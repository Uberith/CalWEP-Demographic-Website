import { sanitizeHTML, nowStamp, formatDuration } from "../utils.js";
import { API_BASE } from "../api.js";

export function renderLoading(address) {
  document.getElementById("result").innerHTML = sanitizeHTML(`
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${nowStamp()}</span>
      </div>
      ${address ? `<p class="note">Address: <strong>${sanitizeHTML(address)}</strong></p>` : ""}
      <div class="callout">Fetching county, languages, English proficiency, population, income, DAC, and alerts…</div>
      <p class="note">Elapsed: <span id="searchTimer">0m 00s</span></p>
    </div>
  `);
}

export function renderError(message, address, elapsedMs) {
  document.getElementById("result").innerHTML = sanitizeHTML(`
    <div class="card" role="alert">
      <div class="card__header">
        <h2 class="card__title">Unable to retrieve data</h2>
        <span class="updated">${nowStamp()}</span>
      </div>
      ${address ? `<p class="note">Address: <strong>${sanitizeHTML(address)}</strong></p>` : ""}
      <div class="callout" style="border-left-color:#b45309;">
        ${sanitizeHTML(message || "Please try again with a different address.")}
      </div>
      <p class="note">Search took ${formatDuration(elapsedMs)}.</p>
      <p class="note">API base: <code>${sanitizeHTML(API_BASE)}</code>. If your API has a prefix, adjust <code>API_PATH</code>.</p>
    </div>
  `);
}
