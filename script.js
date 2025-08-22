/* script.js — Demographics Lookup (API-base aware)
   - Reads API base from <meta name="api-base"> (https://calwep-nft-api.onrender.com)
   - Calls GET /demographics?address=...
   - Robust fetch diagnostics, Google Places autocomplete, Enter-to-search, aria-busy
*/

let autocomplete = null;

let lastReport = null;

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

async function fetchLanguageAcs({ state_fips, county_fips, tract_code } = {}) {
  try {
    if (!state_fips || !county_fips || !tract_code) return {};
    const vars = ["DP02_0114PE", "DP02_0115PE", "DP02_0116PE"];
    const url =
      "https://api.census.gov/data/2022/acs/acs5/profile?get=" +
      vars.join(",") +
      `&for=tract:${tract_code}&in=state:${state_fips}%20county:${county_fips}`;
    const rows = await fetch(url).then((r) => r.json());
    if (!Array.isArray(rows) || rows.length < 2) return {};
    const [langOther, engNotWell, spanish] = rows[1];
    return {
      language_other_than_english_pct: Number(langOther),
      english_less_than_very_well_pct: Number(engNotWell),
      spanish_at_home_pct: Number(spanish),
    };
  } catch {
    return {};
  }
}

// Fetch unemployment rate and population for one or more census tracts
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
  for (const g of Object.values(groups)) {
    const url =
      "https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0009PE,DP05_0001E&for=tract:" +
      g.tracts.join(",") +
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
      // ignore errors for this group
    }
  }
  return results;
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
  if (isMissing(unemployment_rate) && localFips) needed.push(localFips);
  const sFips = Array.isArray(s.census_tracts_fips) ? s.census_tracts_fips : [];
  if (s.demographics && isMissing(s.demographics.unemployment_rate) && sFips.length)
    needed.push(...sFips);
  const wFips = Array.isArray(w.census_tracts) ? w.census_tracts.map(String) : [];
  if (w.demographics && isMissing(w.demographics.unemployment_rate) && wFips.length)
    needed.push(...wFips);

  const fipsSet = Array.from(new Set(needed));
  if (!fipsSet.length) return data;
  const lookup = await fetchUnemploymentForTracts(fipsSet);

  const out = { ...data };
  if (isMissing(unemployment_rate) && localFips && lookup[localFips])
    out.unemployment_rate = lookup[localFips].unemployment_rate;

  if (s.demographics && isMissing(s.demographics.unemployment_rate) && sFips.length) {
    let totPop = 0;
    let totWeighted = 0;
    for (const f of sFips) {
      const item = lookup[f];
      if (item && Number.isFinite(item.unemployment_rate) && Number.isFinite(item.population)) {
        totPop += item.population;
        totWeighted += item.unemployment_rate * item.population;
      }
    }
    if (totPop > 0)
      out.surrounding_10_mile = {
        ...s,
        demographics: { ...s.demographics, unemployment_rate: totWeighted / totPop },
      };
  }

  if (w.demographics && isMissing(w.demographics.unemployment_rate) && wFips.length) {
    let totPop = 0;
    let totWeighted = 0;
    for (const f of wFips) {
      const item = lookup[f];
      if (item && Number.isFinite(item.unemployment_rate) && Number.isFinite(item.population)) {
        totPop += item.population;
        totWeighted += item.unemployment_rate * item.population;
      }
    }
    if (totPop > 0)
      out.water_district = {
        ...w,
        demographics: { ...w.demographics, unemployment_rate: totWeighted / totPop },
      };
  }

  return out;
}

// Fetch surrounding cities and census tracts if API didn't provide them
async function enrichSurrounding(data = {}) {
  const { lat, lon, census_tract, surrounding_10_mile } = data || {};
  if (!surrounding_10_mile || lat == null || lon == null) return data;
  const radiusMeters = 1609.34 * 10; // 10 miles
  const s = { ...surrounding_10_mile };
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
  if (!Array.isArray(s.census_tracts) || !s.census_tracts.length) {
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
          for (const f of features) {
            const attrs = f.attributes || {};
            if (attrs.NAME)
              names.push(attrs.NAME.replace(/^Census Tract\s+/i, ""));
            if (attrs.GEOID) fips.push(String(attrs.GEOID));
          }
          s.census_tracts = Array.from(new Set(names)).slice(0, 10);
          s.census_tracts_fips = Array.from(new Set(fips));
        })
        .catch(() => {}),
    );
  }
  if (tasks.length) await Promise.all(tasks);
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
  return { ...data, surrounding_10_mile: s };
}

