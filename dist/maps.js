let a = null;
const p = "".trim(),
  d = p;
function m() {
  const e = document.getElementById("autocomplete");
  !e ||
    typeof google > "u" ||
    !google.maps ||
    ((a = new google.maps.places.Autocomplete(e, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["address_components", "formatted_address"],
    })),
    a.addListener("place_changed", () => {
      const o = a.getPlace();
      let n = "",
        c = "",
        i = "",
        l = "";
      for (const t of o.address_components || []) {
        const s = t.types || [];
        s.includes("street_number")
          ? (n = t.long_name + " ")
          : s.includes("route")
            ? (n += t.long_name)
            : s.includes("locality")
              ? (c = t.long_name)
              : s.includes("administrative_area_level_1")
                ? (i = t.short_name)
                : s.includes("postal_code") && (l = t.long_name);
      }
      if (!l && o.formatted_address) {
        const t = o.formatted_address.match(/\b\d{5}(?:-\d{4})?\b/);
        t && (l = t[0]);
      }
      const r = [n.trim(), c, i, l].filter(Boolean);
      r.length && (e.value = r.join(", "));
    }),
    e.addEventListener("keydown", (o) => {
      var n;
      o.key === "Enter" &&
        (o.preventDefault(),
        (n = document.getElementById("lookupBtn")) == null || n.click());
    }));
}
async function u() {
  if (!d) {
    console.error("Google Maps API key not configured");
    return;
  }
  try {
    const e = document.createElement("script");
    ((e.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(d)}&libraries=places&callback=initAutocomplete`),
      (e.async = !0),
      document.head.appendChild(e));
  } catch (e) {
    console.error("Failed to load Google Maps", e);
  }
}
window.initAutocomplete = m;
export { d as G, u as l };
