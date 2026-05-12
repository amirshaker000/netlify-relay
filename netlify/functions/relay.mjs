import { setDefaultResultOrder } from "node:dns";
import { lookup } from "node:dns/promises";

const VERSION = "1.1.0";
const TARGET_BASE_RAW = process.env.TARGET_DOMAIN || "";
const UPSTREAM_DNS_ORDER = (process.env.UPSTREAM_DNS_ORDER || "ipv4first").trim().toLowerCase();
const RELAY_PATH = normalizeRelayPath(process.env.RELAY_PATH || "");
const PUBLIC_RELAY_PATH = normalizeRelayPath(process.env.PUBLIC_RELAY_PATH || "/api");
const RELAY_KEY = (process.env.RELAY_KEY || "").trim();
const UPSTREAM_TIMEOUT_MS = parsePositiveInt(process.env.UPSTREAM_TIMEOUT_MS, 60000, 1000);
const MAX_INFLIGHT = parsePositiveInt(process.env.MAX_INFLIGHT, 128, 1);
const MAX_UP_BPS = parseNonNegativeInt(process.env.MAX_UP_BPS, 2621440);
const MAX_DOWN_BPS = parseNonNegativeInt(process.env.MAX_DOWN_BPS, 2621440);
const SUCCESS_LOG_SAMPLE_RATE = clampNumber(parseFloat(process.env.SUCCESS_LOG_SAMPLE_RATE || "0"), 0, 1);
const SUCCESS_LOG_MIN_DURATION_MS = parseNonNegativeInt(process.env.SUCCESS_LOG_MIN_DURATION_MS, 3000);
const ERROR_LOG_MIN_INTERVAL_MS = parseNonNegativeInt(process.env.ERROR_LOG_MIN_INTERVAL_MS, 5000);
const GLOBAL_UPLOAD_LIMITER = createGlobalLimiter(MAX_UP_BPS);
const GLOBAL_DOWNLOAD_LIMITER = createGlobalLimiter(MAX_DOWN_BPS);
const RETRY_BACKOFF_MS = [100, 300];
const DNS_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_DNS_CACHE_ENTRIES = 1024;
const DNS_CACHE_PRUNE_BATCH = 64;

applyDnsPreference();

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST"]);
const RETRY_METHODS = new Set(["GET", "HEAD"]);
const RETRY_STATUSES = new Set([502, 503, 504]);
const RESERVED_ROUTES = new Set([
  "/_relay/health",
  "/_relay/help",
  "/_relay/diagnostics",
  "/__relay-health",
  "/__relay-help",
  "/__relay-diagnostics",
]);
const CORS_ALLOWED_REQUEST_HEADERS = new Set([
  "accept",
  "accept-language",
  "authorization",
  "content-language",
  "content-type",
  "if-modified-since",
  "if-none-match",
  "range",
  "x-relay-key",
]);
const FORWARD_HEADER_EXACT = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "cache-control",
  "content-length",
  "content-type",
  "pragma",
  "range",
  "referer",
  "user-agent",
]);
const FORWARD_HEADER_PREFIXES = ["sec-ch-", "sec-fetch-"];
const STRIP_HEADERS = new Set([
  "host",
  "connection",
  "proxy-connection",
  "keep-alive",
  "via",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "x-forwarded-for",
  "x-real-ip",
]);
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
]);
const BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".localdomain",
  ".internal",
  ".home.arpa",
];

let inFlight = 0;
const dnsValidationCache = new Map();
const logState = {
  timeout: { lastAt: 0, suppressed: 0 },
  error: { lastAt: 0, suppressed: 0 },
};

class RelayError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "RelayError";
    this.status = status;
    this.code = code;
  }
}

