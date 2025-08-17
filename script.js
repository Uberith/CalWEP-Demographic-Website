/* script.js — Demographics Lookup
   - Places Autocomplete with Enter-to-search
   - Robust fetch wrapper (diagnostics)
   - Renders a professional results card using your CSS components
   - Calls GET /demographics?address=...
*/

let autocomplete = null;
let selectedLat = null;
let selectedLon = null;

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
  const rounded = Math.round(n);
  return `$${rounded.toLocaleString()}`;
}
function nowStamp() { return new Date().toLocaleString(); }

async function fetchJsonWithDiagnostics(url) {
  let res;
  try {
    res = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  } catch (e) {
    throw new Error(`Network error calling API: ${e?.message || e}`);
  }
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} for ${url} :: ${text || "<no body>"}`);
  }
  try { return JSON.parse(text); }
  catch { throw new Error(`API 200 but response was not valid JSON for ${url} :: ${text.slice(0, 200)}…`); }
}

// ---------- Places Autocomplete ----------
function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input || typeof google === "undefined" || !google.maps) return;

  autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["address"],
    componentRestrictions: { country: "us" }
  });

  autocomplete.addListener("place_changed", () => {
    const p = autocomplete.getPlace();
    // Compose a clean single-line address
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
    if (p.geometry && p.geometry.location) {
      selectedLat = p.geometry.location.lat();
      selectedLon = p.geometry.location.lng();
    } else {
      selectedLat = selectedLon = null;
    }
    const parts = [street.trim(), city, state, zip].filter(Boolean);
    if (parts.length) input.value = parts.join(", ");
  });

  // Pressing Enter triggers lookup
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("lookupBtn")?.click();
    }
  });
}

function bindLookupTrigger() {
  const btn = document.getElementById("lookupBtn");
  if (!btn) return;
  // Avoid double-binding by cloning
  const clone = btn.cloneNode(true);
  btn.replaceWith(clone);
  clone.addEventListener("click", (e) => {
    e.preventDefault();
    lookup().catch(console.error);
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
      <p class="note">Confirm the <code>/demographics</code> endpoint is reachable and CORS is configured if cross-origin.</p>
    </div>
  `;
}

function renderResult(address, data) {
  const {
    city, zip, county, lat, lon,
    primary_language, secondary_language,
    median_household_income, population,
    dac_status, environmental_hardships
  } = data || {};

  const alerts = Array.isArray(environmental_hardships) ? environmental_hardships : [];
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

      <section class="section-block">
        <h3 class="section-header">Active alerts (NWS)</h3>
        ${alerts.length ? `
          <div class="stats">
            ${alerts.map(a => `<span class="pill">${escapeHTML(a)}</span>`).join("")}
          </div>
        ` : `<p class="note">No active alerts found for this location.</p>`}
      </section>

      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); NWS alerts.
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
    const url = new URL("/demographics", window.location.origin);
    url.searchParams.set("address", address);
    const data = await fetchJsonWithDiagnostics(url.toString());
    if (!data || typeof data !== "object") throw new Error("Malformed response.");
    renderResult(address, data);
  } catch (err) {
    renderError(String(err), address);
  } finally {
    resultBox.removeAttribute("aria-busy");
  }
}

// Initialize
window.onload = () => {
  initAutocomplete();
  bindLookupTrigger();
};
