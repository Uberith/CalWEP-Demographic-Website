export const DEBUG = new URLSearchParams(window.location.search).has("debug");
let debugEl = null;
export function logDebug(...args) {
  if (!DEBUG) return;
  console.log(...args);
  if (!debugEl) {
    debugEl = document.createElement("pre");
    debugEl.id = "debugLog";
    document.body.appendChild(debugEl);
  }
  debugEl.textContent +=
    args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ") +
    "\n";
}

export async function monitorAsync(name, fn, meta = {}) {
  const start = performance.now();
  try {
    const result = await fn();
    return result;
  } catch (err) {
    window.Sentry?.captureException(err, { extra: { name, ...meta } });
    throw err;
  } finally {
    const duration = performance.now() - start;
    logDebug(name, { ...meta, duration });
    window.Sentry?.addBreadcrumb?.({
      category: "async",
      message: name,
      data: { ...meta, duration },
    });
  }
}

export const API_BASE = "https://nftapi.cyberwiz.io";
export const API_PATH = "/demographics"; // see section 2 for why '/api' is safest

export function buildApiUrl(path, params = {}) {
  const base = API_BASE.endsWith("/") ? API_BASE : API_BASE + "/";
  const url = new URL(path.replace(/^\//, ""), base);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).length)
      url.searchParams.set(k, v);
  }
  return url.toString();
}

export async function fetchJsonWithDiagnostics(url) {
  return monitorAsync(
    "fetchJsonWithDiagnostics",
    async () => {
      let res;
      try {
        res = await fetch(url, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
      } catch (e) {
        throw new Error(`Network error calling API: ${e?.message || e}`);
      }
      const txt = await res.text().catch(() => "");
      if (!res.ok)
        throw new Error(
          `API ${res.status} ${res.statusText} for ${url} :: ${txt || "<no body>"}`,
        );
      try {
        return JSON.parse(txt);
      } catch {
        throw new Error(
          `API 200 but response was not valid JSON for ${url} :: ${txt.slice(0, 200)}…`,
        );
      }
    },
    { url },
  );
}