export default async function handler(request, context) {
  const requestId = createRequestId();
  const startedAt = Date.now();
  let slotAcquired = false;
  let upstreamStatus = null;
  let targetInfo = null;
  let responseStatus = 500;
  let errorCode = null;

  try {
    const url = new URL(request.url);
    const normalizedPath = normalizeIncomingPath(resolvePublicPath(url.pathname, context));

    if (RESERVED_ROUTES.has(normalizedPath)) {
      const response = diagnosticsResponse(requestId, startedAt, context);
      responseStatus = response.status;
      return response;
    }

    validateStaticConfig();

    if (!isAllowedRelayPath(normalizedPath, PUBLIC_RELAY_PATH)) {
      const response = textResponse("Not Found", 404);
      responseStatus = response.status;
      return withRelayHeaders(response, requestId, startedAt, { cache: "bypass" });
    }

    if (isCorsPreflight(request)) {
      const response = withRelayHeaders(handleCorsPreflight(request), requestId, startedAt, { cache: "bypass" });
      responseStatus = response.status;
      if (response.status >= 400) errorCode = response.headers.get("x-relay-error") || "cors_origin_denied";
      return response;
    }

    if (!ALLOWED_METHODS.has(request.method)) {
      const response = new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD, POST" },
      });
      responseStatus = response.status;
      return withRelayHeaders(response, requestId, startedAt, { cache: "bypass" });
    }

    if (RELAY_KEY && request.headers.get("x-relay-key") !== RELAY_KEY) {
      throw new RelayError(403, "relay_key_denied", "Forbidden");
    }

    targetInfo = resolveTargetBase(TARGET_BASE_RAW);
    await validateTarget(targetInfo, url);

    if (!tryAcquireSlot()) {
      const response = new Response("Server Busy: Too Many Inflight Requests", {
        status: 503,
        headers: {
          "retry-after": "1",
          ...Object.fromEntries(noStoreHeaders()),
        },
      });
      responseStatus = response.status;
      return withRelayHeaders(response, requestId, startedAt, { cache: "bypass" });
    }
    slotAcquired = true;

    const upstreamPath = mapPublicPathToRelayPath(normalizedPath, PUBLIC_RELAY_PATH, RELAY_PATH);
    const targetUrl = new URL(targetInfo.baseUrl.href);
    targetUrl.pathname = `${targetInfo.basePath}${upstreamPath}`;
    targetUrl.search = url.search || "";
    targetUrl.hash = "";

    const upstream = await fetchUpstream(request, targetUrl);
    upstreamStatus = upstream.status;

    const responseHeaders = buildResponseHeaders(upstream.headers, targetInfo, PUBLIC_RELAY_PATH, RELAY_PATH, request);
    applyCorsHeaders(responseHeaders, request);

    const body = request.method === "HEAD"
      ? null
      : upstream.body && GLOBAL_DOWNLOAD_LIMITER
        ? throttleWebStream(upstream.body, GLOBAL_DOWNLOAD_LIMITER)
        : upstream.body;

    const response = withRelayHeaders(new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    }), requestId, startedAt, {
      cache: "pass",
      upstreamStatus: upstream.status,
      targetHost: targetInfo.host,
      region: getRegion(context),
    });

    responseStatus = response.status;
    maybeLogSuccess({
      requestId,
      path: normalizedPath,
      upstreamPath,
      method: request.method,
      status: upstream.status,
      durationMs: Date.now() - startedAt,
    });
    return response;
  } catch (err) {
    const response = buildRelayError(err, requestId, startedAt);
    responseStatus = response.status;
    errorCode = getErrorCode(err);

    emitRateLimitedError(getErrorStatus(err) === 504 ? "timeout" : "error", "relay error", {
      requestId,
      method: request.method,
      durationMs: Date.now() - startedAt,
      error: String(err),
      errorCode,
    });
    return response;
  } finally {
    if (slotAcquired) releaseSlot();
    logRequest({
      request,
      requestId,
      targetInfo,
      status: responseStatus,
      upstreamStatus,
      durationMs: Date.now() - startedAt,
      error: errorCode,
    });
  }
}

