function p() {
  const o = document.getElementById("autocomplete"),
    t = document.getElementById("autocomplete-list");
  !o ||
    !t ||
    (o.addEventListener("input", async () => {
      const n = o.value.trim();
      if (n.length < 3) {
        t.innerHTML = "";
        return;
      }
      try {
        const e = await fetch(
          `/api/autocomplete?input=${encodeURIComponent(n)}`,
        );
        if (!e.ok) throw new Error("Autocomplete request failed");
        const r = await e.json(),
          i = Array.isArray(r.predictions) ? r.predictions : [];
        t.innerHTML = "";
        for (const s of i.slice(0, 5)) {
          const c = document.createElement("option");
          ((c.value = s.description), t.appendChild(c));
        }
      } catch (e) {
        (console.error("Autocomplete error", e), (t.innerHTML = ""));
      }
    }),
    o.addEventListener("keydown", (n) => {
      var e;
      n.key === "Enter" &&
        (n.preventDefault(),
        (e = document.getElementById("lookupBtn")) == null || e.click());
    }));
}
export { p as s };
