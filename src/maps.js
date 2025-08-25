let autocomplete = null;
const mapsApiKey = (
  import.meta.env.MAPS_API_KEY ||
  import.meta.env.VITE_MAPS_API_KEY ||
  ""
)
  .toString()
  .trim();

export const GOOGLE_MAPS_KEY = mapsApiKey;

export function initAutocomplete() {
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

export async function loadGoogleMaps() {
  if (!GOOGLE_MAPS_KEY) {
    console.error("Google Maps API key not configured");
    return;
  }
  try {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_KEY,
    )}&libraries=places&callback=initAutocomplete`;
    script.async = true;
    document.head.appendChild(script);
  } catch (err) {
    console.error("Failed to load Google Maps", err);
  }
}

window.initAutocomplete = initAutocomplete;
