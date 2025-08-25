const y = "https://nftapi.cyberwiz.io",
  A = {
    "cyberwiz.io": "https://nftapi.cyberwiz.io",
    "calwep.org": "https://api.calwep.org",
  };
function b(e = window.location.hostname) {
  for (const [t, a] of Object.entries(A)) if (e.includes(t)) return a;
  return y;
}
const w = b();
console.log("Resolved API_BASE_URL:", w);
const E = new URLSearchParams(window.location.search).has("debug");
let p = null;
function P(...e) {
  E &&
    (console.log(...e),
    p ||
      ((p = document.createElement("pre")),
      (p.id = "debugLog"),
      document.body.appendChild(p)),
    (p.textContent +=
      e.map((t) => (typeof t == "string" ? t : JSON.stringify(t))).join(" ") +
      `
`));
}
async function v(e, t, a = {}) {
  var c, n, s;
  const r = performance.now();
  try {
    return await t();
  } catch (d) {
    throw (
      (c = window.Sentry) == null ||
        c.captureException(d, { extra: { name: e, ...a } }),
      d
    );
  } finally {
    const d = performance.now() - r;
    (P(e, { ...a, duration: d }),
      (s = (n = window.Sentry) == null ? void 0 : n.addBreadcrumb) == null ||
        s.call(n, {
          category: "async",
          message: e,
          data: { ...a, duration: d },
        }));
  }
}
function S(e, t = {}) {
  const r = `${w.replace(/\/$/, "")}${e.startsWith("/") ? e : "/" + e}`,
    c = new URL(r, window.location.origin);
  for (const [n, s] of Object.entries(t))
    s != null && String(s).length && c.searchParams.set(n, s);
  return c.toString();
}
async function I(e) {
  return (
    console.log("API request:", e),
    v(
      "fetchJsonWithDiagnostics",
      async () => {
        let t;
        try {
          t = await fetch(e, {
            method: "GET",
            mode: "cors",
            cache: "no-store",
            headers: { Accept: "application/json" },
          });
        } catch (r) {
          throw new Error(
            `Network error calling API: ${(r == null ? void 0 : r.message) || r}`,
          );
        }
        const a = await t.text().catch(() => "");
        if (!t.ok) {
          console.error("API error", t.status, a, "for", e);
          let r = `Request failed (HTTP ${t.status})`;
          throw (
            t.status === 400
              ? (r = "Bad request. Please check the input.")
              : t.status === 404
                ? (r = "Address not found. Please refine your search.")
                : t.status >= 500 &&
                  (r = "Server error. Please try again later."),
            new Error(r)
          );
        }
        try {
          return JSON.parse(a);
        } catch {
          throw new Error(
            `API 200 but response was not valid JSON for ${e} :: ${a.slice(0, 200)}…`,
          );
        }
      },
      { url: e },
    )
  );
}
function L() {
  const e = document.getElementById("autocomplete"),
    t = document.getElementById("autocomplete-list");
  if (!e || !t) return;
  const a = "/api/autocomplete";
  let r = null,
    c = [],
    n = -1;
  const s = (o = "") => {
      ((t.innerHTML = o),
        (t.style.display = o ? "block" : "none"),
        (c = []),
        (n = -1));
    },
    d = (o, i) => {
      const l = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        u = new RegExp(l, "gi");
      return o.replace(u, (g) => `<strong>${g}</strong>`);
    },
    m = (o, i) => {
      ((c = o),
        (t.innerHTML = o
          .map(
            (l, u) =>
              `<li class="autocomplete-item" data-index="${u}" role="option">${d(l.description, i)}</li>`,
          )
          .join("")),
        (t.style.display = "block"),
        f());
    },
    h = (o) => {
      const i = c[o];
      i && ((e.value = i.description), s(), e.focus());
    },
    f = () => {
      t.querySelectorAll(".autocomplete-item").forEach((i, l) => {
        i.classList.toggle("active", l === n);
      });
    };
  (e.addEventListener("input", () => {
    const o = e.value.trim();
    if ((clearTimeout(r), !o)) {
      s();
      return;
    }
    r = setTimeout(async () => {
      const i = S(a, { input: o });
      console.log("Autocomplete request:", i);
      try {
        const l = await fetch(i);
        let u = {};
        try {
          u = await l.json();
        } catch {}
        if ((console.log("Autocomplete response:", l.status, u), !l.ok))
          throw new Error(`HTTP ${l.status}`);
        if (u.error === "Missing input") {
          s('<li class="error">Input required.</li>');
          return;
        }
        if (u.error) throw new Error(u.error);
        const g = Array.isArray(u.predictions) ? u.predictions : [];
        if (!g.length) {
          s('<li class="no-suggestions">No suggestions found.</li>');
          return;
        }
        m(g, o);
      } catch (l) {
        (console.error("Autocomplete error", l),
          s('<li class="error">Unable to fetch suggestions.</li>'));
      }
    }, 300);
  }),
    t.addEventListener("mousedown", (o) => {
      const i = o.target.closest(".autocomplete-item");
      i && h(Number(i.dataset.index));
    }),
    e.addEventListener("keydown", (o) => {
      if (c.length)
        switch (o.key) {
          case "ArrowDown":
            (o.preventDefault(), (n = (n + 1) % c.length), f());
            break;
          case "ArrowUp":
            (o.preventDefault(), (n = (n - 1 + c.length) % c.length), f());
            break;
          case "Enter":
            n >= 0 && (o.preventDefault(), h(n));
            break;
          case "Escape":
            s();
            break;
        }
    }),
    e.addEventListener("blur", () => {
      setTimeout(() => s(), 100);
    }));
}
export { w as A, S as b, I as f, P as l, v as m, L as s };
