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
      (u.origin === window.location.origin && /^\/v1\//.test(u.pathname))
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
      if (/^\/v1\//.test(path)) return 'api.calwep.org';
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

// Persist user selections across refresh
const PREFS_KEY = 'calwep_prefs_v1';
function savePreferences() {
  try {
    const { scopes, categories } = getSelections();
    const prefs = { scopes, categories };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}
function restorePreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    const apply = (id, val) => {
      const el = document.getElementById(id);
      if (el && typeof val === 'boolean') el.checked = val;
    };
    const s = prefs.scopes || {};
    apply('scope-tract', s.tract);
    apply('scope-radius', s.radius);
    apply('scope-water', s.water);
    const c = prefs.categories || {};
    apply('cat-demographics', c.demographics);
    apply('cat-language', c.language);
    apply('cat-housing', c.housing);
    apply('cat-enviroscreen', c.enviroscreen);
    apply('cat-dac', c.dac);
    apply('cat-race', c.race);
    apply('cat-alerts', c.alerts);
  } catch {}
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
const API_BASE = (() => {
  const meta = document.querySelector('meta[name="api-base"]')?.content || 'https://api.calwep.org';
  try {
    const u = new URL(meta, window.location.origin);
    // Always use api.calwep.org for app endpoints (even in local dev)
    if (u.hostname === 'api.calwep.org') return u.origin;
  } catch {}
  return 'https://api.calwep.org';
})();
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

// Remove the words "Census Tract" from a tract name for compact display
function cleanTractName(value) {
  if (value == null) return value;
  return String(value).replace(/\bCensus\s*Tract\b\s*/gi, "").trim();
}

// Normalize CalEnviroScreen payloads to the renderer's expected shape
function normalizeEnviroscreenData(data) {
  if (!data || typeof data !== 'object') return null;
  // Already in normalized shape
  if (data.percentile != null || data.overall_percentiles) return data;
  const hasFlat = (
    data.ci_percentile != null ||
    data.ci_score != null ||
    'ozone_pct' in data || 'pm25_pct' in data
  );
  if (!hasFlat) return data;
  const num = (v) => (v == null ? null : Number(v));
  return {
    score: num(data.ci_score),
    percentile: num(data.ci_percentile),
    overall_percentiles: {
      calenviroscreen: num(data.ci_percentile),
      pollution_burden: num(data.pollution_percentile),
      population_characteristics: num(data.pop_char_percentile),
    },
    exposures: {
      ozone: num(data.ozone_pct),
      pm25: num(data.pm25_pct),
      diesel: num(data.diesel_pct),
      toxic_releases: num(data.toxic_releases_pct),
      traffic: num(data.traffic_pct),
      pesticides: num(data.pesticides_pct),
      drinking_water: num(data.drinking_water_pct),
      lead: num(data.lead_pct),
    },
    environmental_effects: {
      cleanup_sites: num(data.cleanup_sites_pct),
      groundwater_threats: num(data.groundwater_threats_pct),
      hazardous_waste: num(data.hazardous_waste_pct),
      impaired_waters: num(data.impaired_waters_pct),
      solid_waste: num(data.solid_waste_pct),
    },
    sensitive_populations: {
      asthma: num(data.asthma_pct),
      low_birth_weight: num(data.low_birth_weight_pct),
      cardiovascular_disease: num(data.cardiovascular_disease_pct),
    },
    socioeconomic_factors: {
      education: num(data.education_pct),
      linguistic_isolation: num(data.linguistic_isolation_pct),
      poverty: num(data.poverty_pct),
      unemployment: num(data.unemployment_pct),
      housing_burden: num(data.housing_burden_pct),
    },
  };
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
  // Normalize URL routing so static servers (no proxy) work
  function normalizeUrlForEnv(u) {
    try {
      const parsed = new URL(u, window.location.origin);
      const sameOrigin = parsed.origin === window.location.origin;
      // Rewrite same-origin proxy paths to public API equivalents
      if (sameOrigin && /^\/(proxy\/acs|api\/acs|acs)\b/.test(parsed.pathname)) {
        const tail = parsed.pathname.replace(/^\/(proxy\/acs|api\/acs|acs)/, '');
        return `https://api.calwep.org/acs${tail}${parsed.search || ''}`;
      }
      if (sameOrigin && /^\/geocoder\b/.test(parsed.pathname)) {
        const tail = parsed.pathname.replace(/^\/geocoder/, '');
        return `https://api.calwep.org/v1/api/geocoder${tail}${parsed.search || ''}`;
      }
      if (sameOrigin && /^\/tiger\b/.test(parsed.pathname)) {
        return `https://api.calwep.org/v1/api${parsed.pathname}${parsed.search || ''}`;
      }
    } catch {}
    return u;
  }
  url = normalizeUrlForEnv(url);
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

// ---------- DB API Helpers ----------
async function dbDemographicsByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/db/demographics/fips', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function dbAcsProfileByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/db/acs-profile', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}

function extractLatLonCandidate(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const has = (k) => Object.prototype.hasOwnProperty.call(obj, k);
  const latKeys = ['lat', 'latitude', 'y'];
  const lonKeys = ['lon', 'lng', 'longitude', 'x'];
  let lat = null, lon = null;
  for (const k of latKeys) if (has(k) && obj[k] != null) { lat = Number(obj[k]); break; }
  for (const k of lonKeys) if (has(k) && obj[k] != null) { lon = Number(obj[k]); break; }
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  return null;
}
async function dbEnviroscreenByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/enviroscreen', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'enviroscreen', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function dbEnviroscreenFetch(fips11) {
  if (!fips11 || String(fips11).length !== 11) return false;
  const url = buildApiUrl('/v1/enviroscreen', { fips: String(fips11) });
  try {
    const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
    return res.ok;
  } catch { return false; }
}

async function enviroscreenSurrounding(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/enviroscreen/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'enviroscreen', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function enviroscreenWaterDistrict(lat, lon) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/enviroscreen/water-district', { lat: String(lat), lon: String(lon) });
  return fetchJsonRetryL(url, 'enviroscreen', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function dbSurroundingAggregates(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/db/aggregates/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 30000 }).catch(() => ({}));
}
async function dbWaterDistrictAggregates(lat, lon) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/db/aggregates/water-district', { lat: String(lat), lon: String(lon) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 30000 }).catch(() => ({}));
}

// List census tracts within a radius (DB-backed)
async function dbTractsWithinRadius(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/db/tracts/within-radius', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'location', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}

// ---------- Typed Endpoints: Population & Income ----------
async function popIncomeByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/population-income', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function popIncomeSurrounding(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/population-income/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function popIncomeWaterDistrict(lat, lon) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/population-income/water-district', { lat: String(lat), lon: String(lon) });
  return fetchJsonRetryL(url, 'population', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}

// ---------- Typed Endpoints: Race & Ethnicity ----------
async function raceByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/race-ethnicity', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'race', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function raceSurrounding(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/race-ethnicity/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'race', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function raceWaterDistrict(lat, lon) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/race-ethnicity/water-district', { lat: String(lat), lon: String(lon) });
  return fetchJsonRetryL(url, 'race', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}

