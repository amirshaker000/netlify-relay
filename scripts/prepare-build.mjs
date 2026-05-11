import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { extname, join } from "node:path";
import { createHash } from "node:crypto";

const AUTO_FRONTEND = (process.env.AUTO_FRONTEND || "1").trim().toLowerCase();
if (AUTO_FRONTEND === "0" || AUTO_FRONTEND === "false" || AUTO_FRONTEND === "off") {
  console.log("prepare-build: AUTO_FRONTEND is disabled; skipping static frontend generation.");
  process.exit(0);
}

const TEMPLATE_ROOT = join("templates", "landing");
const LANDING_TEMPLATE = (process.env.LANDING_TEMPLATE || "").trim();
const publicRelayPath = normalizePath(process.env.PUBLIC_RELAY_PATH || "/api");
const relayPath = normalizePath(process.env.RELAY_PATH || "/api");
const targetDomain = (process.env.TARGET_DOMAIN || "").trim().replace(/\/$/, "");
const netlifyRelayMode = (process.env.NETLIFY_RELAY_MODE || "function").trim().toLowerCase();

const seed = [
  process.env.COMMIT_REF || "",
  process.env.DEPLOY_ID || "",
  process.env.URL || "",
  String(Date.now()),
].join("|");
const hash = createHash("sha256").update(seed).digest("hex");
const buildCode = hash.slice(0, 10).toUpperCase();
const generatedAt = new Date().toISOString();

const templateName = await selectTemplate(TEMPLATE_ROOT, LANDING_TEMPLATE, hash);
const tokens = {
  "{{BUILD_CODE}}": buildCode,
  "{{PUBLIC_RELAY_PATH}}": publicRelayPath,
  "{{RELAY_PATH}}": relayPath,
  "{{GENERATED_AT}}": generatedAt,
  "{{TEMPLATE_NAME}}": templateName,
};

await rm("public", { recursive: true, force: true });
await mkdir("public", { recursive: true });

if (templateName) {
  const templateDir = join(TEMPLATE_ROOT, templateName);
  await copyDirectory(templateDir, "public");
  await replaceTokensRecursive("public", tokens);
  console.log(
    `prepare-build: static frontend generated from template '${templateName}' (public path: ${publicRelayPath}, upstream path: ${relayPath}).`
  );
} else {
  await writeFallbackFrontend(tokens);
  console.log(
    `prepare-build: no templates found. fallback frontend generated (public path: ${publicRelayPath}, upstream path: ${relayPath}).`
  );
}

await writeNetlifyRoutingFiles({
  mode: netlifyRelayMode,
  targetDomain,
  publicRelayPath,
  relayPath,
});

async function selectTemplate(rootDir, explicitName, seedHash) {
  const names = await listTemplateNames(rootDir);
  if (names.length === 0) return "";

  if (explicitName) {
    const exact = names.find((x) => x.toLowerCase() === explicitName.toLowerCase());
    if (exact) return exact;
    console.warn(`prepare-build: LANDING_TEMPLATE='${explicitName}' not found. falling back to random.`);
  }

  const idx = parseInt(seedHash.slice(0, 8), 16) % names.length;
  return names[idx];
}

async function listTemplateNames(rootDir) {
  let dirents = [];
  try {
    dirents = await readdir(rootDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const valid = [];
  for (const entry of dirents) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const indexFile = join(rootDir, name, "index.html");
    try {
      const s = await stat(indexFile);
      if (s.isFile()) valid.push(name);
    } catch {}
  }
  return valid.sort((a, b) => a.localeCompare(b));
}

async function copyDirectory(from, to) {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(from, entry.name);
    const dstPath = join(to, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, dstPath);
      continue;
    }
    if (entry.isFile()) {
      await copyFileWithRetry(srcPath, dstPath);
    }
  }
}

