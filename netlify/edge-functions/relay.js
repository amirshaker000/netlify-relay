const DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD";

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
]);

export default async function relay(request, context) {
  const targetBase = readEnv("TARGET_DOMAIN", "").replace(/\/$/, "");
  const publicBase = normalizePath(readEnv("PUBLIC_RELAY_PATH", "/api"));
  const upstreamBase = normalizePath(readEnv("UPSTREAM_PATH_PREFIX", publicBase));
  const relayKey = readEnv("RELAY_KEY", "").trim();
  const allowedMethods = new Set(
    readEnv("ALLOWED_METHODS", DEFAULT_ALLOWED_METHODS)
      .split(",")
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean),
  );
  const timeoutMs = clampInt(readEnv("UPSTREAM_TIMEOUT_MS", "30000"), 1000, 39000);

  const url = new URL(request.url);
  const path = normalizePathname(url.pathname);
  if (!isRelayPath(path, publicBase)) {
    return context.next();
  }

  if (!targetBase) return textResponse("Misconfigured: TARGET_DOMAIN is not set", 500);
  if (!allowedMethods.has(request.method.toUpperCase())) {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: Array.from(allowedMethods).join(", ") },
    });
  }
  if (relayKey && request.headers.get("x-relay-key") !== relayKey) {
    return textResponse("Forbidden", 403);
  }

  if (request.method.toUpperCase() === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: noStoreHeaders(),
    });
  }

  const upstreamPath = mapPath(path, publicBase, upstreamBase);
  const targetUrl = `${targetBase}${upstreamPath}${url.search || ""}`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort("upstream timeout"), timeoutMs);

  try {
    const init = {
      method: request.method,
      headers: forwardHeaders(request.headers),
      redirect: "manual",
      signal: ctrl.signal,
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const upstream = await fetch(targetUrl, init);
    const responseHeaders = responseHeadersFrom(upstream.headers);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    const message = String(err?.message || err || "");
    if (message.toLowerCase().includes("abort") || message.toLowerCase().includes("timeout")) {
      return textResponse("Gateway Timeout: Upstream Timeout", 504);
    }
    return textResponse("Bad Gateway: Edge Relay Failed", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function readEnv(key, fallback) {
  try {
    const v = Netlify.env.get(key);
    return v == null || v === "" ? fallback : String(v);
  } catch {
    return fallback;
  }
}

function normalizePath(raw) {
  const value = String(raw || "").trim();
  if (!value) return "/api";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.length > 1 && withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
}

function normalizePathname(pathname) {
  const path = String(pathname || "/");
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

function isRelayPath(path, publicBase) {
  return path === publicBase || path.startsWith(`${publicBase}/`);
}

function mapPath(path, publicBase, upstreamBase) {
  if (path === publicBase) return `${upstreamBase}/`;
  return `${upstreamBase}${path.slice(publicBase.length)}`;
}

function forwardHeaders(input) {
  const headers = new Headers();
  for (const [key, value] of input) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    if (lower === "x-relay-key") continue;
    if (lower.startsWith("x-nf-") || lower.startsWith("x-netlify-")) continue;
    headers.set(key, value);
  }
  return headers;
}

function responseHeadersFrom(input) {
  const headers = new Headers();
  for (const [key, value] of input) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    headers.set(key, value);
  }
  for (const [key, value] of noStoreHeaders()) headers.set(key, value);
  return headers;
}

function noStoreHeaders() {
  return new Headers({
    "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    "cdn-cache-control": "no-store",
    "netlify-cdn-cache-control": "no-store",
  });
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

function clampInt(value, min, max) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
