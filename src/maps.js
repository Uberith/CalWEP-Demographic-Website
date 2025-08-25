// Autocomplete logic for the address search box.
// All requests are proxied through the backend; the frontend never
// communicates with Google or embeds an API key.

import { buildApiUrl } from "./api.js";

export function setupAutocomplete() {
  const input = document.getElementById("autocomplete");
  const list = document.getElementById("autocomplete-list");
  if (!input || !list) return;

  // Backend endpoint for autocomplete suggestions. The base host is
  // resolved at runtime in config.js so API calls hit the correct domain.
  // All autocomplete requests must go through this backend endpoint and
  // never talk to Google directly or expose the Maps API key.
  const AUTOCOMPLETE_PATH = "/api/autocomplete";

  let debounceId = null;
  let suggestions = [];
  let activeIndex = -1;

  const clearSuggestions = (message = "") => {
    list.innerHTML = message;
    list.style.display = message ? "block" : "none";
    suggestions = [];
    activeIndex = -1;
  };

  const highlightMatch = (text, query) => {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    return text.replace(regex, (m) => `<strong>${m}</strong>`);
  };

  const renderSuggestions = (preds, query) => {
    suggestions = preds;
    list.innerHTML = preds
      .map(
        (p, i) =>
          `<li class="autocomplete-item" data-index="${i}" role="option">${highlightMatch(
            p.description,
            query,
          )}</li>`,
      )
      .join("");
    list.style.display = "block";
    updateActive();
  };

  const selectSuggestion = (index) => {
    const item = suggestions[index];
    if (!item) return;
    input.value = item.description;
    clearSuggestions();
    input.focus();
  };

  const updateActive = () => {
    const items = list.querySelectorAll(".autocomplete-item");
    items.forEach((el, idx) => {
      el.classList.toggle("active", idx === activeIndex);
    });
  };

  input.addEventListener("input", () => {
    const query = input.value.trim();
    clearTimeout(debounceId);
    if (!query) {
      clearSuggestions();
      return;
    }

    // TODO: show a loading spinner while fetching suggestions
    // Debounce to reduce API spam; adjust timing as needed.
    debounceId = setTimeout(async () => {
      const url = buildApiUrl(AUTOCOMPLETE_PATH, { input: query });
      console.log("Autocomplete request:", url);
      try {
        const resp = await fetch(url);
        let data = {};
        try {
          data = await resp.json();
        } catch {}
        console.log("Autocomplete response:", resp.status, data);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        if (data.error === "Missing input") {
          clearSuggestions('<li class="error">Input required.</li>');
          return;
        }
        if (data.error) throw new Error(data.error);
        const preds = Array.isArray(data.predictions) ? data.predictions : [];
        if (!preds.length) {
          clearSuggestions(
            '<li class="no-suggestions">No suggestions found.</li>',
          );
          return;
        }
        renderSuggestions(preds, query);
      } catch (err) {
        console.error("Autocomplete error", err);
        clearSuggestions('<li class="error">Unable to fetch suggestions.</li>');
      }
    }, 300);
  });

  list.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".autocomplete-item");
    if (!item) return;
    selectSuggestion(Number(item.dataset.index));
  });

  input.addEventListener("keydown", (e) => {
    if (!suggestions.length) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex = (activeIndex + 1) % suggestions.length;
        updateActive();
        break;
      case "ArrowUp":
        e.preventDefault();
        activeIndex =
          (activeIndex - 1 + suggestions.length) % suggestions.length;
        updateActive();
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          selectSuggestion(activeIndex);
        }
        break;
      case "Escape":
        clearSuggestions();
        break;
    }
  });

  input.addEventListener("blur", () => {
    // Delay clearing so clicks register
    setTimeout(() => clearSuggestions(), 100);
  });
}
