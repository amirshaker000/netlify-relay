const VERSION = "1.1.0";
const DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD";
const DEFAULT_PUBLIC_RELAY_PATH = "/api";
const DEFAULT_TIMEOUT_MS = 30000;
const MAX_URL_LENGTH = 8192;
const RETRY_BACKOFF_MS = [100, 300];
const DNS_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_DNS_CACHE_ENTRIES = 1024;
const DNS_CACHE_PRUNE_BATCH = 64;

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
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

const RETRY_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

const RETRY_STATUSES = new Set([
  502,
  503,
  504,
]);

const RESERVED_ROUTES = new Set([
  "/_relay/health",
  "/_relay/help",
  "/_relay/diagnostics",
  "/__relay-health",
  "/__relay-help",
  "/__relay-diagnostics",
]);

const dnsValidationCache = new Map();

class RelayError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "RelayError";
    this.status = status;
    this.code = code;
  }
}

export default async function relay(request, context) {
  const startedAt = Date.now();
  const requestId = createRequestId();
  let targetInfo = null;
  let upstreamStatus = null;
  let responseStatus = 500;
  let errorCode = null;

  try {
    const url = new URL(request.url);
    if (request.url.length > MAX_URL_LENGTH) {
      throw new RelayError(414, "url_too_long", "Request URL is too long.");
    }

    if (RESERVED_ROUTES.has(url.pathname)) {
      const response = handleReservedRoute(requestId, startedAt, context);
      responseStatus = response.status;
      return response;
    }

    const publicBase = normalizePath(readEnv("PUBLIC_RELAY_PATH", DEFAULT_PUBLIC_RELAY_PATH));
    if (!isRelayPath(normalizePathname(url.pathname), publicBase)) {
      const response = await context.next();
      responseStatus = response.status;
      return response;
    }

    if (isCorsPreflight(request)) {
      const response = withRelayHeaders(handleCorsPreflight(request), requestId, startedAt, {
        cache: "bypass",
      });
      responseStatus = response.status;
      if (response.status >= 400) {
        errorCode = response.headers.get("x-relay-error") || "cors_preflight_denied";
      }
      return response;
    }

    const config = getRelayConfig(publicBase);
    targetInfo = config.targetInfo;
    await validateTarget(targetInfo, url);

    if (!config.allowedMethods.has(request.method.toUpperCase())) {
      const response = withRelayHeaders(new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: [...config.allowedMethods].join(", ") },
      }), requestId, startedAt, { cache: "bypass" });
      responseStatus = response.status;
      return response;
    }

    if (config.relayKey && request.headers.get("x-relay-key") !== config.relayKey) {
      throw new RelayError(403, "relay_key_denied", "Forbidden");
    }

    const upstreamPath = mapPath(normalizePathname(url.pathname), publicBase, config.upstreamBase);
    const targetUrl = new URL(targetInfo.baseUrl.href);
    targetUrl.pathname = `${targetInfo.basePath}${upstreamPath}`;
    targetUrl.search = url.search;
    targetUrl.hash = "";

    const upstream = await fetchUpstream(request, targetUrl, config.timeoutMs);
    upstreamStatus = upstream.status;

    const response = buildProxyResponse(request, upstream, targetInfo, publicBase, config.upstreamBase, requestId, startedAt, context);
    responseStatus = response.status;
    return response;
  } catch (error) {
    const response = buildRelayError(error, requestId, startedAt);
    responseStatus = response.status;
    errorCode = getErrorCode(error);
    return response;
  } finally {
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

function getRelayConfig(publicBase) {
  const targetInfo = resolveTargetBase(readEnv("TARGET_DOMAIN", ""));
  const upstreamBase = normalizePath(readEnv("UPSTREAM_PATH_PREFIX", publicBase));
  const relayKey = readEnv("RELAY_KEY", "").trim();
  const allowedMethods = new Set(
    readEnv("ALLOWED_METHODS", DEFAULT_ALLOWED_METHODS)
      .split(",")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  );
  const timeoutMs = clampInt(readEnv("UPSTREAM_TIMEOUT_MS", String(DEFAULT_TIMEOUT_MS)), 1000, 39000);

  return {
    allowedMethods,
    publicBase,
    relayKey,
    targetInfo,
    timeoutMs,
    upstreamBase,
  };
}

function resolveTargetBase(rawTarget) {
  const value = String(rawTarget || "").trim().replace(/\/+$/, "");
  if (!value) {
    throw new RelayError(500, "missing_target_domain", "Misconfigured: TARGET_DOMAIN is not set");
  }

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

function handleReservedRoute(requestId, startedAt, context) {
  return jsonResponse({
    ok: true,
    relay: "netlify-edge",
    version: VERSION,
    mode: "fixed-target",
    targetMode: "target-domain-env",
    streaming: true,
    cors: "same-origin-only",
    cache: "upstream-pass-through",
    privateNetworkBlocking: getPrivateNetworkBlockingMode(),
    redirectHandling: "rewrite-same-target-location",
    safeRetries: {
      enabled: true,
      methods: [...RETRY_METHODS],
      statuses: [...RETRY_STATUSES],
      releasesRetryBodies: true,
    },
    duplicateSuppression: false,
    requestId,
    region: getRegion(context),
  }, requestId, startedAt);
}

async function fetchUpstream(request, targetUrl, timeoutMs) {
  const method = request.method.toUpperCase();
  const headers = forwardHeaders(request.headers);
  const fetchOptions = {
    method,
    headers,
    redirect: "manual",
    timeoutMs,
    body: method !== "GET" && method !== "HEAD" ? request.body : undefined,
  };

  return fetchWithRetries(targetUrl.href, fetchOptions, method);
}

function buildProxyResponse(request, upstream, targetInfo, publicBase, upstreamBase, requestId, startedAt, context) {
  const responseHeaders = responseHeadersFrom(upstream.headers, targetInfo, publicBase, upstreamBase, request);
  applyCorsHeaders(responseHeaders, request);

  const response = new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  return withRelayHeaders(response, requestId, startedAt, {
    cache: "pass",
    upstreamStatus: upstream.status,
    targetHost: targetInfo.host,
    region: getRegion(context),
  });
}

function fetchWithTimeout(input, options) {
  const { timeoutMs, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(input, {
    ...fetchOptions,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
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
    } catch (error) {
      lastError = error;
      if (!canRetry || attempt === maxAttempts - 1) {
        throw error;
      }
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

function forwardHeaders(input) {
  const headers = new Headers();
  let clientIp = null;

  for (const [key, value] of input) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    if (lower === "x-relay-key") continue;
    if (lower.startsWith("x-nf-") || lower.startsWith("x-netlify-")) continue;
    if (lower === "x-real-ip" || lower === "x-forwarded-for") {
      if (!clientIp) clientIp = value.split(",")[0].trim();
      continue;
    }
    headers.set(key, value);
  }

  if (clientIp) headers.set("x-forwarded-for", clientIp);
  return headers;
}

function responseHeadersFrom(input, targetInfo, publicBase, upstreamBase, request) {
  const headers = new Headers();

  for (const [key, value] of input) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
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
  headers.set("access-control-allow-methods", DEFAULT_ALLOWED_METHODS);
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

function isCorsPreflight(request) {
  return request.method.toUpperCase() === "OPTIONS"
    && request.headers.has("origin")
    && request.headers.has("access-control-request-method");
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

async function assertPublicDnsTarget(hostname) {
  if (isIpLiteral(hostname) || !canResolveDns()) return;

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
  const addresses = [];

  for (const recordType of ["A", "AAAA"]) {
    try {
      const records = await Deno.resolveDns(hostname, recordType);
      addresses.push(...records);
    } catch {}
  }

  return addresses;
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

function canResolveDns() {
  return typeof Deno !== "undefined" && typeof Deno.resolveDns === "function";
}

function getPrivateNetworkBlockingMode() {
  return canResolveDns() ? "dns-and-literal" : "literal-and-reserved-hostname";
}

function isRelayPath(path, publicBase) {
  return path === publicBase || path.startsWith(`${publicBase}/`);
}

function mapPath(path, publicBase, upstreamBase) {
  if (path === publicBase) return `${upstreamBase}/`;
  return `${upstreamBase}${path.slice(publicBase.length)}`;
}

function normalizePath(raw) {
  const value = String(raw || "").trim();
  if (!value) return DEFAULT_PUBLIC_RELAY_PATH;
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.length > 1 && withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
}

function normalizePathname(pathname) {
  const path = String(pathname || "/");
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
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
  if (error && error.name === "AbortError") return 504;
  return 502;
}

function getErrorCode(error) {
  if (error instanceof RelayError) return error.code;
  if (error && error.name === "AbortError") return "upstream_timeout";
  return "upstream_fetch_failed";
}

function getErrorMessage(error) {
  if (error instanceof RelayError) return error.message;
  if (error && error.name === "AbortError") return "Gateway Timeout: Upstream Timeout";
  return "Bad Gateway: Edge Relay Failed";
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

function createRequestId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getRegion(context) {
  if (!context) return null;
  return context.server?.region || context.region || context.geo?.city || null;
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

function readEnv(key, fallback) {
  try {
    const value = Netlify.env.get(key);
    return value == null || value === "" ? fallback : String(value);
  } catch {
    return fallback;
  }
}

function clampInt(value, min, max) {
  const number = Number.parseInt(String(value), 10);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