async function replaceTokensRecursive(rootPath, tokensMap) {
  const textExt = new Set([".html", ".css", ".js", ".json", ".txt", ".xml", ".svg", ".md"]);
  const dirents = await readdir(rootPath, { withFileTypes: true });
  for (const dirent of dirents) {
    const target = join(rootPath, dirent.name);
    if (dirent.isDirectory()) {
      await replaceTokensRecursive(target, tokensMap);
      continue;
    }
    if (!dirent.isFile()) continue;

    const ext = extname(dirent.name).toLowerCase();
    if (!textExt.has(ext)) continue;

    const original = await readFile(target, "utf8");
    const replaced = applyTokens(original, tokensMap);
    if (replaced !== original) {
      await writeFile(target, replaced, "utf8");
    }
  }
}

function applyTokens(input, tokensMap) {
  let out = String(input);
  for (const [token, value] of Object.entries(tokensMap)) {
    out = out.split(token).join(String(value));
  }
  return out;
}

async function copyFileWithRetry(srcPath, dstPath) {
  const attempts = 5;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await copyFile(srcPath, dstPath);
      return;
    } catch (err) {
      const code = err?.code || "";
      if ((code === "EBUSY" || code === "EPERM") && i < attempts - 1) {
        await sleep(40 * (i + 1));
        continue;
      }
      throw err;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeFallbackFrontend(tokensMap) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relay Landing</title>
  <meta name="description" content="Static fallback landing page">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main>
    <h1>Relay Landing</h1>
    <p>Template: {{TEMPLATE_NAME}}</p>
    <p>Build: {{BUILD_CODE}}</p>
    <p>Public Path: {{PUBLIC_RELAY_PATH}}</p>
    <p>Upstream Path: {{RELAY_PATH}}</p>
    <p>Generated: {{GENERATED_AT}}</p>
  </main>
</body>
</html>
`;
  const css = `body { margin: 0; font-family: Arial, sans-serif; background: #f4f7fb; color: #203049; }
main { max-width: 760px; margin: 40px auto; padding: 24px; background: #fff; border: 1px solid #dce4ef; border-radius: 12px; }
h1 { margin-top: 0; }`;

  await writeFile("public/index.html", applyTokens(html, tokensMap), "utf8");
  await writeFile("public/styles.css", applyTokens(css, tokensMap), "utf8");
}

async function writeNetlifyRoutingFiles({ mode, targetDomain, publicRelayPath, relayPath }) {
  const selectedMode = mode === "proxy" || mode === "fast-pipe"
    ? "proxy"
    : mode === "edge" || mode === "edge-function"
      ? "edge"
      : "function";
  const publicBase = normalizePath(publicRelayPath);
  const upstreamBase = normalizePath(relayPath);
  const redirects = [];

  if (selectedMode === "proxy") {
    if (!targetDomain) {
      throw new Error("NETLIFY_RELAY_MODE=proxy requires TARGET_DOMAIN during build.");
    }
    redirects.push(`${publicBase} ${targetDomain}${upstreamBase}/ 200!`);
    redirects.push(`${publicBase}/* ${targetDomain}${upstreamBase}/:splat 200!`);
  } else if (selectedMode === "function") {
    redirects.push(`${publicBase} /.netlify/functions/relay 200!`);
    redirects.push(`${publicBase}/* /.netlify/functions/relay/:splat 200!`);
  }

  redirects.push("/* /index.html 200");
  await writeFile("public/_redirects", `${redirects.join("\n")}\n`, "utf8");

  const headers = [
    publicBase,
    "  Cache-Control: no-store, no-cache, must-revalidate, max-age=0",
    "  CDN-Cache-Control: no-store",
    "  Netlify-CDN-Cache-Control: no-store",
    `${publicBase}/*`,
    "  Cache-Control: no-store, no-cache, must-revalidate, max-age=0",
    "  CDN-Cache-Control: no-store",
    "  Netlify-CDN-Cache-Control: no-store",
    "",
  ];
  await writeFile("public/_headers", headers.join("\n"), "utf8");

  console.log(
    `prepare-build: Netlify routing generated (${selectedMode}, public path: ${publicBase}, upstream path: ${upstreamBase}).`
  );
}

function normalizePath(raw) {
  const input = String(raw || "").trim();
  if (!input) return "/api";
  const base = input.startsWith("/") ? input : `/${input}`;
  return base.length > 1 && base.endsWith("/") ? base.slice(0, -1) : base;
}
