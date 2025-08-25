/* script.js — Demographics Lookup
   - Determines API base via config.js
   - Calls GET /lookup?address=...
   - Robust fetch diagnostics, Google Places autocomplete, Enter-to-search, aria-busy
*/

import {
  buildApiUrl,
  fetchJsonWithDiagnostics,
  logDebug,
  monitorAsync,
} from "./api.js";
import { renderLoading, renderError } from "./ui/error.js";
import { setupAutocomplete } from "./maps.js";
import { sanitizeHTML, nowStamp, formatDuration, deepMerge } from "./utils.js";

const SENTRY_DSN =
  document.querySelector('meta[name="sentry-dsn"]')?.content || "";
if (SENTRY_DSN) {
  import("@sentry/browser")
    .then((Sentry) => {
      window.Sentry = Sentry;
      Sentry.init({ dsn: SENTRY_DSN });
      logDebug("Sentry initialized");
    })
    .catch((err) => console.error("Sentry failed to load", err));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("SW registration failed", err));
  });
}
window.addEventListener("error", (event) => {
  logDebug("window.onerror", event.message);
  window.Sentry?.captureException(
    event.error || new Error(event.message || "Unknown error"),
  );
});
window.addEventListener("unhandledrejection", (event) => {
  logDebug("unhandledrejection", event.reason);
  window.Sentry?.captureException(event.reason);
});

let lastReport = null;
// Cache previously retrieved results to avoid redundant network requests
const lookupCache = new Map();
// Memoization caches for bulk tract lookups
const basicDemoCache = new Map();
const housingEduCache = new Map();
const languageCache = new Map();
const unemploymentCache = new Map();
const dacCache = new Map();
const hardshipCache = new Map();

// Latest ACS release year
const ACS_YEAR = 2023;
const ACS5_BASE = `https://api.census.gov/data/${ACS_YEAR}/acs/acs5`;
const ACS5_PROFILE_BASE = `${ACS5_BASE}/profile`;

function printReport() {
  window.print();
}

window.printReport = printReport;

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

window.downloadRawData = downloadRawData;

window.downloadPdf = async function () {
  const { downloadPdf } = await import("./pdf.js");
  downloadPdf(lastReport);
};

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

window.shareReport = shareReport;

function attachCardActions() {
  document.getElementById("printBtn")?.addEventListener("click", printReport);
  document
    .getElementById("pdfBtn")
    ?.addEventListener("click", window.downloadPdf);
  document.getElementById("rawBtn")?.addEventListener("click", downloadRawData);
  document.getElementById("shareBtn")?.addEventListener("click", shareReport);
}

// ---------- Config ----------
// ---------- Utilities ----------
function isMissing(n) {
  const num = Number(n);
  return n == null || !Number.isFinite(num) || num === -888888888;
}
const NO_DATA_TEXT = "No data available";
function fmtInt(n) {
  return !isMissing(n) && Number.isFinite(Number(n))
    ? Number(n).toLocaleString()
    : NO_DATA_TEXT;
}
function fmtCurrency(n) {
  if (isMissing(n) || !Number.isFinite(Number(n))) return NO_DATA_TEXT;
  const r = Math.round(Number(n));
  return `$${r.toLocaleString()}`;
}
function fmtNumber(n) {
  return !isMissing(n) && Number.isFinite(Number(n))
    ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 })
    : NO_DATA_TEXT;
}
function fmtPct(n) {
  return !isMissing(n) && Number.isFinite(Number(n))
    ? `${Number(n).toFixed(1)}%`
    : NO_DATA_TEXT;
}
function titleCase(str = "") {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
// Simple search timer
let searchTimerInterval = null;
let searchTimerStart = null;
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
      `${ACS5_BASE}/groups/C16001.json`,
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
  const key = [...new Set(fipsList.map(String))].sort().join(",");
  if (languageCache.has(key)) return { ...languageCache.get(key) };
  const { codes, names } = await getLanguageMeta();
  if (!codes.length) return {};
  const groups = {};
  for (const f of fipsList) {
    const code = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
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
            i === 0 ? ["C16001_001E", "C16001_002E", ...varChunk] : varChunk;
          const url = `${ACS5_BASE}?get=${vars.join(",")}&for=tract:${tractStr}&in=state:${g.state}%20county:${g.county}`;
          tasks.push(
            fetch(url)
              .then((r) => r.json())
              .then((rows) => ({ type: "lang", rows, chunk: varChunk }))
              .catch(() => null),
          );
        }
        const url2 = `${ACS5_PROFILE_BASE}?get=DP02_0115E&for=tract:${tractStr}&in=state:${g.state}%20county:${g.county}`;
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
          if (!res || !Array.isArray(res.rows) || res.rows.length <= 1)
            continue;
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
  const result = {
    primary_language: sorted[0]?.[0],
    secondary_language: sorted[1]?.[0],
    language_other_than_english_pct: total
      ? ((total - englishOnly) / total) * 100
      : null,
    english_less_than_very_well_pct: total ? (englishLess / total) * 100 : null,
    spanish_at_home_pct: total ? (spanishCount / total) * 100 : null,
  };
  languageCache.set(key, result);
  return { ...result };
}

async function fetchLanguageAcs({ state_fips, county_fips, tract_code } = {}) {
  if (!state_fips || !county_fips || !tract_code) return {};
  const fips = `${state_fips}${county_fips}${tract_code}`;
  return aggregateLanguageForTracts([fips]);
}

