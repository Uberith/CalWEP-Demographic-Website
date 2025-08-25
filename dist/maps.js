var p = {};
let l = null;
const d = (p.MAPS_API_KEY || "").toString().trim();
function m() {
  const e = document.getElementById("autocomplete");
  !e ||
    typeof google > "u" ||
    !google.maps ||
    ((l = new google.maps.places.Autocomplete(e, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["address_components", "formatted_address"],
    })),
    l.addListener("place_changed", () => {
      const o = l.getPlace();
      let n = "",
        c = "",
        i = "",
        a = "";
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
                : s.includes("postal_code") && (a = t.long_name);
      }
      if (!a && o.formatted_address) {
        const t = o.formatted_address.match(/\b\d{5}(?:-\d{4})?\b/);
        t && (a = t[0]);
      }
      const r = [n.trim(), c, i, a].filter(Boolean);
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
export { d, u as l };
