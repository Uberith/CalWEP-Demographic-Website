export function setupAutocomplete() {
  const input = document.getElementById("autocomplete");
  const list = document.getElementById("autocomplete-list");
  if (!input || !list) return;

  // Fetch address suggestions from the server-side proxy
  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (query.length < 3) {
      list.innerHTML = "";
      return;
    }
    try {
      const resp = await fetch(
        `/api/autocomplete?input=${encodeURIComponent(query)}`,
      );
      if (!resp.ok) throw new Error("Autocomplete request failed");
      const data = await resp.json();
      const predictions = Array.isArray(data.predictions)
        ? data.predictions
        : [];
      list.innerHTML = "";
      for (const p of predictions.slice(0, 5)) {
        const opt = document.createElement("option");
        opt.value = p.description;
        list.appendChild(opt);
      }
    } catch (err) {
      console.error("Autocomplete error", err);
      list.innerHTML = "";
    }
  });

  // Enter triggers lookup
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("lookupBtn")?.click();
    }
  });
}
