import { setDefaultResultOrder } from "node:dns";

const TARGET_BASE = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");
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

applyDnsPreference();

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST"]);
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

let inFlight = 0;
const logState = {
  timeout: { lastAt: 0, suppressed: 0 },
  error: { lastAt: 0, suppressed: 0 },
};

export default async function handler(request, context) {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();
  let slotAcquired = false;
  let hitUpstreamTimeout = false;

  if (!TARGET_BASE) return textResponse("Misconfigured: TARGET_DOMAIN is not set", 500);
  if (!RELAY_PATH) return textResponse("Misconfigured: RELAY_PATH is not set", 500);
  if (RELAY_PATH === "/") return textResponse("Misconfigured: RELAY_PATH cannot be '/'", 500);
  if (!PUBLIC_RELAY_PATH) return textResponse("Misconfigured: PUBLIC_RELAY_PATH is not set", 500);
  if (PUBLIC_RELAY_PATH === "/") return textResponse("Misconfigured: PUBLIC_RELAY_PATH cannot be '/'", 500);

  try {
    const url = new URL(request.url);
    const normalizedPath = normalizeIncomingPath(resolvePublicPath(url.pathname, context));

    if (!isAllowedRelayPath(normalizedPath, PUBLIC_RELAY_PATH)) {
      return textResponse("Not Found", 404);
    }
    if (!ALLOWED_METHODS.has(request.method)) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD, POST" },
      });
    }
    if (RELAY_KEY && request.headers.get("x-relay-key") !== RELAY_KEY) {
      return textResponse("Forbidden", 403);
    }
    if (!tryAcquireSlot()) {
      return new Response("Server Busy: Too Many Inflight Requests", {
        status: 503,
        headers: { "retry-after": "1" },
      });
    }
    slotAcquired = true;

    const upstreamPath = mapPublicPathToRelayPath(normalizedPath, PUBLIC_RELAY_PATH, RELAY_PATH);
    const targetUrl = `${TARGET_BASE}${upstreamPath}${url.search || ""}`;
    const headers = buildForwardHeaders(request);
    const abortCtrl = new AbortController();
    const timeoutRef = setTimeout(() => {
      hitUpstreamTimeout = true;
      try {
        abortCtrl.abort();
      } catch {}
    }, UPSTREAM_TIMEOUT_MS);

    try {
      const fetchOpts = {
        method: request.method,
        headers,
        redirect: "manual",
        signal: abortCtrl.signal,
      };

      if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
        fetchOpts.body = GLOBAL_UPLOAD_LIMITER
          ? throttleWebStream(request.body, GLOBAL_UPLOAD_LIMITER)
          : request.body;
        fetchOpts.duplex = "half";
      }

      const upstream = await fetch(targetUrl, fetchOpts);
      const responseHeaders = buildResponseHeaders(upstream.headers);
      const body = upstream.body && GLOBAL_DOWNLOAD_LIMITER
        ? throttleWebStream(upstream.body, GLOBAL_DOWNLOAD_LIMITER)
        : upstream.body;

      const durationMs = Date.now() - startedAt;
      maybeLogSuccess({
        requestId,
        path: normalizedPath,
        upstreamPath,
        method: request.method,
        status: upstream.status,
        durationMs,
      });

      return new Response(body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } finally {
      clearTimeout(timeoutRef);
    }
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    if (hitUpstreamTimeout || isUpstreamTimeoutError(err)) {
      emitRateLimitedError("timeout", "relay timeout", {
        requestId,
        method: request.method,
        durationMs,
        timeoutMs: UPSTREAM_TIMEOUT_MS,
      });
      return textResponse("Gateway Timeout: Upstream Timeout", 504);
    }

    emitRateLimitedError("error", "relay error", {
      requestId,
      method: request.method,
      durationMs,
      error: String(err),
    });
    return textResponse("Bad Gateway: Tunnel Failed", 502);
  } finally {
    if (slotAcquired) releaseSlot();
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
  if (clientIp) headers["x-forwarded-for"] = clientIp;
  return headers;
}

function buildResponseHeaders(inputHeaders) {
  const headers = new Headers();
  for (const [key, value] of inputHeaders) {
    const lower = key.toLowerCase();
    if (lower === "transfer-encoding" || lower === "connection") continue;
    headers.set(key, value);
  }
  headers.set("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("cdn-cache-control", "no-store");
  headers.set("netlify-cdn-cache-control", "no-store");
  return headers;
}

function textResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
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
