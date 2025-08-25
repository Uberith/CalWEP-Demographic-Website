let a = null;
const c = "";
function m() {
  return c;
}
function p() {
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
        i = "",
        r = "",
        l = "";
      for (const t of o.address_components || []) {
        const s = t.types || [];
        s.includes("street_number")
          ? (n = t.long_name + " ")
          : s.includes("route")
            ? (n += t.long_name)
            : s.includes("locality")
              ? (i = t.long_name)
              : s.includes("administrative_area_level_1")
                ? (r = t.short_name)
                : s.includes("postal_code") && (l = t.long_name);
      }
      if (!l && o.formatted_address) {
        const t = o.formatted_address.match(/\b\d{5}(?:-\d{4})?\b/);
        t && (l = t[0]);
      }
      const d = [n.trim(), i, r, l].filter(Boolean);
      d.length && (e.value = d.join(", "));
    }),
    e.addEventListener("keydown", (o) => {
      var n;
      o.key === "Enter" &&
        (o.preventDefault(),
        (n = document.getElementById("lookupBtn")) == null || n.click());
    }));
}
async function u() {
  try {
    if (!c) throw new Error("Google Maps API key not configured");
    const e = document.createElement("script");
    ((e.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(c)}&libraries=places&callback=initAutocomplete`),
      (e.async = !0),
      document.head.appendChild(e));
  } catch (e) {
    console.error("Failed to load Google Maps", e);
  }
}
window.initAutocomplete = p;
export { m as g, u as l };