// ---------- Typed Endpoints: Housing & Education ----------
async function housingByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/housing-education', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'housing', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function housingSurrounding(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/housing-education/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'housing', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function housingWaterDistrict(lat, lon) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/housing-education/water-district', { lat: String(lat), lon: String(lon) });
  return fetchJsonRetryL(url, 'housing', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}

// ---------- Typed Endpoints: DAC ----------
async function dacByFips(fips11) {
  if (!fips11 || String(fips11).length !== 11) return {};
  const url = buildApiUrl('/v1/dac', { fips: String(fips11) });
  return fetchJsonRetryL(url, 'dac', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function dacSurrounding(lat, lon, miles = 10) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/dac/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  return fetchJsonRetryL(url, 'dac', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}
async function dacWaterDistrict(lat, lon) {
  if (lat == null || lon == null) return {};
  const url = buildApiUrl('/v1/dac/water-district', { lat: String(lat), lon: String(lon) });
  return fetchJsonRetryL(url, 'dac', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
}

// ---------- Typed Endpoints: FIPS utilities ----------
async function listFipsSurrounding(lat, lon, miles = 10) {
  if (lat == null || lon == null) return [];
  const url = buildApiUrl('/v1/fips/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles) });
  const j = await fetchJsonRetryL(url, 'location', { retries: 1, timeoutMs: 15000 }).catch(() => null);
  // New shape: { tracts: [{ fips, ...}] }
  if (Array.isArray(j?.tracts)) {
    return j.tracts.map((r) => String(r?.fips || '')).filter((s) => /^\d{11}$/.test(s));
  }
  // Back-compat: older shape returned { fips: [] } or array of objects
  const arr = Array.isArray(j?.fips) ? j.fips.map(String) : Array.isArray(j) ? j.map((o) => String(o?.fips)).filter(Boolean) : [];
  return arr.filter((s) => /^\d{11}$/.test(s));
}

async function fetchSurroundingMeta(lat, lon, miles = 10, includeCity = true) {
  if (lat == null || lon == null) return [];
  const url = buildApiUrl('/v1/fips/surrounding', { lat: String(lat), lon: String(lon), miles: String(miles), include_city: includeCity ? 'true' : undefined });
  const j = await fetchJsonRetryL(url, 'location', { retries: 1, timeoutMs: 20000 }).catch(() => null);
  // New shape: { count, tracts: [{ fips, tract, county, city }] }
  if (Array.isArray(j?.tracts)) {
    return j.tracts.map((r) => ({
      fips: r?.fips ? String(r.fips) : null,
      tract: r?.tract != null ? String(r.tract) : null,
      county: r?.county != null ? String(r.county) : null,
      city: r?.city != null ? String(r.city) : null,
    })).filter((r) => /^\d{11}$/.test(r.fips || ''));
  }
  if (Array.isArray(j)) {
    return j.map((r) => ({
      fips: r?.fips ? String(r.fips) : null,
      tract: r?.tract != null ? String(r.tract) : null,
      county: r?.county != null ? String(r.county) : null,
      city: r?.city != null ? String(r.city) : null,
    })).filter((r) => /^\d{11}$/.test(r.fips || ''));
  }
  // Back-compat minimal shape { fips: [] }
  const arr = Array.isArray(j?.fips) ? j.fips.map(String) : [];
  return arr.filter((s) => /^\d{11}$/.test(s)).map((f) => ({ fips: f, tract: null, county: null, city: null }));
}

async function fetchCountyFromSurrounding(lat, lon) {
  const rows = await fetchSurroundingMeta(lat, lon, 0.1, false).catch(() => []);
  for (const r of rows) {
    if (r && r.county) return String(r.county);
  }
  return null;
}
async function listFipsWaterDistrict(lat, lon) {
  if (lat == null || lon == null) return [];
  const url = buildApiUrl('/v1/fips/water-district', { lat: String(lat), lon: String(lon) });
  const j = await fetchJsonRetryL(url, 'location', { retries: 1, timeoutMs: 15000 }).catch(() => null);
  if (Array.isArray(j?.tracts)) {
    return j.tracts.map((r) => String(r?.fips || '')).filter((s) => /^\d{11}$/.test(s));
  }
  const arr = Array.isArray(j?.fips) ? j.fips.map(String) : [];
  return arr.filter((s) => /^\d{11}$/.test(s));
}

async function fetchWaterMeta(lat, lon) {
  if (lat == null || lon == null) return [];
  const url = buildApiUrl('/v1/fips/water-district', { lat: String(lat), lon: String(lon) });
  const j = await fetchJsonRetryL(url, 'location', { retries: 1, timeoutMs: 20000 }).catch(() => null);
  if (Array.isArray(j?.tracts)) {
    return j.tracts.map((r) => ({
      fips: r?.fips ? String(r.fips) : null,
      tract: r?.tract != null ? String(r.tract) : null,
      county: r?.county != null ? String(r.county) : null,
      city: r?.city != null ? String(r.city) : null,
    })).filter((r) => /^\d{11}$/.test(r.fips || ''));
  }
  const arr = Array.isArray(j?.fips) ? j.fips.map(String) : [];
  return arr.filter((s) => /^\d{11}$/.test(s)).map((f) => ({ fips: f, tract: null, county: null, city: null }));
}

// POST aggregate demographics over a list of tracts (FIPS-11)
// Uses stable legacy endpoint at /v1/db/acs-profile/aggregate
async function dbAcsProfileAggregate(fipsList = []) {
  const f = Array.isArray(fipsList) ? fipsList.map(String).filter((s) => /^\d{11}$/.test(s)) : [];
  if (!f.length) return {};
  const url = buildApiUrl('/v1/db/acs-profile/aggregate');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ fips: f }),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
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

function isDevOrigin() {
  try {
    const h = window.location.hostname;
    return (
      h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
    );
  } catch { return false; }
}

function toCensus(url) {
  try {
    const u = new URL(url);
    const pathAndQuery = u.pathname + (u.search || '');
    // Always route ACS through api.calwep.org browser-friendly alias
    if (u.hostname.endsWith('api.census.gov')) {
      return `https://api.calwep.org/acs${pathAndQuery}`;
    }
    if (u.hostname === 'geocoding.geo.census.gov') {
      const tail = pathAndQuery.replace(/^(\/geocoder)+/, '');
      return `https://api.calwep.org/v1/api/geocoder${tail}`;
    }
    if (u.hostname.endsWith('tigerweb.geo.census.gov')) {
      const m = u.pathname.match(/\/MapServer\/(.*)$/);
      const tail = m ? m[1] : '';
      const p = `/tiger/MapServer/${tail}` + (u.search || '');
      return `https://api.calwep.org/v1/api${p}`;
    }
  } catch {}
  return url;
}
// Attempt to fill in missing city or census tract using public geocoders
async function enrichLocation(data = {}) {
  let { city, county, census_tract, lat, lon, state_fips, county_fips, tract_code } =
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
          if (!county && adminCounty) county = adminCounty;
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
      const geos = j?.result?.geographies || {};
      let tract = null;
      let countyNameCg = null;
      try {
        const counties = Array.isArray(geos?.Counties) ? geos.Counties : Array.isArray(geos?.counties) ? geos.counties : null;
        if (counties && counties.length) countyNameCg = counties[0]?.NAME || counties[0]?.name || null;
      } catch {}
      for (const [k, arr] of Object.entries(geos)) {
        if (/census\s*tract/i.test(k) && Array.isArray(arr) && arr.length) {
          tract = arr[0];
          break;
        }
      }
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
          county: countyNameCg || undefined,
          source: 'census_geocoder',
        };
      }
    } catch {}
    return null;
  }
  async function fipsFromTigerWeb(lat, lon) {
    try {
      const tractUrl = toCensus(
        "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query",
      );
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
        const countyUrl = toCensus(
          "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/9/query",
        );
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
          const placeUrl = toCensus(`https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/${layer}/query`);
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
        if (alt.county && !county) county = alt.county;
      }
    })());
  }
  if (tasks.length) await Promise.all(tasks);
  // If county still missing, prefer CalWEP FIPS meta (fast, DB-cached)
  if (!county && lat != null && lon != null) {
    try {
      const c = await fetchCountyFromSurrounding(lat, lon);
      if (c) county = c;
    } catch {}
  }
  // Final county fallback using TIGERweb Counties layer if still missing
  if (!county && lat != null && lon != null) {
    try {
      const countyUrl = toCensus(
        "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/9/query",
      );
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
      const n = cj?.features?.[0]?.attributes?.NAME;
      if (n) county = n;
    } catch {}
  }
  return {
    ...data,
    city,
    county,
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
  const list = Array.isArray(fipsList) ? fipsList.map(String).filter((s) => /^\d{11}$/.test(s)) : [];
  if (!list.length) return {};
  // Prefer CalWEP API aggregate endpoint for languages
  try {
    const url = buildApiUrl('/v1/languages', { fips: list.join(',') });
    const j = await fetchJsonRetryL(url, 'language', { retries: 1, timeoutMs: 20000 });
    if (j && typeof j === 'object') {
      const out = {};
      if (j.primary_language != null) out.primary_language = j.primary_language;
      if (j.secondary_language != null) out.secondary_language = j.secondary_language;
      if (j.language_other_than_english_pct != null) out.language_other_than_english_pct = j.language_other_than_english_pct;
      if (j.english_less_than_very_well_pct != null) out.english_less_than_very_well_pct = j.english_less_than_very_well_pct;
      if (j.spanish_at_home_pct != null) out.spanish_at_home_pct = j.spanish_at_home_pct;
      // If API includes additional helpful fields, pass them through as well
      for (const k of Object.keys(j)) {
        if (out[k] == null && /_language$|_pct$|_at_home$/.test(k)) out[k] = j[k];
      }
      return out;
    }
  } catch {}
  // Fallback to direct ACS aggregation if API is unavailable
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
// DAC status now comes from DB aggregates. External GIS lookup removed.
async function fetchDacFips(fipsList = []) { return []; }

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
  // Prefer typed endpoint by lat/lon for surrounding
  if (out.lat != null && out.lon != null) {
    try {
      let sFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips.map(String) : [];
      if (!sFips.length) sFips = await listFipsSurrounding(out.lat, out.lon, 10);
      const params = { lat: String(out.lat), lon: String(out.lon), miles: '10' };
      if (sFips.length) params.fips = sFips.join(',');
      const lang = await fetchJsonRetryL(buildApiUrl('/v1/languages/surrounding', params), 'language', { retries: 1, timeoutMs: 20000 });
      const d = s.demographics || {};
      out.surrounding_10_mile = { ...s, demographics: { ...d, ...lang }, census_tracts_fips: sFips.length ? sFips : s.census_tracts_fips };
    } catch {}
  } else if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
    const lang = await aggregateLanguageForTracts(s.census_tracts_fips);
    const d = s.demographics || {};
    out.surrounding_10_mile = { ...s, demographics: { ...d, ...lang } };
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  // Prefer typed endpoint by lat/lon for water district
  if (out.lat != null && out.lon != null) {
    try {
      let wf = wFips;
      if (!wf.length) wf = await listFipsWaterDistrict(out.lat, out.lon);
      const params = { lat: String(out.lat), lon: String(out.lon) };
      if (wf.length) params.fips = wf.join(',');
      const lang = await fetchJsonRetryL(buildApiUrl('/v1/languages/water-district', params), 'language', { retries: 1, timeoutMs: 20000 });
      const d = w.demographics || {};
      out.water_district = { ...w, demographics: { ...d, ...lang }, census_tracts_fips: wf.length ? wf : w.census_tracts_fips };
    } catch {}
  } else if (wFips.length) {
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
  const s = { ...(surrounding_10_mile || {}) };
  // Prefer the new FIPS meta endpoint which returns tract labels, county, and optional city
  try {
    const rows = await fetchSurroundingMeta(lat, lon, 10, true);
    const fips = [];
    const names = [];
    const map = {};
    const cities = new Set(Array.isArray(s.cities) ? s.cities.map(String) : []);
    const counties = new Set(Array.isArray(s.counties) ? s.counties.map(String) : []);
    for (const r of rows) {
      const f = String(r.fips);
      if (/^\d{11}$/.test(f)) fips.push(f);
      const labelRaw = r.tract != null ? String(r.tract) : null;
      const label = labelRaw ? cleanTractName(labelRaw) : null;
      if (label) {
        names.push(label);
        map[f] = label;
      }
      if (r.city) cities.add(String(r.city));
      if (r.county) counties.add(String(r.county));
    }
    if (fips.length) s.census_tracts_fips = Array.from(new Set([...(s.census_tracts_fips || []), ...fips]));
    if (names.length) s.census_tracts = Array.from(new Set([...(s.census_tracts || []), ...names]));
    if (Object.keys(map).length) s.census_tract_map = { ...(s.census_tract_map || {}), ...map };
    s.cities = Array.from(cities).slice(0, 10);
    s.counties = Array.from(counties);
  } catch {
    // Keep previous best-effort values if endpoint fails
  }
  // Always include the local tract in the lists if known
  const tractSet = new Set(Array.isArray(s.census_tracts) ? s.census_tracts.map((t) => cleanTractName(String(t))) : []);
  if (census_tract) tractSet.add(cleanTractName(String(census_tract)));
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
      if (Array.isArray(dacFips) && dacFips.length) {
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
        // Only compute percentages from local sums when we have DAC FIPS
        const lookup = await fetchUnemploymentForTracts(s.census_tracts_fips);
        let totalPop = 0;
        let dacPop = 0;
        const dacSet = new Set(dacFips.map(String));
        for (const f of s.census_tracts_fips) {
          const info = lookup[f];
          if (info && Number.isFinite(info.population)) {
            totalPop += info.population;
            if (dacSet.has(String(f))) dacPop += info.population;
          }
        }
        if (totalPop > 0) s.dac_population_pct = (dacPop / totalPop) * 100;
        if (s.census_tracts_fips.length > 0)
          s.dac_tracts_pct = (dacSet.size / s.census_tracts_fips.length) * 100;
      }
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
    const url = buildApiUrl("/v1/lookup", { address });
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
    const base = "https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query";
    const params = new URLSearchParams({
      geometry: JSON.stringify({ x: Number(lon), y: Number(lat), spatialReference: { wkid: 4326 } }),
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "PWS_NAME",
      returnGeometry: "false",
      f: "json",
    });
    const url = `${base}?${params.toString()}`;
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
      const url = buildApiUrl("/v1/census-tracts", { agency_name: w.name });
      const j = await fetchJsonWithDiagnostics(url);
      const tracts = j?.census_tracts;
      if (Array.isArray(tracts)) {
        w.census_tracts = [...new Set(tracts.map(String))];
      }
    } catch {
      // ignore errors
    }
  }

  // Water district tract list should come from CalWEP API; external overlay removed

  // Prefer new FIPS meta endpoint for water district to populate labels, counties, cities
  try {
    const rows = await fetchWaterMeta(lat, lon);
    const fips = [];
    const names = [];
    const map = {};
    const cities = new Set(Array.isArray(w.cities) ? w.cities.map(String) : []);
    const counties = new Set(Array.isArray(w.counties) ? w.counties.map(String) : []);
    for (const r of rows) {
      const f = String(r.fips);
      if (/^\d{11}$/.test(f)) fips.push(f);
      const labelRaw = r.tract != null ? String(r.tract) : null;
      const label = labelRaw ? cleanTractName(labelRaw) : null;
      if (label) { names.push(label); map[f] = label; }
      if (r.city) cities.add(String(r.city));
      if (r.county) counties.add(String(r.county));
    }
    if (fips.length) w.census_tracts_fips = Array.from(new Set([...(w.census_tracts_fips || []), ...fips]));
    if (names.length) w.census_tracts = Array.from(new Set([...(w.census_tracts || []), ...names]));
    if (Object.keys(map).length) w.census_tract_map = { ...(w.census_tract_map || {}), ...map };
    w.cities = Array.from(cities).slice(0, 10);
    w.counties = Array.from(counties);
  } catch {}

  let tracts = [];
  if (Array.isArray(w.census_tracts)) tracts = w.census_tracts.map(String);
  else if (typeof w.census_tracts === "string")
    tracts = w.census_tracts.split(/\s*,\s*/).filter(Boolean);
  if (census_tract) tracts.unshift(String(census_tract));
  // Normalize and dedupe labels
  w.census_tracts = Array.from(new Set(tracts.map((t) => cleanTractName(String(t)))));

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
      if (Array.isArray(dacFips) && dacFips.length) {
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
        // Only compute percentages from local sums when we have DAC FIPS
        const lookup = await fetchUnemploymentForTracts(w.census_tracts_fips);
        let totalPop = 0;
        let dacPop = 0;
        const dacSet = new Set(dacFips.map(String));
        for (const f of w.census_tracts_fips) {
          const info = lookup[f];
          if (info && Number.isFinite(info.population)) {
            totalPop += info.population;
            if (dacSet.has(String(f))) dacPop += info.population;
          }
        }
        if (totalPop > 0) w.dac_population_pct = (dacPop / totalPop) * 100;
        if (w.census_tracts_fips.length > 0)
          w.dac_tracts_pct = (dacSet.size / w.census_tracts_fips.length) * 100;
      }
    } catch {
      // ignore errors
    }
  }

  // Enviroscreen for water district will be fetched by typed endpoint later in the pipeline

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
        const u = toCensus(`https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`);
        const g = await fetchJsonRetry(u, { retries: 1, timeoutMs: 10000 });
        const geos = g?.result?.geographies || {};
        let ct = null;
        for (const [k, arr] of Object.entries(geos)) {
          if (/census\s*tract/i.test(k) && Array.isArray(arr) && arr.length) { ct = arr[0]; break; }
        }
        const geoid = ct?.GEOID;
        if (geoid && geoid.length >= 11) return { state: geoid.slice(0,2), county: geoid.slice(2,5), tract: geoid.slice(5,11) };
      } catch {}
      return null;
    })();
    const fromTiger = !fromGeocoder ? await (async () => {
      try {
        const tractUrl = toCensus("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query");
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
          .map((f) => {
            const p = f?.properties || {};
            const event = p.event;
            const head = p.headline;
            return head || event || null;
          })
          .filter(Boolean)
      : [];
    const meta = { title: j?.title || null, updated: j?.updated || null };
    return { ...data, alerts, alerts_meta: meta };
  } catch {
    return { ...data, alerts: [], alerts_meta: null };
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

  // Prefer the new PlaceAutocompleteElement when available
  const NewAutocomplete = google.maps.places && google.maps.places.PlaceAutocompleteElement;
  const USE_NEW_ELEMENT = false; // Revert to legacy Autocomplete for compatibility
  if (USE_NEW_ELEMENT && NewAutocomplete) {
    try {
      const elem = new NewAutocomplete();
      // Match our layout and theme
      elem.id = 'autocomplete';
      elem.style.display = 'block';
      elem.style.width = '100%';
      // Apply theme via Google Maps component CSS variables
      try {
        elem.style.setProperty('--gmpx-font-family', 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif');
        elem.style.setProperty('--gmpx-color-surface', 'var(--surface)');
        elem.style.setProperty('--gmpx-color-on-surface', 'var(--ink)');
        elem.style.setProperty('--gmpx-color-outline', 'var(--border)');
        elem.style.setProperty('--gmpx-color-primary', 'var(--brand)');
      } catch {}
      elem.setAttribute('aria-label', input.getAttribute('aria-label') || 'Address search');
      elem.placeholder = input.getAttribute('placeholder') || '';
      // Restrict to US addresses and request minimal fields
      if (elem.setComponentRestrictions) elem.setComponentRestrictions({ country: ['us'] });
      if (elem.setFields) elem.setFields(["address_components", "formatted_address"]);
      // Replace input in DOM to preserve layout/styles
      input.parentNode.replaceChild(elem, input);

      const handle = () => {
        let place = null;
        if (typeof elem.getPlace === 'function') place = elem.getPlace();
        // Fallback: try to use value if no structured place
        const fa = place && place.formatted_address;
        const ac = place && place.address_components;
        let street = "", city = "", state = "", zip = "";
        for (const comp of ac || []) {
          const t = comp.types || [];
          if (t.includes("street_number")) street = comp.long_name + " ";
          else if (t.includes("route")) street += comp.long_name;
          else if (t.includes("locality")) city = comp.long_name;
          else if (t.includes("administrative_area_level_1")) state = comp.short_name;
          else if (t.includes("postal_code")) zip = comp.long_name;
        }
        if (!zip && fa) {
          const m = fa.match(/\b\d{5}(?:-\d{4})?\b/);
          if (m) zip = m[0];
        }
        const finalVal = (street || city || state || zip) ? [street.trim(), city, state, zip].filter(Boolean).join(', ') : (fa || elem.value || '');
        // Populate the element's value and trigger lookup
        try { elem.value = finalVal; } catch {}
        document.getElementById("lookupBtn")?.click();
      };
      // Try both common event names for the new element
      elem.addEventListener('placechange', handle);
      elem.addEventListener('gmp-placeselect', handle);
      // Also submit on Enter
      elem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handle();
        }
      });
      return;
    } catch {}
  }

  // Fallback to legacy Autocomplete widget
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
    // Auto-trigger lookup after selection for smoother UX
    document.getElementById("lookupBtn")?.click();
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
  // Order to match UI categories: Demographics, Language, Housing & Education, Enviroscreen, DAC, Race & Ethnicity, Alerts
  if (categories.demographics) rows.push(makeRow("Population &amp; Income"));
  if (categories.language) rows.push(makeRow("Language"));
  if (categories.housing) rows.push(makeRow("Housing &amp; Education"));
  if (categories.enviroscreen) rows.push(makeRow("Environmental Indicators"));
  if (categories.dac) rows.push(makeRow("Disadvantaged Community (DAC) Status"));
  if (categories.race) rows.push(makeRow("Race &amp; Ethnicity"));
  if (categories.alerts)
    rows.push(
      `<section class="section-block"><h3 class="section-header">Active Alerts</h3><p class="note">Loading…</p></section>`,
    );
  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${nowStamp()}</span>
      </div>
      ${address ? `<p class="note">Address: <strong>${escapeHTML(address)}</strong></p>` : ""}
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
  // Per-section column headers
  const headerCols = [];
  if (scopes.tract) headerCols.push('<div class="col">Census tract</div>');
  if (scopes.radius) headerCols.push('<div class="col">10 mile radius</div>');
  if (scopes.water) headerCols.push('<div class="col">Water district</div>');
  const headers = headerCols.length
    ? `<div class="comparison-grid column-headers">${headerCols.join("")}</div>`
    : "";
  return `
    <section class="section-block">
      <h3 class="section-header">${title}</h3>
      ${descriptionHtml}
      ${headers}
      <div class="comparison-grid">${cols.join("")}</div>
    </section>
  `;
}