function validateStaticConfig() {
  if (!TARGET_BASE_RAW.trim()) throw new RelayError(500, "missing_target_domain", "Misconfigured: TARGET_DOMAIN is not set");
  if (!RELAY_PATH) throw new RelayError(500, "missing_relay_path", "Misconfigured: RELAY_PATH is not set");
  if (RELAY_PATH === "/") throw new RelayError(500, "invalid_relay_path", "Misconfigured: RELAY_PATH cannot be '/'");
  if (!PUBLIC_RELAY_PATH) throw new RelayError(500, "missing_public_relay_path", "Misconfigured: PUBLIC_RELAY_PATH is not set");
  if (PUBLIC_RELAY_PATH === "/") throw new RelayError(500, "invalid_public_relay_path", "Misconfigured: PUBLIC_RELAY_PATH cannot be '/'");
}

function resolveTargetBase(rawTarget) {
  const value = String(rawTarget || "").trim().replace(/\/+$/, "");
  if (!value) throw new RelayError(500, "missing_target_domain", "Misconfigured: TARGET_DOMAIN is not set");

  let baseUrl;
  try {
    baseUrl = new URL(value);
  } catch {
    throw new RelayError(500, "invalid_target_domain", "Misconfigured: TARGET_DOMAIN must be a valid URL");
  }

  if (baseUrl.protocol !== "https:" && baseUrl.protocol !== "http:") {
    throw new RelayError(500, "invalid_target_protocol", "Misconfigured: TARGET_DOMAIN must use HTTP or HTTPS");
  }
  if (baseUrl.username || baseUrl.password) {
    throw new RelayError(500, "target_credentials_blocked", "Misconfigured: TARGET_DOMAIN credentials are not allowed");
  }

  baseUrl.search = "";
  baseUrl.hash = "";

  return {
    baseUrl,
    basePath: baseUrl.pathname === "/" ? "" : baseUrl.pathname.replace(/\/+$/, ""),
    host: baseUrl.host,
    hostname: baseUrl.hostname,
  };
}

async function validateTarget(targetInfo, incomingUrl) {
  const targetHostname = normalizeHostname(targetInfo.hostname);
  const requestHostname = normalizeHostname(incomingUrl.hostname);

  if (!targetHostname) {
    throw new RelayError(500, "invalid_target_domain", "Misconfigured: TARGET_DOMAIN host is invalid");
  }
  if (targetHostname === requestHostname) {
    throw new RelayError(508, "relay_loop_blocked", "Misconfigured: TARGET_DOMAIN points back to this relay");
  }
  if (isBlockedHostname(targetHostname) || isBlockedIpLiteral(targetHostname)) {
    throw new RelayError(403, "private_target_blocked", "Private or local TARGET_DOMAIN values are blocked.");
  }

  await assertPublicDnsTarget(targetHostname);
}

async function fetchUpstream(request, targetUrl) {
  const method = request.method.toUpperCase();
  const fetchOptions = {
    method,
    headers: buildForwardHeaders(request),
    redirect: "manual",
    timeoutMs: UPSTREAM_TIMEOUT_MS,
  };

  if (method !== "GET" && method !== "HEAD" && request.body) {
    fetchOptions.body = GLOBAL_UPLOAD_LIMITER
      ? throttleWebStream(request.body, GLOBAL_UPLOAD_LIMITER)
      : request.body;
    fetchOptions.duplex = "half";
  }

  return fetchWithRetries(targetUrl.href, fetchOptions, method);
}

function fetchWithTimeout(input, options) {
  const { timeoutMs, ...fetchOptions } = options;
  const abortCtrl = new AbortController();
  const timeoutRef = setTimeout(() => abortCtrl.abort(), timeoutMs);

  return fetch(input, {
    ...fetchOptions,
    signal: abortCtrl.signal,
  }).finally(() => clearTimeout(timeoutRef));
}

async function fetchWithRetries(input, options, method) {
  const canRetry = RETRY_METHODS.has(method);
  const maxAttempts = canRetry ? RETRY_BACKOFF_MS.length + 1 : 1;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, options);
      if (!canRetry || !RETRY_STATUSES.has(response.status) || attempt === maxAttempts - 1) {
        return response;
      }
      await releaseResponseBody(response);
    } catch (err) {
      lastError = err;
      if (!canRetry || attempt === maxAttempts - 1) throw err;
    }

    await sleep(RETRY_BACKOFF_MS[attempt]);
  }

  throw lastError || new Error("Upstream fetch failed.");
}

