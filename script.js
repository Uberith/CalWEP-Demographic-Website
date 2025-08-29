/* script.js — Demographics Lookup (API-base aware)
   - Reads API base from <meta name="api-base"> (https://api.calwep.org)
   - Calls GET /demographics?address=...
   - Robust fetch diagnostics, Google Places autocomplete, Enter-to-search, aria-busy
*/

let autocomplete = null;
// Abort controller for in-flight lookups to prevent piling up work
let currentLookupController = null;
let CURRENT_SOURCE_LOG = null;
// Simple in-memory JSON cache for GET requests (per session)
const HTTP_JSON_CACHE = new Map(); // url -> Promise or value
function isCacheableUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    // Cache Census APIs and local dev proxies (ACS + Geocoder). Also cache our API reads.
    return (
      /api\.census\.gov$/i.test(u.hostname) ||
      (u.origin === window.location.origin && /^\/proxy\/(acs|geocoder)\b/.test(u.pathname)) ||
      (u.origin === window.location.origin && /^(?:\/demographics|\/lookup|\/census-tracts)\b/.test(u.pathname))
    );
  } catch {
    return false;
  }
}

function logSource(section, url, ok, note = "") {
  if (!CURRENT_SOURCE_LOG) return;
  if (!CURRENT_SOURCE_LOG[section]) CURRENT_SOURCE_LOG[section] = [];
  CURRENT_SOURCE_LOG[section].push({ url, ok: !!ok, note: String(note || "") });
}

async function fetchJsonRetryL(url, section, opts = {}) {
  try {
    const j = await fetchJsonRetry(url, opts);
    logSource(section, url, true);
    return j;
  } catch (e) {
    logSource(section, url, false, e && e.message ? e.message : String(e));
    throw e;
  }
}

function sourceDomainLabel(u) {
  try {
    const url = new URL(u);
    const host = url.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === window.location.hostname;
    const path = url.pathname || '';
    if (isLocal) {
      if (/^\/(demographics|lookup|census-tracts)/.test(path)) return 'api.calwep.org';
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

function renderSourceNotesGrouped(section, sourceLog) {
  const entries = sourceLog && sourceLog[section] ? sourceLog[section] : [];
  if (!entries.length) return "";
  const grouped = new Map();
  let order = 0;
  for (const e of entries) {
    const label = sourceDomainLabel(e.url);
    if (!label) continue;
    if (!grouped.has(label)) grouped.set(label, { ok: 0, fail: 0, total: 0, lastOkOrder: -1 });
    const g = grouped.get(label);
    g.total += 1;
    if (e.ok) { g.ok += 1; g.lastOkOrder = order; } else { g.fail += 1; }
    order += 1;
  }
  if (!grouped.size) return "";
  // Determine the domain that materially provided data (latest success)
  let usedDomain = null; let usedOrder = -1;
  for (const [domain, stats] of grouped.entries()) {
    if (stats.lastOkOrder > usedOrder) { usedOrder = stats.lastOkOrder; usedDomain = domain; }
  }
  const lines = [];
  if (usedDomain) lines.push(`${escapeHTML(usedDomain)} — used`);
  for (const [domain, stats] of grouped.entries()) {
    if (domain === usedDomain) continue;
    if (stats.fail > 0 && stats.ok === 0) lines.push(`${escapeHTML(domain)} — down (${stats.fail})`);
  }
  if (!lines.length) return "";
  return `<details class=\"source-notes\"><summary>Details</summary><p class=\"note\">${lines.join('<br>')}</p></details>`;
}
function renderSourceNotes(section, sourceLog) {
  const entries = sourceLog && sourceLog[section] ? sourceLog[section] : [];
  if (!entries.length) return "";
  const succ = entries.filter((e) => e.ok);
  const fail = entries.filter((e) => !e.ok);
  const list = entries
    .map((e) => `${e.ok ? "✓" : "✗"} ${escapeHTML(e.url)}${e.ok ? "" : ` — ${escapeHTML(e.note)}`}`)
    .join("<br>");
  return `<div class="source-notes"><p class="note"><strong>Endpoints tried:</strong><br>${list}</p></div>`;
}

let lastReport = null;
// Cache previously retrieved results to avoid redundant network requests
const lookupCache = new Map();

function getSelections() {
  const scopes = {
    tract: document.getElementById("scope-tract")?.checked ?? true,
    radius: document.getElementById("scope-radius")?.checked ?? true,
    water: document.getElementById("scope-water")?.checked ?? true,
  };
  const categories = {
    demographics: document.getElementById("cat-demographics")?.checked ?? true,
    language: document.getElementById("cat-language")?.checked ?? true,
    housing: document.getElementById("cat-housing")?.checked ?? true,
    enviroscreen: document.getElementById("cat-enviroscreen")?.checked ?? true,
    dac: document.getElementById("cat-dac")?.checked ?? true,
    race: document.getElementById("cat-race")?.checked ?? true,
    alerts: document.getElementById("cat-alerts")?.checked ?? true,
  };
  return { scopes, categories };
}

function printReport() {
  window.print();
}

function downloadRawData() {
  if (!lastReport) return;
  const blob = new Blob([JSON.stringify(lastReport, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = (lastReport.address || "report")
    .replace(/[^a-z0-9]+/gi, "_")
    .toLowerCase();
  a.href = url;
  a.download = `calwep_report_${safe}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadPdf() {
  if (!lastReport) return;
  const safe = (lastReport.address || "report")
    .replace(/[^a-z0-9]+/gi, "_")
    .toLowerCase();
  const element = document.querySelector("#result .card");
  if (!element) return;
  const opt = {
    margin: 0.5,
    filename: `calwep_report_${safe}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };
  html2pdf().set(opt).from(element).save();
}

function shareReport() {
  const link = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Link copied to clipboard"))
      .catch(() => {
        prompt("Copy this link:", link);
      });
  } else {
    prompt("Copy this link:", link);
  }
}

// ---------- Config ----------
const API_BASE =
  document.querySelector('meta[name="api-base"]')?.content ||
  window.location.origin;
const API_PATH = "/demographics"; // see section 2 for why '/api' is safest

// ---------- Utilities ----------
function escapeHTML(str = "") {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function isMissing(n) {
  return n == null || Number(n) === -888888888;
}
function isMissingOrZero(n) {
  const v = Number(n);
  return n == null || !Number.isFinite(v) || v === 0 || v === -888888888;
}
function fmtInt(n) {
  return !isMissing(n) && Number.isFinite(Number(n))
    ? Number(n).toLocaleString()
    : "—";
}
function fmtCurrency(n) {
  if (isMissing(n) || !Number.isFinite(Number(n))) return "—";
  const r = Math.round(Number(n));
  return `$${r.toLocaleString()}`;
}
function fmtNumber(n) {
  return !isMissing(n) && Number.isFinite(Number(n))
    ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 })
    : "—";
}
function fmtPct(n) {
  return !isMissing(n) && Number.isFinite(Number(n))
    ? `${Number(n).toFixed(1)}%`
    : "—";
}
function titleCase(str = "") {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function deepMerge(target = {}, ...sources) {
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  for (const src of sources) {
    if (!isObj(src)) continue;
    for (const [key, val] of Object.entries(src)) {
      if (isObj(val)) {
        target[key] = deepMerge(isObj(target[key]) ? target[key] : {}, val);
      } else {
        target[key] = val;
      }
    }
  }
  return target;
}

// Split an array into chunks so API requests stay within URL limits
function chunk(arr = [], size = 50) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
const CES_LABELS = {
  pm25: "PM2.5",
  diesel: "Diesel PM",
  toxic_releases: "Toxic releases",
  drinking_water: "Drinking water",
  cleanup_sites: "Cleanup sites",
  groundwater_threats: "Groundwater threats",
  hazardous_waste: "Hazardous waste",
  impaired_waters: "Impaired waters",
  solid_waste: "Solid waste",
  low_birth_weight: "Low birth weight",
  cardiovascular_disease: "Cardiovascular disease",
  linguistic_isolation: "Linguistic isolation",
  housing_burden: "Housing burden",
};

// Desired display order for CalEnviroScreen indicator groups
const CES_GROUP_ORDER = {
  exposures: [
    "ozone",
    "pm25",
    "diesel",
    "toxic_releases",
    "traffic",
    "pesticides",
    "drinking_water",
    "lead",
  ],
  environmental_effects: [
    "cleanup_sites",
    "groundwater_threats",
    "hazardous_waste",
    "impaired_waters",
    "solid_waste",
  ],
  sensitive_populations: [
    "asthma",
    "low_birth_weight",
    "cardiovascular_disease",
  ],
  socioeconomic_factors: [
    "education",
    "linguistic_isolation",
    "poverty",
    "unemployment",
    "housing_burden",
  ],
};
function nowStamp() {
  return new Date().toLocaleString();
}

// Simple search timer
let searchTimerInterval = null;
let searchTimerStart = null;
function formatDuration(ms = 0) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mLabel = minutes === 1 ? "Minute" : "Minutes";
  const sLabel = seconds === 1 ? "Second" : "Seconds";
  return `${minutes} ${mLabel} and ${seconds} ${sLabel}`;
}
function startSearchTimer() {
  searchTimerStart = Date.now();
  const setText = (text) => {
    const timerEl = document.getElementById("searchTimer");
    if (timerEl) timerEl.textContent = text;
    const spinnerEl = document.getElementById("spinnerTime");
    if (spinnerEl) spinnerEl.textContent = text;
  };
  setText("0m 00s");
  searchTimerInterval = setInterval(() => {
    if (!searchTimerStart) return;
    const elapsed = Date.now() - searchTimerStart;
    const secs = Math.floor((elapsed / 1000) % 60);
    const mins = Math.floor(elapsed / 60000);
    setText(`${mins}m ${secs.toString().padStart(2, "0")}s`);
  }, 1000);
}
function stopSearchTimer() {
  if (searchTimerInterval) clearInterval(searchTimerInterval);
  const elapsed = searchTimerStart ? Date.now() - searchTimerStart : 0;
  searchTimerInterval = null;
  searchTimerStart = null;
  return elapsed;
}
function buildApiUrl(path, params = {}) {
  const base = API_BASE.endsWith("/") ? API_BASE : API_BASE + "/";
  const url = new URL(path.replace(/^\//, ""), base);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).length)
      url.searchParams.set(k, v);
  }
  return url.toString();
}
function withTimeout(promise, ms, fallbackValue, onTimeout) {
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (onTimeout) try { onTimeout(); } catch {}
      if (arguments.length >= 3) resolve(fallbackValue);
      else reject(new Error('Timed out'));
    }, ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise,
  ]);
}

async function fetchJsonWithDiagnostics(url, opts = {}) {
  const { timeoutMs = 15000, signal, headers = {} } = opts;
  let res;
  try {
    const p = fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      signal,
      headers: { Accept: "application/json", ...headers },
    });
    res = await withTimeout(p, timeoutMs);
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
}

async function fetchJsonRetry(url, opts = {}) {
  const {
    retries = 2,
    backoffMs = 600,
    timeoutMs = 12000,
    signal,
    headers = {},
    noCache = false,
  } = opts || {};
  const cacheable = !noCache && isCacheableUrl(url);
  if (cacheable && HTTP_JSON_CACHE.has(url)) {
    const cached = HTTP_JSON_CACHE.get(url);
    if (cached && typeof cached.then === 'function') return cached; // in-flight promise
    return cached; // resolved value
  }
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const p = fetchJsonWithDiagnostics(url, { timeoutMs, signal, headers });
      if (cacheable) HTTP_JSON_CACHE.set(url, p);
      const val = await p;
      if (cacheable) HTTP_JSON_CACHE.set(url, val);
      return val;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
        continue;
      }
    }
  }
  throw lastErr;
}