// No longer need a global column header; per-section headers are rendered above each section

function renderEnviroscreenContent(data) {
  const norm = normalizeEnviroscreenData(data);
  if (!norm || typeof norm !== "object")
    return "<p class=\"note\">No data</p>";
  const badge = (v) => {
    const { bg, fg } = cesColor(v);
    const val = Number.isFinite(Number(v)) ? Number(v).toFixed(1) : "—";
    return `<span class="ces-badge" style="background:${bg};color:${fg};">${val}</span>`;
  };
  const overall = norm.percentile;
  const pb = norm.overall_percentiles?.pollution_burden;
  const pc = norm.overall_percentiles?.population_characteristics;
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
    ${renderGroup("Exposures", norm.exposures, CES_GROUP_ORDER.exposures)}
    ${renderGroup("Environmental effects", norm.environmental_effects, CES_GROUP_ORDER.environmental_effects)}
    ${renderGroup("Sensitive populations", norm.sensitive_populations, CES_GROUP_ORDER.sensitive_populations)}
    ${renderGroup("Socioeconomic factors", norm.socioeconomic_factors, CES_GROUP_ORDER.socioeconomic_factors)}
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
    alerts_meta,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const alertList = Array.isArray(alerts) ? alerts : [];
  const alertsUpdated = alerts_meta && alerts_meta.updated ? alerts_meta.updated : null;
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
        ? s.census_tracts.map(cleanTractName).join(", ")
        : (s.census_tracts ? escapeHTML(cleanTractName(s.census_tracts)) : "—");
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
      ? w.census_tracts.map(cleanTractName).join(", ")
      : (w.census_tracts ? escapeHTML(cleanTractName(w.census_tracts)) : "—");
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
    alerts_meta,
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
  // Environmental hardships section removed
  const sTracts = Array.isArray(s.census_tracts)
    ? Array.from(new Set(s.census_tracts.map((t) => cleanTractName(String(t)))))
    : [];
  const sCities = Array.isArray(s.cities)
    ? s.cities.join(", ")
    : escapeHTML(s.cities) || "—";
  const sCounties = Array.isArray(s.counties) && s.counties.length
    ? Array.from(new Set(s.counties.map(String))).join(', ')
    : (s.county ? escapeHTML(String(s.county)) : '—');
  const wTracts = Array.isArray(w.census_tracts)
    ? Array.from(new Set(w.census_tracts.map((t) => cleanTractName(String(t)))))
    : [];
  const wCities = Array.isArray(w.cities)
    ? w.cities.join(", ")
    : escapeHTML(w.cities) || "—";
  const wCounties = Array.isArray(w.counties) && w.counties.length
    ? Array.from(new Set(w.counties.map(String))).join(', ')
    : (w.county ? escapeHTML(String(w.county)) : '—');

  const locLocal = `
    <div class="kv">
      <div class="key">City</div><div class="val">${escapeHTML(city) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${escapeHTML(cleanTractName(census_tract)) || "—"}</div>
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
  function renderListWithToggle(arr, id, maxShown = 3) {
    if (!Array.isArray(arr) || !arr.length) return '—';
    const vals = Array.from(new Set(arr.map((v) => String(v))));
    const full = vals.join(', ');
    if (vals.length <= maxShown) return escapeHTML(full);
    const shown = vals.slice(0, maxShown).join(', ');
    const short = `${shown} …`;
    return `<span id="${id}-tracts">${escapeHTML(short)}</span> <button class="link-button" data-expand="${id}" data-short="${escapeHTML(short)}" data-full="${escapeHTML(full)}">More…</button>`;
  }
  const sFipsArr = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips.map(String) : [];
  const wFipsArr = Array.isArray(w.census_tracts_fips) ? w.census_tracts_fips.map(String) : [];
  const locSurround = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${renderListWithToggle(Array.isArray(s.cities) ? s.cities : (s.cities ? [s.cities] : []), 'sCities', 3)}</div>
      <div class="key">Counties</div><div class="val">${renderListWithToggle(Array.isArray(s.counties) ? s.counties : (s.county ? [s.county] : []), 'sCounties', 3)}</div>
      <div class="key">Census tracts</div><div class="val">${renderTractList(sTracts, 's')}</div>
      <div class="key">FIPS</div><div class="val">${sFipsArr.length ? renderTractList(sFipsArr, 'sF') : '—'}</div>
    </div>
  `;
  const locDistrict = `
    <div class="kv">
      <div class="key">District</div><div class="val">${escapeHTML(w.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${renderListWithToggle(Array.isArray(w.cities) ? w.cities : (w.cities ? [w.cities] : []), 'wCities', 3)}</div>
      <div class="key">Counties</div><div class="val">${renderListWithToggle(Array.isArray(w.counties) ? w.counties : (w.county ? [w.county] : []), 'wCounties', 3)}</div>
      <div class="key">Census tracts</div><div class="val">${renderTractList(wTracts, 'w')}</div>
      <div class="key">FIPS</div><div class="val">${wFipsArr.length ? renderTractList(wFipsArr, 'wF') : '—'}</div>
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
    // Normalize possible field name variants from aggregate API
    const dh = { ...d };
    if (dh.housing_units_total == null && dh.total_housing_units != null) dh.housing_units_total = dh.total_housing_units;
    if (dh.housing_units_occupied == null && dh.occupied_units != null) dh.housing_units_occupied = dh.occupied_units;
    if (dh.housing_units_vacant == null && dh.vacant_units != null) dh.housing_units_vacant = dh.vacant_units;
    if (dh.less_than_hs_pct == null && dh.less_than_high_school_pct != null) dh.less_than_hs_pct = dh.less_than_high_school_pct;
    if (dh.hs_grad_pct == null && dh.high_school_graduate_pct != null) dh.hs_grad_pct = dh.high_school_graduate_pct;
    if (dh.some_college_or_assoc_pct == null) {
      if (dh.some_college_or_associates_pct != null) dh.some_college_or_assoc_pct = dh.some_college_or_associates_pct;
      else if (dh.some_college_no_degree_pct != null || dh.associates_degree_pct != null) {
        const a = Number(dh.some_college_no_degree_pct) || 0;
        const b = Number(dh.associates_degree_pct) || 0;
        dh.some_college_or_assoc_pct = a + b;
      }
    }
    if (dh.bachelors_pct == null && dh.bachelors_degree_pct != null) dh.bachelors_pct = dh.bachelors_degree_pct;
    if (dh.grad_prof_pct == null && dh.graduate_or_professional_degree_pct != null) dh.grad_prof_pct = dh.graduate_or_professional_degree_pct;
    const entries = [
      ["Total housing units", fmtInt(dh.housing_units_total)],
      ["Occupied units", fmtInt(dh.housing_units_occupied)],
      ["Vacant units", fmtInt(dh.housing_units_vacant)],
      ["Vacancy rate", fmtPct(dh.vacancy_rate_pct)],
      ["Occupancy rate", fmtPct(dh.occupancy_rate_pct)],
      ["Owner occupied", fmtPct(dh.owner_occupied_pct)],
      ["Renter occupied", fmtPct(dh.renter_occupied_pct)],
      ["Median home value", fmtCurrency(dh.median_home_value)],
      ["Median gross rent", fmtCurrency(dh.median_gross_rent)],
      ["High school or higher", fmtPct(dh.high_school_or_higher_pct)],
      ["Bachelor's degree or higher", fmtPct(dh.bachelors_or_higher_pct)],
      ["Less than high school", fmtPct(dh.less_than_hs_pct)],
      ["High school graduate (incl. equivalency)", fmtPct(dh.hs_grad_pct)],
      ["Some college or associate's", fmtPct(dh.some_college_or_assoc_pct)],
      ["Bachelor's degree", fmtPct(dh.bachelors_pct)],
      ["Graduate or professional degree", fmtPct(dh.grad_prof_pct)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const housingRow = buildComparisonRow(
    "Housing &amp; Education (ACS)",
    housingContent(data || {}),
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
    dacCallout(null, s.dac_tracts, s.dac_population_pct, s.dac_tracts_pct),
    dacCallout(null, w.dac_tracts, w.dac_population_pct, w.dac_tracts_pct),
    '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>' + renderSourceNotesGrouped('dac', data._source_log),
    scopes,
  );

  // Normalize local enviroscreen source: accept either `enviroscreen` or `environment`
  const localEnv = (data && (data.enviroscreen || data.environment)) || enviroscreen;
  const enviroscreenRow = buildComparisonRow(
    "Environmental Indicators (CalEPA Enviroscreen)",
    renderEnviroscreenContent(localEnv),
    renderEnviroscreenContent(s.environment),
    renderEnviroscreenContent(w.environment),
    '<p class="section-description">This section shows environmental and community health indicators from California’s Enviroscreen tool. Results are presented as percentiles, with higher numbers (and darker colors) indicating greater environmental burdens compared to other areas in the state. These measures include factors such as air quality, traffic pollution, and access to safe drinking water.</p><p class="section-description">Staff can use this information to understand potential environmental challenges facing a neighborhood, strengthen grant applications that require equity or environmental justice considerations, and design outreach that addresses local concerns. For example, if an event is planned in an area with a high Enviroscreen percentile, staff may want to highlight programs or benefits related to clean water, pollution reduction, or community health.</p><p class="section-description"><strong>How to Read This</strong><br>Green = Low burden (fewer environmental and health challenges)<br>Yellow/Orange = Moderate burden<br>Red = High burden (greater environmental and health challenges)<br>Percentile score shows how the community compares to others across California.</p>' + renderSourceNotesGrouped('enviroscreen', data._source_log),
    scopes,
  );

  

  const alertsRow = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${(alerts_meta && alerts_meta.updated) ? `<p class="note">Updated: ${escapeHTML(alerts_meta.updated)}</p>` : ''}
      ${
        alertList.length
          ? `<div class="stats">${alertList
              .map((a) => `<span class="pill">${escapeHTML(a)}</span>`)
              .join("")}</div>`
          : '<p class="note">No active alerts found for this location.</p>'
      }
    </section>
  `;
  const rows = [locationRow];
  // Order: Demographics, Language, Housing & Education, Enviroscreen, DAC, Race & Ethnicity, Alerts
  if (categories.demographics) rows.push(populationRow);
  if (categories.language) rows.push(languageRow);
  if (categories.housing) rows.push(housingRow);
  if (categories.enviroscreen) rows.push(enviroscreenRow);
  if (categories.dac) rows.push(dacRow);
  if (categories.race) rows.push(raceRow);
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
    CURRENT_SOURCE_LOG = {};
    // Resolve lat/lon and basic location info via existing helpers
    // Prefer API lookup to resolve service area context; fall back to geocoders
    let data = {};
    try {
      const lu = buildApiUrl('/v1/lookup', { address });
      const j = await fetchJsonRetryL(lu, 'location', { timeoutMs: 30000, signal });
      if (j && typeof j === 'object') {
        data = { ...data, ...j };
        // Map DAC status from lookup → local flag used by renderer
        if (data.dac_status == null && j.is_disadvantaged_community != null) {
          data.dac_status = Boolean(j.is_disadvantaged_community);
        }
        // Seed water district display name from lookup agency info
        const agency = j.agency || {};
        const agencyDisplay = agency.display_name || agency.agency_name || agency.name || null;
        if (agencyDisplay) {
          data.water_district = { ...(data.water_district || {}), name: agencyDisplay };
        }
        // Try to extract lat/lon from common response shapes
        const candidates = [j, j.location, j.point, j.coords, j.coordinate, j.center, j.centroid, j.result?.point, j.agency?.center, j.agency?.centroid];
        for (const c of candidates) {
          const p = extractLatLonCandidate(c);
          if (p) { data.lat = p.lat; data.lon = p.lon; break; }
        }
      }
    } catch {}
    data.address = address;
    data = await enrichLocation(data);

    // Start enrichment tasks, but do not block initial render beyond a short budget
    // Primary tasks (local + discover surrounding/district context)
    const primaryTasks = [];
    // Fetch typed endpoints for the local tract (respect category toggles)
    primaryTasks.push((async () => {
      const { state_fips, county_fips, tract_code } = data || {};
      if (state_fips && county_fips && tract_code) {
        const fips = `${state_fips}${county_fips}${tract_code}`;
        const popP = categories.demographics ? popIncomeByFips(fips) : Promise.resolve({});
        const raceP = categories.race ? raceByFips(fips) : Promise.resolve({});
        const housingP = categories.housing ? housingByFips(fips) : Promise.resolve({});
        const envP = categories.enviroscreen ? dbEnviroscreenByFips(fips) : Promise.resolve({});
        const langP = categories.language ? aggregateLanguageForTracts([fips]).catch(() => ({})) : Promise.resolve({});
        const dacP = categories.dac ? dacByFips(fips).catch(() => ({})) : Promise.resolve({});
        let [popInc, race, housing, env, lang, dac] = await Promise.all([popP, raceP, housingP, envP, langP, dacP]);
        if (!env || !Object.keys(env).length) {
          if (categories.enviroscreen) {
            const ok = await dbEnviroscreenFetch(fips);
            if (ok) { try { env = await dbEnviroscreenByFips(fips); } catch {} }
          }
        }
        const merged = { ...popInc, ...race, ...housing, ...lang };
        if (categories.enviroscreen && env && Object.keys(env).length) merged.enviroscreen = env;
        // Map DAC result to dac_status if provided
        if (categories.dac && dac && typeof dac === 'object') {
          if (merged.dac_status == null) {
            const share = dac.share_dac;
            let status = Boolean(dac.is_majority_dac);
            if (!status && Number.isFinite(Number(share))) {
              const val = Number(share);
              status = val > 0 && (val > 1 ? val : val * 100) >= 50 ? true : status;
            }
            merged.dac_status = status;
          }
        }
        return merged;
      }
      return {};
    })());
    // Populate surrounding (tract labels, counties, cities, FIPS) using new FIPS endpoint
    primaryTasks.push(enrichSurrounding(data, categories));
    // Populate water district (tract labels, counties, cities, FIPS) using water FIPS endpoint
    primaryTasks.push(enrichWaterDistrict(data, address, categories));

  // Prefer DB endpoints over external TIGER/ArcGIS for surrounding and water
    // (Shape-based enrichers are skipped to avoid external dependencies)

    // Note: Do not call legacy DB aggregate endpoints. Typed endpoints below will populate regions.
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
    // Do not stop the timer yet; keep spinner counter running during background work
    const soFar = searchTimerStart ? Date.now() - searchTimerStart : 0;
    renderResult(address, data, soFar, selections);

    // Phase 2: finish remaining primary tasks and re-render when done (unless aborted)
    const allPrimary = await Promise.allSettled(primaryTasks);
    if (signal.aborted) return;
    const finalPrimary = allPrimary.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...finalPrimary);

    // Region aggregations via typed endpoints (respect scope + category toggles)
    const regionTasks = [];
    // Surrounding population/race/housing
    regionTasks.push((async () => {
      if (data.lat != null && data.lon != null && scopes.radius) {
        const s = data.surrounding_10_mile || {};
        let sFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips.map(String) : [];
        if (!sFips.length) sFips = await listFipsSurrounding(data.lat, data.lon, 10);
        const fipsParam = sFips.length ? { fips: sFips.join(',') } : {};
        const popP = categories.demographics
          ? fetchJsonRetryL(buildApiUrl('/v1/population-income/surrounding', { lat: String(data.lat), lon: String(data.lon), miles: '10', ...fipsParam }), 'population', { retries: 1, timeoutMs: 20000 })
          : Promise.resolve({});
        const raceP = categories.race
          ? fetchJsonRetryL(buildApiUrl('/v1/race-ethnicity/surrounding', { lat: String(data.lat), lon: String(data.lon), miles: '10', ...fipsParam }), 'race', { retries: 1, timeoutMs: 20000 })
          : Promise.resolve({});
        const houseP = categories.housing
          ? fetchJsonRetryL(buildApiUrl('/v1/housing-education/surrounding', { lat: String(data.lat), lon: String(data.lon), miles: '10', ...fipsParam }), 'housing', { retries: 1, timeoutMs: 20000 })
          : Promise.resolve({});
        const [pop, raceD, house] = await Promise.all([popP, raceP, houseP]);
        const d = { ...(s.demographics || {}), ...pop, ...raceD, ...house };
        return { surrounding_10_mile: { ...s, demographics: d, census_tracts_fips: sFips.length ? sFips : s.census_tracts_fips } };
      }
      return {};
    })());
    // Water-district population/race/housing
    regionTasks.push((async () => {
      if (data.lat != null && data.lon != null && scopes.water) {
        const w = data.water_district || {};
        let wf = Array.isArray(w.census_tracts_fips) ? w.census_tracts_fips.map(String) : [];
        if (!wf.length) wf = await listFipsWaterDistrict(data.lat, data.lon);
        const fipsParam = wf.length ? { fips: wf.join(',') } : {};
        const popP = categories.demographics
          ? fetchJsonRetryL(buildApiUrl('/v1/population-income/water-district', { lat: String(data.lat), lon: String(data.lon), ...fipsParam }), 'population', { retries: 1, timeoutMs: 20000 })
          : Promise.resolve({});
        const raceP = categories.race
          ? fetchJsonRetryL(buildApiUrl('/v1/race-ethnicity/water-district', { lat: String(data.lat), lon: String(data.lon), ...fipsParam }), 'race', { retries: 1, timeoutMs: 20000 })
          : Promise.resolve({});
        const houseP = categories.housing
          ? fetchJsonRetryL(buildApiUrl('/v1/housing-education/water-district', { lat: String(data.lat), lon: String(data.lon), ...fipsParam }), 'housing', { retries: 1, timeoutMs: 20000 })
          : Promise.resolve({});
        const [pop, raceD, house] = await Promise.all([popP, raceP, houseP]);
        const d = { ...(w.demographics || {}), ...pop, ...raceD, ...house };
        return { water_district: { ...w, demographics: d, census_tracts_fips: wf.length ? wf : w.census_tracts_fips } };
      }
      return {};
    })());

    // Quick pass
    const phaseR1 = await Promise.allSettled(
      regionTasks.map((t) => withTimeout(t, budgetMs, {})),
    );
    const regionQuick = phaseR1.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...regionQuick);
    renderResult(address, data, elapsed, selections);

    // Finalize region
    // Enviroscreen (typed endpoints) for surrounding (respect category toggle)
    if (categories.enviroscreen) regionTasks.push((async () => {
      if (data.lat != null && data.lon != null && scopes.radius) {
        const s2 = data.surrounding_10_mile || {};
        let sFips = Array.isArray(s2.census_tracts_fips) ? s2.census_tracts_fips.map(String) : [];
        if (!sFips.length) sFips = await listFipsSurrounding(data.lat, data.lon, 10);
        // Prefer FIPS-only call for Enviroscreen if we have them (backend aggregates & weights by population)
        let env;
        if (sFips.length) {
          env = await fetchJsonRetryL(
            buildApiUrl('/v1/enviroscreen/surrounding', { fips: sFips.join(',') }),
            'enviroscreen',
            { retries: 1, timeoutMs: 20000 },
          ).catch(() => ({}));
        } else {
          env = await fetchJsonRetryL(
            buildApiUrl('/v1/enviroscreen/surrounding', { lat: String(data.lat), lon: String(data.lon), miles: '10' }),
            'enviroscreen',
            { retries: 1, timeoutMs: 20000 },
          ).catch(() => ({}));
        }
        const out = { ...s2, environment: env, census_tracts_fips: sFips.length ? sFips : s2.census_tracts_fips };
        return { surrounding_10_mile: out };
      }
      return {};
    })());
    // Enviroscreen (typed endpoints) for water (respect category toggle)
    if (categories.enviroscreen) regionTasks.push((async () => {
      if (data.lat != null && data.lon != null && scopes.water) {
        const w2 = data.water_district || {};
        let wf = Array.isArray(w2.census_tracts_fips) ? w2.census_tracts_fips.map(String) : [];
        if (!wf.length) wf = await listFipsWaterDistrict(data.lat, data.lon);
        // Prefer FIPS-only call when available
        let env;
        if (wf.length) {
          env = await fetchJsonRetryL(buildApiUrl('/v1/enviroscreen/water-district', { fips: wf.join(',') }), 'enviroscreen', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
        } else {
          env = await fetchJsonRetryL(buildApiUrl('/v1/enviroscreen/water-district', { lat: String(data.lat), lon: String(data.lon) }), 'enviroscreen', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
        }
        const out = { ...w2, environment: env, census_tracts_fips: wf.length ? wf : w2.census_tracts_fips };
        return { water_district: out };
      }
      return {};
    })());
    // DAC (respect category toggle)
    if (categories.dac) regionTasks.push((async () => {
      const out = {};
      if (data.lat != null && data.lon != null && scopes.radius) {
        const s2 = data.surrounding_10_mile || {};
        let sFips = Array.isArray(s2.census_tracts_fips) ? s2.census_tracts_fips.map(String) : [];
        if (!sFips.length) sFips = await listFipsSurrounding(data.lat, data.lon, 10);
        const dacParams = sFips.length ? { fips: sFips.join(',') } : { lat: String(data.lat), lon: String(data.lon), miles: '10' };
        const dac = await fetchJsonRetryL(buildApiUrl('/v1/dac/surrounding', dacParams), 'dac', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
        if (dac && typeof dac === 'object') {
          const patch = {};
          const share = Number(dac.share_dac);
          if (Number.isFinite(share)) patch.dac_population_pct = share <= 1 ? share * 100 : share;
          const shareTracts = Number(dac.share_tracts);
          if (Number.isFinite(shareTracts)) patch.dac_tracts_pct = shareTracts <= 1 ? shareTracts * 100 : shareTracts;
          const dCount = Number(dac.tracts_dac ?? dac.count_dac);
          const tCount = Number(dac.tracts_total ?? dac.total_tracts ?? (Array.isArray(s2.census_tracts_fips) ? s2.census_tracts_fips.length : NaN));
          if (!Number.isFinite(patch.dac_tracts_pct) && Number.isFinite(dCount) && Number.isFinite(tCount) && tCount > 0) {
            patch.dac_tracts_pct = (dCount / tCount) * 100;
          }
          if (Object.keys(patch).length) out.surrounding_10_mile = { ...(s2 || {}), ...patch };
        }
      }
      if (data.lat != null && data.lon != null && scopes.water) {
        const w2 = data.water_district || {};
        let wf = Array.isArray(w2.census_tracts_fips) ? w2.census_tracts_fips.map(String) : [];
        if (!wf.length) wf = await listFipsWaterDistrict(data.lat, data.lon);
        const dacParams = wf.length ? { fips: wf.join(',') } : { lat: String(data.lat), lon: String(data.lon) };
        const dac = await fetchJsonRetryL(buildApiUrl('/v1/dac/water-district', dacParams), 'dac', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
        if (dac && typeof dac === 'object') {
          const patch = {};
          const share = Number(dac.share_dac);
          if (Number.isFinite(share)) patch.dac_population_pct = share <= 1 ? share * 100 : share;
          const shareTracts = Number(dac.share_tracts);
          if (Number.isFinite(shareTracts)) patch.dac_tracts_pct = shareTracts <= 1 ? shareTracts * 100 : shareTracts;
          const dCount = Number(dac.tracts_dac ?? dac.count_dac);
          const tCount = Number(dac.tracts_total ?? dac.total_tracts ?? (Array.isArray(w2.census_tracts_fips) ? w2.census_tracts_fips.length : NaN));
          if (!Number.isFinite(patch.dac_tracts_pct) && Number.isFinite(dCount) && Number.isFinite(tCount) && tCount > 0) {
            patch.dac_tracts_pct = (dCount / tCount) * 100;
          }
          if (Object.keys(patch).length) out.water_district = { ...(w2 || {}), ...patch };
        }
      }
      return out;
    })());
    // Language aggregates via typed API (respect category toggle)
    if (categories.language) {
      // Surrounding languages
      regionTasks.push((async () => {
        if (data.lat != null && data.lon != null && scopes.radius) {
          const s = data.surrounding_10_mile || {};
          let sFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips.map(String) : [];
          if (!sFips.length) sFips = await listFipsSurrounding(data.lat, data.lon, 10);
          const params = { lat: String(data.lat), lon: String(data.lon), miles: '10' };
          if (sFips.length) params.fips = sFips.join(',');
          const lang = await fetchJsonRetryL(buildApiUrl('/v1/languages/surrounding', params), 'language', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
          const d = s.demographics || {};
          return { surrounding_10_mile: { ...s, demographics: { ...d, ...lang }, census_tracts_fips: sFips.length ? sFips : s.census_tracts_fips } };
        }
        return {};
      })());
      // Water languages
      regionTasks.push((async () => {
        if (data.lat != null && data.lon != null && scopes.water) {
          const w = data.water_district || {};
          let wf = Array.isArray(w.census_tracts_fips) ? w.census_tracts_fips.map(String) : [];
          if (!wf.length) wf = await listFipsWaterDistrict(data.lat, data.lon);
          const params = { lat: String(data.lat), lon: String(data.lon) };
          if (wf.length) params.fips = wf.join(',');
          const lang = await fetchJsonRetryL(buildApiUrl('/v1/languages/water-district', params), 'language', { retries: 1, timeoutMs: 20000 }).catch(() => ({}));
          const d = w.demographics || {};
          return { water_district: { ...w, demographics: { ...d, ...lang }, census_tracts_fips: wf.length ? wf : w.census_tracts_fips } };
        }
        return {};
      })());
    }
    regionTasks.push(enrichDerivedCountsAndRent(data));
    const allRegion = await Promise.allSettled(regionTasks);
    if (signal.aborted) return;
    const regionFinal = allRegion.map((r) => (r.status === 'fulfilled' ? r.value || {} : {}));
    deepMerge(data, ...regionFinal);

    data._source_log = CURRENT_SOURCE_LOG;
    lastReport = { address, data };
    lookupCache.set(cacheKey, data);
    // Stop the timer now that all work is complete and render final elapsed
    elapsed = stopSearchTimer();
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
    // Persist the user's preference changes without re-querying the API.
    savePreferences();
    // If we have data already, just re-render the view using the existing results
    // and the updated selections (no network requests).
    try {
      if (lastReport && lastReport.address && lastReport.data) {
        const selections = getSelections();
        renderResult(lastReport.address, lastReport.data, 0, selections);
      }
    } catch {}
  }, 150);
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
  // Add loading=async for best-practice and keep defer to avoid blocking
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&loading=async&callback=initAutocomplete`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Warm language metadata so the first lookup is faster
getLanguageMeta().catch(() => {});

window.onload = () => {
  // Restore saved preferences before binding and lookup
  restorePreferences();
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