async function releaseResponseBody(response) {
  if (!response.body) return;
  try {
    await response.body.cancel();
  } catch {
    try {
      await response.arrayBuffer();
    } catch {}
  }
}

function resolvePublicPath(pathname, context) {
  const path = normalizeIncomingPath(pathname);
  const functionBase = "/.netlify/functions/relay";
  if (path === functionBase) return PUBLIC_RELAY_PATH;
  if (path.startsWith(`${functionBase}/`)) {
    return normalizeIncomingPath(`${PUBLIC_RELAY_PATH}${path.slice(functionBase.length)}`);
  }
  if (context?.params?.splat) {
    return normalizeIncomingPath(`${PUBLIC_RELAY_PATH}/${context.params.splat}`);
  }
  return path;
}

function buildForwardHeaders(request) {
  const headers = {};
  const clientIp = request.headers.get("x-nf-client-connection-ip")
    || request.headers.get("client-ip")
    || request.headers.get("x-forwarded-for");

  for (const [key, value] of request.headers) {
    const lower = key.toLowerCase();
    if (STRIP_HEADERS.has(lower)) continue;
    if (lower === "x-relay-key") continue;
    if (lower.startsWith("x-nf-") || lower.startsWith("x-netlify-")) continue;
    if (!shouldForwardHeader(lower)) continue;
    if (value) headers[lower] = value;
  }
  if (clientIp) headers["x-forwarded-for"] = clientIp.split(",")[0].trim();
  return headers;
}

function buildResponseHeaders(inputHeaders, targetInfo, publicBase, upstreamBase, request) {
  const headers = new Headers();
  for (const [key, value] of inputHeaders) {
    const lower = key.toLowerCase();
    if (lower === "transfer-encoding" || lower === "connection") continue;
    if (lower === "location") {
      headers.set(key, rewriteLocationHeader(value, targetInfo, publicBase, upstreamBase, request));
      continue;
    }
    headers.set(key, value);
  }
  headers.set("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("cdn-cache-control", "no-store");
  headers.set("netlify-cdn-cache-control", "no-store");
  return headers;
}

function rewriteLocationHeader(locationValue, targetInfo, publicBase, upstreamBase, request) {
  if (!locationValue) return locationValue;

  let locationUrl;
  try {
    locationUrl = new URL(locationValue, targetInfo.baseUrl);
  } catch {
    return locationValue;
  }

  if (normalizeHostname(locationUrl.host) !== normalizeHostname(targetInfo.host)) return locationValue;

  const relayUrl = new URL(request.url);
  const upstreamPrefix = `${targetInfo.basePath}${upstreamBase}`.replace(/\/+$/, "");
  if (locationUrl.pathname === upstreamPrefix || locationUrl.pathname.startsWith(`${upstreamPrefix}/`)) {
    relayUrl.pathname = `${publicBase}${locationUrl.pathname.slice(upstreamPrefix.length)}` || publicBase;
  } else {
    relayUrl.pathname = locationUrl.pathname;
  }
  relayUrl.search = locationUrl.search;
  relayUrl.hash = locationUrl.hash;
  return relayUrl.href;
}

function handleCorsPreflight(request) {
  if (!isTrustedCorsOrigin(request)) {
    return new Response(null, {
      status: 403,
      headers: {
        ...Object.fromEntries(noStoreHeaders()),
        "vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
        "x-relay-error": "cors_origin_denied",
      },
    });
  }

  const headers = noStoreHeaders();
  headers.set("access-control-allow-methods", "GET, HEAD, POST, OPTIONS");
  headers.set("access-control-allow-headers", getAllowedCorsRequestHeaders(request));
  headers.set("access-control-max-age", "86400");
  headers.set("vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
  applyCorsHeaders(headers, request);
  return new Response(null, { status: 204, headers });
}

function applyCorsHeaders(headers, request) {
  if (!isTrustedCorsOrigin(request)) return;
  headers.set("access-control-allow-origin", request.headers.get("origin"));
  headers.set("access-control-allow-credentials", "true");
  appendVary(headers, "Origin");
}

function isTrustedCorsOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || /[\r\n]/.test(origin)) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.protocol !== "https:" && originUrl.protocol !== "http:") return false;
    return normalizeHostname(originUrl.host) === normalizeHostname(requestUrl.host);
  } catch {
    return false;
  }
}