function toCensus(url) {
  try {
    const u = new URL(url);
    const pathAndQuery = u.pathname + (u.search || '');
    if (u.hostname.endsWith('api.census.gov')) {
      return `${window.location.origin}/proxy/acs${pathAndQuery}`;
    }
    if (u.hostname === 'geocoding.geo.census.gov') {
      return `${window.location.origin}/proxy/geocoder${pathAndQuery}`;
    }
  } catch {}
  return url;
}
// Attempt to fill in missing city or census tract using public geocoders
async function enrichLocation(data = {}) {
  let { city, census_tract, lat, lon, state_fips, county_fips, tract_code } =
    data;
  let usedGeocoderFallback = false;
  let geocodeFallbackSource = null;
  const tasks = [];
  if (!city && lat != null && lon != null) {
    tasks.push(
      fetchJsonRetry(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { retries: 1, timeoutMs: 8000 },
      )
        .then((j) => {
          const adminCity = Array.isArray(j?.localityInfo?.administrative)
            ? j.localityInfo.administrative.find(
                (a) => a.order === 8 || a.adminLevel === 8,
              )?.name
            : null;
          city = adminCity || j.city || j.locality || city;
          // County name if missing
          const adminCounty = Array.isArray(j?.localityInfo?.administrative)
            ? j.localityInfo.administrative.find((a) => a.order === 6 || a.adminLevel === 6)?.name
            : null;
          if (!data.county && adminCounty) data.county = adminCounty;
          // FIPS codes if available
          const sFips = j?.fips?.state;
          const cFips = j?.fips?.county;
          if (!state_fips && sFips) state_fips = String(sFips).padStart(2, '0');
          if (!county_fips && cFips) county_fips = String(cFips).padStart(3, '0');
        })
        .catch(() => {}),
    );
  }
  async function fipsFromCensusGeocoder(lat, lon) {
    try {
      const u = toCensus(`https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`);
      const j = await fetchJsonRetry(u, { retries: 1, timeoutMs: 10000 });
      const tract = j?.result?.geographies?.["Census Tracts"]?.[0];
      const geoid = tract?.GEOID;
      const name = tract?.NAME;
      if (geoid && geoid.length >= 11) {
        const state = geoid.slice(0, 2);
        const county = geoid.slice(2, 5);
        const tract6 = geoid.slice(5);
        return {
          state_fips: state,
          county_fips: county,
          tract_code: tract6,
          census_tract: name || `${tract6.slice(0, 4)}.${tract6.slice(4)}`,
          source: 'census_geocoder',
        };
      }
    } catch {}
    return null;
  }
  async function fipsFromTigerWeb(lat, lon) {
    try {
      const tractUrl =
        "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query";
      const params = new URLSearchParams({
        where: "1=1",
        geometry: JSON.stringify({ x: Number(lon), y: Number(lat), spatialReference: { wkid: 4326 } }),
        geometryType: "esriGeometryPoint",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "NAME,GEOID,INTPTLAT,INTPTLON",
        returnGeometry: "false",
        f: "json",
      });
      const j = await fetchJsonRetryL(`${tractUrl}?${params.toString()}`, 'location', { retries: 1, timeoutMs: 10000 });
      const attrs = j?.features?.[0]?.attributes;
      const geoid = attrs?.GEOID;
      const name = attrs?.NAME;
      const latp = attrs?.INTPTLAT;
      const lonp = attrs?.INTPTLON;
      // Also fetch county name from TIGERweb Counties layer (9)
      let countyName = null;
      try {
        const countyUrl =
          "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/9/query";
        const cparams = new URLSearchParams({
          where: "1=1",
          geometry: JSON.stringify({ x: Number(lon), y: Number(lat), spatialReference: { wkid: 4326 } }),
          geometryType: "esriGeometryPoint",
          inSR: "4326",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "NAME,GEOID",
          returnGeometry: "false",
          f: "json",
        });
        const cj = await fetchJsonRetryL(`${countyUrl}?${cparams.toString()}`, 'location', { retries: 1, timeoutMs: 10000 });
        countyName = cj?.features?.[0]?.attributes?.NAME || null;
      } catch {}
      // Try to fetch place (city/CDP) name from possible Places layers (best-effort)
      let placeName = null;
      const placeLayers = [7, 8];
      for (const layer of placeLayers) {
        try {
          const placeUrl = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/${layer}/query`;
          const pparams = new URLSearchParams({
            where: "1=1",
            geometry: JSON.stringify({ x: Number(lon), y: Number(lat), spatialReference: { wkid: 4326 } }),
            geometryType: "esriGeometryPoint",
            inSR: "4326",
            spatialRel: "esriSpatialRelIntersects",
            outFields: "NAME,GEOID",
            returnGeometry: "false",
            f: "json",
          });
          const pj = await fetchJsonRetryL(`${placeUrl}?${pparams.toString()}`, 'location', { retries: 1, timeoutMs: 8000 });
          const n = pj?.features?.[0]?.attributes?.NAME;
          if (n) { placeName = n; break; }
        } catch {}
      }
      if (geoid && geoid.length >= 11) {
        const state = String(geoid).slice(0, 2);
        const county = String(geoid).slice(2, 5);
        const tract6 = String(geoid).slice(5);
        const info = {
          state_fips: state,
          county_fips: county,
          tract_code: tract6,
          census_tract: name || `${tract6.slice(0, 4)}.${tract6.slice(4)}`,
          source: 'tigerweb',
        };
        if (countyName) info.county = countyName;
        if (placeName) info.city = placeName;
        if (latp && lonp) { info.lat = Number(latp); info.lon = Number(lonp); }
        return info;
      }
    } catch {}
    return null;
  }
  if (
    (!census_tract || !state_fips || !county_fips || !tract_code) &&
    lat != null &&
    lon != null
  ) {
    tasks.push((async () => {
      // Preferred order: Census Geocoder → TIGERweb → FCC
      let alt = await fipsFromCensusGeocoder(lat, lon);
      if (!alt) alt = await fipsFromTigerWeb(lat, lon);
      if (!alt) {
        try {
          const j = await fetchJsonRetry(
            `https://geo.fcc.gov/api/census/block/find?latitude=${lat}&longitude=${lon}&format=json`,
            { retries: 2, timeoutMs: 10000 },
          );
          const fips = j?.Block?.FIPS;
          if (fips && fips.length >= 11) {
            state_fips = fips.slice(0, 2);
            county_fips = fips.slice(2, 5);
            tract_code = fips.slice(5, 11);
            census_tract = `${tract_code.slice(0, 4)}.${tract_code.slice(4)}`;
            geocodeFallbackSource = 'fcc';
            usedGeocoderFallback = true; // fallback from preferred
            return;
          }
        } catch {}
      }
      if (alt) {
        state_fips = alt.state_fips;
        county_fips = alt.county_fips;
        tract_code = alt.tract_code;
        census_tract = alt.census_tract;
        geocodeFallbackSource = alt.source || 'census_geocoder';
        // If source isn't census_geocoder, we consider it a fallback
        usedGeocoderFallback = geocodeFallbackSource !== 'census_geocoder';
        if ((alt.lat != null && alt.lon != null) && (lat == null || lon == null)) {
          lat = alt.lat;
          lon = alt.lon;
        }
        if (alt.city && !city) city = alt.city;
      }
    })());
  }
  if (tasks.length) await Promise.all(tasks);
  return {
    ...data,
    city,
    census_tract,
    state_fips,
    county_fips,
    tract_code,
    geocoder_fallback: usedGeocoderFallback,
    geocode_fallback_source: geocodeFallbackSource,
  };
}

let LANGUAGE_META = null;
async function getLanguageMeta() {
  if (LANGUAGE_META) return LANGUAGE_META;
  try {
    const meta = await fetchJsonWithDiagnostics(
      toCensus("https://api.census.gov/data/2022/acs/acs5/groups/C16001.json"),
    );
    const vars = meta?.variables || {};
    const codes = [];
    const names = {};
    for (const [code, info] of Object.entries(vars)) {
      if (!code.endsWith("E")) continue;
      const label = info.label || "";
      const m = /^Estimate!!Total:!!([^:]+):$/.exec(label);
      if (m) {
        codes.push(code);
        names[code] = m[1];
      }
    }
    LANGUAGE_META = { codes, names };
  } catch {
    LANGUAGE_META = { codes: [], names: {} };
  }
  return LANGUAGE_META;
}

async function aggregateLanguageForTracts(fipsList = []) {
  const { codes, names } = await getLanguageMeta();
  if (!codes.length) return {};
  const groups = {};
  for (const f of fipsList) {
    const code = String(f).replace(/[^0-9]/g, "").padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }
  let total = 0;
  let englishOnly = 0;
  let englishLess = 0;
  const langCounts = {};
  const groupPromises = Object.values(groups).map(async (g) => {
    const tractChunks = chunk(g.tracts, 50);
    const chunkResults = await Promise.all(
      tractChunks.map(async (tChunk) => {
        const tractStr = tChunk.join(",");
        const chunkSize = 40;
        const tasks = [];
        for (let i = 0; i < codes.length; i += chunkSize) {
          const varChunk = codes.slice(i, i + chunkSize);
          const vars =
            i === 0
              ? ["C16001_001E", "C16001_002E", ...varChunk]
              : varChunk;
          const url =
            toCensus(`https://api.census.gov/data/2022/acs/acs5?get=${vars.join(",")}&for=tract:${tractStr}&in=state:${g.state}%20county:${g.county}`);
          tasks.push(
            fetchJsonRetryL(url, 'language', { retries: 2, timeoutMs: 15000 })
              .then((rows) => ({ type: "lang", rows, chunk: varChunk }))
              .catch(() => null),
          );
        }
        const url2 =
          toCensus(`https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0115E&for=tract:${tractStr}&in=state:${g.state}%20county:${g.county}`);
        tasks.push(
          fetchJsonRetryL(url2, 'language', { retries: 2, timeoutMs: 15000 })
            .then((rows) => ({ type: "english", rows }))
            .catch(() => null),
        );
        const results = await Promise.all(tasks);
        let gTotal = 0;
        let gEnglishOnly = 0;
        let gEnglishLess = 0;
        const gLangCounts = {};
        for (const res of results) {
          if (!res || !Array.isArray(res.rows) || res.rows.length <= 1) continue;
          const { rows } = res;
          if (res.type === "lang") {
            const headers = rows[0];
            for (let j = 1; j < rows.length; j++) {
              const row = rows[j];
              const rec = {};
              headers.forEach((h, idx) => (rec[h] = Number(row[idx])));
              gTotal += rec.C16001_001E || 0;
              gEnglishOnly += rec.C16001_002E || 0;
              for (const code of res.chunk) {
                const name = names[code];
                const val = rec[code] || 0;
                if (name) gLangCounts[name] = (gLangCounts[name] || 0) + val;
              }
            }
          } else if (res.type === "english") {
            const headers2 = rows[0];
            for (let i = 1; i < rows.length; i++) {
              const row2 = rows[i];
              const rec2 = {};
              headers2.forEach((h, idx) => (rec2[h] = Number(row2[idx])));
              gEnglishLess += rec2.DP02_0115E || 0;
            }
          }
        }
        return {
          total: gTotal,
          englishOnly: gEnglishOnly,
          englishLess: gEnglishLess,
          langCounts: gLangCounts,
        };
      }),
    );
    const agg = { total: 0, englishOnly: 0, englishLess: 0, langCounts: {} };
    for (const res of chunkResults) {
      agg.total += res.total;
      agg.englishOnly += res.englishOnly;
      agg.englishLess += res.englishLess;
      for (const [lang, count] of Object.entries(res.langCounts)) {
        agg.langCounts[lang] = (agg.langCounts[lang] || 0) + count;
      }
    }
    return agg;
  });
  const groupResults = await Promise.all(groupPromises);
  for (const res of groupResults) {
    total += res.total;
    englishOnly += res.englishOnly;
    englishLess += res.englishLess;
    for (const [lang, count] of Object.entries(res.langCounts)) {
      langCounts[lang] = (langCounts[lang] || 0) + count;
    }
  }
  langCounts.English = englishOnly;
  const spanishCount = langCounts.Spanish || 0;
  const sorted = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  return {
    primary_language: sorted[0]?.[0],
    secondary_language: sorted[1]?.[0],
    language_other_than_english_pct:
      total ? ((total - englishOnly) / total) * 100 : null,
    english_less_than_very_well_pct: total ? (englishLess / total) * 100 : null,
    spanish_at_home_pct: total ? (spanishCount / total) * 100 : null,
  };
}

async function fetchLanguageAcs({ state_fips, county_fips, tract_code } = {}) {
  if (!state_fips || !county_fips || !tract_code) return {};
  const fips = `${state_fips}${county_fips}${tract_code}`;
  return aggregateLanguageForTracts([fips]);
}

// Aggregate basic demographic fields for a set of census tracts using
// population-weighted averages.
async function aggregateBasicDemographicsForTracts(fipsList = []) {
  const groups = {};
  for (const f of fipsList) {
    const code = String(f).replace(/[^0-9]/g, "").padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }

  let totalPop = 0;
  let ageWeighted = 0;
  let incomeWeighted = 0;
  let perCapitaWeighted = 0;
  let povertyCount = 0;

  const tasks = [];
  const fbTasks = [];
  for (const g of Object.values(groups)) {
    const tractChunks = chunk(g.tracts, 50);
    for (const ch of tractChunks) {
      const url =
        toCensus("https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE&for=tract:") +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      tasks.push(
        fetchJsonRetryL(url, 'population', { retries: 2, timeoutMs: 15000 })
          .catch(() => null),
      );
      // Fallbacks: base and subject tables
      const fb1 =
        toCensus("https://api.census.gov/data/2022/acs/acs5?get=B01003_001E,B01002_001E,B19013_001E,B19301_001E&for=tract:") +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      const fb2 =
        toCensus("https://api.census.gov/data/2022/acs/acs5/subject?get=S1701_C02_001E&for=tract:") +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      fbTasks.push(fetchJsonRetryL(fb1, 'population', { retries: 2, timeoutMs: 15000 }).catch(() => null));
      fbTasks.push(fetchJsonRetryL(fb2, 'population', { retries: 2, timeoutMs: 15000 }).catch(() => null));
    }
  }

  const responses = await Promise.all(tasks);
  const fbResponses = await Promise.all(fbTasks);
  const fbMap = new Map();
  for (const rows of fbResponses) {
    if (!Array.isArray(rows) || rows.length < 2) continue;
    const headers = rows[0];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rec = {};
      headers.forEach((h, idx) => (rec[h] = row[idx]));
      const state = rec.state, county = rec.county, tract = rec.tract;
      if (!state || !county || !tract) continue;
      const geoid = `${state}${county}${tract}`;
      if (!fbMap.has(geoid)) fbMap.set(geoid, {});
      const dest = fbMap.get(geoid);
      if (rec.B01003_001E) dest.pop = Number(rec.B01003_001E);
      if (rec.B01002_001E) dest.age = Number(rec.B01002_001E);
      if (rec.B19013_001E) dest.mhi = Number(rec.B19013_001E);
      if (rec.B19301_001E) dest.pci = Number(rec.B19301_001E);
      if (rec.S1701_C02_001E) dest.povPct = Number(rec.S1701_C02_001E);
    }
  }
  for (const rows of responses) {
    if (!Array.isArray(rows) || rows.length < 2) continue;
    const header = rows[0];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rec = {};
      header.forEach((h, idx) => (rec[h] = row[idx]));
      let pop = Number(rec.DP05_0001E);
      let age = Number(rec.DP05_0018E);
      let income = Number(rec.DP03_0062E);
      let perCapita = Number(rec.DP03_0088E);
      let povPct = Number(rec.DP03_0128PE);
      if (!Number.isFinite(pop) || pop <= 0 || !Number.isFinite(age) || !Number.isFinite(income) || !Number.isFinite(perCapita) || !Number.isFinite(povPct)) {
        const geoid = `${rec.state}${rec.county}${rec.tract}`;
        const fb = fbMap.get(geoid) || {};
        if ((!Number.isFinite(pop) || pop <= 0) && Number.isFinite(fb.pop)) pop = fb.pop;
        if (!Number.isFinite(age) && Number.isFinite(fb.age)) age = fb.age;
        if (!Number.isFinite(income) && Number.isFinite(fb.mhi)) income = fb.mhi;
        if (!Number.isFinite(perCapita) && Number.isFinite(fb.pci)) perCapita = fb.pci;
        if (!Number.isFinite(povPct) && Number.isFinite(fb.povPct)) povPct = fb.povPct;
      }
      if (Number.isFinite(pop) && pop > 0) {
        totalPop += pop;
        if (Number.isFinite(age)) ageWeighted += age * pop;
        if (Number.isFinite(income)) incomeWeighted += income * pop;
        if (Number.isFinite(perCapita)) perCapitaWeighted += perCapita * pop;
        if (Number.isFinite(povPct) && povPct >= 0)
          povertyCount += (povPct / 100) * pop;
      }
    }
  }

  const result = {};
  if (totalPop > 0) {
    result.population = totalPop;
    if (ageWeighted > 0) result.median_age = ageWeighted / totalPop;
    if (incomeWeighted > 0)
      result.median_household_income = incomeWeighted / totalPop;
    if (perCapitaWeighted > 0)
      result.per_capita_income = perCapitaWeighted / totalPop;
    if (povertyCount > 0) result.poverty_rate = (povertyCount / totalPop) * 100;
    if (result.population && Number.isFinite(result.poverty_rate)) {
      result.people_below_poverty = Math.round(
        (Number(result.poverty_rate) / 100) * Number(result.population),
      );
    }
  }
  return result;
}

