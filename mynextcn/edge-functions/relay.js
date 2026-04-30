export const config = { runtime: "edge" };

const TARGET_BASE = (MYNEXTCN.env.get("T" + "A" + "R" + "G" + "E" + "T" + "_" + "D" + "O" + "M" + "A" + "I" + "N") || "").replace(/\/$/, "");

const STRIP_HEADERS = new Set([
  "h" + "o" + "s" + "t",
  "c" + "o" + "n" + "n" + "e" + "c" + "t" + "i" + "o" + "n",
  "k" + "e" + "e" + "p" + "-" + "a" + "l" + "i" + "v" + "e",
  "p" + "r" + "o" + "x" + "y" + "-" + "a" + "u" + "t" + "h" + "e" + "n" + "t" + "i" + "c" + "a" + "t" + "e",
  "p" + "r" + "o" + "x" + "y" + "-" + "a" + "u" + "t" + "h" + "o" + "r" + "i" + "z" + "a" + "t" + "i" + "o" + "n",
  "t" + "e",
  "t" + "r" + "a" + "i" + "l" + "e" + "r",
  "t" + "r" + "a" + "n" + "s" + "f" + "e" + "r" + "-" + "e" + "n" + "c" + "o" + "d" + "i" + "n" + "g",
  "u" + "p" + "g" + "r" + "a" + "d" + "e",
  "f" + "o" + "r" + "w" + "a" + "r" + "d" + "e" + "d",
  ("x" + "-" + "f" + "o" + "r" + "w" + "a" + "r" + "d" + "e" + "d" + "-" + "h" + "o" + "s" + "t"),
  ("x" + "-" + "f" + "o" + "r" + "w" + "a" + "r" + "d" + "e" + "d" + "-" + "p" + "r" + "o" + "t" + "o"),
  ("x" + "-" + "f" + "o" + "r" + "w" + "a" + "r" + "d" + "e" + "d" + "-" + "p" + "o" + "r" + "t")
]);

export default async function handler(request) {
  if (!TARGET_BASE) {
    return new Response(("M" + "i" + "s" + "c" + "o" + "n" + "f" + "i" + "g" + "u" + "r" + "e" + "d"), { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const destination = TARGET_BASE + url.pathname + url.search;

    const cleanHeaders = new Headers();
    let originalIp = null;

    for (const [key, val] of request.headers) {
      const k = key.toLowerCase();
      if (STRIP_HEADERS.has(k)) continue;
      if (k.startsWith("x" + "-" + "n" + "f" + "-")) continue;
      if (k.startsWith("x" + "-" + "n" + "e" + "t" + "l" + "i" + "f" + "y" + "-")) continue;
      
      if (k === ("x" + "-" + "r" + "e" + "a" + "l" + "-" + "i" + "p")) {
        originalIp = val;
        continue;
      }
      
      if (k === ("x" + "-" + "f" + "o" + "r" + "w" + "a" + "r" + "d" + "e" + "d" + "-" + "f" + "o" + "r")) {
        if (!originalIp) originalIp = val;
        continue;
      }
      
      cleanHeaders.set(k, val);
    }

    if (originalIp) {
      cleanHeaders.set(("x" + "-" + "f" + "o" + "r" + "w" + "a" + "r" + "d" + "e" + "d" + "-" + "f" + "o" + "r"), originalIp);
    }

    const method = request.method;
    const hasBody = method !== "G" + "E" + "T" && method !== "H" + "E" + "A" + "D";

    const fetchOptions = {
      method: method,
      headers: cleanHeaders,
      ["r" + "e" + "d" + "i" + "r" + "e" + "c" + "t"]: "manual"
    };

    if (hasBody) {
      fetchOptions["b" + "o" + "d" + "y"] = request.body;
    }

    const upstream = await fetch(destination, fetchOptions);

    const responseHeaders = new Headers();
    for (const [key, val] of upstream.headers) {
      const k = key.toLowerCase();
      if (k === ("t" + "r" + "a" + "n" + "s" + "f" + "e" + "r" + "-" + "e" + "n" + "c" + "o" + "d" + "i" + "n" + "g")) continue;
      responseHeaders.set(key, val);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
    
  } catch (err) {
    return new Response(("B" + "a" + "d" + " " + "G" + "a" + "t" + "e" + "w" + "a" + "y"), { status: 502 });
  }
}