function getAllowedCorsRequestHeaders(request) {
  const requestedHeaders = request.headers.get("access-control-request-headers");
  if (!requestedHeaders) return "authorization, content-type, x-relay-key";

  const allowedHeaders = requestedHeaders
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter((header) => CORS_ALLOWED_REQUEST_HEADERS.has(header));

  return allowedHeaders.length ? allowedHeaders.join(", ") : "content-type";
}

async function assertPublicDnsTarget(hostname) {
  if (isIpLiteral(hostname)) return;

  const cachedResult = dnsValidationCache.get(hostname);
  if (cachedResult && cachedResult.expiresAt > Date.now()) {
    if (cachedResult.blocked) {
      throw new RelayError(403, "private_target_blocked", "Private or local TARGET_DOMAIN values are blocked.");
    }
    return;
  }

  const addresses = await resolveTargetAddresses(hostname);
  const blocked = addresses.some((address) => isBlockedIpLiteral(normalizeHostname(address)));
  pruneDnsValidationCache();
  dnsValidationCache.set(hostname, {
    blocked,
    expiresAt: Date.now() + DNS_CACHE_TTL_MS,
  });
  enforceDnsValidationCacheLimit();

  if (blocked) {
    throw new RelayError(403, "private_target_blocked", "Private or local TARGET_DOMAIN values are blocked.");
  }
}

async function resolveTargetAddresses(hostname) {
  try {
    const records = await lookup(hostname, { all: true, verbatim: true });
    return records.map((record) => record.address);
  } catch {
    return [];
  }
}

function pruneDnsValidationCache() {
  const now = Date.now();
  let checked = 0;

  for (const [hostname, cachedResult] of dnsValidationCache) {
    if (cachedResult.expiresAt <= now) dnsValidationCache.delete(hostname);
    checked += 1;
    if (checked >= DNS_CACHE_PRUNE_BATCH) break;
  }
}

function enforceDnsValidationCacheLimit() {
  while (dnsValidationCache.size > MAX_DNS_CACHE_ENTRIES) {
    const oldestKey = dnsValidationCache.keys().next().value;
    if (!oldestKey) break;
    dnsValidationCache.delete(oldestKey);
  }
}

function isBlockedHostname(hostname) {
  if (BLOCKED_HOSTNAMES.has(hostname)) return true;
  return BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

function normalizeHostname(hostname) {
  return String(hostname || "")
    .trim()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function isBlockedIpLiteral(hostname) {
  if (isBlockedIpv4(hostname)) return true;
  if (isBlockedIpv6(hostname)) return true;
  return false;
}

function isIpLiteral(hostname) {
  return isIpv4Literal(hostname) || hostname.includes(":");
}

function isIpv4Literal(hostname) {
  const parts = hostname.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part));
}

function isBlockedIpv4(hostname) {
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  if (!parts.every((part) => /^\d{1,3}$/.test(part))) return false;

  const nums = parts.map((part) => Number(part));
  if (!nums.every((num) => num >= 0 && num <= 255)) return true;

  const [a, b] = nums;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}

function isBlockedIpv6(hostname) {
  const value = hostname.toLowerCase();
  if (!value.includes(":")) return false;
  if (value === "::1" || value === "0:0:0:0:0:0:0:1") return true;
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb")) return true;
  if (value.startsWith("::ffff:")) return isBlockedIpv4(value.slice("::ffff:".length));
  return false;
}

function diagnosticsResponse(requestId, startedAt, context) {
  return jsonResponse({
    ok: true,
    relay: "netlify-function",
    version: VERSION,
    mode: "fixed-target",
    targetConfigured: Boolean(TARGET_BASE_RAW.trim()),
    publicRelayPath: PUBLIC_RELAY_PATH || null,
    relayPath: RELAY_PATH || null,
    streaming: true,
    cors: "same-origin-only",
    cache: "upstream-pass-through",
    privateNetworkBlocking: "dns-and-literal",
    redirectHandling: "rewrite-same-target-location",
    inflightLimit: MAX_INFLIGHT,
    safeRetries: {
      enabled: true,
      methods: [...RETRY_METHODS],
      statuses: [...RETRY_STATUSES],
      releasesRetryBodies: true,
    },
    requestId,
    region: getRegion(context),
  }, requestId, startedAt);
}