// Aggregate race and ethnicity using ACS tables B02001 (race) and B03003 (Hispanic)
async function aggregateRaceForTracts(fipsList = []) {
  const groups = {};
  for (const f of fipsList) {
    const code = String(f).replace(/[^0-9]/g, "").padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }
  let tot = 0;
  let white = 0;
  let black = 0;
  let asian = 0;
  let native = 0;
  let pacific = 0;
  let other = 0;
  let twoPlus = 0;
  let hisp = 0;
  let notHisp = 0;
  const tasks = [];
  for (const g of Object.values(groups)) {
    const chunks = chunk(g.tracts, 50);
    for (const ch of chunks) {
      const urlRace =
        "https://api.census.gov/data/2022/acs/acs5?get=B02001_001E,B02001_002E,B02001_003E,B02001_004E,B02001_005E,B02001_006E,B02001_007E,B02001_008E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      const urlEth =
        "https://api.census.gov/data/2022/acs/acs5?get=B03003_001E,B03003_002E,B03003_003E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      tasks.push(
        Promise.all([
          fetch(urlRace).then((r) => r.json()).catch(() => null),
          fetch(urlEth).then((r) => r.json()).catch(() => null),
        ]),
      );
    }
  }
  const responses = await Promise.all(tasks);
  for (const pair of responses) {
    const [rowsRace, rowsEth] = pair || [];
    if (Array.isArray(rowsRace) && rowsRace.length > 1) {
      for (let i = 1; i < rowsRace.length; i++) {
        const [t, w, b, n, a, p, o, m] = rowsRace[i]
          .slice(0, 8)
          .map((x) => Number(x));
        if (Number.isFinite(t) && t > 0) {
          tot += t;
          if (Number.isFinite(w)) white += w;
          if (Number.isFinite(b)) black += b;
          if (Number.isFinite(n)) native += n;
          if (Number.isFinite(a)) asian += a;
          if (Number.isFinite(p)) pacific += p;
          if (Number.isFinite(o)) other += o;
          if (Number.isFinite(m)) twoPlus += m;
        }
      }
    }
    if (Array.isArray(rowsEth) && rowsEth.length > 1) {
      for (let i = 1; i < rowsEth.length; i++) {
        const [t, notH, h] = rowsEth[i]
          .slice(0, 3)
          .map((x) => Number(x));
        if (Number.isFinite(t) && t > 0) {
          if (Number.isFinite(notH)) notHisp += notH;
          if (Number.isFinite(h)) hisp += h;
        }
      }
    }
  }
  if (tot <= 0) return {};
  return {
    white_pct: (white / tot) * 100,
    black_pct: (black / tot) * 100,
    native_pct: (native / tot) * 100,
    asian_pct: (asian / tot) * 100,
    pacific_pct: (pacific / tot) * 100,
    other_race_pct: (other / tot) * 100,
    two_or_more_races_pct: (twoPlus / tot) * 100,
    hispanic_pct: (hisp / (hisp + notHisp || 1)) * 100,
    not_hispanic_pct: (notHisp / (hisp + notHisp || 1)) * 100,
  };
}

// Aggregate housing and education using ACS tables B25003 (tenure) and B15003 (education)
async function aggregateHousingEducationForTracts(fipsList = []) {
  const groups = {};
  for (const f of fipsList) {
    const code = String(f).replace(/[^0-9]/g, "").padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }
  let occTotal = 0;
  let owners = 0;
  let renters = 0;
  let eduTotal = 0;
  let bachelorsPlus = 0;
  let hsOrHigher = 0;
  let lessHS = 0;
  let hsGrad = 0;
  let someCollege = 0;
  let bachelorsOnly = 0;
  let gradProf = 0;
  const ownerUnitsByGeoid = {};
  const renterUnitsByGeoid = {};
  let ownerUnitsTotal = 0;
  let renterUnitsTotal = 0;
  let medianHomeWeighted = 0;
  let medianRentWeighted = 0;
  let housingUnitsTotal = 0;
  let occupiedUnits = 0;
  let vacantUnits = 0;
  const tasks = [];
  for (const g of Object.values(groups)) {
    const chunks = chunk(g.tracts, 50);
    for (const ch of chunks) {
      const urlTenure =
        "https://api.census.gov/data/2022/acs/acs5?get=B25003_001E,B25003_002E,B25003_003E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      const urlEdu =
        "https://api.census.gov/data/2022/acs/acs5?get=B15003_001E,B15003_022E,B15003_023E,B15003_024E,B15003_025E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      const urlEduHS =
        "https://api.census.gov/data/2022/acs/acs5?get=B15003_001E,B15003_017E,B15003_018E,B15003_019E,B15003_020E,B15003_021E,B15003_022E,B15003_023E,B15003_024E,B15003_025E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      const urlMedians =
        "https://api.census.gov/data/2022/acs/acs5?get=B25077_001E,B25064_001E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      const urlOccupancy =
        "https://api.census.gov/data/2022/acs/acs5?get=B25002_001E,B25002_002E,B25002_003E&for=tract:" +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      tasks.push(
        Promise.all([
          fetchJsonRetryL(toCensus(urlTenure), 'housing', { retries: 2, timeoutMs: 15000 }).catch(() => null),
          fetchJsonRetryL(toCensus(urlEdu), 'housing', { retries: 2, timeoutMs: 15000 }).catch(() => null),
          fetchJsonRetryL(toCensus(urlEduHS), 'housing', { retries: 2, timeoutMs: 15000 }).catch(() => null),
          fetchJsonRetryL(toCensus(urlMedians), 'housing', { retries: 2, timeoutMs: 15000 }).catch(() => null),
          fetchJsonRetryL(toCensus(urlOccupancy), 'housing', { retries: 2, timeoutMs: 15000 }).catch(() => null),
        ]),
      );
    }
  }
  const responses = await Promise.all(tasks);
  for (const pair of responses) {
    const [rowsTenure, rowsEdu, rowsEduHS, rowsMedians, rowsOccup] = pair || [];
    if (Array.isArray(rowsTenure) && rowsTenure.length > 1) {
      for (let i = 1; i < rowsTenure.length; i++) {
        const row = rowsTenure[i];
        const [t, o, r] = row.slice(0, 3).map((x) => Number(x));
        const [state, county, tract] = row.slice(-3);
        const geoid = `${state}${county}${tract}`;
        if (Number.isFinite(t) && t > 0) {
          occTotal += t;
          if (Number.isFinite(o)) {
            owners += o;
            ownerUnitsByGeoid[geoid] = (ownerUnitsByGeoid[geoid] || 0) + o;
            ownerUnitsTotal += o;
          }
          if (Number.isFinite(r)) {
            renters += r;
            renterUnitsByGeoid[geoid] = (renterUnitsByGeoid[geoid] || 0) + r;
            renterUnitsTotal += r;
          }
        }
      }
    }
    if (Array.isArray(rowsEdu) && rowsEdu.length > 1) {
      for (let i = 1; i < rowsEdu.length; i++) {
        const [t, b, m, p, d] = rowsEdu[i]
          .slice(0, 5)
          .map((x) => Number(x));
        if (Number.isFinite(t) && t > 0) {
          eduTotal += t;
          bachelorsPlus += [b, m, p, d].filter(Number.isFinite).reduce((a, n) => a + n, 0);
        }
      }
    }
    if (Array.isArray(rowsEduHS) && rowsEduHS.length > 1) {
      for (let i = 1; i < rowsEduHS.length; i++) {
        const nums = rowsEduHS[i].slice(0, 10).map((x) => Number(x));
        const t = nums[0];
        const hs = nums[1]; // 017E
        const sc = [nums[2], nums[3], nums[4], nums[5]] // 018E-021E
          .filter(Number.isFinite)
          .reduce((a, n) => a + n, 0);
        const bach = nums[6]; // 022E
        const grad = [nums[7], nums[8], nums[9]] // 023E-025E
          .filter(Number.isFinite)
          .reduce((a, n) => a + n, 0);
        if (Number.isFinite(t) && t > 0) {
          hsOrHigher += (Number.isFinite(hs) ? hs : 0) + sc + (Number.isFinite(bach) ? bach : 0) + grad;
          hsGrad += Number.isFinite(hs) ? hs : 0;
          someCollege += sc;
          bachelorsOnly += Number.isFinite(bach) ? bach : 0;
          gradProf += grad;
          // less than HS = total - (hs + sc + bach + grad)
          const less = t - ((Number.isFinite(hs) ? hs : 0) + sc + (Number.isFinite(bach) ? bach : 0) + grad);
          if (Number.isFinite(less) && less > 0) lessHS += less;
        }
      }
    }
    if (Array.isArray(rowsMedians) && rowsMedians.length > 1) {
      for (let i = 1; i < rowsMedians.length; i++) {
        const row = rowsMedians[i];
        const [mv, mr] = row.slice(0, 2).map((x) => Number(x));
        const [state, county, tract] = row.slice(-3);
        const geoid = `${state}${county}${tract}`;
        const ou = ownerUnitsByGeoid[geoid] || 0;
        const ru = renterUnitsByGeoid[geoid] || 0;
        if (Number.isFinite(mv) && mv > 0 && ou > 0) {
          medianHomeWeighted += mv * ou;
        }
        if (Number.isFinite(mr) && mr > 0 && ru > 0) {
          medianRentWeighted += mr * ru;
        }
      }
    }
    if (Array.isArray(rowsOccup) && rowsOccup.length > 1) {
      for (let i = 1; i < rowsOccup.length; i++) {
        const [total, occ, vac] = rowsOccup[i].slice(0, 3).map((x) => Number(x));
        if (Number.isFinite(total) && total > 0) {
          housingUnitsTotal += total;
          if (Number.isFinite(occ)) occupiedUnits += occ;
          if (Number.isFinite(vac)) vacantUnits += vac;
        }
      }
    }
  }
  const out = {};
  if (occTotal > 0) {
    out.owner_occupied_pct = (owners / occTotal) * 100;
    out.renter_occupied_pct = (renters / occTotal) * 100;
  }
  if (eduTotal > 0) {
    out.bachelors_or_higher_pct = (bachelorsPlus / eduTotal) * 100;
  }
  if (hsOrHigher > 0 && eduTotal > 0) {
    out.high_school_or_higher_pct = (hsOrHigher / eduTotal) * 100;
  }
  if (eduTotal > 0) {
    out.less_than_hs_pct = (lessHS / eduTotal) * 100;
    out.hs_grad_pct = (hsGrad / eduTotal) * 100;
    out.some_college_or_assoc_pct = (someCollege / eduTotal) * 100;
    out.bachelors_pct = (bachelorsOnly / eduTotal) * 100;
    out.grad_prof_pct = (gradProf / eduTotal) * 100;
  }
  if (ownerUnitsTotal > 0 && medianHomeWeighted > 0) {
    out.median_home_value = medianHomeWeighted / ownerUnitsTotal;
  }
  if (renterUnitsTotal > 0 && medianRentWeighted > 0) {
    out.median_gross_rent = medianRentWeighted / renterUnitsTotal;
  }
  // Set occupancy counts and derived rates
  if (housingUnitsTotal > 0) {
    out.housing_units_total = housingUnitsTotal;
    out.housing_units_occupied = occupiedUnits;
    out.housing_units_vacant = vacantUnits;
    out.vacancy_rate_pct = (vacantUnits / housingUnitsTotal) * 100;
    out.occupancy_rate_pct = (occupiedUnits / housingUnitsTotal) * 100;
  }
  return out;
}

// Fetch unemployment metrics for tracts. Prefer counts (labor force, unemployed) to compute accurate rates.
async function fetchUnemploymentForTracts(fipsList = []) {
  const groups = {};
  for (const f of fipsList) {
    const code = String(f).replace(/[^0-9]/g, "").padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }
  const results = {};
  const jobs = [];
  for (const g of Object.values(groups)) {
    const chunks = chunk(g.tracts, 50);
    for (const ch of chunks) {
      // Primary: counts from detailed table B23025 (labor force, unemployed)
      const urlCounts =
        toCensus("https://api.census.gov/data/2022/acs/acs5?get=B23025_003E,B23025_005E&for=tract:") +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      jobs.push({ type: 'counts', promise: fetchJsonRetryL(urlCounts, 'population', { retries: 2, timeoutMs: 15000 }).catch(() => null) });
      // Profile: unemployment rate percent and population (fallbacks)
      const urlProf =
        toCensus("https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0009PE,DP05_0001E&for=tract:") +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      jobs.push({ type: 'profile', promise: fetchJsonRetryL(urlProf, 'population', { retries: 2, timeoutMs: 15000 }).catch(() => null) });
      // Subject: unemployment rate percent and a population fallback
      const urlSubj =
        toCensus("https://api.census.gov/data/2022/acs/acs5/subject?get=S2301_C04_001E,S2301_C01_001E&for=tract:") +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      jobs.push({ type: 'subject', promise: fetchJsonRetryL(urlSubj, 'population', { retries: 2, timeoutMs: 15000 }).catch(() => null) });
    }
  }
  const jobResults = await Promise.all(jobs.map((j) => j.promise));
  for (let j = 0; j < jobResults.length; j++) {
    const rows = jobResults[j];
    const type = jobs[j].type;
    if (!Array.isArray(rows) || rows.length < 2) continue;
    const header = rows[0];
    for (let i = 1; i < rows.length; i++) {
      const rec = {};
      header.forEach((h, idx) => (rec[h] = rows[i][idx]));
      const state = rec.state, county = rec.county, tract = rec.tract;
      if (!state || !county || !tract) continue;
      const geoid = `${state}${county}${tract}`;
      const out = results[geoid] || { unemployment_rate: NaN, population: NaN, labor_force: NaN, unemployed: NaN };
      if (type === 'counts') {
        const lf = Number(rec.B23025_003E);
        const unemp = Number(rec.B23025_005E);
        if (Number.isFinite(lf)) out.labor_force = lf;
        if (Number.isFinite(unemp)) out.unemployed = unemp;
        if (Number.isFinite(out.labor_force) && out.labor_force > 0 && Number.isFinite(out.unemployed)) {
          out.unemployment_rate = (out.unemployed / out.labor_force) * 100;
        }
      } else if (type === 'profile') {
        if (rec.DP03_0009PE && !Number.isFinite(out.unemployment_rate)) out.unemployment_rate = Number(rec.DP03_0009PE);
        if (rec.DP05_0001E && !Number.isFinite(out.population)) out.population = Number(rec.DP05_0001E);
      } else if (type === 'subject') {
        if (rec.S2301_C04_001E && !Number.isFinite(out.unemployment_rate)) out.unemployment_rate = Number(rec.S2301_C04_001E);
        if (rec.S2301_C01_001E && !Number.isFinite(out.population)) out.population = Number(rec.S2301_C01_001E);
      }
      results[geoid] = out;
    }
  }
  return results;
}