// Aggregate basic demographic fields for a set of census tracts using
// population-weighted averages.
async function aggregateBasicDemographicsForTracts(fipsList = []) {
  const key = [...new Set(fipsList.map(String))].sort().join(",");
  if (basicDemoCache.has(key)) return { ...basicDemoCache.get(key) };
  const groups = {};
  for (const f of fipsList) {
    const code = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
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
  let whiteCount = 0;
  let blackCount = 0;
  let nativeCount = 0;
  let asianCount = 0;
  let pacificCount = 0;
  let otherCount = 0;
  let twoCount = 0;
  let hispCount = 0;
  let notHispCount = 0;

  for (const g of Object.values(groups)) {
    const tractChunks = chunk(g.tracts, 50);
    for (const ch of tractChunks) {
      const url = `${ACS5_PROFILE_BASE}?get=${[
        "DP05_0001E",
        "DP05_0018E",
        "DP03_0062E",
        "DP03_0088E",
        "DP03_0128PE",
        // Race and ethnicity percentages
        "DP05_0037PE",
        "DP05_0038PE",
        "DP05_0039PE",
        "DP05_0044PE",
        "DP05_0052PE",
        "DP05_0057PE",
        "DP05_0035PE",
        "DP05_0073PE",
        "DP05_0078PE",
      ].join(
        ",",
      )}&for=tract:${ch.join(",")}&in=state:${g.state}%20county:${g.county}`;
      try {
        const rows = await fetch(url).then((r) => r.json());
        if (!Array.isArray(rows) || rows.length < 2) continue;
        for (let i = 1; i < rows.length; i++) {
          const [
            pop,
            age,
            income,
            perCapita,
            povPct,
            whitePct,
            blackPct,
            nativePct,
            asianPct,
            pacificPct,
            otherPct,
            twoPct,
            hispPct,
            notHispPct,
          ] = rows[i].map(Number);
          if (Number.isFinite(pop) && pop > 0) {
            totalPop += pop;
            if (Number.isFinite(age)) ageWeighted += age * pop;
            if (Number.isFinite(income)) incomeWeighted += income * pop;
            if (Number.isFinite(perCapita))
              perCapitaWeighted += perCapita * pop;
            if (Number.isFinite(povPct) && povPct >= 0)
              povertyCount += (povPct / 100) * pop;
            if (Number.isFinite(whitePct)) whiteCount += (whitePct / 100) * pop;
            if (Number.isFinite(blackPct)) blackCount += (blackPct / 100) * pop;
            if (Number.isFinite(nativePct))
              nativeCount += (nativePct / 100) * pop;
            if (Number.isFinite(asianPct)) asianCount += (asianPct / 100) * pop;
            if (Number.isFinite(pacificPct))
              pacificCount += (pacificPct / 100) * pop;
            if (Number.isFinite(otherPct)) otherCount += (otherPct / 100) * pop;
            if (Number.isFinite(twoPct)) twoCount += (twoPct / 100) * pop;
            if (Number.isFinite(hispPct)) hispCount += (hispPct / 100) * pop;
            if (Number.isFinite(notHispPct))
              notHispCount += (notHispPct / 100) * pop;
          }
        }
      } catch {
        // ignore errors for this chunk
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
    if (whiteCount > 0) result.white_pct = (whiteCount / totalPop) * 100;
    if (blackCount > 0) result.black_pct = (blackCount / totalPop) * 100;
    if (nativeCount > 0) result.native_pct = (nativeCount / totalPop) * 100;
    if (asianCount > 0) result.asian_pct = (asianCount / totalPop) * 100;
    if (pacificCount > 0) result.pacific_pct = (pacificCount / totalPop) * 100;
    if (otherCount > 0) result.other_race_pct = (otherCount / totalPop) * 100;
    if (twoCount > 0)
      result.two_or_more_races_pct = (twoCount / totalPop) * 100;
    const totalHisp = hispCount + notHispCount;
    if (totalHisp > 0) {
      result.hispanic_pct = (hispCount / totalHisp) * 100;
      result.not_hispanic_pct = (notHispCount / totalHisp) * 100;
    }
  }
  basicDemoCache.set(key, result);
  return { ...result };
}

// Aggregate housing and education fields for a set of census tracts using
// population- or unit-weighted averages.
async function aggregateHousingEducationForTracts(fipsList = []) {
  const key = [...new Set(fipsList.map(String))].sort().join(",");
  if (housingEduCache.has(key)) return { ...housingEduCache.get(key) };
  const groups = {};
  for (const f of fipsList) {
    const code = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }

  let occTotal = 0;
  let ownerTotal = 0;
  let renterTotal = 0;
  let homeValueWeighted = 0;
  let pop25Total = 0;
  let hsGradTotal = 0;
  let bachTotal = 0;

  for (const g of Object.values(groups)) {
    const tractChunks = chunk(g.tracts, 50);
    for (const ch of tractChunks) {
      const url = `${ACS5_PROFILE_BASE}?get=${[
        "DP04_0045E",
        "DP04_0046E",
        "DP04_0047E",
        "DP04_0089E",
        "DP02_0059E",
        "DP02_0067E",
        "DP02_0068E",
      ].join(
        ",",
      )}&for=tract:${ch.join(",")}&in=state:${g.state}%20county:${g.county}`;
      try {
        const rows = await fetch(url).then((r) => r.json());
        if (!Array.isArray(rows) || rows.length < 2) continue;
        for (let i = 1; i < rows.length; i++) {
          const [occ, owner, renter, homeVal, pop25, hsGrad, bach] = rows[i]
            .slice(0, 7)
            .map(Number);
          if (Number.isFinite(occ) && occ > 0) occTotal += occ;
          if (Number.isFinite(owner) && owner > 0) {
            ownerTotal += owner;
            if (Number.isFinite(homeVal) && homeVal > 0)
              homeValueWeighted += homeVal * owner;
          }
          if (Number.isFinite(renter) && renter > 0) renterTotal += renter;
          if (Number.isFinite(pop25) && pop25 > 0) {
            pop25Total += pop25;
            if (Number.isFinite(hsGrad) && hsGrad > 0) hsGradTotal += hsGrad;
            if (Number.isFinite(bach) && bach > 0) bachTotal += bach;
          }
        }
      } catch {
        // ignore errors for this chunk
      }
    }
  }

  const res = {};
  const occUnits = ownerTotal + renterTotal;
  if (occUnits > 0) {
    res.owner_occupied_pct = (ownerTotal / occUnits) * 100;
    res.renter_occupied_pct = (renterTotal / occUnits) * 100;
  }
  if (ownerTotal > 0 && homeValueWeighted > 0) {
    res.median_home_value = homeValueWeighted / ownerTotal;
  }
  if (pop25Total > 0) {
    res.high_school_or_higher_pct = (hsGradTotal / pop25Total) * 100;
    res.bachelors_or_higher_pct = (bachTotal / pop25Total) * 100;
  }
  housingEduCache.set(key, res);
  return { ...res };
}

// Fetch detailed demographics for one or more census tracts
async function fetchTractDemographics(fipsList = []) {
  const groups = {};
  for (const f of fipsList) {
    const code = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }
  const results = {};
  for (const g of Object.values(groups)) {
    const tractChunks = chunk(g.tracts, 50);
    for (const ch of tractChunks) {
      const url = `${ACS5_PROFILE_BASE}?get=${[
        "DP05_0001E", // total population
        "DP05_0018E", // median age
        "DP03_0062E", // median household income
        "DP03_0088E", // per capita income
        "DP03_0128PE", // poverty rate
        "DP03_0009PE", // unemployment rate
        // Race and ethnicity percentages
        "DP05_0037PE", // White
        "DP05_0038PE", // Black or African American
        "DP05_0039PE", // American Indian/Alaska Native
        "DP05_0044PE", // Asian
        "DP05_0052PE", // Native Hawaiian/Pacific Islander
        "DP05_0057PE", // Some other race
        "DP05_0035PE", // Two or more races
        "DP05_0073PE", // Hispanic or Latino
        "DP05_0078PE", // Not Hispanic or Latino
      ].join(
        ",",
      )}&for=tract:${ch.join(",")}&in=state:${g.state}%20county:${g.county}`;
      try {
        const rows = await fetch(url).then((r) => r.json());
        if (!Array.isArray(rows) || rows.length < 2) continue;
        for (let i = 1; i < rows.length; i++) {
          const [
            pop,
            age,
            income,
            perCap,
            povPct,
            unemp,
            whitePct,
            blackPct,
            nativePct,
            asianPct,
            pacificPct,
            otherPct,
            twoPct,
            hispPct,
            notHispPct,
            state,
            county,
            tract,
          ] = rows[i];
          const geoid = `${state}${county}${tract}`;
          results[geoid] = {
            population: Number(pop),
            median_age: Number(age),
            median_household_income: Number(income),
            per_capita_income: Number(perCap),
            poverty_rate: Number(povPct),
            unemployment_rate: Number(unemp),
            white_pct: Number(whitePct),
            black_pct: Number(blackPct),
            native_pct: Number(nativePct),
            asian_pct: Number(asianPct),
            pacific_pct: Number(pacificPct),
            other_race_pct: Number(otherPct),
            two_or_more_races_pct: Number(twoPct),
            hispanic_pct: Number(hispPct),
            not_hispanic_pct: Number(notHispPct),
          };
        }
      } catch {
        // ignore errors for this chunk
      }
    }
  }
  return results;
}

// Fetch unemployment rate and population for one or more census tracts
async function fetchUnemploymentForTracts(fipsList = []) {
  const key = [...new Set(fipsList.map(String))].sort().join(",");
  if (unemploymentCache.has(key)) return { ...unemploymentCache.get(key) };
  const groups = {};
  for (const f of fipsList) {
    const code = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (code.length !== 11) continue;
    const state = code.slice(0, 2);
    const county = code.slice(2, 5);
    const tract = code.slice(5);
    const key = `${state}${county}`;
    if (!groups[key]) groups[key] = { state, county, tracts: [] };
    groups[key].tracts.push(tract);
  }
  const results = {};
  for (const g of Object.values(groups)) {
    const tractChunks = chunk(g.tracts, 50);
    for (const ch of tractChunks) {
      const url =
        `${ACS5_PROFILE_BASE}?get=DP03_0009PE,DP05_0001E&for=tract:` +
        ch.join(",") +
        `&in=state:${g.state}%20county:${g.county}`;
      try {
        const rows = await fetch(url).then((r) => r.json());
        if (!Array.isArray(rows) || rows.length < 2) continue;
        for (let i = 1; i < rows.length; i++) {
          const [unemp, pop, state, county, tract] = rows[i];
          const geoid = `${state}${county}${tract}`;
          results[geoid] = {
            unemployment_rate: Number(unemp),
            population: Number(pop),
          };
        }
      } catch {
        // ignore errors for this chunk
      }
    }
  }
  unemploymentCache.set(key, results);
  return { ...results };
}

// Fetch a list of census tract FIPS codes flagged as disadvantaged communities
async function fetchDacFips(fipsList = []) {
  const key = [...new Set(fipsList.map(String))].sort().join(",");
  if (dacCache.has(key)) return [...dacCache.get(key)];
  const baseUrl =
    "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query";
  const out = new Set();
  const chunkSize = 50;
  for (let i = 0; i < fipsList.length; i += chunkSize) {
    const chunk = fipsList.slice(i, i + chunkSize);
    if (!chunk.length) continue;
    const where = `GEOID20 IN (${chunk.map((f) => `'${f}'`).join(",")})`;
    const url =
      baseUrl +
      `?where=${encodeURIComponent(where)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    try {
      const j = await fetch(url).then((r) => r.json());
      for (const f of j.features || []) {
        const attrs = f.attributes || {};
        const geoid = String(attrs.GEOID20);
        const status = String(attrs.DAC20 || "").toUpperCase();
        if (status === "Y") out.add(geoid);
      }
    } catch {
      // ignore errors for this chunk
    }
  }
  const arr = Array.from(out);
  dacCache.set(key, arr);
  return [...arr];
}

// Fetch environmental hardships for one or more census tracts and merge them
async function aggregateHardshipsForTracts(fipsList = []) {
  const key = [...new Set(fipsList.map(String))].sort().join(",");
  if (hardshipCache.has(key)) return [...hardshipCache.get(key)];
  const set = new Set();
  await Promise.all(
    fipsList.map(async (f) => {
      try {
        const url = buildApiUrl("/lookup", {
          fips: f,
          census_tract: f,
          geoid: f,
        });
        const j = await fetchJsonWithDiagnostics(url);
        if (Array.isArray(j.environmental_hardships)) {
          j.environmental_hardships.forEach((h) => set.add(h));
        }
      } catch {
        // ignore errors for this tract
      }
    }),
  );
  const arr = Array.from(set).sort();
  hardshipCache.set(key, arr);
  return [...arr];
}

// Populate missing basic demographics for the local census tract
async function enrichTractDemographics(data = {}) {
  const { state_fips, county_fips, tract_code } = data || {};
  const localFips =
    state_fips && county_fips && tract_code
      ? `${state_fips}${county_fips}${tract_code}`
      : null;
  const fields = [
    "population",
    "median_age",
    "median_household_income",
    "per_capita_income",
    "poverty_rate",
    "unemployment_rate",
    "white_pct",
    "black_pct",
    "native_pct",
    "asian_pct",
    "pacific_pct",
    "other_race_pct",
    "two_or_more_races_pct",
    "hispanic_pct",
    "not_hispanic_pct",
    "owner_occupied_pct",
    "renter_occupied_pct",
    "median_home_value",
    "high_school_or_higher_pct",
    "bachelors_or_higher_pct",
  ];
  const needsData = localFips && fields.some((k) => isMissing(data[k]));
  if (!needsData) return data;
  const lookup = await fetchTractDemographics([localFips]);
  const info = lookup[localFips];
  if (!info) return data;
  const housingEdu = await aggregateHousingEducationForTracts([localFips]);
  const merged = { ...info, ...housingEdu };
  const out = { ...data };
  out.demographics = { ...out.demographics, ...merged };
  for (const [k, v] of Object.entries(merged)) {
    if (isMissing(out[k])) out[k] = v;
  }
  return out;
}

// Populate basic demographic fields for surrounding and district regions using
// population-weighted averages.
async function enrichRegionBasics(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
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

// Populate housing and education fields for surrounding and district regions
// using population- or unit-weighted averages.
async function enrichRegionHousingEducation(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
    const d = s.demographics || {};
    const needed = [
      d.owner_occupied_pct,
      d.renter_occupied_pct,
      d.median_home_value,
      d.high_school_or_higher_pct,
      d.bachelors_or_higher_pct,
    ].some((v) => isMissing(v) || (typeof v === "number" && v < 0));
    if (needed) {
      const stats = await aggregateHousingEducationForTracts(
        s.census_tracts_fips,
      );
      out.surrounding_10_mile = {
        ...s,
        demographics: { ...d, ...stats },
      };
    }
  }
  const w = water_district || {};
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (wFips.length) {
    const d = w.demographics || {};
    const needed = [
      d.owner_occupied_pct,
      d.renter_occupied_pct,
      d.median_home_value,
      d.high_school_or_higher_pct,
      d.bachelors_or_higher_pct,
    ].some((v) => isMissing(v) || (typeof v === "number" && v < 0));
    if (needed) {
      const stats = await aggregateHousingEducationForTracts(wFips);
      let merged = { ...d, ...stats };
      const surroundMedianHome =
        out.surrounding_10_mile?.demographics?.median_home_value;
      if (
        surroundMedianHome != null &&
        (!Number.isFinite(merged.median_home_value) ||
          merged.median_home_value < 0)
      ) {
        merged.median_home_value = surroundMedianHome;
      }
      out.water_district = { ...w, demographics: merged };
    }
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
  const localFips =
    state_fips && county_fips && tract_code
      ? `${state_fips}${county_fips}${tract_code}`
      : null;
  if (isMissing(unemployment_rate) && localFips) needed.push(localFips);
  const sFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips : [];
  if (
    s.demographics &&
    isMissing(s.demographics.unemployment_rate) &&
    sFips.length
  )
    needed.push(...sFips);
  const wFips = Array.isArray(w.census_tracts_fips)
    ? w.census_tracts_fips.map(String)
    : [];
  if (
    w.demographics &&
    isMissing(w.demographics.unemployment_rate) &&
    wFips.length
  )
    needed.push(...wFips);

  const fipsSet = Array.from(new Set(needed));
  if (!fipsSet.length) return data;
  const lookup = await fetchUnemploymentForTracts(fipsSet);

  const out = { ...data };
  if (isMissing(unemployment_rate) && localFips && lookup[localFips])
    out.unemployment_rate = lookup[localFips].unemployment_rate;

  if (
    s.demographics &&
    isMissing(s.demographics.unemployment_rate) &&
    sFips.length
  ) {
    let totPop = 0;
    let totWeighted = 0;
    for (const f of sFips) {
      const item = lookup[f];
      if (
        item &&
        Number.isFinite(item.unemployment_rate) &&
        Number.isFinite(item.population)
      ) {
        totPop += item.population;
        totWeighted += item.unemployment_rate * item.population;
      }
    }
    if (totPop > 0)
      out.surrounding_10_mile = {
        ...s,
        demographics: {
          ...s.demographics,
          unemployment_rate: totWeighted / totPop,
        },
      };
  }

  if (
    w.demographics &&
    isMissing(w.demographics.unemployment_rate) &&
    wFips.length
  ) {
    let totPop = 0;
    let totWeighted = 0;
    for (const f of wFips) {
      const item = lookup[f];
      if (
        item &&
        Number.isFinite(item.unemployment_rate) &&
        Number.isFinite(item.population)
      ) {
        totPop += item.population;
        totWeighted += item.unemployment_rate * item.population;
      }
    }
    if (totPop > 0)
      out.water_district = {
        ...w,
        demographics: {
          ...w.demographics,
          unemployment_rate: totWeighted / totPop,
        },
      };
  }

  return out;
}

async function enrichRegionLanguages(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
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

// Populate environmental hardships for surrounding and district regions
async function enrichRegionHardships(data = {}) {
  const { surrounding_10_mile, water_district } = data || {};
  const out = { ...data };
  const s = surrounding_10_mile || {};
  const sFips =
    Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length
      ? s.census_tracts_fips
      : Array.isArray(s.census_tracts)
        ? s.census_tracts
        : [];
  if (
    (!Array.isArray(s.environmental_hardships) ||
      !s.environmental_hardships.length) &&
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
    (!Array.isArray(w.environmental_hardships) ||
      !w.environmental_hardships.length) &&
    wFips.length
  ) {
    const hardships = await aggregateHardshipsForTracts(wFips);
    out.water_district = { ...w, environmental_hardships: hardships };
  }
  return out;
}

// Fetch surrounding cities and census tracts if API didn't provide them
async function enrichSurrounding(data = {}) {
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
  const existingTracts = Array.isArray(s.census_tracts)
    ? s.census_tracts.map(String)
    : [];
  const existingFips = Array.isArray(s.census_tracts_fips)
    ? s.census_tracts_fips.map(String)
    : [];
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
  const tractSet = new Set(
    Array.isArray(s.census_tracts) ? s.census_tracts : [],
  );
  if (census_tract) tractSet.add(String(census_tract));
  s.census_tracts = Array.from(tractSet);
  if (Array.isArray(s.census_tracts_fips)) {
    const fipsSet = new Set(s.census_tracts_fips);
    const { state_fips, county_fips, tract_code } = data || {};
    if (state_fips && county_fips && tract_code)
      fipsSet.add(`${state_fips}${county_fips}${tract_code}`);
    s.census_tracts_fips = Array.from(fipsSet);
  }
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
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
  if (Array.isArray(s.census_tracts_fips) && s.census_tracts_fips.length) {
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
async function enrichWaterDistrict(data = {}, address = "") {
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
              w.census_tracts_fips = [
                ...new Set([...(w.census_tracts_fips || []), ...fipsArr]),
              ];
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
          w.census_tracts_fips = [...new Set([...existingFips, ...fips])];
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

  if (Array.isArray(w.census_tracts_fips) && w.census_tracts_fips.length) {
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
  if (Array.isArray(w.census_tracts_fips) && w.census_tracts_fips.length) {
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
        w.dac_tracts_pct = (dacFips.size / w.census_tracts_fips.length) * 100;
    } catch {
      // ignore errors
    }
  }

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

  return { ...data, water_district: w };
}

// Fetch English proficiency percentage if missing
async function enrichEnglishProficiency(data = {}) {
  const { lat, lon, english_less_than_very_well_pct } = data || {};
  if (!isMissing(english_less_than_very_well_pct) || lat == null || lon == null)
    return data;
  try {
    const geo = await fetch(
      `https://geo.fcc.gov/api/census/block/find?latitude=${lat}&longitude=${lon}&format=json`,
    ).then((r) => r.json());
    const fips = geo?.Block?.FIPS;
    if (fips && fips.length >= 11) {
      const state = fips.slice(0, 2);
      const county = fips.slice(2, 5);
      const tract = fips.slice(5, 11);
      const url = `${ACS5_PROFILE_BASE}?get=DP02_0111PE&for=tract:${tract}&in=state:${state}+county:${county}`;
      const acs = await fetch(url).then((r) => r.json());
      const val = acs?.[1]?.[0];
      const num = Number(val);
      if (Number.isFinite(num) && num >= 0) {
        return { ...data, english_less_than_very_well_pct: num };
      }
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
    const j = await res.json();
    const alerts = Array.isArray(j?.features)
      ? j.features.map((f) => f?.properties?.headline).filter(Boolean)
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
  if (!data || typeof data !== "object")
    return `<section class="section-block"><h3 class="section-header">${sanitizeHTML(
      title,
    )}</h3><p class="note">${NO_DATA_TEXT}</p></section>`;
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
          `<div class="key">${sanitizeHTML(
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
        <h3 class="section-header">${sanitizeHTML(title)}</h3>
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
// initAutocomplete moved to maps.js

// ---------- Rendering ----------

function buildComparisonRow(
  title,
  localHtml,
  surroundingHtml,
  districtHtml,
  descriptionHtml = "",
) {
  const cell = (html) =>
    html && String(html).trim() ? html : `<p class="note">${NO_DATA_TEXT}</p>`;
  return `
    <section class="section-block">
      <h3 class="section-header">${sanitizeHTML(title)}</h3>
      ${descriptionHtml}
      <div class="comparison-grid" role="table" aria-label="${sanitizeHTML(
        title,
      )}">
        <div class="col local" role="cell" aria-label="Census tract">${cell(
          localHtml,
        )}</div>
        <div class="col surrounding" role="cell" aria-label="10-mile radius">${cell(
          surroundingHtml,
        )}</div>
        <div class="col district" role="cell" aria-label="Water district">${cell(
          districtHtml,
        )}</div>
      </div>
    </section>
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
    demographics: tractDemo = {},
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
    high_school_or_higher_pct,
    bachelors_or_higher_pct,
    alerts,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const population = data.population ?? tractDemo.population;
  const median_age = data.median_age ?? tractDemo.median_age;
  const median_household_income =
    data.median_household_income ?? tractDemo.median_household_income;
  const per_capita_income =
    data.per_capita_income ?? tractDemo.per_capita_income;
  const poverty_rate = data.poverty_rate ?? tractDemo.poverty_rate;
  const unemployment_rate =
    data.unemployment_rate ?? tractDemo.unemployment_rate;
  const people_below_poverty =
    data.people_below_poverty ?? tractDemo.people_below_poverty;

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
  let mapImgHtml = "";
  if (lat != null && lon != null) {
    const staticMapUrl = new URL("/api/staticmap", window.location.origin);
    staticMapUrl.searchParams.set("lat", lat);
    staticMapUrl.searchParams.set("lon", lon);
    mapImgHtml = `<img class="map-image" src="${staticMapUrl}" alt="Map of location" />`;
  }

  const hardshipSection = `
    <section class="section-block">
      <h3 class="section-header">Environmental hardships</h3>
      ${hardshipList.length ? `<div class="stats">${hardshipList.map((h) => `<span class="pill">${sanitizeHTML(h)}</span>`).join("")}</div>` : `<p class="note">No environmental hardships recorded.</p>`}
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
        : sanitizeHTML(s.census_tracts) || "—";
      const cityList = Array.isArray(s.cities)
        ? s.cities.join(", ")
        : sanitizeHTML(s.cities) || "—";
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
          <div class="key">Primary language</div><div class="val">${sanitizeHTML(d.primary_language) || "—"}</div>
          <div class="key">Second most common</div><div class="val">${sanitizeHTML(d.secondary_language) || "—"}</div>
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
      : sanitizeHTML(w.census_tracts) || "—";
    const cityList = Array.isArray(w.cities)
      ? w.cities.join(", ")
      : sanitizeHTML(w.cities) || "—";
    if (w.name || w.census_tracts || w.cities)
      html += `
      <section class="section-block">
        <h3 class="section-header">Location Summary</h3>
        <div class="kv">
          <div class="key">District</div><div class="val">${sanitizeHTML(w.name) || "—"}</div>
          <div class="key">Cities</div><div class="val">${cityList}</div>
          <div class="key">Census tracts</div><div class="val">${tractList}</div>
        </div>
      </section>
    `;
    if (Object.keys(d).length) {
      html += `
      <section class="section-block">
        <h3 class="section-header">${sanitizeHTML(w.name) || "Water District Region"} (ACS)</h3>
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
          <div class="key">Primary language</div><div class="val">${sanitizeHTML(d.primary_language) || "—"}</div>
          <div class="key">Second most common</div><div class="val">${sanitizeHTML(d.secondary_language) || "—"}</div>
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
        <div class="key">City</div><div class="val">${sanitizeHTML(city) || "—"}</div>
        <div class="key">Census tract</div><div class="val">${sanitizeHTML(census_tract) || "—"}</div>
        <div class="key">ZIP code</div><div class="val">${sanitizeHTML(zip) || "—"}</div>
        <div class="key">County</div><div class="val">${sanitizeHTML(county) || "—"}</div>
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
        <div class="key">Primary language</div><div class="val">${sanitizeHTML(primary_language) || "—"}</div>
        <div class="key">Second most common</div><div class="val">${sanitizeHTML(secondary_language) || "—"}</div>
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
          ${alertList.map((a) => `<span class="pill">${sanitizeHTML(a)}</span>`).join("")}
        </div>
      `
          : `<p class="note">No active alerts found for this location.</p>`
      }
    </section>
  `;

  document.getElementById("result").innerHTML = sanitizeHTML(`
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${sanitizeHTML(address)}</h2>
          <div class="card__actions">
            <button type="button" id="printBtn">Print</button>
            <button type="button" id="pdfBtn">Download PDF</button>
            <button type="button" id="rawBtn">Raw Data</button>
            <button type="button" id="shareBtn">Share Link</button>
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
    `);
  attachCardActions();
}

// New row-based renderer
function renderResult(address, data, elapsedMs) {
  const {
    city,
    zip,
    county,
    census_tract,
    lat,
    lon,
    english_less_than_very_well_pct,
    language_other_than_english_pct,
    spanish_at_home_pct,
    languages,
    demographics: tractDemo = {},
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
    high_school_or_higher_pct,
    bachelors_or_higher_pct,
    alerts,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const population = data.population ?? tractDemo.population;
  const median_age = data.median_age ?? tractDemo.median_age;
  const median_income =
    data.median_income ??
    data.median_household_income ??
    tractDemo.median_income ??
    tractDemo.median_household_income;
  const per_capita_income =
    data.per_capita_income ?? tractDemo.per_capita_income;
  const poverty_rate = data.poverty_rate ?? tractDemo.poverty_rate;
  const unemployment_rate =
    data.unemployment_rate ?? tractDemo.unemployment_rate;
  const language_list =
    Array.isArray(languages) && languages.length
      ? languages
      : tractDemo.languages;
  const enviroscreen_score = data.enviroscreen_score ?? enviroscreen?.score;
  const enviroscreen_percentile =
    data.enviroscreen_percentile ?? enviroscreen?.percentile;

  const hardshipList = Array.isArray(environmental_hardships)
    ? Array.from(new Set(environmental_hardships))
    : [];
  const alertList = Array.isArray(alerts) ? alerts : [];

  const coords =
    lat != null && lon != null
      ? `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}`
      : "—";
  let mapImgHtml = "";
  if (lat != null && lon != null) {
    const staticMapUrl = new URL("/api/staticmap", window.location.origin);
    staticMapUrl.searchParams.set("lat", lat);
    staticMapUrl.searchParams.set("lon", lon);
    mapImgHtml = `<img class="map-image" src="${staticMapUrl}" alt="Map of location" />`;
  }

  const s = surrounding_10_mile || {};
  const w = water_district || {};
  const sHardships = Array.isArray(s.environmental_hardships)
    ? Array.from(new Set(s.environmental_hardships))
    : [];
  const wHardships = Array.isArray(w.environmental_hardships)
    ? Array.from(new Set(w.environmental_hardships))
    : [];
  const sTracts = Array.isArray(s.census_tracts)
    ? s.census_tracts.join(", ")
    : sanitizeHTML(s.census_tracts) || "—";
  const sCities = Array.isArray(s.cities)
    ? s.cities.join(", ")
    : sanitizeHTML(s.cities) || "—";
  const wTracts = Array.isArray(w.census_tracts)
    ? w.census_tracts.join(", ")
    : sanitizeHTML(w.census_tracts) || "—";
  const wCities = Array.isArray(w.cities)
    ? w.cities.join(", ")
    : sanitizeHTML(w.cities) || "—";

  const locLocal = `
    <div class="kv">
      <div class="key">City</div><div class="val">${sanitizeHTML(city) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${sanitizeHTML(census_tract) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${sanitizeHTML(zip) || "—"}</div>
      <div class="key">County</div><div class="val">${sanitizeHTML(county) || "—"}</div>
      <div class="key">Coordinates</div><div class="val">${coords}</div>
    </div>
    ${mapImgHtml}
  `;
  const locSurround = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${sCities}</div>
      <div class="key">Census tracts</div><div class="val">${sTracts}</div>
    </div>
  `;
  const locDistrict = `
    <div class="kv">
      <div class="key">District</div><div class="val">${sanitizeHTML(w.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${wCities}</div>
      <div class="key">Census tracts</div><div class="val">${wTracts}</div>
    </div>
  `;
  const locationRow = buildComparisonRow(
    "Location Summary",
    locLocal,
    locSurround,
    locDistrict,
    '<p class="section-description">This section lists basic geographic information for the census tract, surrounding 10&#8209;mile area, and water district, such as city, ZIP code, county, and coordinates.</p>',
  );

  const popFields = (d = {}) => {
    const entries = [
      ["Total population", fmtInt(d.population)],
      ["Median age", fmtNumber(d.median_age)],
      [
        "Median household income",
        fmtCurrency(d.median_income ?? d.median_household_income),
      ],
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
      median_income,
      per_capita_income,
      poverty_rate,
      unemployment_rate,
    }),
    popFields(s.demographics || {}),
    popFields(w.demographics || {}),
    '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
  );
  const languageFields = (d = {}) => {
    const langList =
      Array.isArray(d.languages) && d.languages.length
        ? d.languages.map((l) => sanitizeHTML(l)).join(", ")
        : "Not available";
    const entries = [
      ["Languages spoken", langList],
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
      languages: language_list,
      language_other_than_english_pct,
      english_less_than_very_well_pct,
      spanish_at_home_pct,
    }),
    languageFields(s.demographics || {}),
    languageFields(w.demographics || {}),
    '<p class="section-description">This section highlights the languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
  );

  const enviroscreenFields = (d = {}) => {
    const score = d.enviroscreen_score ?? d.score;
    const percentileRaw = d.enviroscreen_percentile ?? d.percentile;
    const percentile =
      Number.isFinite(Number(percentileRaw)) && Number(percentileRaw) <= 1
        ? Number(percentileRaw) * 100
        : percentileRaw;
    const entries = [
      ["Score", fmtNumber(score)],
      ["Percentile", fmtPct(percentile)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const enviroscreenRow = buildComparisonRow(
    "EnviroScreen (CalEnviroScreen 4.0)",
    enviroscreenFields({
      enviroscreen_score,
      enviroscreen_percentile,
    }),
    enviroscreenFields(s.environment || {}),
    enviroscreenFields(w.environment || {}),
    '<p class="section-description">This section shows the CalEnviroScreen 4.0 score and percentile for the selected area and comparison regions.</p>',
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
    '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
  );

  const housingContent = (d = {}) => {
    const entries = [
      ["Owner occupied", fmtPct(d.owner_occupied_pct)],
      ["Renter occupied", fmtPct(d.renter_occupied_pct)],
      ["Median home value", fmtCurrency(d.median_home_value)],
      ["High school or higher", fmtPct(d.high_school_or_higher_pct)],
      ["Bachelor's degree or higher", fmtPct(d.bachelors_or_higher_pct)],
    ];
    return `<div class="kv">${entries
      .map(([k, v]) => `<div class="key">${k}</div><div class="val">${v}</div>`)
      .join("")}</div>`;
  };
  const housingRow = buildComparisonRow(
    "Housing &amp; Education (ACS)",
    housingContent({
      owner_occupied_pct,
      renter_occupied_pct,
      median_home_value,
      high_school_or_higher_pct,
      bachelors_or_higher_pct,
    }),
    housingContent(s.demographics || {}),
    housingContent(w.demographics || {}),
    '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
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
    if (stats.length)
      lines.push(`<ul class="dac-stats">${stats.join("")}</ul>`);

    if (Array.isArray(tracts) && tracts.length)
      lines.push(
        `<div class="dac-tracts">Tracts ${tracts
          .map((t) => sanitizeHTML(t))
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
    '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
  );

  const hardshipRow = buildComparisonRow(
    "Environmental Hardships",
    hardshipList.length
      ? `<div class="stats">${hardshipList
          .map((h) => `<span class="pill">${sanitizeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    sHardships.length
      ? `<div class="stats">${sHardships
          .map((h) => `<span class="pill">${sanitizeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    wHardships.length
      ? `<div class="stats">${wHardships
          .map((h) => `<span class="pill">${sanitizeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
  );

  const alertsRow = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${
        alertList.length
          ? `<div class="stats">${alertList
              .map((a) => `<span class="pill">${sanitizeHTML(a)}</span>`)
              .join("")}</div>`
          : '<p class="note">No active alerts found for this location.</p>'
      }
    </section>
  `;

  const columnHeaders = `
    <div class="comparison-grid column-headers">
      <div class="col">Census tract</div>
      <div class="col">10 mile radius</div>
      <div class="col">Water district</div>
    </div>
  `;

  document.getElementById("result").innerHTML = sanitizeHTML(`
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${sanitizeHTML(address)}</h2>
          <div class="card__actions">
            <button type="button" id="printBtn">Print</button>
            <button type="button" id="pdfBtn">Download PDF</button>
            <button type="button" id="rawBtn">Raw Data</button>
            <button type="button" id="shareBtn">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${nowStamp()}</span>
      </div>
      ${columnHeaders}
      ${locationRow}
      ${populationRow}
      ${languageRow}
      ${raceRow}
      ${housingRow}
      ${dacRow}
      ${enviroscreenRow}
      ${hardshipRow}
      ${alertsRow}
      <p class="note">Search took ${formatDuration(elapsedMs)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
    `);
  attachCardActions();
}
// ---------- Flow ----------
async function lookup() {
  const input = document.getElementById("autocomplete");
  const resultBox = document.getElementById("result");
  const address = (input?.value || "").trim();

  if (address.length < 4) {
    renderError(
      "Please enter a more complete address (at least 4 characters).",
      address,
      0,
    );
    return;
  }

  const cacheKey = address.toLowerCase();
  if (lookupCache.has(cacheKey)) {
    const cached = lookupCache.get(cacheKey);
    lastReport = { address, data: cached };
    const locUrl = new URL(window.location);
    locUrl.searchParams.set("address", address);
    window.history.replaceState(null, "", locUrl.toString());
    renderResult(address, cached, 0);
    return;
  }

  resultBox.setAttribute("aria-busy", "true");
  renderLoading(address);
  const overlay = document.getElementById("spinnerOverlay");
  if (overlay) overlay.style.display = "flex";
  startSearchTimer();
  let elapsed = 0;

  try {
    const url = buildApiUrl("/lookup", { address });
    console.log("Lookup request:", url);
    let data = await fetchJsonWithDiagnostics(url);
    if (!data || typeof data !== "object")
      throw new Error("Malformed response.");
    data = await monitorAsync("enrichLocation", () => enrichLocation(data));
    const [lang, surround, water, english, alerts] = await Promise.all([
      monitorAsync("fetchLanguageAcs", () => fetchLanguageAcs(data)),
      monitorAsync("enrichSurrounding", () => enrichSurrounding(data)),
      monitorAsync("enrichWaterDistrict", () =>
        enrichWaterDistrict(data, address),
      ),
      monitorAsync("enrichEnglishProficiency", () =>
        enrichEnglishProficiency(data),
      ),
      monitorAsync("enrichNwsAlerts", () => enrichNwsAlerts(data)),
    ]);
    deepMerge(data, lang, surround, water, english, alerts);

    const tractBasics = await monitorAsync("enrichTractDemographics", () =>
      enrichTractDemographics(data),
    );
    deepMerge(data, tractBasics);

    const basics = await monitorAsync("enrichRegionBasics", () =>
      enrichRegionBasics(data),
    );
    const housingEd = await monitorAsync("enrichRegionHousingEducation", () =>
      enrichRegionHousingEducation(data),
    );
    deepMerge(data, basics, housingEd);

    const [regionLangs, regionHard, unemployment] = await Promise.all([
      monitorAsync("enrichRegionLanguages", () => enrichRegionLanguages(data)),
      monitorAsync("enrichRegionHardships", () => enrichRegionHardships(data)),
      monitorAsync("enrichUnemployment", () => enrichUnemployment(data)),
    ]);
    deepMerge(data, regionLangs, regionHard, unemployment);

    lastReport = { address, data };
    lookupCache.set(cacheKey, data);
    const locUrl = new URL(window.location);
    locUrl.searchParams.set("address", address);
    window.history.replaceState(null, "", locUrl.toString());
    elapsed = stopSearchTimer();
    renderResult(address, data, elapsed);
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
  const form = document.getElementById("lookupForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    lookup().catch(console.error);
  });
}

// Warm language metadata so the first lookup is faster
getLanguageMeta().catch(() => {});

window.onload = () => {
  setupAutocomplete();
  bindLookupTrigger();
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