function noStoreHeaders() {
  return new Headers({
    "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    "cdn-cache-control": "no-store",
    "netlify-cdn-cache-control": "no-store",
  });
}

function jsonResponse(payload, requestId, startedAt, status = 200) {
  const response = new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...Object.fromEntries(noStoreHeaders()),
    },
  });
  return withRelayHeaders(response, requestId, startedAt, { cache: "bypass" });
}

function textResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...Object.fromEntries(noStoreHeaders()),
    },
  });
}

function buildRelayError(error, requestId, startedAt) {
  const response = textResponse(getErrorMessage(error), getErrorStatus(error));
  response.headers.set("x-relay-error", getErrorCode(error));
  return withRelayHeaders(response, requestId, startedAt, { cache: "bypass" });
}

function getErrorStatus(error) {
  if (error instanceof RelayError) return error.status;
  if (isUpstreamTimeoutError(error)) return 504;
  return 502;
}

function getErrorCode(error) {
  if (error instanceof RelayError) return error.code;
  if (isUpstreamTimeoutError(error)) return "upstream_timeout";
  return "upstream_fetch_failed";
}

function getErrorMessage(error) {
  if (error instanceof RelayError) return error.message;
  if (isUpstreamTimeoutError(error)) return "Gateway Timeout: Upstream Timeout";
  return "Bad Gateway: Tunnel Failed";
}