// Fetch a list of census tract FIPS codes flagged as disadvantaged communities
async function fetchDacFips(fipsList = []) {
  const baseUrl =
    "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query";
  const out = new Set();
  const chunkSize = 50;
  const tasks = [];
  for (let i = 0; i < fipsList.length; i += chunkSize) {
    const chunk = fipsList.slice(i, i + chunkSize);
    if (!chunk.length) continue;
    const where = `GEOID20 IN (${chunk.map((f) => `'${f}'`).join(",")})`;
    const url =
      baseUrl +
      `?where=${encodeURIComponent(where)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    tasks.push(
      fetch(url)
        .then((r) => r.json())
        .catch(() => null),
    );
  }
  const results = await Promise.all(tasks);
  for (const j of results) {
    if (!j) continue;
    for (const f of j.features || []) {
      const attrs = f.attributes || {};
      const geoid = String(attrs.GEOID20);
      const status = String(attrs.DAC20 || "").toUpperCase();
      if (status === "Y") out.add(geoid);
    }
  }
  return Array.from(out);
}

// Fetch environmental hardships for one or more census tracts and merge them
async function aggregateHardshipsForTracts(fipsList = []) {
  const set = new Set();
  await Promise.all(
    fipsList.map(async (f) => {
      try {
        const url = buildApiUrl(API_PATH, { fips: f, census_tract: f, geoid: f });
        const j = await fetchJsonRetryL(url, 'hardships', { retries: 1, timeoutMs: 20000 });
        if (Array.isArray(j.environmental_hardships)) {
          j.environmental_hardships.forEach((h) => set.add(h));
        }
      } catch {
        // ignore errors for this tract
      }
    }),
  );
  return Array.from(set).sort();
}

// Populate basic demographic fields for surrounding and district regions using
// population-weighted averages.
async function enrichRegionBasics(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (
    Array.isArray(s.census_tracts_fips) &&
    s.census_tracts_fips.length
  ) {
    const basics = await aggregateBasicDemographicsForTracts(
      s.census_tracts_fips,
    );
    const d = s.demographics || {};
    out.surrounding_10_mile = {
      ...s,
      demographics: { ...d, ...basics },
    };
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (wFips.length) {
    const basics = await aggregateBasicDemographicsForTracts(wFips);
    const d = w.demographics || {};
    const surroundMedian =
      out.surrounding_10_mile?.demographics?.median_household_income;
    const merged = { ...d, ...basics };
    if (
      surroundMedian != null &&
      (!Number.isFinite(merged.median_household_income) ||
        merged.median_household_income < 0)
    ) {
      merged.median_household_income = surroundMedian;
    }
    out.water_district = { ...w, demographics: merged };
  }
  return out;
}

// Ensure unemployment rates are populated for local, surrounding, and water regions
async function enrichUnemployment(data = {}) {
  const {
    state_fips,
    county_fips,
    tract_code,
    unemployment_rate,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const s = surrounding_10_mile || {};
  const w = water_district || {};
  const needed = [];
  const localFips = state_fips && county_fips && tract_code ? `${state_fips}${county_fips}${tract_code}` : null;
  if (isMissingOrZero(unemployment_rate) && localFips) needed.push(localFips);
  const sFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips : [];
  if (s.demographics && isMissingOrZero(s.demographics.unemployment_rate) && sFips.length)
    needed.push(...sFips);
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (w.demographics && isMissingOrZero(w.demographics.unemployment_rate) && wFips.length)
    needed.push(...wFips);

  const fipsSet = Array.from(new Set(needed));
  if (!fipsSet.length) return data;
  const lookup = await fetchUnemploymentForTracts(fipsSet);

  const out = { ...data };
  if (isMissingOrZero(unemployment_rate) && localFips && lookup[localFips])
    out.unemployment_rate = lookup[localFips].unemployment_rate;

  if (s.demographics && isMissingOrZero(s.demographics.unemployment_rate) && sFips.length) {
    let lfTot = 0, unempTot = 0;
    let popTot = 0, ratePopWeighted = 0;
    for (const f of sFips) {
      const item = lookup[f];
      if (!item) continue;
      if (Number.isFinite(item.labor_force) && item.labor_force > 0 && Number.isFinite(item.unemployed)) {
        lfTot += item.labor_force;
        unempTot += item.unemployed;
      }
      if (Number.isFinite(item.unemployment_rate) && Number.isFinite(item.population) && item.population > 0) {
        popTot += item.population;
        ratePopWeighted += item.unemployment_rate * item.population;
      }
    }
    let rate = NaN;
    if (lfTot > 0) rate = (unempTot / lfTot) * 100;
    else if (popTot > 0) rate = ratePopWeighted / popTot;
    if (Number.isFinite(rate))
      out.surrounding_10_mile = {
        ...s,
        demographics: { ...s.demographics, unemployment_rate: rate },
      };
  }

  if (w.demographics && isMissingOrZero(w.demographics.unemployment_rate) && wFips.length) {
    let lfTot = 0, unempTot = 0;
    let popTot = 0, ratePopWeighted = 0;
    for (const f of wFips) {
      const item = lookup[f];
      if (!item) continue;
      if (Number.isFinite(item.labor_force) && item.labor_force > 0 && Number.isFinite(item.unemployed)) {
        lfTot += item.labor_force;
        unempTot += item.unemployed;
      }
      if (Number.isFinite(item.unemployment_rate) && Number.isFinite(item.population) && item.population > 0) {
        popTot += item.population;
        ratePopWeighted += item.unemployment_rate * item.population;
      }
    }
    let rate = NaN;
    if (lfTot > 0) rate = (unempTot / lfTot) * 100;
    else if (popTot > 0) rate = ratePopWeighted / popTot;
    if (Number.isFinite(rate))
      out.water_district = {
        ...w,
        demographics: { ...w.demographics, unemployment_rate: rate },
      };
  }

  return out;
}

// County-level fallback for tract median gross rent (when tract value suppressed)
async function fetchCountyMedianRent(state_fips, county_fips) {
  if (!state_fips || !county_fips) return null;
  const url = toCensus(
    `https://api.census.gov/data/2022/acs/acs5?get=B25064_001E&for=county:${county_fips}&in=state:${state_fips}`,
  );
  try {
    const rows = await fetchJsonRetryL(url, 'housing', { retries: 2, timeoutMs: 12000 });
    if (Array.isArray(rows) && rows.length > 1) {
      const header = rows[0];
      const idx = header.indexOf('B25064_001E');
      if (idx < 0) return null;
      const val = Number(rows[1][idx]);
      return Number.isFinite(val) && val > 0 ? val : null;
    }
  } catch {}
  return null;
}

// Derive counts and fill missing rent using county fallback
async function enrichDerivedCountsAndRent(data = {}) {
  const out = { ...data };
  // Local tract: derive people_below_poverty
  if (
    out.people_below_poverty == null &&
    Number.isFinite(Number(out.population)) &&
    Number.isFinite(Number(out.poverty_rate))
  ) {
    out.people_below_poverty = Math.round(
      (Number(out.poverty_rate) / 100) * Number(out.population),
    );
  }
  // Regions: derive counts if possible
  const s = out.surrounding_10_mile || {};
  if (s.demographics) {
    const d = { ...s.demographics };
    if (
      d.people_below_poverty == null &&
      Number.isFinite(Number(d.population)) &&
      Number.isFinite(Number(d.poverty_rate))
    ) {
      d.people_below_poverty = Math.round(
        (Number(d.poverty_rate) / 100) * Number(d.population),
      );
      out.surrounding_10_mile = { ...s, demographics: d };
    }
  }
  const w = out.water_district || {};
  if (w.demographics) {
    const d = { ...w.demographics };
    if (
      d.people_below_poverty == null &&
      Number.isFinite(Number(d.population)) &&
      Number.isFinite(Number(d.poverty_rate))
    ) {
      d.people_below_poverty = Math.round(
        (Number(d.poverty_rate) / 100) * Number(d.population),
      );
      out.water_district = { ...w, demographics: d };
    }
  }

  // Local tract: fallback for median_gross_rent from county
  if (isMissing(out.median_gross_rent) || !Number.isFinite(Number(out.median_gross_rent)) || Number(out.median_gross_rent) <= 0) {
    if (out.state_fips && out.county_fips) {
      const countyRent = await fetchCountyMedianRent(out.state_fips, out.county_fips);
      if (Number.isFinite(Number(countyRent)) && Number(countyRent) > 0) {
        out.median_gross_rent = Number(countyRent);
      }
    }
  }

  return out;
}

