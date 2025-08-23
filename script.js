/* script.js — Demographics Lookup (API-base aware)
   - Reads API base from <meta name="api-base"> (https://calwep-nft-api.onrender.com)
   - Calls GET /demographics?address=...
   - Robust fetch diagnostics, Google Places autocomplete, Enter-to-search, aria-busy
*/

let autocomplete = null;

let lastReport = null;
// Cache previously retrieved results to avoid redundant network requests
const lookupCache = new Map();

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
const API_BASE = "https://calwep-nft-api.onrender.com";
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
  const el = document.getElementById("searchTimer");
  if (el) el.textContent = "0m 00s";
  searchTimerInterval = setInterval(() => {
    if (!searchTimerStart) return;
    const elapsed = Date.now() - searchTimerStart;
    const secs = Math.floor((elapsed / 1000) % 60);
    const mins = Math.floor(elapsed / 60000);
    const timerEl = document.getElementById("searchTimer");
    if (timerEl)
      timerEl.textContent = `${mins}m ${secs.toString().padStart(2, "0")}s`;
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
async function fetchJsonWithDiagnostics(url) {
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
}

// Attempt to fill in missing city or census tract using public geocoders
async function enrichLocation(data = {}) {
  let { city, census_tract, lat, lon, state_fips, county_fips, tract_code } =
    data;
  const tasks = [];
  if (!city && lat != null && lon != null) {
    tasks.push(
      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      )
        .then((r) => r.json())
        .then((j) => {
          const adminCity = Array.isArray(j?.localityInfo?.administrative)
            ? j.localityInfo.administrative.find(
                (a) => a.order === 8 || a.adminLevel === 8,
              )?.name
            : null;
          city = adminCity || j.city || j.locality || city;
        })
        .catch(() => {}),
    );
  }
  if (
    (!census_tract || !state_fips || !county_fips || !tract_code) &&
    lat != null &&
    lon != null
  ) {
    tasks.push(
      fetch(
        `https://geo.fcc.gov/api/census/block/find?latitude=${lat}&longitude=${lon}&format=json`,
      )
        .then((r) => r.json())
        .then((j) => {
          const fips = j?.Block?.FIPS;
          if (fips && fips.length >= 11) {
            state_fips = fips.slice(0, 2);
            county_fips = fips.slice(2, 5);
            tract_code = fips.slice(5, 11);
            census_tract = `${tract_code.slice(0, 4)}.${tract_code.slice(4)}`;
          }
        })
        .catch(() => {}),
    );
  }
  if (tasks.length) await Promise.all(tasks);
  return { ...data, city, census_tract, state_fips, county_fips, tract_code };
}

let LANGUAGE_META = null;
async function getLanguageMeta() {
  if (LANGUAGE_META) return LANGUAGE_META;
  try {
    const meta = await fetchJsonWithDiagnostics(
      "https://api.census.gov/data/2022/acs/acs5/groups/C16001.json",
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
    const tractStr = g.tracts.join(",");
    const chunkSize = 40;
    const tasks = [];
    for (let i = 0; i < codes.length; i += chunkSize) {
      const chunk = codes.slice(i, i + chunkSize);
      const vars =
        i === 0 ? ["C16001_001E", "C16001_002E", ...chunk] : chunk;
      const url =
        `https://api.census.gov/data/2022/acs/acs5?get=${vars.join(",")}&for=tract:${tractStr}&in=state:${g.state}%20county:${g.county}`;
      tasks.push(
        fetch(url)
          .then((r) => r.json())
          .then((rows) => ({ type: "lang", rows, chunk }))
          .catch(() => null),
      );
    }
    const url2 =
      `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0115E&for=tract:${tractStr}&in=state:${g.state}%20county:${g.county}`;
    tasks.push(
      fetch(url2)
        .then((r) => r.json())
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

// ... rest of your file continues unchanged ...