function withRelayHeaders(response, requestId, startedAt, details = {}) {
  const headers = new Headers(response.headers);
  headers.set("x-relay-request-id", requestId);
  headers.set("x-relay-duration-ms", String(Date.now() - startedAt));
  headers.set("x-relay-version", VERSION);
  if (details.cache) headers.set("x-relay-cache", details.cache);
  if (details.upstreamStatus != null) headers.set("x-relay-upstream-status", String(details.upstreamStatus));
  if (details.targetHost) headers.set("x-relay-target-host", details.targetHost);
  if (details.region) headers.set("x-relay-region", details.region);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function appendVary(headers, value) {
  const existing = headers.get("vary");
  if (!existing) {
    headers.set("vary", value);
    return;
  }
  const values = existing.split(",").map((item) => item.trim().toLowerCase());
  if (!values.includes(value.toLowerCase())) headers.set("vary", `${existing}, ${value}`);
}

function shouldForwardHeader(headerName) {
  if (FORWARD_HEADER_EXACT.has(headerName)) return true;
  return FORWARD_HEADER_PREFIXES.some((prefix) => headerName.startsWith(prefix));
}

function maybeLogSuccess(payload) {
  if (payload.status >= 400) {
    console.warn("relay non-2xx", payload);
    return;
  }
  if (payload.durationMs >= SUCCESS_LOG_MIN_DURATION_MS) {
    console.info("relay slow", payload);
    return;
  }
  if (SUCCESS_LOG_SAMPLE_RATE > 0 && Math.random() < SUCCESS_LOG_SAMPLE_RATE) {
    console.info("relay sample", payload);
  }
}

function emitRateLimitedError(kind, label, payload) {
  const state = logState[kind] || logState.error;
  const now = Date.now();
  if (ERROR_LOG_MIN_INTERVAL_MS <= 0) {
    console.error(label, payload);
    return;
  }
  if (now - state.lastAt < ERROR_LOG_MIN_INTERVAL_MS) {
    state.suppressed += 1;
    return;
  }
  const out = { ...payload };
  if (state.suppressed > 0) out.suppressed = state.suppressed;
  state.suppressed = 0;
  state.lastAt = now;
  console.error(label, out);
}

function logRequest({ request, requestId, targetInfo, status, upstreamStatus, durationMs, error }) {
  try {
    const url = new URL(request.url);
    console.log(JSON.stringify({
      requestId,
      method: request.method,
      path: url.pathname,
      targetHost: targetInfo ? targetInfo.host : null,
      status,
      upstreamStatus,
      durationMs,
      error,
    }));
  } catch {}
}

function createRequestId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getRegion(context) {
  if (!context) return null;
  return context.server?.region || context.region || context.geo?.city || null;
}

function applyDnsPreference() {
  if (UPSTREAM_DNS_ORDER !== "ipv4first" && UPSTREAM_DNS_ORDER !== "verbatim") return;
  try {
    setDefaultResultOrder(UPSTREAM_DNS_ORDER);
  } catch {}
}

function isUpstreamTimeoutError(err) {
  if (!err) return false;
  if (err?.name === "AbortError") return true;
  if (err?.code === "ABORT_ERR") return true;
  if (err?.message === "upstream_timeout") return true;
  if (err?.cause?.message === "upstream_timeout") return true;
  return typeof err === "string" && err === "upstream_timeout";
}

function isCorsPreflight(request) {
  return request.method.toUpperCase() === "OPTIONS"
    && request.headers.has("origin")
    && request.headers.has("access-control-request-method");
}

function isAllowedRelayPath(pathname, publicPath) {
  return pathname === publicPath || pathname.startsWith(`${publicPath}/`);
}

function mapPublicPathToRelayPath(pathname, publicPath, relayPath) {
  if (pathname === publicPath) return relayPath;
  return `${relayPath}${pathname.slice(publicPath.length)}`;
}

function normalizeRelayPath(rawPath) {
  if (!rawPath) return "";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function normalizeIncomingPath(pathname) {
  if (!pathname) return "/";
  let normalized = String(pathname).replace(/\/{2,}/g, "/");
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  return normalized.length > 1 && normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

function parsePositiveInt(rawValue, fallbackValue, minValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < minValue) return fallbackValue;
  return Math.trunc(value);
}

function parseNonNegativeInt(rawValue, fallbackValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) return fallbackValue;
  return Math.trunc(value);
}

function clampNumber(value, minValue, maxValue) {
  if (!Number.isFinite(value)) return minValue;
  return Math.min(maxValue, Math.max(minValue, value));
}

function tryAcquireSlot() {
  if (inFlight >= MAX_INFLIGHT) return false;
  inFlight += 1;
  return true;
}

function releaseSlot() {
  inFlight = Math.max(0, inFlight - 1);
}

function createGlobalLimiter(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return null;

  const burstCap = Math.max(bytesPerSecond, 262144);
  let tokens = burstCap;
  let lastRefill = Date.now();
  const queue = [];
  let timer = null;

  function refill() {
    const now = Date.now();
    const elapsedMs = now - lastRefill;
    if (elapsedMs <= 0) return;
    tokens = Math.min(burstCap, tokens + (elapsedMs * bytesPerSecond) / 1000);
    lastRefill = now;
  }

  function tryDrain() {
    refill();
    while (queue.length > 0 && tokens >= 1) {
      const item = queue[0];
      const grant = Math.min(item.maxBytes, Math.max(1, Math.floor(tokens)));
      if (grant < 1) break;
      tokens -= grant;
      queue.shift();
      item.resolve(grant);
    }
  }

  function schedule() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      tryDrain();
      if (queue.length > 0) schedule();
    }, 5);
  }

  return {
    acquire(maxBytes) {
      const requested = Math.max(1, Math.trunc(maxBytes || 1));
      return new Promise((resolve) => {
        queue.push({ maxBytes: requested, resolve });
        tryDrain();
        if (queue.length > 0) schedule();
      });
    },
  };
}

function throttleWebStream(stream, limiter) {
  if (!stream || !limiter) return stream;

  return stream.pipeThrough(new TransformStream({
    async transform(chunk, controller) {
      const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
      let offset = 0;
      while (offset < bytes.length) {
        const grant = await limiter.acquire(bytes.length - offset);
        controller.enqueue(bytes.subarray(offset, offset + grant));
        offset += grant;
      }
    },
  }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