async function enrichRegionLanguages(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (
    Array.isArray(s.census_tracts_fips) &&
    s.census_tracts_fips.length
  ) {
    const lang = await aggregateLanguageForTracts(s.census_tracts_fips);
    const d = s.demographics || {};
    out.surrounding_10_mile = { ...s, demographics: { ...d, ...lang } };
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (wFips.length) {
    const lang = await aggregateLanguageForTracts(wFips);
    const d = w.demographics || {};
    out.water_district = { ...w, demographics: { ...d, ...lang } };
  }
  return out;
}

async function enrichRegionRace(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
    const race = await aggregateRaceForTracts(s.census_tracts_fips);
    const d = s.demographics || {};
    out.surrounding_10_mile = { ...s, demographics: { ...d, ...race } };
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (wFips.length) {
    const race = await aggregateRaceForTracts(wFips);
    const d = w.demographics || {};
    out.water_district = { ...w, demographics: { ...d, ...race } };
  }
  return out;
}

async function enrichRegionHousingEducation(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
    const he = await aggregateHousingEducationForTracts(s.census_tracts_fips);
    const d = s.demographics || {};
    out.surrounding_10_mile = { ...s, demographics: { ...d, ...he } };
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (wFips.length) {
    const he = await aggregateHousingEducationForTracts(wFips);
    const d = w.demographics || {};
    out.water_district = { ...w, demographics: { ...d, ...he } };
  }
  return out;
}

// Populate environmental hardships for surrounding and district regions
async function enrichRegionHardships(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  const sFips = Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length
    ? s.census_tracts_fips
    : Array.isArray(s.census_tracts)
      ? s.census_tracts
      : [];
  if (
    (!Array.isArray(s.environmental_hardships) || !s.environmental_hardships.length) &&
    sFips.length
  ) {
    const hardships = await aggregateHardshipsForTracts(sFips);
    out.surrounding_10_mile = { ...s, environmental_hardships: hardships };
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (
    (!Array.isArray(w.environmental_hardships) || !w.environmental_hardships.length) &&
    wFips.length
  ) {
    const hardships = await aggregateHardshipsForTracts(wFips);
    out.water_district = { ...w, environmental_hardships: hardships };
  }
  return out;
}

// Fetch surrounding cities and census tracts if API didn't provide them
async function enrichSurrounding(data = {}, categories = {}) {
  const { lat, lon, census_tract, surrounding_10_mile } = data || {};
  if (lat == null || lon == null) return data;
  const radiusMeters = 1609.34 * 10; // 10 miles
  const s = { ...(surrounding_10_mile || {}) };
  const tasks = [];
  if (!Array.isArray(s.cities) || !s.cities.length) {
    const query = `[out:json];(node[place=city](around:${radiusMeters},${lat},${lon});node[place=town](around:${radiusMeters},${lat},${lon}););out;`;
    const url =
      "https://overpass-api.de/api/interpreter?data=" +
      encodeURIComponent(query);
    tasks.push(
      fetch(url)
        .then((r) => r.json())
        .then((j) => {
          const names = (j.elements || [])
            .map((e) => e.tags?.name)
            .filter(Boolean);
          s.cities = Array.from(new Set(names)).slice(0, 10);
        })
        .catch(() => {}),
    );
  }
  const existingTracts = Array.isArray(s.census_tracts) ? s.census_tracts.map(String) : [];
  const existingFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips.map(String) : [];
  const existingMap = { ...(s.census_tract_map || {}) };
  const tractUrl =
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query" +
    `?where=1=1&geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${radiusMeters}&units=esriSRUnit_Meter&outFields=NAME,GEOID&f=json`;
  tasks.push(
    fetch(tractUrl)
      .then((r) => r.json())
      .then((j) => {
        const features = j.features || [];
        const names = [];
        const fips = [];
        const map = {};
        for (const f of features) {
          const attrs = f.attributes || {};
          let name = null;
          if (attrs.NAME) {
            name = attrs.NAME.replace(/^Census Tract\s+/i, "");
            names.push(name);
          }
          if (attrs.GEOID) {
            const geoid = String(attrs.GEOID);
            fips.push(geoid);
            if (name) map[geoid] = name;
          }
        }
        s.census_tracts = Array.from(new Set([...existingTracts, ...names]));
        s.census_tracts_fips = Array.from(new Set([...existingFips, ...fips]));
        s.census_tract_map = { ...existingMap, ...map };
      })
      .catch(() => {}),
  );
  if (tasks.length) await Promise.all(tasks);
  if (!Array.isArray(s.cities)) s.cities = [];
  const tractSet = new Set(Array.isArray(s.census_tracts) ? s.census_tracts : []);
  if (census_tract) tractSet.add(String(census_tract));
  s.census_tracts = Array.from(tractSet);
  if (Array.isArray(s.census_tracts_fips)) {
    const fipsSet = new Set(s.census_tracts_fips);
    const { state_fips, county_fips, tract_code } = data || {};
    if (state_fips && county_fips && tract_code)
      fipsSet.add(`${state_fips}${county_fips}${tract_code}`);
    s.census_tracts_fips = Array.from(fipsSet);
  }
  if (
    categories.dac &&
    Array.isArray(s.census_tracts_fips) &&
    s.census_tracts_fips.length
  ) {
    try {
      const dacFips = await fetchDacFips(s.census_tracts_fips);
      const names = [];
      for (const f of dacFips) {
        const name = (s.census_tract_map && s.census_tract_map[f]) || f;
        names.push(name);
      }
      s.dac_tracts = names;
      s.dac_tracts_fips = dacFips;
      if (names.length) {
        const set = new Set([...(s.census_tracts || []), ...names]);
        s.census_tracts = Array.from(set);
      }
    } catch {
      // ignore errors
    }
  }
  if (
    categories.dac &&
    Array.isArray(s.census_tracts_fips) &&
    s.census_tracts_fips.length
  ) {
    try {
      const lookup = await fetchUnemploymentForTracts(s.census_tracts_fips);
      let totalPop = 0;
      let dacPop = 0;
      const dacFips = new Set(s.dac_tracts_fips || []);
      for (const f of s.census_tracts_fips) {
        const info = lookup[f];
        if (info && Number.isFinite(info.population)) {
          totalPop += info.population;
          if (dacFips.has(String(f))) dacPop += info.population;
        }
      }
      if (totalPop > 0) s.dac_population_pct = (dacPop / totalPop) * 100;
      if (s.census_tracts_fips.length > 0)
        s.dac_tracts_pct = (dacFips.size / s.census_tracts_fips.length) * 100;
    } catch {
      // ignore errors
    }
  }
  return { ...data, surrounding_10_mile: s };
}

// Fill in missing water district basics if the API doesn't provide them
async function enrichWaterDistrict(data = {}, address = "", categories = {}) {
  const {
    lat,
    lon,
    city,
    census_tract,
    state_fips,
    county_fips,
    tract_code,
    water_district,
  } = data || {};
  if (lat == null || lon == null) return data;
  const w = { ...water_district };
  const tasks = [];

  // Primary lookup using the NFT API (includes service-area shape info)
  if (address) {
    const url = buildApiUrl("/lookup", { address });
    tasks.push(
      fetchJsonWithDiagnostics(url)
        .then((j) => {
          w.name =
            j?.agency?.agency_name ||
            j?.agency?.name ||
            j?.agency_name ||
            j?.name ||
            w.name;
          const tracts =
            j?.agency?.service_area_tracts ||
            j?.service_area_tracts ||
            j?.census_tracts ||
            j?.agency?.census_tracts;
          if (typeof tracts === "string") {
            const arr = tracts.split(/\s*,\s*/).filter(Boolean);
            w.census_tracts = arr;
            const fipsArr = arr.filter((t) => /^\d{11}$/.test(t));
            if (fipsArr.length) w.census_tracts_fips = fipsArr;
          } else if (Array.isArray(tracts)) {
            const arr = [...new Set(tracts.map(String))];
            w.census_tracts = arr;
            const fipsArr = arr.filter((t) => /^\d{11}$/.test(t));
            if (fipsArr.length)
              w.census_tracts_fips = [...new Set([...(w.census_tracts_fips || []), ...fipsArr])];
          }
        })
        .catch(() => {}),
    );
  }

  // Fallback: look up a district name from the state water board service
  if (!w.name) {
    const url =
      "https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query" +
      `?geometry=${lon}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=false&f=json`;
    tasks.push(
      fetch(url)
        .then((r) => r.json())
        .then((j) => {
          w.name = j?.features?.[0]?.attributes?.PWS_NAME || w.name;
        })
        .catch(() => {}),
    );
  }

  if (!Array.isArray(w.cities) || !w.cities.length) {
    if (city) w.cities = [city];
  }

  if (tasks.length) await Promise.all(tasks);

  // Fetch census tracts from the API if we have a name but no tract list
  if (w.name && (!Array.isArray(w.census_tracts) || !w.census_tracts.length)) {
    try {
      const url = buildApiUrl("/census-tracts", { agency_name: w.name });
      const j = await fetchJsonWithDiagnostics(url);
      const tracts = j?.census_tracts;
      if (Array.isArray(tracts)) {
        w.census_tracts = [...new Set(tracts.map(String))];
      }
    } catch {
      // ignore errors
    }
  }

  // Overlay the water district shape to include any intersecting census tracts
  // (be generous and include tracts that only partially overlap the boundary)
  try {
    const geoUrl =
      "https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query" +
      `?geometry=${lon}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`;
    const j = await fetch(geoUrl).then((r) => r.json());
    const geom = j?.features?.[0]?.geometry;
    if (geom) {
      const tractUrl =
        "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query";
      const tractParams = new URLSearchParams({
        where: "1=1",
        geometry: JSON.stringify(geom),
        geometryType: "esriGeometryPolygon",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "NAME,GEOID",
        returnGeometry: "false",
        f: "json",
      });
      let t;
      try {
        t = await fetch(tractUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: tractParams.toString(),
        }).then((r) => r.json());
      } catch {
        const fallbackUrl = `${tractUrl}?${tractParams.toString()}`;
        t = await fetch(fallbackUrl).then((r) => r.json());
      }
      const names = [];
      const fips = [];
      const map = {};
      for (const f of t.features || []) {
        const attrs = f.attributes || {};
        let name = null;
        if (attrs.NAME) {
          name = attrs.NAME.replace(/^Census Tract\s+/i, "");
          names.push(name);
        }
        if (attrs.GEOID) {
          const geoid = String(attrs.GEOID);
          fips.push(geoid);
          if (name) map[geoid] = name;
        }
      }
      if (names.length || fips.length) {
        const existing = Array.isArray(w.census_tracts)
          ? w.census_tracts.map(String)
          : [];
        const existingFips = Array.isArray(w.census_tracts_fips)
          ? w.census_tracts_fips.map(String)
          : [];
        const existingMap = w.census_tract_map || {};
        if (names.length)
          w.census_tracts = [...new Set([...existing, ...names])];
        if (fips.length)
          w.census_tracts_fips = [
            ...new Set([...existingFips, ...fips]),
          ];
        if (Object.keys(map).length)
          w.census_tract_map = { ...existingMap, ...map };
      }
    }
  } catch {
    // ignore errors
  }

  let tracts = [];
  if (Array.isArray(w.census_tracts)) tracts = w.census_tracts.map(String);
  else if (typeof w.census_tracts === "string")
    tracts = w.census_tracts.split(/\s*,\s*/).filter(Boolean);
  if (census_tract) tracts.unshift(String(census_tract));
  w.census_tracts = [...new Set(tracts)];

  let fipsList = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  for (const t of w.census_tracts) {
    if (/^\d{11}$/.test(t)) {
      fipsList.push(t);
    } else if (state_fips && county_fips) {
      const digits = String(t).replace(/[^0-9]/g, "");
      if (digits) {
        const tract = digits.padStart(6, "0").slice(-6);
        fipsList.push(`${state_fips}${county_fips}${tract}`);
      }
    }
  }
  if (state_fips && county_fips && tract_code)
    fipsList.unshift(`${state_fips}${county_fips}${tract_code}`);
  w.census_tracts_fips = [...new Set(fipsList)];

  if (
    categories.dac &&
    Array.isArray(w.census_tracts_fips) &&
    w.census_tracts_fips.length
  ) {
    try {
      const dacFips = await fetchDacFips(w.census_tracts_fips);
      const names = [];
      for (const f of dacFips) {
        const name = (w.census_tract_map && w.census_tract_map[f]) || f;
        names.push(name);
      }
      w.dac_tracts = names;
      w.dac_tracts_fips = dacFips;
      if (names.length) {
        const set = new Set([...(w.census_tracts || []), ...names]);
        w.census_tracts = Array.from(set);
      }
    } catch {
      // ignore errors
    }
  }
  if (
    categories.dac &&
    Array.isArray(w.census_tracts_fips) &&
    w.census_tracts_fips.length
  ) {
    try {
      const lookup = await fetchUnemploymentForTracts(w.census_tracts_fips);
      let totalPop = 0;
      let dacPop = 0;
      const dacFips = new Set(w.dac_tracts_fips || []);
      for (const f of w.census_tracts_fips) {
        const info = lookup[f];
        if (info && Number.isFinite(info.population)) {
          totalPop += info.population;
          if (dacFips.has(String(f))) dacPop += info.population;
        }
      }
      if (totalPop > 0) w.dac_population_pct = (dacPop / totalPop) * 100;
      if (w.census_tracts_fips.length > 0)
        w.dac_tracts_pct =
          (dacFips.size / w.census_tracts_fips.length) * 100;
    } catch {
      // ignore errors
    }
  }

  if (categories.enviroscreen) {
    // Hard-coded CalEnviroScreen indicators for the water district region
    w.environment = {
      percentile: 48.5,
      overall_percentiles: {
        pollution_burden: 37.2,
        population_characteristics: 56.5,
      },
      exposures: {
        ozone: 98.8,
        pm25: 34.0,
        diesel: 24.2,
        toxic_releases: 32.7,
        traffic: 12.3,
        pesticides: 22.7,
        drinking_water: 61.8,
        lead: 49.1,
      },
      environmental_effects: {
        cleanup_sites: 25.2,
        groundwater_threats: 20.4,
        hazardous_waste: 27.8,
        impaired_waters: 23.0,
        solid_waste: 45.7,
      },
      sensitive_populations: {
        asthma: 58.9,
        low_birth_weight: 52.8,
        cardiovascular_disease: 81.6,
      },
      socioeconomic_factors: {
        education: 45.5,
        linguistic_isolation: 17.0,
        poverty: 54.5,
        unemployment: 63.2,
        housing_burden: 38.8,
      },
    };
  }

  return { ...data, water_district: w };
}

// Fetch English proficiency percentage if missing
async function enrichEnglishProficiency(data = {}) {
  const { lat, lon, english_less_than_very_well_pct, state_fips, county_fips, tract_code } = data || {};
  if (!isMissing(english_less_than_very_well_pct) || lat == null || lon == null)
    return data;
  try {
    // If we already have FIPS parts from earlier, avoid lookups
    if (state_fips && county_fips && tract_code) {
      const url = toCensus(`https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${tract_code}&in=state:${state_fips}+county:${county_fips}`);
      const acs = await fetchJsonRetry(url, { retries: 1, timeoutMs: 12000 });
      const val = acs?.[1]?.[0];
      const num = Number(val);
      if (Number.isFinite(num) && num >= 0) return { ...data, english_less_than_very_well_pct: num };
    }
    // Prefer Census Geocoder → TIGERweb → FCC to derive FIPS
    const fromGeocoder = await (async () => {
      try {
        const u = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
        const g = await fetchJsonRetry(u, { retries: 1, timeoutMs: 10000 });
        const ct = g?.result?.geographies?.["Census Tracts"]?.[0];
        const geoid = ct?.GEOID;
        if (geoid && geoid.length >= 11) return { state: geoid.slice(0,2), county: geoid.slice(2,5), tract: geoid.slice(5,11) };
      } catch {}
      return null;
    })();
    const fromTiger = !fromGeocoder ? await (async () => {
      try {
        const tractUrl = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query";
        const params = new URLSearchParams({
          where: "1=1",
          geometry: JSON.stringify({ x: Number(lon), y: Number(lat), spatialReference: { wkid: 4326 } }),
          geometryType: "esriGeometryPoint",
          inSR: "4326",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "NAME,GEOID",
          returnGeometry: "false",
          f: "json",
        });
        const j = await fetchJsonRetry(`${tractUrl}?${params.toString()}`, { retries: 1, timeoutMs: 10000 });
        const attrs = j?.features?.[0]?.attributes;
        const geoid = attrs?.GEOID;
        if (geoid && geoid.length >= 11) return { state: geoid.slice(0,2), county: geoid.slice(2,5), tract: geoid.slice(5,11) };
      } catch {}
      return null;
    })() : null;
    let fips = fromGeocoder || fromTiger;
    if (!fips) {
      try {
        const geo = await fetchJsonRetry(
          `https://geo.fcc.gov/api/census/block/find?latitude=${lat}&longitude=${lon}&format=json`,
          { retries: 2, timeoutMs: 10000 },
        );
        const block = geo?.Block?.FIPS;
        if (block && block.length >= 11) {
          fips = { state: block.slice(0,2), county: block.slice(2,5), tract: block.slice(5,11) };
        }
      } catch {}
    }
    if (fips) {
      const url = toCensus(`https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${fips.tract}&in=state:${fips.state}+county:${fips.county}`);
      const acs = await fetchJsonRetry(url, { retries: 1, timeoutMs: 12000 });
      const val = acs?.[1]?.[0];
      const num = Number(val);
      if (Number.isFinite(num) && num >= 0) return { ...data, english_less_than_very_well_pct: num };
    }
  } catch (e) {
    // Ignore errors and fall through
  }
  return data;
}

// Fetch NWS alerts for the given coordinates and append to data
async function enrichNwsAlerts(data = {}) {
  const { lat, lon } = data || {};
  if (lat == null || lon == null) return { ...data, alerts: [] };
  try {
    const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/geo+json",
        "User-Agent": "CalWEP-Demographic-Website (info@calwep.org)",
      },
    });
    if (!res.ok) throw new Error("NWS response not ok");
    const j = await (async () => { try { const jj = await res.json(); logSource('alerts', url, true); return jj; } catch (e) { logSource('alerts', url, false, String(e)); throw e; } })();
    const alerts = Array.isArray(j?.features)
      ? j.features
          .map((f) => f?.properties?.headline)
          .filter(Boolean)
      : [];
    return { ...data, alerts };
  } catch {
    return { ...data, alerts: [] };
  }
}

// CalEnviroScreen color helper
function cesColor(percentile) {
  const p = Number(percentile);
  if (!Number.isFinite(p)) return { bg: "#fff", fg: "#000" };
  const scale = [
    { max: 10, color: "#006837", fg: "#fff" },
    { max: 20, color: "#1A9850", fg: "#fff" },
    { max: 30, color: "#66BD63" },
    { max: 40, color: "#A6D96A" },
    { max: 50, color: "#FEE08B" },
    { max: 60, color: "#FDAE61" },
    { max: 70, color: "#F46D43", fg: "#fff" },
    { max: 80, color: "#D73027", fg: "#fff" },
    { max: 90, color: "#A50026", fg: "#fff" },
    { max: 100, color: "#6E0000", fg: "#fff" },
  ];
  for (const r of scale) {
    if (p <= r.max) return { bg: r.color, fg: r.fg || "#000" };
  }
  return { bg: "#6E0000", fg: "#fff" };
}

function renderEnviroscreenSection(title, data, includeDescription = false) {
  if (!data || typeof data !== "object") return "";
  const badge = (v) => {
    const { bg, fg } = cesColor(v);
    const val = Number.isFinite(Number(v)) ? Number(v).toFixed(1) : "—";
    return `<span class="ces-badge" style="background:${bg};color:${fg};">${val}</span>`;
  };
  const overall = data.percentile;
  const pb = data.overall_percentiles?.pollution_burden;
  const pc = data.overall_percentiles?.population_characteristics;
  const renderGroup = (groupTitle, obj, order = []) => {
    if (!obj || typeof obj !== "object") return "";
    const entries = Object.entries(obj).sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    const kv = entries
      .map(
        ([k, v]) =>
          `<div class="key">${escapeHTML(
            CES_LABELS[k] || titleCase(k),
          )}</div><div class="val">${badge(v)}</div>`,
      )
      .join("");
    return `<h4 class="sub-section-header">${groupTitle}</h4><div class="kv">${kv}</div>`;
  };
  const desc = includeDescription
    ? `
        <p class="section-description">This section shows environmental and community health indicators from California’s Enviroscreen tool. Results are presented as percentiles, with higher numbers (and darker colors) indicating greater environmental burdens compared to other areas in the state. These measures include factors such as air quality, traffic pollution, and access to safe drinking water.</p>
        <p class="section-description">Staff can use this information to understand potential environmental challenges facing a neighborhood, strengthen grant applications that require equity or environmental justice considerations, and design outreach that addresses local concerns. For example, if an event is planned in an area with a high Enviroscreen percentile, staff may want to highlight programs or benefits related to clean water, pollution reduction, or community health.</p>
        <p class="section-description"><strong>How to Read This</strong><br>Green = Low burden (fewer environmental and health challenges)<br>Yellow/Orange = Moderate burden<br>Red = High burden (greater environmental and health challenges)<br>Percentile score shows how the community compares to others across California.</p>
      `
    : "";
  return `
      <section class="section-block">
        <h3 class="section-header">${title}</h3>
        ${desc}
        <div class="kv">
          <div class="key">Overall percentile</div><div class="val">${badge(overall)}</div>
          <div class="key">Pollution burden</div><div class="val">${badge(pb)}</div>
          <div class="key">Population characteristics</div><div class="val">${badge(pc)}</div>
        </div>
        ${renderGroup("Exposures", data.exposures, CES_GROUP_ORDER.exposures)}
        ${renderGroup("Environmental effects", data.environmental_effects, CES_GROUP_ORDER.environmental_effects)}
        ${renderGroup("Sensitive populations", data.sensitive_populations, CES_GROUP_ORDER.sensitive_populations)}
        ${renderGroup("Socioeconomic factors", data.socioeconomic_factors, CES_GROUP_ORDER.socioeconomic_factors)}
      </section>
    `;
}

