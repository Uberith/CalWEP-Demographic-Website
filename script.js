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

function downloadReport() {
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
      <div class="callout">Fetching county, languages, population, income, DAC, and alerts…</div>
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
function renderResult(address, data, elapsedMs) {
  const {
    city,
    zip,
    county,
    lat,
    lon,
    primary_language,
    secondary_language,
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
  } = data || {};

  const hardshipList = Array.isArray(environmental_hardships)
    ? environmental_hardships
    : [];
  const alertList = Array.isArray(alerts) ? alerts : [];
  const cesSection = (() => {
    if (!enviroscreen || typeof enviroscreen !== "object") return "";
    const badge = (v) => {
      const { bg, fg } = cesColor(v);
      const val = Number.isFinite(Number(v)) ? Number(v).toFixed(1) : "—";
      return `<span class="ces-badge" style="background:${bg};color:${fg};">${val}</span>`;
    };
    const overall = enviroscreen.percentile;
    const pb = enviroscreen.overall_percentiles?.pollution_burden;
    const pc = enviroscreen.overall_percentiles?.population_characteristics;
    const renderGroup = (title, obj) => {
      if (!obj || typeof obj !== "object") return "";
      const kv = Object.entries(obj)
        .map(
          ([k, v]) =>
            `<div class="key">${escapeHTML(
              CES_LABELS[k] || titleCase(k),
            )}</div><div class="val">${badge(v)}</div>`,
        )
        .join("");
      return `<h4 class="sub-section-header">${title}</h4><div class="kv">${kv}</div>`;
    };
    return `
      <section class="section-block">
        <h3 class="section-header">CalEnviroScreen 4.0</h3>
        <div class="kv">
          <div class="key">Overall percentile</div><div class="val">${badge(overall)}</div>
          <div class="key">Pollution burden</div><div class="val">${badge(pb)}</div>
          <div class="key">Population characteristics</div><div class="val">${badge(pc)}</div>
        </div>
        ${renderGroup("Exposures", enviroscreen.exposures)}
        ${renderGroup("Environmental effects", enviroscreen.environmental_effects)}
        ${renderGroup("Sensitive populations", enviroscreen.sensitive_populations)}
        ${renderGroup("Socioeconomic factors", enviroscreen.socioeconomic_factors)}
      </section>
    `;
  })();
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
      <h3 class="section-header">Race &amp; ethnicity (ACS)</h3>
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
      <h3 class="section-header">Housing &amp; education (ACS)</h3>
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
    const d = s.demographics || {};
    if (Object.keys(d).length === 0) return "";
    return `
      <section class="section-block">
        <h3 class="section-header">Surrounding 10‑mile area (ACS)</h3>
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
  })();

  const chartsSection = `
    <section class="section-block">
      <h3 class="section-header">Visualizations</h3>
      <div class="chart-grid">
        <div><canvas id="raceChart"></canvas></div>
        <div><canvas id="exposureChart"></canvas></div>
      </div>
    </section>
  `;

  const rawJsonSection = `
    <section class="section-block">
      <h3 class="section-header">Raw data</h3>
      <pre class="raw-json">${escapeHTML(JSON.stringify(data, null, 2))}</pre>
    </section>
  `;

  const localInfo = `
    <section class="section-block">
      <h3 class="section-header">Location summary</h3>
      <div class="kv">
        <div class="key">City</div><div class="val">${escapeHTML(city) || "—"}</div>
        <div class="key">ZIP code</div><div class="val">${escapeHTML(zip) || "—"}</div>
        <div class="key">County</div><div class="val">${escapeHTML(county) || "—"}</div>
        <div class="key">Coordinates</div><div class="val">${coords}</div>
      </div>
      ${mapImgHtml}
    </section>
      <p class="note">Search took ${formatDuration(elapsedMs)}.</p>

    <section class="section-block">
      <h3 class="section-header">Population &amp; income (ACS)</h3>
      <div class="kv">
        <div class="key">Total population</div><div class="val">${fmtInt(population)}</div>
        <div class="key">Median age</div><div class="val">${fmtNumber(median_age)}</div>
        <div class="key">Median household income</div><div class="val">${fmtCurrency(median_household_income)}</div>
        <div class="key">Per capita income</div><div class="val">${fmtCurrency(per_capita_income)}</div>
        <div class="key">People below poverty</div><div class="val">${fmtInt(people_below_poverty)}</div>
        <div class="key">Poverty rate</div><div class="val">${fmtPct(poverty_rate)}</div>
        <div class="key">Unemployment rate</div><div class="val">${fmtPct(unemployment_rate)}</div>
      </div>
    </section>

    <section class="section-block">
      <h3 class="section-header">Languages (ACS)</h3>
      <div class="kv">
        <div class="key">Primary language</div><div class="val">${escapeHTML(primary_language) || "—"}</div>
        <div class="key">Second most common</div><div class="val">${escapeHTML(secondary_language) || "—"}</div>
      </div>
    </section>

    ${raceSection}
    ${housingSection}
    <section class="section-block">
      <h3 class="section-header">Disadvantaged Community (DAC)</h3>
      <div class="callout" style="border-left-color:${
        dac_status ? "var(--success)" : "var(--border-strong)"
      }">
        Disadvantaged community: <strong>${dac_status ? "Yes" : "No"}</strong>
      </div>
    </section>

    ${cesSection}
    ${hardshipSection}
    ${chartsSection}

    <section class="section-block">
      <h3 class="section-header">Active alerts (NWS)</h3>
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
    ${rawJsonSection}
  `;

  document.getElementById("result").innerHTML = `
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${escapeHTML(address)}</h2>
          <div class="card__actions">
            <button type="button" onclick="printReport()">Print</button>
            <button type="button" onclick="downloadReport()">Download</button>
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
      </div>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
  `;
  renderCharts(data);
}

function renderCharts(data) {
  if (typeof Chart === "undefined") return;
  const raceCtx = document.getElementById("raceChart");
  if (raceCtx) {
    new Chart(raceCtx, {
      type: "pie",
      data: {
        labels: [
          "White",
          "Black",
          "Native",
          "Asian",
          "Pacific",
          "Other",
          "Two or more",
          "Hispanic",
          "Not Hispanic",
        ],
        datasets: [
          {
            data: [
              data.white_pct,
              data.black_pct,
              data.native_pct,
              data.asian_pct,
              data.pacific_pct,
              data.other_race_pct,
              data.two_or_more_races_pct,
              data.hispanic_pct,
              data.not_hispanic_pct,
            ],
            backgroundColor: [
              "#4e79a7",
              "#f28e2c",
              "#e15759",
              "#76b7b2",
              "#59a14f",
              "#edc948",
              "#b07aa1",
              "#ff9da7",
              "#9c755f",
            ],
          },
        ],
      },
      options: { plugins: { legend: { position: "bottom" } } },
    });
  }
  const exposureCtx = document.getElementById("exposureChart");
  if (exposureCtx) {
    const exp = (data.enviroscreen && data.enviroscreen.exposures) || {};
    const labels = Object.keys(exp).map((k) => CES_LABELS[k] || titleCase(k));
    const values = Object.values(exp);
    new Chart(exposureCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Percentile",
            data: values,
            backgroundColor: "#4e79a7",
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true, max: 100 } } },
    });
  }
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
    const data = await fetchJsonWithDiagnostics(url);
    if (!data || typeof data !== "object")
      throw new Error("Malformed response.");
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
