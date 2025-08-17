/* script.js
   Wires up Google Places autocomplete, calls /demographics, and renders a results card.
   Assumes same-origin backend exposing GET /demographics?address=...
*/

(function () {
  const input = document.getElementById('autocomplete');
  const lookupBtn = document.getElementById('lookupBtn');
  const resultEl = document.getElementById('result');
  const buildingTypeEl = document.getElementById('building-type');

  // Initialize Places Autocomplete (uses your existing script include)
  try {
    if (window.google && google.maps && google.maps.places) {
      const ac = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        fields: ['formatted_address']
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place && place.formatted_address) {
          input.value = place.formatted_address;
        }
      });
    }
  } catch (e) {
    // Non-blocking: if Maps fails, free-typed addresses still work.
  }

  // UX helpers
  const escapeHtml = (s) =>
    String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const fmtInt = (n) => (Number.isFinite(n) ? n.toLocaleString() : '—');
  const fmtCurrency = (n) => (Number.isFinite(n) ? `$${Math.round(n).toLocaleString()}` : '—');
  const nowStamp = () => new Date().toLocaleString();

  const INSTITUTION_VALUES = new Set([
    'gov_properties', 'hospitals', 'universities', 'private_schools', 'colleges',
    'medical_centers', 'nursing_homes', 'research_institutions',
    'corporate_training_centers', 'religious_nonprofit_properties'
  ]);

  function isInstitutionalSelected() {
    return INSTITUTION_VALUES.has(buildingTypeEl.value);
  }

  function renderLoading(address) {
    resultEl.innerHTML = `
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Looking up demographics…</h2>
          <span class="updated">Started ${nowStamp()}</span>
        </div>
        <p class="note">Address: <strong>${escapeHtml(address)}</strong></p>
        <div class="callout">Fetching census, county, and alert data…</div>
      </div>
    `;
  }

  function renderError(message, address) {
    resultEl.innerHTML = `
      <div class="card" role="alert">
        <div class="card__header">
          <h2 class="card__title">Unable to retrieve data</h2>
          <span class="updated">${nowStamp()}</span>
        </div>
        ${address ? `<p class="note">Address: <strong>${escapeHtml(address)}</strong></p>` : ''}
        <div class="callout" style="border-left-color:#b45309;">
          ${escapeHtml(message || 'Please try again with a different address.')}
        </div>
        <p class="note">If this persists, confirm the backend <code>/demographics</code> endpoint is reachable and CORS is configured when cross-origin.</p>
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

    const showDAC = isInstitutionalSelected();
    const alerts = Array.isArray(environmental_hardships) ? environmental_hardships : [];

    resultEl.innerHTML = `
      <article class="card">
        <div class="card__header">
          <h2 class="card__title">Results for: ${escapeHtml(address)}</h2>
          <span class="updated">Updated ${nowStamp()}</span>
        </div>

        <section class="section-block">
          <h3 class="section-header">Location summary</h3>
          <div class="kv">
            <div class="key">City</div><div class="val">${escapeHtml(city) || '—'}</div>
            <div class="key">ZIP code</div><div class="val">${escapeHtml(zip) || '—'}</div>
            <div class="key">County</div><div class="val">${escapeHtml(county) || '—'}</div>
            <div class="key">Coordinates</div><div class="val">${(lat!=null && lon!=null) ? `${lat.toFixed(6)}, ${lon.toFixed(6)}` : '—'}</div>
          </div>
        </section>

        <section class="section-block">
          <h3 class="section-header">Population & income (ACS)</h3>
          <div class="kv">
            <div class="key">Total population</div><div class="val">${fmtInt(population)}</div>
            <div class="key">Median household income</div><div class="val">${fmtCurrency(median_household_income)}</div>
          </div>
        </section>

        <section class="section-block">
          <h3 class="section-header">Languages (ACS)</h3>
          <div class="kv">
            <div class="key">Primary language</div><div class="val">${escapeHtml(primary_language) || '—'}</div>
            <div class="key">Second most common</div><div class="val">${escapeHtml(secondary_language) || '—'}</div>
          </div>
        </section>

        ${showDAC ? `
          <section class="section-block">
            <h3 class="section-header">DAC status</h3>
            <div class="callout" style="border-left-color:${dac_status ? 'var(--success)' : 'var(--border-strong)'}">
              Disadvantaged community: <strong>${dac_status ? 'Yes' : 'No'}</strong>
            </div>
            <p class="note">Shown because an institutional property type is selected.</p>
          </section>
        ` : ''}

        <section class="section-block">
          <h3 class="section-header">Active alerts (NWS)</h3>
          ${alerts.length ? `
            <div class="stats">
              ${alerts.map(a => `<span class="pill">${escapeHtml(a)}</span>`).join('')}
            </div>
          ` : `<p class="note">No active alerts found for this location.</p>`}
        </section>

        <span class="updated--footer">
          Sources: FCC Block for county & tract; US Census ACS 5‑year (languages, population, median income); NWS alerts.
        </span>
      </article>
    `;
  }

  // Network: keep a reference so we can abort in-flight lookups if user searches again
  let inflightController = null;

  async function doLookup() {
    const address = input.value.trim();
    if (address.length < 4) {
      renderError('Please enter a more complete address (at least 4 characters).', address);
      return;
    }

    if (inflightController) inflightController.abort();
    inflightController = new AbortController();

    lookupBtn.disabled = true;
    renderLoading(address);

    try {
      const url = `/demographics?address=${encodeURIComponent(address)}`;
      const res = await fetch(url, { signal: inflightController.signal });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();

      // Defensive checks against unexpected shapes
      if (!data || typeof data !== 'object') throw new Error('Malformed response.');
      renderResult(address, data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      renderError(err.message || 'Lookup failed.', address);
    } finally {
      lookupBtn.disabled = false;
      inflightController = null;
    }
  }

  // Events
  lookupBtn.addEventListener('click', doLookup);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLookup();
  });
})();
