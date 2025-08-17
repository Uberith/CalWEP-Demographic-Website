/* script.js — Demographics Lookup (API-base aware)
   - Reads API base from <meta name="api-base"> (https://calwep-nft-api.onrender.com)
   - Calls GET /demographics?address=...
   - Robust fetch diagnostics, Google Places autocomplete, Enter-to-search, aria-busy
*/

let autocomplete = null;

// ---------- Config ----------
const API_BASE = "https://calwep-nft-api.onrender.com";
const API_PATH = "/demographics"; // see section 2 for why '/api' is safest

function buildApiUrl(address) {
  const u = new URL(API_PATH.replace(/^\//, ""), API_BASE + "/");
  u.searchParams.set("address", address);
  return u.toString();
}

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
    </div>
  `;
}
function renderError(message, address) {
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
      <p class="note">API base: <code>${escapeHTML(API_BASE)}</code>. If your API has a prefix, adjust <code>API_PATH</code>.</p>
    </div>
  `;
}
function renderResult(address, data) {
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
            `<div class="key">${escapeHTML(CES_LABELS[k] || titleCase(k))}</div><div class="val">${fmtNumber(v)}</div>`,
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
    if (!s || typeof s !== "object" || Object.keys(s).length === 0) return "";
    return `
      <section class="section-block">
        <h3 class="section-header">Surrounding 10‑mile area (ACS)</h3>
        <div class="kv">
          <div class="key">Population</div><div class="val">${fmtInt(s.population)}</div>
          <div class="key">Median age</div><div class="val">${fmtNumber(s.median_age)}</div>
          <div class="key">Median household income</div><div class="val">${fmtCurrency(s.median_household_income)}</div>
          <div class="key">Per capita income</div><div class="val">${fmtCurrency(s.per_capita_income)}</div>
          <div class="key">Poverty rate</div><div class="val">${fmtPct(s.poverty_rate)}</div>
          <div class="key">Unemployment rate</div><div class="val">${fmtPct(s.unemployment_rate)}</div>
          <div class="key">Owner occupied</div><div class="val">${fmtPct(s.owner_occupied_pct)}</div>
          <div class="key">Renter occupied</div><div class="val">${fmtPct(s.renter_occupied_pct)}</div>
          <div class="key">Median home value</div><div class="val">${fmtCurrency(s.median_home_value)}</div>
          <div class="key">High school or higher</div><div class="val">${fmtPct(s.high_school_or_higher_pct)}</div>
          <div class="key">Bachelor's degree or higher</div><div class="val">${fmtPct(s.bachelors_or_higher_pct)}</div>
          <div class="key">White</div><div class="val">${fmtPct(s.white_pct)}</div>
          <div class="key">Black or African American</div><div class="val">${fmtPct(s.black_pct)}</div>
          <div class="key">American Indian / Alaska Native</div><div class="val">${fmtPct(s.native_pct)}</div>
          <div class="key">Asian</div><div class="val">${fmtPct(s.asian_pct)}</div>
          <div class="key">Native Hawaiian / Pacific Islander</div><div class="val">${fmtPct(s.pacific_pct)}</div>
          <div class="key">Other race</div><div class="val">${fmtPct(s.other_race_pct)}</div>
          <div class="key">Two or more races</div><div class="val">${fmtPct(s.two_or_more_races_pct)}</div>
          <div class="key">Hispanic</div><div class="val">${fmtPct(s.hispanic_pct)}</div>
          <div class="key">Not Hispanic</div><div class="val">${fmtPct(s.not_hispanic_pct)}</div>
        </div>
      </section>
    `;
  })();

  document.getElementById("result").innerHTML = `
    <article class="card">
      <div class="card__header">
        <h2 class="card__title">Results for: ${escapeHTML(address)}</h2>
        <span class="updated">Updated ${nowStamp()}</span>
      </div>

      <section class="section-block">
        <h3 class="section-header">Location summary</h3>
        <div class="kv">
          <div class="key">City</div><div class="val">${escapeHTML(city) || "—"}</div>
          <div class="key">ZIP code</div><div class="val">${escapeHTML(zip) || "—"}</div>
          <div class="key">County</div><div class="val">${escapeHTML(county) || "—"}</div>
          <div class="key">Coordinates</div><div class="val">${coords}</div>
        </div>
      </section>

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
        <div class="callout" style="border-left-color:${dac_status ? "var(--success)" : "var(--border-strong)"}">
          Disadvantaged community: <strong>${dac_status ? "Yes" : "No"}</strong>
        </div>
      </section>

      ${cesSection}
      ${hardshipSection}

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

      ${surroundingSection}

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
    );
    return;
  }

  resultBox.setAttribute("aria-busy", "true");
  renderLoading(address);

  try {
    const url = buildApiUrl(API_PATH, { address });
    const data = await fetchJsonWithDiagnostics(url);
    if (!data || typeof data !== "object")
      throw new Error("Malformed response.");
    renderResult(address, data);
  } catch (err) {
    renderError(String(err), address);
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
window.onload = () => {
  initAutocomplete();
  bindLookupTrigger();
};