// Fill in missing water district basics if the API doesn't provide them
async function enrichWaterDistrict(data = {}, address = "") {
  const { lat, lon, city, census_tract, water_district } = data || {};
  if (lat == null || lon == null) return data;
  const w = { ...water_district };
  const tasks = [];

  // Primary lookup using the NFT API (includes service-area shape info)
  if (address) {
    const url = buildApiUrl("/lookup", { address });
    tasks.push(
      fetchJsonWithDiagnostics(url)
        .then((j) => {
          w.name = j?.agency?.agency_name || w.name;
          const tracts =
            j?.agency?.service_area_tracts ||
            j?.service_area_tracts ||
            j?.census_tracts ||
            j?.agency?.census_tracts;
          if (typeof tracts === "string") {
            w.census_tracts = tracts.split(/\s*,\s*/).filter(Boolean);
          } else if (Array.isArray(tracts)) {
            w.census_tracts = [...new Set(tracts.map(String))];
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

  // If census tracts weren't provided, try overlaying the water district shape
  if (!Array.isArray(w.census_tracts) || !w.census_tracts.length) {
    const geoUrl =
      "https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query" +
      `?geometry=${lon}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`;
    tasks.push(
      fetch(geoUrl)
        .then((r) => r.json())
        .then((j) => {
          const geom = j?.features?.[0]?.geometry;
          if (!geom) return;
          const tractUrl =
            "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query" +
            `?where=1%3D1&geometry=${encodeURIComponent(JSON.stringify(geom))}&geometryType=esriGeometryPolygon&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=NAME&returnGeometry=false&f=json`;
          return fetch(tractUrl)
            .then((r) => r.json())
            .then((t) => {
              const names = (t.features || [])
                .map((f) => f.attributes?.NAME)
                .filter(Boolean)
                .map((n) => n.replace(/^Census Tract\s+/i, ""));
              if (names.length)
                w.census_tracts = [...new Set(names.map(String))];
            });
        })
        .catch(() => {}),
    );
  }

  if (!Array.isArray(w.cities) || !w.cities.length) {
    if (city) w.cities = [city];
  }

  if (tasks.length) await Promise.all(tasks);

  let tracts = [];
  if (Array.isArray(w.census_tracts)) tracts = w.census_tracts.map(String);
  else if (typeof w.census_tracts === "string")
    tracts = w.census_tracts.split(/\s*,\s*/).filter(Boolean);
  if (census_tract) tracts.unshift(String(census_tract));
  w.census_tracts = [...new Set(tracts)];

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
      const url =
        `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${tract}&in=state:${state}+county:${county}`;
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
  const renderGroup = (groupTitle, obj) => {
    if (!obj || typeof obj !== "object") return "";
    const kv = Object.entries(obj)
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
        ${renderGroup("Exposures", data.exposures)}
        ${renderGroup("Environmental effects", data.environmental_effects)}
        ${renderGroup("Sensitive populations", data.sensitive_populations)}
        ${renderGroup("Socioeconomic factors", data.socioeconomic_factors)}
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
function renderLoading(address) {
  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${nowStamp()}</span>
      </div>
      ${address ? `<p class="note">Address: <strong>${escapeHTML(address)}</strong></p>` : ""}
      <div class="callout">Fetching county, languages, English proficiency, population, income, DAC, and alerts…</div>
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
) {
  const cell = (html) =>
    html && String(html).trim() ? html : '<p class="note">No data</p>';
  return `
    <section class="section-block">
      <h3 class="section-header">${title}</h3>
      ${descriptionHtml}
      <div class="comparison-grid">
        <div class="col local">${cell(localHtml)}</div>
        <div class="col surrounding">${cell(surroundingHtml)}</div>
        <div class="col district">${cell(districtHtml)}</div>
      </div>
    </section>
  `;
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
  const renderGroup = (title, obj) => {
    if (!obj || typeof obj !== "object") return "";
    const kv = Object.entries(obj)
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
    ${renderGroup("Exposures", data.exposures)}
    ${renderGroup("Environmental effects", data.environmental_effects)}
    ${renderGroup("Sensitive populations", data.sensitive_populations)}
    ${renderGroup("Socioeconomic factors", data.socioeconomic_factors)}
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
    high_school_or_higher_pct,
    bachelors_or_higher_pct,
    alerts,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const hardshipList = Array.isArray(environmental_hardships)
    ? environmental_hardships
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
    high_school_or_higher_pct,
    bachelors_or_higher_pct,
    alerts,
    enviroscreen,
    surrounding_10_mile,
    water_district,
  } = data || {};

  const hardshipList = Array.isArray(environmental_hardships)
    ? environmental_hardships
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
  const sTracts = Array.isArray(s.census_tracts)
    ? s.census_tracts.join(", ")
    : escapeHTML(s.census_tracts) || "—";
  const sCities = Array.isArray(s.cities)
    ? s.cities.join(", ")
    : escapeHTML(s.cities) || "—";
  const wTracts = Array.isArray(w.census_tracts)
    ? w.census_tracts.join(", ")
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
  const locSurround = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${sCities}</div>
      <div class="key">Census tracts</div><div class="val">${sTracts}</div>
    </div>
  `;
  const locDistrict = `
    <div class="kv">
      <div class="key">District</div><div class="val">${escapeHTML(w.name) || "—"}</div>
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
    '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p>',
  );

  const languageLocal = `
    <div class="kv">
      <div class="key">People who speak a language other than English at home</div><div class="val">${fmtPct(
        language_other_than_english_pct,
      )}</div>
      <div class="key">People who speak English less than \"very well\"</div><div class="val">${fmtPct(
        english_less_than_very_well_pct,
      )}</div>
      <div class="key">People who speak Spanish at home</div><div class="val">${fmtPct(
        spanish_at_home_pct,
      )}</div>
    </div>
    <p class="note">Source: Latest ACS 5-Year Estimates<br>Data Profiles/Social Characteristics</p>
  `;
  const languageRow = buildComparisonRow(
    "Language (ACS)",
    languageLocal,
    "",
    "",
    '<p class="section-description">This section highlights the primary and secondary languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p>',
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
    '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p>',
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
    '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p>',
  );

  const dacRow = buildComparisonRow(
    "Disadvantaged Community (DAC) Status",
    `<div class="callout" style="border-left-color:${
      dac_status ? "var(--success)" : "var(--border-strong)"
    }">Disadvantaged community: <strong>${dac_status ? "Yes" : "No"}</strong></div>`,
    "",
    "",
    '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
  );

  const enviroscreenRow = buildComparisonRow(
    "Environmental Indicators (CalEPA Enviroscreen)",
    renderEnviroscreenContent(enviroscreen),
    renderEnviroscreenContent(s.environment),
    renderEnviroscreenContent(w.environment),
    '<p class="section-description">This section shows environmental and community health indicators from California’s Enviroscreen tool. Results are presented as percentiles, with higher numbers (and darker colors) indicating greater environmental burdens compared to other areas in the state. These measures include factors such as air quality, traffic pollution, and access to safe drinking water.</p><p class="section-description">Staff can use this information to understand potential environmental challenges facing a neighborhood, strengthen grant applications that require equity or environmental justice considerations, and design outreach that addresses local concerns. For example, if an event is planned in an area with a high Enviroscreen percentile, staff may want to highlight programs or benefits related to clean water, pollution reduction, or community health.</p><p class="section-description"><strong>How to Read This</strong><br>Green = Low burden (fewer environmental and health challenges)<br>Yellow/Orange = Moderate burden<br>Red = High burden (greater environmental and health challenges)<br>Percentile score shows how the community compares to others across California.</p>',
  );

  const hardshipRow = buildComparisonRow(
    "Environmental Hardships",
    hardshipList.length
      ? `<div class="stats">${hardshipList
          .map((h) => `<span class="pill">${escapeHTML(h)}</span>`)
          .join("")}</div>`
      : "",
    "",
    "",
    '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
  );

  const alertsRow = buildComparisonRow(
    "Active Alerts (National Weather Service)",
    alertList.length
      ? `<div class="stats">${alertList
          .map((a) => `<span class="pill">${escapeHTML(a)}</span>`)
          .join("")}</div>`
      : '<p class="note">No active alerts found for this location.</p>',
    "",
    "",
    '<p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>',
  );

  const columnHeaders = `
    <div class="comparison-grid column-headers">
      <div class="col">Census tract</div>
      <div class="col">10 mile radius</div>
      <div class="col">Water district</div>
    </div>
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
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
  `;
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

  resultBox.setAttribute("aria-busy", "true");
  renderLoading(address);
  startSearchTimer();
  let elapsed = 0;

  try {
    const url = buildApiUrl(API_PATH, { address });
    let data = await fetchJsonWithDiagnostics(url);
    if (!data || typeof data !== "object")
      throw new Error("Malformed response.");
    data = await enrichLocation(data);
    const lang = await fetchLanguageAcs(data);
    data = { ...data, ...lang };
    data = await enrichSurrounding(data);
    data = await enrichWaterDistrict(data, address);
    data = await enrichUnemployment(data);
    data = await enrichEnglishProficiency(data);
    lastReport = { address, data };
    const locUrl = new URL(window.location);
    locUrl.searchParams.set("address", address);
    window.history.replaceState(null, "", locUrl.toString());
    elapsed = stopSearchTimer();
    renderResult(address, data, elapsed);
  } catch (err) {
    if (!elapsed) elapsed = stopSearchTimer();
    renderError(String(err), address, elapsed);
  } finally {
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

function loadGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=initAutocomplete`;
  script.async = true;
  document.head.appendChild(script);
}

window.onload = () => {
  loadGoogleMaps();
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
