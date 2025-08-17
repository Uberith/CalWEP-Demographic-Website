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
function fmtInt(n) { return Number.isFinite(n) ? n.toLocaleString() : "—"; }
function fmtCurrency(n) {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n);
  return `$${r.toLocaleString()}`;
}
function nowStamp() { return new Date().toLocaleString(); }
function buildApiUrl(path, params = {}) {
  const base = API_BASE.endsWith("/") ? API_BASE : API_BASE + "/";
  const url = new URL(path.replace(/^\//, ""), base);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).length) url.searchParams.set(k, v);
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
      headers: { Accept: "application/json" }
    });
  } catch (e) {
    throw new Error(`Network error calling API: ${e?.message || e}`);
  }
  const txt = await res.text().catch(() => "");
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText} for ${url} :: ${txt || "<no body>"}`);
  try { return JSON.parse(txt); }
  catch { throw new Error(`API 200 but response was not valid JSON for ${url} :: ${txt.slice(0, 200)}…`); }
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
    { max: 100, color: "#6E0000", fg: "#fff" }
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
    let street = "", city = "", state = "", zip = "";
    for (const comp of p.address_components || []) {
      const t = comp.types || [];
      if (t.includes("street_number")) street = comp.long_name + " ";
      else if (t.includes("route")) street += comp.long_name;
      else if (t.includes("locality")) city = comp.long_name;
      else if (t.includes("administrative_area_level_1")) state = comp.short_name;
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
    city, zip, county, lat, lon,
    primary_language, secondary_language,
    median_household_income, population,
    dac_status, environmental_hardships,
    enviroscreen
  } = data || {};

  const alerts = Array.isArray(environmental_hardships) ? environmental_hardships : [];
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
    return `
      <section class="section-block">
        <h3 class="section-header">CalEnviroScreen 4.0</h3>
        <div class="kv">
          <div class="key">Overall percentile</div><div class="val">${badge(overall)}</div>
          <div class="key">Pollution burden</div><div class="val">${badge(pb)}</div>
          <div class="key">Population characteristics</div><div class="val">${badge(pc)}</div>
        </div>
      </section>
    `;
  })();
  const coords = (lat != null && lon != null) ? `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}` : "—";

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
          <div class="key">Median household income</div><div class="val">${fmtCurrency(median_household_income)}</div>
        </div>
      </section>

      <section class="section-block">
        <h3 class="section-header">Languages (ACS)</h3>
        <div class="kv">
          <div class="key">Primary language</div><div class="val">${escapeHTML(primary_language) || "—"}</div>
          <div class="key">Second most common</div><div class="val">${escapeHTML(secondary_language) || "—"}</div>
        </div>
      </section>

      <section class="section-block">
        <h3 class="section-header">Disadvantaged Community (DAC)</h3>
        <div class="callout" style="border-left-color:${dac_status ? 'var(--success)' : 'var(--border-strong)'}">
          Disadvantaged community: <strong>${dac_status ? "Yes" : "No"}</strong>
        </div>
      </section>

      ${cesSection}

      <section class="section-block">
        <h3 class="section-header">Active alerts (NWS)</h3>
        ${alerts.length ? `
          <div class="stats">
            ${alerts.map(a => `<span class="pill">${escapeHTML(a)}</span>`).join("")}
          </div>
        ` : `<p class="note">No active alerts found for this location.</p>`}
      </section>

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
    renderError("Please enter a more complete address (at least 4 characters).", address);
    return;
  }

  resultBox.setAttribute("aria-busy", "true");
  renderLoading(address);

  try {
    const url = buildApiUrl(API_PATH, { address });
    const data = await fetchJsonWithDiagnostics(url);
    if (!data || typeof data !== "object") throw new Error("Malformed response.");
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
window.onload = () => { initAutocomplete(); bindLookupTrigger(); };