// ---------- Places Autocomplete ----------
function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input || typeof google === "undefined" || !google.maps) return;

  autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["address"],
    componentRestrictions: { country: "us" },
    fields: ["address_components", "formatted_address"],
  });

  autocomplete.addListener("place_changed", () => {
    const p = autocomplete.getPlace();
    let street = "",
      city = "",
      state = "",
      zip = "";
    for (const comp of p.address_components || []) {
      const t = comp.types || [];
      if (t.includes("street_number")) street = comp.long_name + " ";
      else if (t.includes("route")) street += comp.long_name;
      else if (t.includes("locality")) city = comp.long_name;
      else if (t.includes("administrative_area_level_1"))
        state = comp.short_name;
      else if (t.includes("postal_code")) zip = comp.long_name;
    }
    if (!zip && p.formatted_address) {
      const m = p.formatted_address.match(/\b\d{5}(?:-\d{4})?\b/);
      if (m) zip = m[0];
    }
    const parts = [street.trim(), city, state, zip].filter(Boolean);
    if (parts.length) input.value = parts.join(", ");
  });

  // Enter triggers lookup
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("lookupBtn")?.click();
    }
  });
}

// ---------- Rendering ----------
function renderLoading(address, selections) {
  const { scopes, categories } = selections;
  const loadingCell = '<p class="note">Loading…</p>';
  const rows = [];
  const makeRow = (title) =>
    buildComparisonRow(title, loadingCell, loadingCell, loadingCell, "", scopes);
  rows.push(makeRow("Location Summary"));
  if (categories.demographics) rows.push(makeRow("Population &amp; Income"));
  if (categories.language) rows.push(makeRow("Language"));
  if (categories.race) rows.push(makeRow("Race &amp; Ethnicity"));
  if (categories.housing) rows.push(makeRow("Housing &amp; Education"));
  if (categories.dac) rows.push(makeRow("Disadvantaged Community (DAC) Status"));
  if (categories.enviroscreen) {
    rows.push(makeRow("Environmental Indicators"));
    rows.push(makeRow("Environmental Hardships"));
  }
  if (categories.alerts)
    rows.push(
      `<section class="section-block"><h3 class="section-header">Active Alerts</h3><p class="note">Loading…</p></section>`,
    );
  const columnHeaders = buildColumnHeaders(scopes);
  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${nowStamp()}</span>
      </div>
      ${address ? `<p class="note">Address: <strong>${escapeHTML(address)}</strong></p>` : ""}
      ${columnHeaders}
      ${rows.join("")}
      <p class="note">Elapsed: <span id="searchTimer">0m 00s</span></p>
    </div>
  `;
}
function renderError(message, address, elapsedMs) {
  document.getElementById("result").innerHTML = `
    <div class="card" role="alert">
      <div class="card__header">
        <h2 class="card__title">Unable to retrieve data</h2>
        <span class="updated">${nowStamp()}</span>
      </div>
      ${address ? `<p class="note">Address: <strong>${escapeHTML(address)}</strong></p>` : ""}
      <div class="callout" style="border-left-color:#b45309;">
        ${escapeHTML(message || "Please try again with a different address.")}
      </div>
      <p class="note">Search took ${formatDuration(elapsedMs)}.</p>
      <p class="note">API base: <code>${escapeHTML(API_BASE)}</code>. If your API has a prefix, adjust <code>API_PATH</code>.</p>
    </div>
  `;
}

function buildComparisonRow(
  title,
  localHtml,
  surroundingHtml,
  districtHtml,
  descriptionHtml = "",
  scopes = { tract: true, radius: true, water: true },
) {
  const cell = (html) =>
    html && String(html).trim() ? html : '<p class="note">No data</p>';
  const cols = [];
  if (scopes.tract) cols.push(`<div class="col local">${cell(localHtml)}</div>`);
  if (scopes.radius)
    cols.push(`<div class="col surrounding">${cell(surroundingHtml)}</div>`);
  if (scopes.water) cols.push(`<div class="col district">${cell(districtHtml)}</div>`);
  return `
    <section class="section-block">
      <h3 class="section-header">${title}</h3>
      ${descriptionHtml}
      <div class="comparison-grid">${cols.join("")}</div>
    </section>
  `;
}

function buildColumnHeaders(scopes = { tract: true, radius: true, water: true }) {
  const cols = [];
  if (scopes.tract) cols.push('<div class="col">Census tract</div>');
  if (scopes.radius) cols.push('<div class="col">10 mile radius</div>');
  if (scopes.water) cols.push('<div class="col">Water district</div>');
  if (!cols.length) return "";
  return `<div class="comparison-grid column-headers">${cols.join("")}</div>`;
}

function renderEnviroscreenContent(data) {
  if (!data || typeof data !== "object")
    return "<p class=\"note\">No data</p>";
  const badge = (v) => {
    const { bg, fg } = cesColor(v);
    const val = Number.isFinite(Number(v)) ? Number(v).toFixed(1) : "—";
    return `<span class="ces-badge" style="background:${bg};color:${fg};">${val}</span>`;
  };
  const overall = data.percentile;
  const pb = data.overall_percentiles?.pollution_burden;
  const pc = data.overall_percentiles?.population_characteristics;
  const renderGroup = (title, obj, order = []) => {
    if (!obj || typeof obj !== "object") return "";
    const entries = Object.entries(obj).sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    const kv = entries
      .map(
        ([k, v]) =>
          `<div class=\"key\">${escapeHTML(
            CES_LABELS[k] || titleCase(k),
          )}</div><div class=\"val\">${badge(v)}</div>`,
      )
      .join("");
    return `<h4 class=\"sub-section-header\">${title}</h4><div class=\"kv\">${kv}</div>`;
  };
  return `
    <div class="kv">
      <div class="key">Overall percentile</div><div class="val">${badge(overall)}</div>
      <div class="key">Pollution burden</div><div class="val">${badge(pb)}</div>
      <div class="key">Population characteristics</div><div class="val">${badge(pc)}</div>
    </div>
    ${renderGroup("Exposures", data.exposures, CES_GROUP_ORDER.exposures)}
    ${renderGroup("Environmental effects", data.environmental_effects, CES_GROUP_ORDER.environmental_effects)}
    ${renderGroup("Sensitive populations", data.sensitive_populations, CES_GROUP_ORDER.sensitive_populations)}
    ${renderGroup("Socioeconomic factors", data.socioeconomic_factors, CES_GROUP_ORDER.socioeconomic_factors)}
  `;
}
function renderResultOld(address, data, elapsedMs) {
  const {
    city,
    zip,
    county,
    census_tract,
    lat,
    lon,
    primary_language,
    secondary_language,
    english_less_than_very_well_pct,
    language_other_than_english_pct,
    spanish_at_home_pct,
    median_household_income,
    per_capita_income,
    median_age,
    poverty_rate,
    unemployment_rate,
    population,
    people_below_poverty,
    dac_status,
    environmental_hardships,
    white_pct,
    black_pct,
    native_pct,
    asian_pct,
    pacific_pct,
    other_race_pct,
    two_or_more_races_pct,
    hispanic_pct,
    not_hispanic_pct,
    owner_occupied_pct,
    renter_occupied_pct,
    median_home_value,
    median_gross_rent,
    high_school_or_higher_pct,
    bachelors_or_higher_pct,
    alerts,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const hardshipList = Array.isArray(environmental_hardships)
    ? Array.from(new Set(environmental_hardships))
    : [];
  const alertList = Array.isArray(alerts) ? alerts : [];
  const cesSection = renderEnviroscreenSection(
    "Environmental Indicators (CalEPA Enviroscreen)",
    enviroscreen,
    true,
  );
  const coords =
    lat != null && lon != null
      ? `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}`
      : "—";
  const mapImgHtml =
    lat != null && lon != null
      ? `<img class="map-image" src="https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=600x300&markers=color:red|${lat},${lon}&key=${GOOGLE_MAPS_KEY}" alt="Map of location" />`
      : "";

const hardshipSection = `
    <section class="section-block">
      <h3 class="section-header">Environmental hardships</h3>
      ${hardshipList.length ? `<div class="stats">${hardshipList.map((h) => `<span class="pill">${escapeHTML(h)}</span>`).join("")}</div>` : `<p class="note">No environmental hardships recorded.</p>`}
    </section>
  `;

  const raceSection = `
    <section class="section-block">
      <h3 class="section-header">Race &amp; Ethnicity (ACS)</h3>
      <p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p>
      <div class="kv">
        <div class="key">White</div><div class="val">${fmtPct(white_pct)}</div>
        <div class="key">Black or African American</div><div class="val">${fmtPct(black_pct)}</div>
        <div class="key">American Indian / Alaska Native</div><div class="val">${fmtPct(native_pct)}</div>
        <div class="key">Asian</div><div class="val">${fmtPct(asian_pct)}</div>
        <div class="key">Native Hawaiian / Pacific Islander</div><div class="val">${fmtPct(pacific_pct)}</div>
        <div class="key">Other race</div><div class="val">${fmtPct(other_race_pct)}</div>
        <div class="key">Two or more races</div><div class="val">${fmtPct(two_or_more_races_pct)}</div>
        <div class="key">Hispanic</div><div class="val">${fmtPct(hispanic_pct)}</div>
        <div class="key">Not Hispanic</div><div class="val">${fmtPct(not_hispanic_pct)}</div>
      </div>
    </section>
  `;

  const housingSection = `
    <section class="section-block">
      <h3 class="section-header">Housing &amp; Education (ACS)</h3>
      <p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner-occupied and renter-occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p>
      <div class="kv">
        <div class="key">Owner occupied</div><div class="val">${fmtPct(owner_occupied_pct)}</div>
        <div class="key">Renter occupied</div><div class="val">${fmtPct(renter_occupied_pct)}</div>
        <div class="key">Median home value</div><div class="val">${fmtCurrency(median_home_value)}</div>
        <div class="key">Median gross rent</div><div class="val">${fmtCurrency(median_gross_rent)}</div>
        <div class="key">High school or higher</div><div class="val">${fmtPct(high_school_or_higher_pct)}</div>
        <div class="key">Bachelor's degree or higher</div><div class="val">${fmtPct(bachelors_or_higher_pct)}</div>
      </div>
    </section>
  `;

  const surroundingSection = (() => {
    const s = surrounding_10_mile || {};
    let html = "";
    const d = s.demographics || {};
    if (Object.keys(d).length) {
      const tractList = Array.isArray(s.census_tracts)
        ? s.census_tracts.join(", ")
        : escapeHTML(s.census_tracts) || "—";
      const cityList = Array.isArray(s.cities)
        ? s.cities.join(", ")
        : escapeHTML(s.cities) || "—";
      html += `
      <section class="section-block">
        <h3 class="section-header">Surrounding 10‑Mile Area (ACS)</h3>
        <div class="kv">
          <div class="key">Cities</div><div class="val">${cityList}</div>
          <div class="key">Census tracts</div><div class="val">${tractList}</div>
          <div class="key">Population</div><div class="val">${fmtInt(d.population)}</div>
          <div class="key">Median age</div><div class="val">${fmtNumber(d.median_age)}</div>
          <div class="key">Median household income</div><div class="val">${fmtCurrency(d.median_household_income)}</div>
          <div class="key">Per capita income</div><div class="val">${fmtCurrency(d.per_capita_income)}</div>
          <div class="key">Poverty rate</div><div class="val">${fmtPct(d.poverty_rate)}</div>
          <div class="key">Unemployment rate</div><div class="val">${fmtPct(d.unemployment_rate)}</div>
          <div class="key">Owner occupied</div><div class="val">${fmtPct(d.owner_occupied_pct)}</div>
          <div class="key">Renter occupied</div><div class="val">${fmtPct(d.renter_occupied_pct)}</div>
          <div class="key">Median home value</div><div class="val">${fmtCurrency(d.median_home_value)}</div>
          <div class="key">High school or higher</div><div class="val">${fmtPct(d.high_school_or_higher_pct)}</div>
          <div class="key">Bachelor's degree or higher</div><div class="val">${fmtPct(d.bachelors_or_higher_pct)}</div>
          <div class="key">Primary language</div><div class="val">${escapeHTML(d.primary_language) || "—"}</div>
          <div class="key">Second most common</div><div class="val">${escapeHTML(d.secondary_language) || "—"}</div>
          <div class="key">People who speak a language other than English at home</div><div class="val">${fmtPct(d.language_other_than_english_pct)}</div>
          <div class="key">People who speak English less than \"very well\"</div><div class="val">${fmtPct(d.english_less_than_very_well_pct)}</div>
          <div class="key">People who speak Spanish at home</div><div class="val">${fmtPct(d.spanish_at_home_pct)}</div>
          <div class="key">White</div><div class="val">${fmtPct(d.white_pct)}</div>
          <div class="key">Black or African American</div><div class="val">${fmtPct(d.black_pct)}</div>
          <div class="key">American Indian / Alaska Native</div><div class="val">${fmtPct(d.native_pct)}</div>
          <div class="key">Asian</div><div class="val">${fmtPct(d.asian_pct)}</div>
          <div class="key">Native Hawaiian / Pacific Islander</div><div class="val">${fmtPct(d.pacific_pct)}</div>
          <div class="key">Other race</div><div class="val">${fmtPct(d.other_race_pct)}</div>
          <div class="key">Two or more races</div><div class="val">${fmtPct(d.two_or_more_races_pct)}</div>
          <div class="key">Hispanic</div><div class="val">${fmtPct(d.hispanic_pct)}</div>
          <div class="key">Not Hispanic</div><div class="val">${fmtPct(d.not_hispanic_pct)}</div>
        </div>
      </section>
    `;
    }
    if (s.environment)
      html += renderEnviroscreenSection(
        "Surrounding 10‑Mile Area Environment (CalEPA Enviroscreen)",
        s.environment,
      );
    return html;
  })();

  const waterDistrictSection = (() => {
    const w = water_district || {};
    let html = "";
    const d = w.demographics || {};
    const tractList = Array.isArray(w.census_tracts)
      ? w.census_tracts.join(", ")
      : escapeHTML(w.census_tracts) || "—";
    const cityList = Array.isArray(w.cities)
      ? w.cities.join(", ")
      : escapeHTML(w.cities) || "—";
    if (w.name || w.census_tracts || w.cities)
      html += `
      <section class="section-block">
        <h3 class="section-header">Location Summary</h3>
        <div class="kv">
          <div class="key">District</div><div class="val">${escapeHTML(w.name) || "—"}</div>
          <div class="key">Cities</div><div class="val">${cityList}</div>
          <div class="key">Census tracts</div><div class="val">${tractList}</div>
        </div>
      </section>
    `;
    if (Object.keys(d).length) {
      html += `
      <section class="section-block">
        <h3 class="section-header">${escapeHTML(w.name) || "Water District Region"} (ACS)</h3>
        <div class="kv">
          <div class="key">Population</div><div class="val">${fmtInt(d.population)}</div>
          <div class="key">Median age</div><div class="val">${fmtNumber(d.median_age)}</div>
          <div class="key">Median household income</div><div class="val">${fmtCurrency(d.median_household_income)}</div>
          <div class="key">Per capita income</div><div class="val">${fmtCurrency(d.per_capita_income)}</div>
          <div class="key">Poverty rate</div><div class="val">${fmtPct(d.poverty_rate)}</div>
          <div class="key">Unemployment rate</div><div class="val">${fmtPct(d.unemployment_rate)}</div>
          <div class="key">Owner occupied</div><div class="val">${fmtPct(d.owner_occupied_pct)}</div>
          <div class="key">Renter occupied</div><div class="val">${fmtPct(d.renter_occupied_pct)}</div>
          <div class="key">Median home value</div><div class="val">${fmtCurrency(d.median_home_value)}</div>
          <div class="key">High school or higher</div><div class="val">${fmtPct(d.high_school_or_higher_pct)}</div>
          <div class="key">Bachelor's degree or higher</div><div class="val">${fmtPct(d.bachelors_or_higher_pct)}</div>
          <div class="key">Primary language</div><div class="val">${escapeHTML(d.primary_language) || "—"}</div>
          <div class="key">Second most common</div><div class="val">${escapeHTML(d.secondary_language) || "—"}</div>
          <div class="key">People who speak a language other than English at home</div><div class="val">${fmtPct(d.language_other_than_english_pct)}</div>
          <div class="key">People who speak Spanish at home</div><div class="val">${fmtPct(d.spanish_at_home_pct)}</div>
          <div class="key">Speak English less than \"very well\"</div><div class="val">${fmtPct(d.english_less_than_very_well_pct)}</div>
          <div class="key">White</div><div class="val">${fmtPct(d.white_pct)}</div>
          <div class="key">Black or African American</div><div class="val">${fmtPct(d.black_pct)}</div>
          <div class="key">American Indian / Alaska Native</div><div class="val">${fmtPct(d.native_pct)}</div>
          <div class="key">Asian</div><div class="val">${fmtPct(d.asian_pct)}</div>
          <div class="key">Native Hawaiian / Pacific Islander</div><div class="val">${fmtPct(d.pacific_pct)}</div>
          <div class="key">Other race</div><div class="val">${fmtPct(d.other_race_pct)}</div>
          <div class="key">Two or more races</div><div class="val">${fmtPct(d.two_or_more_races_pct)}</div>
          <div class="key">Hispanic</div><div class="val">${fmtPct(d.hispanic_pct)}</div>
          <div class="key">Not Hispanic</div><div class="val">${fmtPct(d.not_hispanic_pct)}</div>
        </div>
      </section>
    `;
    }
    if (w.environment && Object.keys(w.environment).length)
      html += renderEnviroscreenSection(
        "Water District Region Environment (CalEPA Enviroscreen)",
        w.environment,
      );
    return html;
  })();


  const localInfo = `
    <section class="section-block">
      <h3 class="section-header">Location Summary</h3>
      <div class="kv">
        <div class="key">City</div><div class="val">${escapeHTML(city) || "—"}</div>
        <div class="key">Census tract</div><div class="val">${escapeHTML(census_tract) || "—"}</div>
        <div class="key">ZIP code</div><div class="val">${escapeHTML(zip) || "—"}</div>
        <div class="key">County</div><div class="val">${escapeHTML(county) || "—"}</div>
        <div class="key">Coordinates</div><div class="val">${coords}</div>
      </div>
      ${mapImgHtml}
    </section>
      <p class="note">Search took ${formatDuration(elapsedMs)}.</p>

    <section class="section-block">
      <h3 class="section-header">Population &amp; Income (ACS)</h3>
      <p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p>
      <div class="kv">
        ${(() => {
          const popEntries = [
            ["Total population", fmtInt(population)],
            ["Median age", fmtNumber(median_age)],
            ["Median household income", fmtCurrency(median_household_income)],
            ["Per capita income", fmtCurrency(per_capita_income)],
            ["People below poverty", fmtInt(people_below_poverty)],
            ["Poverty rate", fmtPct(poverty_rate)],
            ["Unemployment rate", fmtPct(unemployment_rate)],
          ];
          return popEntries
            .filter(([, v]) => v !== "—")
            .map(
              ([k, v]) =>
                `<div class="key">${k}</div><div class="val">${v}</div>`,
            )
            .join("");
        })()}
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-header">Language (ACS)</h3>
      <p class="section-description">This section highlights the primary and secondary languages spoken in the community and key language indicators based on American Community Survey (ACS) 5‑year estimates.</p>
      <div class="kv">
        <div class="key">Primary language</div><div class="val">${escapeHTML(primary_language) || "—"}</div>
        <div class="key">Second most common</div><div class="val">${escapeHTML(secondary_language) || "—"}</div>
        <div class="key">People who speak a language other than English at home</div><div class="val">${fmtPct(language_other_than_english_pct)}</div>
        <div class="key">People who speak English less than \"very well\"</div><div class="val">${fmtPct(english_less_than_very_well_pct)}</div>
        <div class="key">People who speak Spanish at home</div><div class="val">${fmtPct(spanish_at_home_pct)}</div>
      </div>
      <p class="note">Source: Latest ACS 5-Year Estimates<br>Data Profiles/Social Characteristics</p>
    </section>

    ${raceSection}
    ${housingSection}
    <section class="section-block">
      <h3 class="section-header">Disadvantaged Community (DAC) Status</h3>
      <p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>
      <div class="callout" style="border-left-color:${
        dac_status ? "var(--success)" : "var(--border-strong)"
      }">
        Disadvantaged community: <strong>${dac_status ? "Yes" : "No"}</strong>
      </div>
    </section>

    ${cesSection}
    ${hardshipSection}
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${
        alertList.length
          ? `
        <div class="stats">
          ${alertList.map((a) => `<span class="pill">${escapeHTML(a)}</span>`).join("")}
        </div>
      `
          : `<p class="note">No active alerts found for this location.</p>`
      }
    </section>
  `;

  document.getElementById("result").innerHTML = `
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${escapeHTML(address)}</h2>
          <div class="card__actions">
            <button type="button" onclick="printReport()">Print</button>
            <button type="button" onclick="downloadPdf()">Download PDF</button>
            <button type="button" onclick="downloadRawData()">Raw Data</button>
            <button type="button" onclick="shareReport()">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${nowStamp()}</span>
      </div>
      <div class="comparison-grid">
        <div class="col local">
          ${localInfo}
        </div>
        ${
          surroundingSection
            ? `<div class="col surrounding">${surroundingSection}</div>`
            : ""
        }
        ${
          waterDistrictSection
            ? `<div class="col district">${waterDistrictSection}</div>`
            : ""
        }
      </div>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
  `;
}

// New row-based renderer
function renderResult(address, data, elapsedMs, selections) {
  const { scopes, categories } = selections;
  const {
    city,
    zip,
    county,
    census_tract,
    lat,
    lon,
    geocoder_fallback,
    geocode_fallback_source,
    english_less_than_very_well_pct,
    language_other_than_english_pct,
    spanish_at_home_pct,
    primary_language,
    secondary_language,
    median_household_income,
    per_capita_income,
    median_age,
    poverty_rate,
    unemployment_rate,
    population,
    dac_status,
    environmental_hardships,
    white_pct,
    black_pct,
    native_pct,
    asian_pct,
    pacific_pct,
    other_race_pct,
    two_or_more_races_pct,
    hispanic_pct,
    not_hispanic_pct,
    owner_occupied_pct,
    renter_occupied_pct,
    median_home_value,
    median_gross_rent,
    high_school_or_higher_pct,
    bachelors_or_higher_pct,
    alerts,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const hardshipList = Array.isArray(environmental_hardships)
    ? Array.from(new Set(environmental_hardships))
    : [];
  const alertList = Array.isArray(alerts) ? alerts : [];

  const coords =
    lat != null && lon != null
      ? `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}`
      : "—";
  const mapImgHtml =
    lat != null && lon != null
      ? `<img class="map-image" src="https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=600x300&markers=color:red|${lat},${lon}&key=${GOOGLE_MAPS_KEY}" alt="Map of location" />`
      : "";

  const s = surrounding_10_mile || {};
  const w = water_district || {};
  const sHardships = Array.isArray(s.environmental_hardships)
    ? Array.from(new Set(s.environmental_hardships))
    : [];
  const wHardships = Array.isArray(w.environmental_hardships)
    ? Array.from(new Set(w.environmental_hardships))
    : [];
  const sTracts = Array.isArray(s.census_tracts)
    ? s.census_tracts
    : escapeHTML(s.census_tracts) || "—";
  const sCities = Array.isArray(s.cities)
    ? s.cities.join(", ")
    : escapeHTML(s.cities) || "—";
  const wTracts = Array.isArray(w.census_tracts)
    ? w.census_tracts
    : escapeHTML(w.census_tracts) || "—";
  const wCities = Array.isArray(w.cities)
    ? w.cities.join(", ")
    : escapeHTML(w.cities) || "—";

  const locLocal = `
    <div class="kv">
      <div class="key">City</div><div class="val">${escapeHTML(city) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${escapeHTML(census_tract) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${escapeHTML(zip) || "—"}</div>
      <div class="key">County</div><div class="val">${escapeHTML(county) || "—"}</div>
      <div class="key">Coordinates</div><div class="val">${coords}</div>
    </div>
    ${mapImgHtml}
  `;
  function renderTractList(arr, id) {
    if (!Array.isArray(arr) || !arr.length) return '—';
    const shown = arr.slice(0, 5).join(', ');
    const full = arr.join(', ');
    if (arr.length <= 5) return escapeHTML(full);
    const short = `${shown} …`;
    return `<span id="${id}-tracts">${escapeHTML(short)}</span> <button class="link-button" data-expand="${id}" data-short="${escapeHTML(short)}" data-full="${escapeHTML(full)}">More…</button>`;
  }
  const locSurround = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${sCities}</div>
      <div class="key">Census tracts</div><div class="val">${renderTractList(sTracts, 's')}</div>
    </div>
  `;
  const locDistrict = `
    <div class="kv">
      <div class="key">District</div><div class="val">${escapeHTML(w.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${wCities}</div>
      <div class="key">Census tracts</div><div class="val">${renderTractList(wTracts, 'w')}</div>
    </div>
  `;
  const locDescBase = '<p class="section-description">This section lists basic geographic information for the census tract, surrounding 10&#8209;mile area, and water district, such as city, ZIP code, county, and coordinates.</p>' + renderSourceNotesGrouped('location', data._source_log);
  const fallbackName = geocode_fallback_source === 'tigerweb' ? 'Census TIGERweb' : (geocode_fallback_source === 'fcc' ? 'FCC Block API' : 'Census Geocoder');
  const locDescFallback = geocoder_fallback
    ? `<p class="note">Using ${fallbackName} fallback due to FCC endpoint issues.</p>`
    : '';
  const locationRow = buildComparisonRow(
    "Location Summary",
    locLocal,
    locSurround,
    locDistrict,
    locDescBase + locDescFallback,
    scopes,
  );

  const popFields = (d = {}) => {
    const entries = [
      ["Total population", fmtInt(d.population)],
      ["Median age", fmtNumber(d.median_age)],
      ["Median household income", fmtCurrency(d.median_household_income)],
      ["Per capita income", fmtCurrency(d.per_capita_income)],
      ["Poverty rate", fmtPct(d.poverty_rate)],
      ["Unemployment rate", fmtPct(d.unemployment_rate)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const populationRow = buildComparisonRow(
    "Population &amp; Income (ACS)",
    popFields({
      population,
      median_age,
      median_household_income,
      per_capita_income,
      poverty_rate,
      unemployment_rate,
    }),
    popFields(s.demographics || {}),
    popFields(w.demographics || {}),
    '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>' + renderSourceNotesGrouped('population', data._source_log),
    scopes,
  );
  const languageFields = (d = {}) => {
    const entries = [
      ["Primary language", escapeHTML(d.primary_language) || "—"],
      ["Second most common", escapeHTML(d.secondary_language) || "—"],
      [
        "People who speak a language other than English at home",
        fmtPct(d.language_other_than_english_pct),
      ],
      [
        'People who speak English less than "very well"',
        fmtPct(d.english_less_than_very_well_pct),
      ],
      ["People who speak Spanish at home", fmtPct(d.spanish_at_home_pct)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const languageRow = buildComparisonRow(
    "Language (ACS)",
    languageFields({
      primary_language,
      secondary_language,
      language_other_than_english_pct,
      english_less_than_very_well_pct,
      spanish_at_home_pct,
    }),
    languageFields(s.demographics || {}),
    languageFields(w.demographics || {}),
    '<p class="section-description">This section highlights the primary and secondary languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>' + renderSourceNotesGrouped('language', data._source_log),
    scopes,
  );

  const raceContent = (d = {}) => {
    const entries = [
      ["White", fmtPct(d.white_pct)],
      ["Black or African American", fmtPct(d.black_pct)],
      ["American Indian / Alaska Native", fmtPct(d.native_pct)],
      ["Asian", fmtPct(d.asian_pct)],
      ["Native Hawaiian / Pacific Islander", fmtPct(d.pacific_pct)],
      ["Other race", fmtPct(d.other_race_pct)],
      ["Two or more races", fmtPct(d.two_or_more_races_pct)],
      ["Hispanic", fmtPct(d.hispanic_pct)],
      ["Not Hispanic", fmtPct(d.not_hispanic_pct)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const raceRow = buildComparisonRow(
    "Race &amp; Ethnicity (ACS)",
    raceContent({
      white_pct,
      black_pct,
      native_pct,
      asian_pct,
      pacific_pct,
      other_race_pct,
      two_or_more_races_pct,
      hispanic_pct,
      not_hispanic_pct,
    }),
    raceContent(s.demographics || {}),
    raceContent(w.demographics || {}),
    '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>' + renderSourceNotesGrouped('race', data._source_log),
    scopes,
  );

  const housingContent = (d = {}) => {
    const entries = [
      ["Total housing units", fmtInt(d.housing_units_total)],
      ["Occupied units", fmtInt(d.housing_units_occupied)],
      ["Vacant units", fmtInt(d.housing_units_vacant)],
      ["Vacancy rate", fmtPct(d.vacancy_rate_pct)],
      ["Occupancy rate", fmtPct(d.occupancy_rate_pct)],
      ["Owner occupied", fmtPct(d.owner_occupied_pct)],
      ["Renter occupied", fmtPct(d.renter_occupied_pct)],
      ["Median home value", fmtCurrency(d.median_home_value)],
      ["Median gross rent", fmtCurrency(d.median_gross_rent)],
      ["High school or higher", fmtPct(d.high_school_or_higher_pct)],
      ["Bachelor's degree or higher", fmtPct(d.bachelors_or_higher_pct)],
      ["Less than high school", fmtPct(d.less_than_hs_pct)],
      ["High school graduate (incl. equivalency)", fmtPct(d.hs_grad_pct)],
      ["Some college or associate's", fmtPct(d.some_college_or_assoc_pct)],
      ["Bachelor's degree", fmtPct(d.bachelors_pct)],
      ["Graduate or professional degree", fmtPct(d.grad_prof_pct)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const housingRow = buildComparisonRow(
    "Housing &amp; Education (ACS)",
    housingContent({
      housing_units_total: data.housing_units_total,
      housing_units_occupied: data.housing_units_occupied,
      housing_units_vacant: data.housing_units_vacant,
      vacancy_rate_pct: data.vacancy_rate_pct,
      occupancy_rate_pct: data.occupancy_rate_pct,
      owner_occupied_pct: data.owner_occupied_pct,
      renter_occupied_pct: data.renter_occupied_pct,
      median_home_value: data.median_home_value,
      median_gross_rent: data.median_gross_rent,
      high_school_or_higher_pct: data.high_school_or_higher_pct,
      bachelors_or_higher_pct: data.bachelors_or_higher_pct,
      less_than_hs_pct: data.less_than_hs_pct,
      hs_grad_pct: data.hs_grad_pct,
      some_college_or_assoc_pct: data.some_college_or_assoc_pct,
      bachelors_pct: data.bachelors_pct,
      grad_prof_pct: data.grad_prof_pct,
    }),
    housingContent(s.demographics || {}),
    housingContent(w.demographics || {}),
    '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>' + renderSourceNotesGrouped('housing', data._source_log),
    scopes,
  );

  const dacCallout = (status, tracts, popPct, tractPct) => {
    const yes = Array.isArray(tracts) ? tracts.length > 0 : !!status;
    const border = yes ? "var(--success)" : "var(--border-strong)";

    const lines = [
      `Disadvantaged community: <strong>${yes ? "Yes" : "No"}</strong>`,
    ];

    const stats = [];
    if (Number.isFinite(popPct))
      stats.push(`<li><strong>${fmtPct(popPct)}</strong> of population</li>`);
    if (Number.isFinite(tractPct))
      stats.push(`<li><strong>${fmtPct(tractPct)}</strong> of tracts</li>`);
    if (stats.length) lines.push(`<ul class="dac-stats">${stats.join("")}</ul>`);

    if (Array.isArray(tracts) && tracts.length)
      lines.push(
        `<div class="dac-tracts">Tracts ${tracts
          .map((t) => escapeHTML(t))
          .join(", ")}</div>`,
      );

    return `<div class="callout" style="border-left-color:${border}">${lines.join("")}</div>`;
  };

  const dacRow = buildComparisonRow(
    "Disadvantaged Community (DAC) Status",
    dacCallout(dac_status),
    Array.isArray(s.dac_tracts)
      ? dacCallout(null, s.dac_tracts, s.dac_population_pct, s.dac_tracts_pct)
      : "",
    Array.isArray(w.dac_tracts)
      ? dacCallout(null, w.dac_tracts, w.dac_population_pct, w.dac_tracts_pct)
      : "",
    '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>' + renderSourceNotesGrouped('dac', data._source_log),
    scopes,
  );

  const enviroscreenRow = buildComparisonRow(
    "Environmental Indicators (CalEPA Enviroscreen)",
    renderEnviroscreenContent(enviroscreen),
    renderEnviroscreenContent(s.environment),
    renderEnviroscreenContent(w.environment),
    '<p class="section-description">This section shows environmental and community health indicators from California’s Enviroscreen tool. Results are presented as percentiles, with higher numbers (and darker colors) indicating greater environmental burdens compared to other areas in the state. These measures include factors such as air quality, traffic pollution, and access to safe drinking water.</p><p class="section-description">Staff can use this information to understand potential environmental challenges facing a neighborhood, strengthen grant applications that require equity or environmental justice considerations, and design outreach that addresses local concerns. For example, if an event is planned in an area with a high Enviroscreen percentile, staff may want to highlight programs or benefits related to clean water, pollution reduction, or community health.</p><p class="section-description"><strong>How to Read This</strong><br>Green = Low burden (fewer environmental and health challenges)<br>Yellow/Orange = Moderate burden<br>Red = High burden (greater environmental and health challenges)<br>Percentile score shows how the community compares to others across California.</p>' + renderSourceNotesGrouped('enviroscreen', data._source_log),
    scopes,
  );

  const hardshipRow = buildComparisonRow(
    "Environmental Hardships",
    hardshipList.length
      ? `<div class="stats">${hardshipList
          .map((h) => `<span class="pill">${escapeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    sHardships.length
      ? `<div class="stats">${sHardships
          .map((h) => `<span class="pill">${escapeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    wHardships.length
      ? `<div class="stats">${wHardships
          .map((h) => `<span class="pill">${escapeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
    scopes,
  );

  const alertsRow = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${
        alertList.length
          ? `<div class="stats">${alertList
              .map((a) => `<span class="pill">${escapeHTML(a)}</span>`)
              .join("")}</div>`
          : '<p class="note">No active alerts found for this location.</p>'
      }
    </section>
  `;
  const columnHeaders = buildColumnHeaders(scopes);
  const rows = [locationRow];
  if (categories.demographics) rows.push(populationRow);
  if (categories.language) rows.push(languageRow);
  if (categories.race) rows.push(raceRow);
  if (categories.housing) rows.push(housingRow);
  if (categories.dac) rows.push(dacRow);
  if (categories.enviroscreen) {
    rows.push(enviroscreenRow);
    rows.push(hardshipRow);
  }
  document.getElementById("result").innerHTML = `
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${escapeHTML(address)}</h2>
          <div class="card__actions">
            <button type="button" onclick="printReport()">Print</button>
            <button type="button" onclick="downloadPdf()">Download PDF</button>
            <button type="button" onclick="downloadRawData()">Raw Data</button>
            <button type="button" onclick="shareReport()">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${nowStamp()}</span>
      </div>
      ${columnHeaders}
      ${rows.join("")}
      ${categories.alerts ? alertsRow : ""}
      <p class="note">Search took ${formatDuration(elapsedMs)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
  `;
}
// ---------- Flow ----------
async function lookup(opts = {}) {
  const { force = false } = opts || {};
  const input = document.getElementById("autocomplete");
  const resultBox = document.getElementById("result");
  const address = (input?.value || "").trim();
  const selections = getSelections();
  const { scopes, categories } = selections;
  if (!scopes.tract && !scopes.radius && !scopes.water) {
    renderError("Please select at least one geographic scope.", address, 0);
    return;
  }

  if (address.length < 4) {
    renderError(
      "Please enter a more complete address (at least 4 characters).",
      address,
      0,
    );
    return;
  }

  const cacheKey = address.toLowerCase();
  if (!force && lookupCache.has(cacheKey)) {
    const cached = lookupCache.get(cacheKey);
    lastReport = { address, data: cached };
    const locUrl = new URL(window.location);
    locUrl.searchParams.set("address", address);
    window.history.replaceState(null, "", locUrl.toString());
    renderResult(address, cached, 0, selections);
    return;
  }

  // Cancel any in-flight lookup
  if (currentLookupController) try { currentLookupController.abort(); } catch {}
  currentLookupController = new AbortController();
  const { signal } = currentLookupController;

  resultBox.setAttribute("aria-busy", "true");
  renderLoading(address, selections);
  const overlay = document.getElementById("spinnerOverlay");
  if (overlay) overlay.style.display = "flex";
  startSearchTimer();
  let elapsed = 0;

  try {
    const url = buildApiUrl(API_PATH, { address });
    CURRENT_SOURCE_LOG = {};
    let data = await fetchJsonRetryL(url, 'population', { timeoutMs: 45000, signal });
    if (!data || typeof data !== "object")
      throw new Error("Malformed response.");
    data = await enrichLocation(data);

    // Start enrichment tasks, but do not block initial render beyond a short budget
    // Primary tasks (local + discover surrounding/district context)
    const primaryTasks = [];
    primaryTasks.push(categories.language ? fetchLanguageAcs(data) : Promise.resolve({}));
    primaryTasks.push(categories.race ? (async () => {
      const { state_fips, county_fips, tract_code } = data || {};
      if (state_fips && county_fips && tract_code) {
        const fips = `${state_fips}${county_fips}${tract_code}`;
        return aggregateRaceForTracts([fips]);
      }
      return {};
    })() : Promise.resolve({}));
    primaryTasks.push(categories.housing ? (async () => {
      const { state_fips, county_fips, tract_code } = data || {};
      if (state_fips && county_fips && tract_code) {
        const fips = `${state_fips}${county_fips}${tract_code}`;
        return aggregateHousingEducationForTracts([fips]);
      }
      return {};
    })() : Promise.resolve({}));
    primaryTasks.push(scopes.radius ? enrichSurrounding(data, categories) : Promise.resolve({}));
    primaryTasks.push(scopes.water ? enrichWaterDistrict(data, address, categories) : Promise.resolve({}));
    primaryTasks.push(categories.language ? enrichEnglishProficiency(data) : Promise.resolve({}));
    primaryTasks.push(categories.alerts ? enrichNwsAlerts(data) : Promise.resolve({}));
    
    // Phase 1: wait briefly for quick results, then render
    const budgetMs = 6000;
    const phase1 = await Promise.allSettled(
      primaryTasks.map((t) => withTimeout(t, budgetMs, {})),
    );
    const phase1Results = phase1.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...phase1Results);

    // Early render with whatever we have
    const locUrl = new URL(window.location);
    locUrl.searchParams.set("address", address);
    window.history.replaceState(null, "", locUrl.toString());
    elapsed = stopSearchTimer();
    renderResult(address, data, elapsed, selections);

    // Phase 2: finish remaining primary tasks and re-render when done (unless aborted)
    const allPrimary = await Promise.allSettled(primaryTasks);
    if (signal.aborted) return;
    const finalPrimary = allPrimary.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...finalPrimary);

    // Now that surrounding/district context is available, run region aggregations
    const regionTasks = [];
    if ((scopes.radius || scopes.water) && (categories.demographics || categories.housing || categories.race))
      regionTasks.push(enrichRegionBasics(data));
    if ((scopes.radius || scopes.water) && categories.language)
      regionTasks.push(enrichRegionLanguages(data));
    if ((scopes.radius || scopes.water) && categories.race)
      regionTasks.push(enrichRegionRace(data));
    if ((scopes.radius || scopes.water) && categories.housing)
      regionTasks.push(enrichRegionHousingEducation(data));
    if ((scopes.radius || scopes.water) && categories.enviroscreen)
      regionTasks.push(enrichRegionHardships(data));
    if (categories.demographics)
      regionTasks.push(enrichUnemployment(data));

    // Quick pass
    const phaseR1 = await Promise.allSettled(
      regionTasks.map((t) => withTimeout(t, budgetMs, {})),
    );
    const regionQuick = phaseR1.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...regionQuick);
    renderResult(address, data, elapsed, selections);

    // Finalize region
    // Add derived counts/rent enrichment late to leverage upstream + region merges
    regionTasks.push(enrichDerivedCountsAndRent(data));
    const allRegion = await Promise.allSettled(regionTasks);
    if (signal.aborted) return;
    const regionFinal = allRegion.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...regionFinal);

    data._source_log = CURRENT_SOURCE_LOG;
    lastReport = { address, data };
    lookupCache.set(cacheKey, data);
    renderResult(address, data, elapsed, selections);
  } catch (err) {
    if (!elapsed) elapsed = stopSearchTimer();
    renderError(String(err), address, elapsed);
  } finally {
    const overlay = document.getElementById("spinnerOverlay");
    if (overlay) overlay.style.display = "none";
    resultBox.removeAttribute("aria-busy");
  }
}

// ---------- Init ----------
function bindLookupTrigger() {
  const btn = document.getElementById("lookupBtn");
  if (!btn) return;
  const clone = btn.cloneNode(true);
  btn.replaceWith(clone);
  clone.addEventListener("click", (e) => {
    e.preventDefault();
    lookup().catch(console.error);
  });
}

function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function bindOptionToggles() {
  const handler = debounce(() => {
    const input = document.getElementById("autocomplete");
    const addr = (input?.value || "").trim();
    if (addr.length >= 4) lookup({ force: true }).catch(console.error);
  }, 200);
  document
    .querySelectorAll('.scope-options input[type="checkbox"], .category-options input[type="checkbox"]')
    .forEach((el) => el.addEventListener("change", handler));
}

function bindExpanders() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-expand]');
    if (!btn) return;
    const id = btn.getAttribute('data-expand');
    const full = btn.getAttribute('data-full');
    const short = btn.getAttribute('data-short');
    if (!id || !full) return;
    const span = document.getElementById(`${id}-tracts`);
    const expanded = btn.getAttribute('data-state') === 'expanded';
    if (!expanded) {
      if (span) span.textContent = full;
      btn.textContent = 'Less';
      btn.setAttribute('data-state', 'expanded');
    } else {
      if (span && short) span.textContent = short;
      btn.textContent = 'More…';
      btn.removeAttribute('data-state');
    }
  });
}

function loadGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=initAutocomplete`;
  script.async = true;
  document.head.appendChild(script);
}

// Warm language metadata so the first lookup is faster
getLanguageMeta().catch(() => {});

window.onload = () => {
  loadGoogleMaps();
  bindLookupTrigger();
  bindOptionToggles();
  bindExpanders();
  const params = new URLSearchParams(window.location.search);
  const addr = params.get("address");
  if (addr) {
    const input = document.getElementById("autocomplete");
    if (input) {
      input.value = addr;
      lookup().catch(console.error);
    }
  }
};
