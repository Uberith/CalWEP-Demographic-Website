import { _ as Ht } from "./pdf.js";
import { l as Et, s as ye, f as et, b as ot, m as G } from "./maps.js";
import {
  r as Lt,
  a as ve,
  d as rt,
  s as D,
  n as we,
  f as be,
} from "./error.js";
var Gt;
const It =
  ((Gt = document.querySelector('meta[name="sentry-dsn"]')) == null
    ? void 0
    : Gt.content) || "";
It &&
  Ht(() => import("./index.js"), [])
    .then((t) => {
      ((window.Sentry = t), t.init({ dsn: It }), Et("Sentry initialized"));
    })
    .catch((t) => console.error("Sentry failed to load", t));
"serviceWorker" in navigator &&
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((t) => console.error("SW registration failed", t));
  });
window.addEventListener("error", (t) => {
  var s;
  (Et("window.onerror", t.message),
    (s = window.Sentry) == null ||
      s.captureException(t.error || new Error(t.message || "Unknown error")));
});
window.addEventListener("unhandledrejection", (t) => {
  var s;
  (Et("unhandledrejection", t.reason),
    (s = window.Sentry) == null || s.captureException(t.reason));
});
let J = null;
const ft = new Map(),
  gt = new Map(),
  yt = new Map(),
  vt = new Map(),
  wt = new Map(),
  bt = new Map(),
  At = new Map(),
  Ae = 2023,
  kt = `https://api.census.gov/data/${Ae}/acs/acs5`,
  Z = `${kt}/profile`;
function xt() {
  window.print();
}
window.printReport = xt;
function zt() {
  if (!J) return;
  const t = new Blob([JSON.stringify(J, null, 2)], {
      type: "application/json",
    }),
    s = URL.createObjectURL(t),
    i = document.createElement("a"),
    o = (J.address || "report").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  ((i.href = s),
    (i.download = `calwep_report_${o}.json`),
    document.body.appendChild(i),
    i.click(),
    document.body.removeChild(i),
    URL.revokeObjectURL(s));
}
window.downloadRawData = zt;
window.downloadPdf = async function () {
  const { downloadPdf: t } = await Ht(async () => {
    const { downloadPdf: s } = await import("./pdf.js").then((i) => i.p);
    return { downloadPdf: s };
  }, []);
  t(J);
};
function qt() {
  const t = window.location.href;
  navigator.clipboard && window.isSecureContext
    ? navigator.clipboard
        .writeText(t)
        .then(() => alert("Link copied to clipboard"))
        .catch(() => {
          prompt("Copy this link:", t);
        })
    : prompt("Copy this link:", t);
}
window.shareReport = qt;
function $e() {
  var t, s, i, o;
  ((t = document.getElementById("printBtn")) == null ||
    t.addEventListener("click", xt),
    (s = document.getElementById("pdfBtn")) == null ||
      s.addEventListener("click", window.downloadPdf),
    (i = document.getElementById("rawBtn")) == null ||
      i.addEventListener("click", zt),
    (o = document.getElementById("shareBtn")) == null ||
      o.addEventListener("click", qt));
}
function I(t) {
  const s = Number(t);
  return t == null || !Number.isFinite(s) || s === -888888888;
}
const st = "No data available";
function Se(t) {
  return !I(t) && Number.isFinite(Number(t)) ? Number(t).toLocaleString() : st;
}
function $t(t) {
  return I(t) || !Number.isFinite(Number(t))
    ? st
    : `$${Math.round(Number(t)).toLocaleString()}`;
}
function Bt(t) {
  return !I(t) && Number.isFinite(Number(t))
    ? Number(t).toLocaleString(void 0, { maximumFractionDigits: 1 })
    : st;
}
function k(t) {
  return !I(t) && Number.isFinite(Number(t)) ? `${Number(t).toFixed(1)}%` : st;
}
function nt(t = [], s = 50) {
  const i = [];
  for (let o = 0; o < t.length; o += s) i.push(t.slice(o, o + s));
  return i;
}
let at = null,
  X = null;
function Pe() {
  X = Date.now();
  const t = (s) => {
    const i = document.getElementById("searchTimer");
    i && (i.textContent = s);
    const o = document.getElementById("spinnerTime");
    o && (o.textContent = s);
  };
  (t("0m 00s"),
    (at = setInterval(() => {
      if (!X) return;
      const s = Date.now() - X,
        i = Math.floor((s / 1e3) % 60),
        o = Math.floor(s / 6e4);
      t(`${o}m ${i.toString().padStart(2, "0")}s`);
    }, 1e3)));
}
function Mt() {
  at && clearInterval(at);
  const t = X ? Date.now() - X : 0;
  return ((at = null), (X = null), t);
}
async function Ee(t = {}) {
  let {
    city: s,
    census_tract: i,
    lat: o,
    lon: c,
    state_fips: l,
    county_fips: e,
    tract_code: n,
  } = t;
  const u = [];
  return (
    !s &&
      o != null &&
      c != null &&
      u.push(
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${o}&longitude=${c}&localityLanguage=en`,
        )
          .then((p) => p.json())
          .then((p) => {
            var f, g;
            s =
              (Array.isArray(
                (f = p == null ? void 0 : p.localityInfo) == null
                  ? void 0
                  : f.administrative,
              )
                ? (g = p.localityInfo.administrative.find(
                    (m) => m.order === 8 || m.adminLevel === 8,
                  )) == null
                  ? void 0
                  : g.name
                : null) ||
              p.city ||
              p.locality ||
              s;
          })
          .catch(() => {}),
      ),
    (!i || !l || !e || !n) &&
      o != null &&
      c != null &&
      u.push(
        fetch(
          `https://geo.fcc.gov/api/census/block/find?latitude=${o}&longitude=${c}&format=json`,
        )
          .then((p) => p.json())
          .then((p) => {
            var f;
            const r =
              (f = p == null ? void 0 : p.Block) == null ? void 0 : f.FIPS;
            r &&
              r.length >= 11 &&
              ((l = r.slice(0, 2)),
              (e = r.slice(2, 5)),
              (n = r.slice(5, 11)),
              (i = `${n.slice(0, 4)}.${n.slice(4)}`));
          })
          .catch(() => {}),
      ),
    u.length && (await Promise.all(u)),
    {
      ...t,
      city: s,
      census_tract: i,
      state_fips: l,
      county_fips: e,
      tract_code: n,
    }
  );
}
let tt = null;
async function Vt() {
  if (tt) return tt;
  try {
    const t = await et(`${kt}/groups/C16001.json`),
      s = (t == null ? void 0 : t.variables) || {},
      i = [],
      o = {};
    for (const [c, l] of Object.entries(s)) {
      if (!c.endsWith("E")) continue;
      const e = l.label || "",
        n = /^Estimate!!Total:!!([^:]+):$/.exec(e);
      n && (i.push(c), (o[c] = n[1]));
    }
    tt = { codes: i, names: o };
  } catch {
    tt = { codes: [], names: {} };
  }
  return tt;
}
async function St(t = []) {
  var v, w;
  const s = [...new Set(t.map(String))].sort().join(",");
  if (vt.has(s)) return { ...vt.get(s) };
  const { codes: i, names: o } = await Vt();
  if (!i.length) return {};
  const c = {};
  for (const d of t) {
    const a = String(d)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (a.length !== 11) continue;
    const h = a.slice(0, 2),
      _ = a.slice(2, 5),
      b = a.slice(5),
      A = `${h}${_}`;
    (c[A] || (c[A] = { state: h, county: _, tracts: [] }), c[A].tracts.push(b));
  }
  let l = 0,
    e = 0,
    n = 0;
  const u = {},
    p = Object.values(c).map(async (d) => {
      const a = nt(d.tracts, 50),
        h = await Promise.all(
          a.map(async (b) => {
            const A = b.join(","),
              P = 40,
              S = [];
            for (let E = 0; E < i.length; E += P) {
              const N = i.slice(E, E + P),
                q = E === 0 ? ["C16001_001E", "C16001_002E", ...N] : N,
                B = `${kt}?get=${q.join(",")}&for=tract:${A}&in=state:${d.state}%20county:${d.county}`;
              S.push(
                fetch(B)
                  .then((U) => U.json())
                  .then((U) => ({ type: "lang", rows: U, chunk: N }))
                  .catch(() => null),
              );
            }
            const $ = `${Z}?get=DP02_0115E&for=tract:${A}&in=state:${d.state}%20county:${d.county}`;
            S.push(
              fetch($)
                .then((E) => E.json())
                .then((E) => ({ type: "english", rows: E }))
                .catch(() => null),
            );
            const C = await Promise.all(S);
            let F = 0,
              L = 0,
              H = 0;
            const V = {};
            for (const E of C) {
              if (!E || !Array.isArray(E.rows) || E.rows.length <= 1) continue;
              const { rows: N } = E;
              if (E.type === "lang") {
                const q = N[0];
                for (let B = 1; B < N.length; B++) {
                  const U = N[B],
                    W = {};
                  (q.forEach((x, j) => (W[x] = Number(U[j]))),
                    (F += W.C16001_001E || 0),
                    (L += W.C16001_002E || 0));
                  for (const x of E.chunk) {
                    const j = o[x],
                      ct = W[x] || 0;
                    j && (V[j] = (V[j] || 0) + ct);
                  }
                }
              } else if (E.type === "english") {
                const q = N[0];
                for (let B = 1; B < N.length; B++) {
                  const U = N[B],
                    W = {};
                  (q.forEach((x, j) => (W[x] = Number(U[j]))),
                    (H += W.DP02_0115E || 0));
                }
              }
            }
            return { total: F, englishOnly: L, englishLess: H, langCounts: V };
          }),
        ),
        _ = { total: 0, englishOnly: 0, englishLess: 0, langCounts: {} };
      for (const b of h) {
        ((_.total += b.total),
          (_.englishOnly += b.englishOnly),
          (_.englishLess += b.englishLess));
        for (const [A, P] of Object.entries(b.langCounts))
          _.langCounts[A] = (_.langCounts[A] || 0) + P;
      }
      return _;
    }),
    r = await Promise.all(p);
  for (const d of r) {
    ((l += d.total), (e += d.englishOnly), (n += d.englishLess));
    for (const [a, h] of Object.entries(d.langCounts)) u[a] = (u[a] || 0) + h;
  }
  u.English = e;
  const f = u.Spanish || 0,
    g = Object.entries(u).sort((d, a) => a[1] - d[1]),
    m = {
      primary_language: (v = g[0]) == null ? void 0 : v[0],
      secondary_language: (w = g[1]) == null ? void 0 : w[0],
      language_other_than_english_pct: l ? ((l - e) / l) * 100 : null,
      english_less_than_very_well_pct: l ? (n / l) * 100 : null,
      spanish_at_home_pct: l ? (f / l) * 100 : null,
    };
  return (vt.set(s, m), { ...m });
}
async function ke({ state_fips: t, county_fips: s, tract_code: i } = {}) {
  if (!t || !s || !i) return {};
  const o = `${t}${s}${i}`;
  return St([o]);
}
async function Ot(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (gt.has(s)) return { ...gt.get(s) };
  const i = {};
  for (const h of t) {
    const _ = String(h)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (_.length !== 11) continue;
    const b = _.slice(0, 2),
      A = _.slice(2, 5),
      P = _.slice(5),
      S = `${b}${A}`;
    (i[S] || (i[S] = { state: b, county: A, tracts: [] }), i[S].tracts.push(P));
  }
  let o = 0,
    c = 0,
    l = 0,
    e = 0,
    n = 0,
    u = 0,
    p = 0,
    r = 0,
    f = 0,
    g = 0,
    m = 0,
    v = 0,
    w = 0,
    d = 0;
  for (const h of Object.values(i)) {
    const _ = nt(h.tracts, 50);
    for (const b of _) {
      const A = `${Z}?get=${["DP05_0001E", "DP05_0018E", "DP03_0062E", "DP03_0088E", "DP03_0128PE", "DP05_0037PE", "DP05_0038PE", "DP05_0039PE", "DP05_0044PE", "DP05_0052PE", "DP05_0057PE", "DP05_0035PE", "DP05_0073PE", "DP05_0078PE"].join(",")}&for=tract:${b.join(",")}&in=state:${h.state}%20county:${h.county}`;
      try {
        const P = await fetch(A).then((S) => S.json());
        if (!Array.isArray(P) || P.length < 2) continue;
        for (let S = 1; S < P.length; S++) {
          const [$, C, F, L, H, V, E, N, q, B, U, W, x, j] = P[S].map(Number);
          Number.isFinite($) &&
            $ > 0 &&
            ((o += $),
            Number.isFinite(C) && (c += C * $),
            Number.isFinite(F) && (l += F * $),
            Number.isFinite(L) && (e += L * $),
            Number.isFinite(H) && H >= 0 && (n += (H / 100) * $),
            Number.isFinite(V) && (u += (V / 100) * $),
            Number.isFinite(E) && (p += (E / 100) * $),
            Number.isFinite(N) && (r += (N / 100) * $),
            Number.isFinite(q) && (f += (q / 100) * $),
            Number.isFinite(B) && (g += (B / 100) * $),
            Number.isFinite(U) && (m += (U / 100) * $),
            Number.isFinite(W) && (v += (W / 100) * $),
            Number.isFinite(x) && (w += (x / 100) * $),
            Number.isFinite(j) && (d += (j / 100) * $));
        }
      } catch {}
    }
  }
  const a = {};
  if (o > 0) {
    ((a.population = o),
      c > 0 && (a.median_age = c / o),
      l > 0 && (a.median_household_income = l / o),
      e > 0 && (a.per_capita_income = e / o),
      n > 0 && (a.poverty_rate = (n / o) * 100),
      u > 0 && (a.white_pct = (u / o) * 100),
      p > 0 && (a.black_pct = (p / o) * 100),
      r > 0 && (a.native_pct = (r / o) * 100),
      f > 0 && (a.asian_pct = (f / o) * 100),
      g > 0 && (a.pacific_pct = (g / o) * 100),
      m > 0 && (a.other_race_pct = (m / o) * 100),
      v > 0 && (a.two_or_more_races_pct = (v / o) * 100));
    const h = w + d;
    h > 0 &&
      ((a.hispanic_pct = (w / h) * 100), (a.not_hispanic_pct = (d / h) * 100));
  }
  return (gt.set(s, a), { ...a });
}
async function Ut(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (yt.has(s)) return { ...yt.get(s) };
  const i = {};
  for (const g of t) {
    const m = String(g)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (m.length !== 11) continue;
    const v = m.slice(0, 2),
      w = m.slice(2, 5),
      d = m.slice(5),
      a = `${v}${w}`;
    (i[a] || (i[a] = { state: v, county: w, tracts: [] }), i[a].tracts.push(d));
  }
  let o = 0,
    c = 0,
    l = 0,
    e = 0,
    n = 0,
    u = 0,
    p = 0;
  for (const g of Object.values(i)) {
    const m = nt(g.tracts, 50);
    for (const v of m) {
      const w = `${Z}?get=${["DP04_0045E", "DP04_0046E", "DP04_0047E", "DP04_0089E", "DP02_0059E", "DP02_0067E", "DP02_0068E"].join(",")}&for=tract:${v.join(",")}&in=state:${g.state}%20county:${g.county}`;
      try {
        const d = await fetch(w).then((a) => a.json());
        if (!Array.isArray(d) || d.length < 2) continue;
        for (let a = 1; a < d.length; a++) {
          const [h, _, b, A, P, S, $] = d[a].slice(0, 7).map(Number);
          (Number.isFinite(h) && h > 0 && (o += h),
            Number.isFinite(_) &&
              _ > 0 &&
              ((c += _), Number.isFinite(A) && A > 0 && (e += A * _)),
            Number.isFinite(b) && b > 0 && (l += b),
            Number.isFinite(P) &&
              P > 0 &&
              ((n += P),
              Number.isFinite(S) && S > 0 && (u += S),
              Number.isFinite($) && $ > 0 && (p += $)));
        }
      } catch {}
    }
  }
  const r = {},
    f = c + l;
  return (
    f > 0 &&
      ((r.owner_occupied_pct = (c / f) * 100),
      (r.renter_occupied_pct = (l / f) * 100)),
    c > 0 && e > 0 && (r.median_home_value = e / c),
    n > 0 &&
      ((r.high_school_or_higher_pct = (u / n) * 100),
      (r.bachelors_or_higher_pct = (p / n) * 100)),
    yt.set(s, r),
    { ...r }
  );
}
async function Ce(t = []) {
  const s = {};
  for (const o of t) {
    const c = String(o)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (c.length !== 11) continue;
    const l = c.slice(0, 2),
      e = c.slice(2, 5),
      n = c.slice(5),
      u = `${l}${e}`;
    (s[u] || (s[u] = { state: l, county: e, tracts: [] }), s[u].tracts.push(n));
  }
  const i = {};
  for (const o of Object.values(s)) {
    const c = nt(o.tracts, 50);
    for (const l of c) {
      const e = `${Z}?get=${["DP05_0001E", "DP05_0018E", "DP03_0062E", "DP03_0088E", "DP03_0128PE", "DP03_0009PE", "DP05_0037PE", "DP05_0038PE", "DP05_0039PE", "DP05_0044PE", "DP05_0052PE", "DP05_0057PE", "DP05_0035PE", "DP05_0073PE", "DP05_0078PE"].join(",")}&for=tract:${l.join(",")}&in=state:${o.state}%20county:${o.county}`;
      try {
        const n = await fetch(e).then((u) => u.json());
        if (!Array.isArray(n) || n.length < 2) continue;
        for (let u = 1; u < n.length; u++) {
          const [p, r, f, g, m, v, w, d, a, h, _, b, A, P, S, $, C, F] = n[u],
            L = `${$}${C}${F}`;
          i[L] = {
            population: Number(p),
            median_age: Number(r),
            median_household_income: Number(f),
            per_capita_income: Number(g),
            poverty_rate: Number(m),
            unemployment_rate: Number(v),
            white_pct: Number(w),
            black_pct: Number(d),
            native_pct: Number(a),
            asian_pct: Number(h),
            pacific_pct: Number(_),
            other_race_pct: Number(b),
            two_or_more_races_pct: Number(A),
            hispanic_pct: Number(P),
            not_hispanic_pct: Number(S),
          };
        }
      } catch {}
    }
  }
  return i;
}
async function Ct(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (wt.has(s)) return { ...wt.get(s) };
  const i = {};
  for (const c of t) {
    const l = String(c)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (l.length !== 11) continue;
    const e = l.slice(0, 2),
      n = l.slice(2, 5),
      u = l.slice(5),
      p = `${e}${n}`;
    (i[p] || (i[p] = { state: e, county: n, tracts: [] }), i[p].tracts.push(u));
  }
  const o = {};
  for (const c of Object.values(i)) {
    const l = nt(c.tracts, 50);
    for (const e of l) {
      const n =
        `${Z}?get=DP03_0009PE,DP05_0001E&for=tract:` +
        e.join(",") +
        `&in=state:${c.state}%20county:${c.county}`;
      try {
        const u = await fetch(n).then((p) => p.json());
        if (!Array.isArray(u) || u.length < 2) continue;
        for (let p = 1; p < u.length; p++) {
          const [r, f, g, m, v] = u[p],
            w = `${g}${m}${v}`;
          o[w] = { unemployment_rate: Number(r), population: Number(f) };
        }
      } catch {}
    }
  }
  return (wt.set(s, o), { ...o });
}
async function Yt(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (bt.has(s)) return [...bt.get(s)];
  const i =
      "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query",
    o = new Set(),
    c = 50;
  for (let e = 0; e < t.length; e += c) {
    const n = t.slice(e, e + c);
    if (!n.length) continue;
    const u = `GEOID20 IN (${n.map((r) => `'${r}'`).join(",")})`,
      p =
        i +
        `?where=${encodeURIComponent(u)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    try {
      const r = await fetch(p).then((f) => f.json());
      for (const f of r.features || []) {
        const g = f.attributes || {},
          m = String(g.GEOID20);
        String(g.DAC20 || "").toUpperCase() === "Y" && o.add(m);
      }
    } catch {}
  }
  const l = Array.from(o);
  return (bt.set(s, l), [...l]);
}
async function Wt(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (At.has(s)) return [...At.get(s)];
  const i = new Set();
  await Promise.all(
    t.map(async (c) => {
      try {
        const l = ot("/lookup", { fips: c, census_tract: c, geoid: c }),
          e = await et(l);
        Array.isArray(e.environmental_hardships) &&
          e.environmental_hardships.forEach((n) => i.add(n));
      } catch {}
    }),
  );
  const o = Array.from(i).sort();
  return (At.set(s, o), [...o]);
}
async function Ne(t = {}) {
  const { state_fips: s, county_fips: i, tract_code: o } = t || {},
    c = s && i && o ? `${s}${i}${o}` : null;
  if (
    !(
      c &&
      [
        "population",
        "median_age",
        "median_household_income",
        "per_capita_income",
        "poverty_rate",
        "unemployment_rate",
        "white_pct",
        "black_pct",
        "native_pct",
        "asian_pct",
        "pacific_pct",
        "other_race_pct",
        "two_or_more_races_pct",
        "hispanic_pct",
        "not_hispanic_pct",
      ].some((r) => I(t[r]))
    )
  )
    return t;
  const u = (await Ce([c]))[c];
  if (!u) return t;
  const p = { ...t };
  p.demographics = { ...p.demographics, ...u };
  for (const [r, f] of Object.entries(u)) I(p[r]) && (p[r] = f);
  return p;
}
async function De(t = {}) {
  var n, u;
  const { surrounding_10_mile: s, water_district: i } = t || {},
    o = { ...t },
    c = s || {};
  if (Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length) {
    const p = await Ot(c.census_tracts_fips),
      r = c.demographics || {};
    o.surrounding_10_mile = { ...c, demographics: { ...r, ...p } };
  }
  const l = i || {},
    e = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (e.length) {
    const p = await Ot(e),
      r = l.demographics || {},
      f =
        (u = (n = o.surrounding_10_mile) == null ? void 0 : n.demographics) ==
        null
          ? void 0
          : u.median_household_income,
      g = { ...r, ...p };
    (f != null &&
      (!Number.isFinite(g.median_household_income) ||
        g.median_household_income < 0) &&
      (g.median_household_income = f),
      (o.water_district = { ...l, demographics: g }));
  }
  return o;
}
async function Fe(t = {}) {
  var n, u;
  const { surrounding_10_mile: s, water_district: i } = t || {},
    o = { ...t },
    c = s || {};
  if (Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length) {
    const p = c.demographics || {};
    if (
      [
        p.owner_occupied_pct,
        p.renter_occupied_pct,
        p.median_home_value,
        p.high_school_or_higher_pct,
        p.bachelors_or_higher_pct,
      ].some((f) => I(f) || (typeof f == "number" && f < 0))
    ) {
      const f = await Ut(c.census_tracts_fips);
      o.surrounding_10_mile = { ...c, demographics: { ...p, ...f } };
    }
  }
  const l = i || {},
    e = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (e.length) {
    const p = l.demographics || {};
    if (
      [
        p.owner_occupied_pct,
        p.renter_occupied_pct,
        p.median_home_value,
        p.high_school_or_higher_pct,
        p.bachelors_or_higher_pct,
      ].some((f) => I(f) || (typeof f == "number" && f < 0))
    ) {
      const f = await Ut(e);
      let g = { ...p, ...f };
      const m =
        (u = (n = o.surrounding_10_mile) == null ? void 0 : n.demographics) ==
        null
          ? void 0
          : u.median_home_value;
      (m != null &&
        (!Number.isFinite(g.median_home_value) || g.median_home_value < 0) &&
        (g.median_home_value = m),
        (o.water_district = { ...l, demographics: g }));
    }
  }
  return o;
}
async function Re(t = {}) {
  const {
      state_fips: s,
      county_fips: i,
      tract_code: o,
      unemployment_rate: c,
      surrounding_10_mile: l,
      water_district: e,
    } = t || {},
    n = l || {},
    u = e || {},
    p = [],
    r = s && i && o ? `${s}${i}${o}` : null;
  I(c) && r && p.push(r);
  const f = Array.isArray(n.census_tracts_fips) ? n.census_tracts_fips : [];
  n.demographics &&
    I(n.demographics.unemployment_rate) &&
    f.length &&
    p.push(...f);
  const g = Array.isArray(u.census_tracts_fips)
    ? u.census_tracts_fips.map(String)
    : [];
  u.demographics &&
    I(u.demographics.unemployment_rate) &&
    g.length &&
    p.push(...g);
  const m = Array.from(new Set(p));
  if (!m.length) return t;
  const v = await Ct(m),
    w = { ...t };
  if (
    (I(c) && r && v[r] && (w.unemployment_rate = v[r].unemployment_rate),
    n.demographics && I(n.demographics.unemployment_rate) && f.length)
  ) {
    let d = 0,
      a = 0;
    for (const h of f) {
      const _ = v[h];
      _ &&
        Number.isFinite(_.unemployment_rate) &&
        Number.isFinite(_.population) &&
        ((d += _.population), (a += _.unemployment_rate * _.population));
    }
    d > 0 &&
      (w.surrounding_10_mile = {
        ...n,
        demographics: { ...n.demographics, unemployment_rate: a / d },
      });
  }
  if (u.demographics && I(u.demographics.unemployment_rate) && g.length) {
    let d = 0,
      a = 0;
    for (const h of g) {
      const _ = v[h];
      _ &&
        Number.isFinite(_.unemployment_rate) &&
        Number.isFinite(_.population) &&
        ((d += _.population), (a += _.unemployment_rate * _.population));
    }
    d > 0 &&
      (w.water_district = {
        ...u,
        demographics: { ...u.demographics, unemployment_rate: a / d },
      });
  }
  return w;
}
async function Te(t = {}) {
  const { surrounding_10_mile: s, water_district: i } = t || {},
    o = { ...t },
    c = s || {};
  if (Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length) {
    const n = await St(c.census_tracts_fips),
      u = c.demographics || {};
    o.surrounding_10_mile = { ...c, demographics: { ...u, ...n } };
  }
  const l = i || {},
    e = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (e.length) {
    const n = await St(e),
      u = l.demographics || {};
    o.water_district = { ...l, demographics: { ...u, ...n } };
  }
  return o;
}
async function Le(t = {}) {
  const { surrounding_10_mile: s, water_district: i } = t || {},
    o = { ...t },
    c = s || {},
    l =
      Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length
        ? c.census_tracts_fips
        : Array.isArray(c.census_tracts)
          ? c.census_tracts
          : [];
  if (
    (!Array.isArray(c.environmental_hardships) ||
      !c.environmental_hardships.length) &&
    l.length
  ) {
    const u = await Wt(l);
    o.surrounding_10_mile = { ...c, environmental_hardships: u };
  }
  const e = i || {},
    n = Array.isArray(e.census_tracts_fips)
      ? e.census_tracts_fips.map(String)
      : [];
  if (
    (!Array.isArray(e.environmental_hardships) ||
      !e.environmental_hardships.length) &&
    n.length
  ) {
    const u = await Wt(n);
    o.water_district = { ...e, environmental_hardships: u };
  }
  return o;
}
async function Ie(t = {}) {
  const { lat: s, lon: i, census_tract: o, surrounding_10_mile: c } = t || {};
  if (s == null || i == null) return t;
  const l = 1609.34 * 10,
    e = { ...(c || {}) },
    n = [];
  if (!Array.isArray(e.cities) || !e.cities.length) {
    const m = `[out:json];(node[place=city](around:${l},${s},${i});node[place=town](around:${l},${s},${i}););out;`,
      v =
        "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(m);
    n.push(
      fetch(v)
        .then((w) => w.json())
        .then((w) => {
          const d = (w.elements || [])
            .map((a) => {
              var h;
              return (h = a.tags) == null ? void 0 : h.name;
            })
            .filter(Boolean);
          e.cities = Array.from(new Set(d)).slice(0, 10);
        })
        .catch(() => {}),
    );
  }
  const u = Array.isArray(e.census_tracts) ? e.census_tracts.map(String) : [],
    p = Array.isArray(e.census_tracts_fips)
      ? e.census_tracts_fips.map(String)
      : [],
    r = { ...(e.census_tract_map || {}) },
    f = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query?where=1=1&geometry=${i},${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${l}&units=esriSRUnit_Meter&outFields=NAME,GEOID&f=json`;
  (n.push(
    fetch(f)
      .then((m) => m.json())
      .then((m) => {
        const v = m.features || [],
          w = [],
          d = [],
          a = {};
        for (const h of v) {
          const _ = h.attributes || {};
          let b = null;
          if (
            (_.NAME &&
              ((b = _.NAME.replace(/^Census Tract\s+/i, "")), w.push(b)),
            _.GEOID)
          ) {
            const A = String(_.GEOID);
            (d.push(A), b && (a[A] = b));
          }
        }
        ((e.census_tracts = Array.from(new Set([...u, ...w]))),
          (e.census_tracts_fips = Array.from(new Set([...p, ...d]))),
          (e.census_tract_map = { ...r, ...a }));
      })
      .catch(() => {}),
  ),
    n.length && (await Promise.all(n)),
    Array.isArray(e.cities) || (e.cities = []));
  const g = new Set(Array.isArray(e.census_tracts) ? e.census_tracts : []);
  if (
    (o && g.add(String(o)),
    (e.census_tracts = Array.from(g)),
    Array.isArray(e.census_tracts_fips))
  ) {
    const m = new Set(e.census_tracts_fips),
      { state_fips: v, county_fips: w, tract_code: d } = t || {};
    (v && w && d && m.add(`${v}${w}${d}`),
      (e.census_tracts_fips = Array.from(m)));
  }
  if (Array.isArray(e.census_tracts_fips) && e.census_tracts_fips.length)
    try {
      const m = await Yt(e.census_tracts_fips),
        v = [];
      for (const w of m) {
        const d = (e.census_tract_map && e.census_tract_map[w]) || w;
        v.push(d);
      }
      if (((e.dac_tracts = v), (e.dac_tracts_fips = m), v.length)) {
        const w = new Set([...(e.census_tracts || []), ...v]);
        e.census_tracts = Array.from(w);
      }
    } catch {}
  if (Array.isArray(e.census_tracts_fips) && e.census_tracts_fips.length)
    try {
      const m = await Ct(e.census_tracts_fips);
      let v = 0,
        w = 0;
      const d = new Set(e.dac_tracts_fips || []);
      for (const a of e.census_tracts_fips) {
        const h = m[a];
        h &&
          Number.isFinite(h.population) &&
          ((v += h.population), d.has(String(a)) && (w += h.population));
      }
      (v > 0 && (e.dac_population_pct = (w / v) * 100),
        e.census_tracts_fips.length > 0 &&
          (e.dac_tracts_pct = (d.size / e.census_tracts_fips.length) * 100));
    } catch {}
  return { ...t, surrounding_10_mile: e };
}
async function Be(t = {}, s = "") {
  var v, w;
  const {
    lat: i,
    lon: o,
    city: c,
    census_tract: l,
    state_fips: e,
    county_fips: n,
    tract_code: u,
    water_district: p,
  } = t || {};
  if (i == null || o == null) return t;
  const r = { ...p },
    f = [];
  if (s) {
    const d = ot("/lookup", { address: s });
    f.push(
      et(d)
        .then((a) => {
          var _, b, A, P;
          r.name =
            ((_ = a == null ? void 0 : a.agency) == null
              ? void 0
              : _.agency_name) ||
            ((b = a == null ? void 0 : a.agency) == null ? void 0 : b.name) ||
            (a == null ? void 0 : a.agency_name) ||
            (a == null ? void 0 : a.name) ||
            r.name;
          const h =
            ((A = a == null ? void 0 : a.agency) == null
              ? void 0
              : A.service_area_tracts) ||
            (a == null ? void 0 : a.service_area_tracts) ||
            (a == null ? void 0 : a.census_tracts) ||
            ((P = a == null ? void 0 : a.agency) == null
              ? void 0
              : P.census_tracts);
          if (typeof h == "string") {
            const S = h.split(/\s*,\s*/).filter(Boolean);
            r.census_tracts = S;
            const $ = S.filter((C) => /^\d{11}$/.test(C));
            $.length && (r.census_tracts_fips = $);
          } else if (Array.isArray(h)) {
            const S = [...new Set(h.map(String))];
            r.census_tracts = S;
            const $ = S.filter((C) => /^\d{11}$/.test(C));
            $.length &&
              (r.census_tracts_fips = [
                ...new Set([...(r.census_tracts_fips || []), ...$]),
              ]);
          }
        })
        .catch(() => {}),
    );
  }
  if (!r.name) {
    const d = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${o}%2C${i}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=false&f=json`;
    f.push(
      fetch(d)
        .then((a) => a.json())
        .then((a) => {
          var h, _, b;
          r.name =
            ((b =
              (_ =
                (h = a == null ? void 0 : a.features) == null
                  ? void 0
                  : h[0]) == null
                ? void 0
                : _.attributes) == null
              ? void 0
              : b.PWS_NAME) || r.name;
        })
        .catch(() => {}),
    );
  }
  if (
    ((!Array.isArray(r.cities) || !r.cities.length) && c && (r.cities = [c]),
    f.length && (await Promise.all(f)),
    r.name && (!Array.isArray(r.census_tracts) || !r.census_tracts.length))
  )
    try {
      const d = ot("/census-tracts", { agency_name: r.name }),
        a = await et(d),
        h = a == null ? void 0 : a.census_tracts;
      Array.isArray(h) && (r.census_tracts = [...new Set(h.map(String))]);
    } catch {}
  try {
    const d = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${o}%2C${i}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`,
      a = await fetch(d).then((_) => _.json()),
      h =
        (w = (v = a == null ? void 0 : a.features) == null ? void 0 : v[0]) ==
        null
          ? void 0
          : w.geometry;
    if (h) {
      const _ =
          "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query",
        b = new URLSearchParams({
          where: "1=1",
          geometry: JSON.stringify(h),
          geometryType: "esriGeometryPolygon",
          inSR: "4326",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "NAME,GEOID",
          returnGeometry: "false",
          f: "json",
        });
      let A;
      try {
        A = await fetch(_, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: b.toString(),
        }).then((C) => C.json());
      } catch {
        const C = `${_}?${b.toString()}`;
        A = await fetch(C).then((F) => F.json());
      }
      const P = [],
        S = [],
        $ = {};
      for (const C of A.features || []) {
        const F = C.attributes || {};
        let L = null;
        if (
          (F.NAME && ((L = F.NAME.replace(/^Census Tract\s+/i, "")), P.push(L)),
          F.GEOID)
        ) {
          const H = String(F.GEOID);
          (S.push(H), L && ($[H] = L));
        }
      }
      if (P.length || S.length) {
        const C = Array.isArray(r.census_tracts)
            ? r.census_tracts.map(String)
            : [],
          F = Array.isArray(r.census_tracts_fips)
            ? r.census_tracts_fips.map(String)
            : [],
          L = r.census_tract_map || {};
        (P.length && (r.census_tracts = [...new Set([...C, ...P])]),
          S.length && (r.census_tracts_fips = [...new Set([...F, ...S])]),
          Object.keys($).length && (r.census_tract_map = { ...L, ...$ }));
      }
    }
  } catch {}
  let g = [];
  (Array.isArray(r.census_tracts)
    ? (g = r.census_tracts.map(String))
    : typeof r.census_tracts == "string" &&
      (g = r.census_tracts.split(/\s*,\s*/).filter(Boolean)),
    l && g.unshift(String(l)),
    (r.census_tracts = [...new Set(g)]));
  let m = Array.isArray(r.census_tracts_fips)
    ? r.census_tracts_fips.map(String)
    : [];
  for (const d of r.census_tracts)
    if (/^\d{11}$/.test(d)) m.push(d);
    else if (e && n) {
      const a = String(d).replace(/[^0-9]/g, "");
      if (a) {
        const h = a.padStart(6, "0").slice(-6);
        m.push(`${e}${n}${h}`);
      }
    }
  if (
    (e && n && u && m.unshift(`${e}${n}${u}`),
    (r.census_tracts_fips = [...new Set(m)]),
    Array.isArray(r.census_tracts_fips) && r.census_tracts_fips.length)
  )
    try {
      const d = await Yt(r.census_tracts_fips),
        a = [];
      for (const h of d) {
        const _ = (r.census_tract_map && r.census_tract_map[h]) || h;
        a.push(_);
      }
      if (((r.dac_tracts = a), (r.dac_tracts_fips = d), a.length)) {
        const h = new Set([...(r.census_tracts || []), ...a]);
        r.census_tracts = Array.from(h);
      }
    } catch {}
  if (Array.isArray(r.census_tracts_fips) && r.census_tracts_fips.length)
    try {
      const d = await Ct(r.census_tracts_fips);
      let a = 0,
        h = 0;
      const _ = new Set(r.dac_tracts_fips || []);
      for (const b of r.census_tracts_fips) {
        const A = d[b];
        A &&
          Number.isFinite(A.population) &&
          ((a += A.population), _.has(String(b)) && (h += A.population));
      }
      (a > 0 && (r.dac_population_pct = (h / a) * 100),
        r.census_tracts_fips.length > 0 &&
          (r.dac_tracts_pct = (_.size / r.census_tracts_fips.length) * 100));
    } catch {}
  return (
    (r.environment = {
      percentile: 48.5,
      overall_percentiles: {
        pollution_burden: 37.2,
        population_characteristics: 56.5,
      },
      exposures: {
        ozone: 98.8,
        pm25: 34,
        diesel: 24.2,
        toxic_releases: 32.7,
        traffic: 12.3,
        pesticides: 22.7,
        drinking_water: 61.8,
        lead: 49.1,
      },
      environmental_effects: {
        cleanup_sites: 25.2,
        groundwater_threats: 20.4,
        hazardous_waste: 27.8,
        impaired_waters: 23,
        solid_waste: 45.7,
      },
      sensitive_populations: {
        asthma: 58.9,
        low_birth_weight: 52.8,
        cardiovascular_disease: 81.6,
      },
      socioeconomic_factors: {
        education: 45.5,
        linguistic_isolation: 17,
        poverty: 54.5,
        unemployment: 63.2,
        housing_burden: 38.8,
      },
    }),
    { ...t, water_district: r }
  );
}
async function Me(t = {}) {
  var c, l;
  const { lat: s, lon: i, english_less_than_very_well_pct: o } = t || {};
  if (!I(o) || s == null || i == null) return t;
  try {
    const e = await fetch(
        `https://geo.fcc.gov/api/census/block/find?latitude=${s}&longitude=${i}&format=json`,
      ).then((u) => u.json()),
      n = (c = e == null ? void 0 : e.Block) == null ? void 0 : c.FIPS;
    if (n && n.length >= 11) {
      const u = n.slice(0, 2),
        p = n.slice(2, 5),
        r = n.slice(5, 11),
        f = `${Z}?get=DP02_0111PE&for=tract:${r}&in=state:${u}+county:${p}`,
        g = await fetch(f).then((w) => w.json()),
        m = (l = g == null ? void 0 : g[1]) == null ? void 0 : l[0],
        v = Number(m);
      if (Number.isFinite(v) && v >= 0)
        return { ...t, english_less_than_very_well_pct: v };
    }
  } catch {}
  return t;
}
async function Oe(t = {}) {
  const { lat: s, lon: i } = t || {};
  if (s == null || i == null) return { ...t, alerts: [] };
  try {
    const o = `https://api.weather.gov/alerts/active?point=${s},${i}`,
      c = await fetch(o, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "CalWEP-Demographic-Website (info@calwep.org)",
        },
      });
    if (!c.ok) throw new Error("NWS response not ok");
    const l = await c.json(),
      e = Array.isArray(l == null ? void 0 : l.features)
        ? l.features
            .map((n) => {
              var u;
              return (u = n == null ? void 0 : n.properties) == null
                ? void 0
                : u.headline;
            })
            .filter(Boolean)
        : [];
    return { ...t, alerts: e };
  } catch {
    return { ...t, alerts: [] };
  }
}
function Y(t, s, i, o, c = "") {
  const l = (e) => (e && String(e).trim() ? e : `<p class="note">${st}</p>`);
  return `
    <section class="section-block">
      <h3 class="section-header">${D(t)}</h3>
      ${c}
      <div class="comparison-grid" role="table" aria-label="${D(t)}">
        <div class="col local" role="cell" aria-label="Census tract">${l(s)}</div>
        <div class="col surrounding" role="cell" aria-label="10-mile radius">${l(i)}</div>
        <div class="col district" role="cell" aria-label="Water district">${l(o)}</div>
      </div>
    </section>
  `;
}
function jt(t, s, i) {
  const {
      city: o,
      zip: c,
      county: l,
      census_tract: e,
      lat: n,
      lon: u,
      english_less_than_very_well_pct: p,
      language_other_than_english_pct: r,
      spanish_at_home_pct: f,
      languages: g,
      demographics: m = {},
      dac_status: v,
      environmental_hardships: w,
      white_pct: d,
      black_pct: a,
      native_pct: h,
      asian_pct: _,
      pacific_pct: b,
      other_race_pct: A,
      two_or_more_races_pct: P,
      hispanic_pct: S,
      not_hispanic_pct: $,
      owner_occupied_pct: C,
      renter_occupied_pct: F,
      median_home_value: L,
      high_school_or_higher_pct: H,
      bachelors_or_higher_pct: V,
      alerts: E,
      enviroscreen: N,
      surrounding_10_mile: q,
      water_district: B,
    } = s || {},
    U = s.population ?? m.population,
    W = s.median_age ?? m.median_age,
    x =
      s.median_income ??
      s.median_household_income ??
      m.median_income ??
      m.median_household_income,
    j = s.per_capita_income ?? m.per_capita_income,
    ct = s.poverty_rate ?? m.poverty_rate,
    Jt = s.unemployment_rate ?? m.unemployment_rate,
    Xt = Array.isArray(g) && g.length ? g : m.languages,
    Zt = s.enviroscreen_score ?? (N == null ? void 0 : N.score),
    Kt = s.enviroscreen_percentile ?? (N == null ? void 0 : N.percentile),
    Nt = Array.isArray(w) ? Array.from(new Set(w)) : [],
    Dt = Array.isArray(E) ? E : [],
    Qt =
      n != null && u != null
        ? `${Number(n).toFixed(6)}, ${Number(u).toFixed(6)}`
        : "—";
  let Ft = "";
  if (n != null && u != null) {
    const y = new URL("/api/staticmap", window.location.origin);
    (y.searchParams.set("lat", n),
      y.searchParams.set("lon", u),
      (Ft = `<img class="map-image" src="${y}" alt="Map of location" />`));
  }
  const T = q || {},
    R = B || {},
    Rt = Array.isArray(T.environmental_hardships)
      ? Array.from(new Set(T.environmental_hardships))
      : [],
    Tt = Array.isArray(R.environmental_hardships)
      ? Array.from(new Set(R.environmental_hardships))
      : [],
    te = Array.isArray(T.census_tracts)
      ? T.census_tracts.join(", ")
      : D(T.census_tracts) || "—",
    ee = Array.isArray(T.cities) ? T.cities.join(", ") : D(T.cities) || "—",
    se = Array.isArray(R.census_tracts)
      ? R.census_tracts.join(", ")
      : D(R.census_tracts) || "—",
    ne = Array.isArray(R.cities) ? R.cities.join(", ") : D(R.cities) || "—",
    ie = `
    <div class="kv">
      <div class="key">City</div><div class="val">${D(o) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${D(e) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${D(c) || "—"}</div>
      <div class="key">County</div><div class="val">${D(l) || "—"}</div>
      <div class="key">Coordinates</div><div class="val">${Qt}</div>
    </div>
    ${Ft}
  `,
    re = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${ee}</div>
      <div class="key">Census tracts</div><div class="val">${te}</div>
    </div>
  `,
    ae = `
    <div class="kv">
      <div class="key">District</div><div class="val">${D(R.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${ne}</div>
      <div class="key">Census tracts</div><div class="val">${se}</div>
    </div>
  `,
    oe = Y(
      "Location Summary",
      ie,
      re,
      ae,
      '<p class="section-description">This section lists basic geographic information for the census tract, surrounding 10&#8209;mile area, and water district, such as city, ZIP code, county, and coordinates.</p>',
    ),
    lt = (y = {}) =>
      `<div class="kv">${[
        ["Total population", Se(y.population)],
        ["Median age", Bt(y.median_age)],
        [
          "Median household income",
          $t(y.median_income ?? y.median_household_income),
        ],
        ["Per capita income", $t(y.per_capita_income)],
        ["Poverty rate", k(y.poverty_rate)],
        ["Unemployment rate", k(y.unemployment_rate)],
      ]
        .map(
          ([M, O]) => `<div class="key">${M}</div><div class="val">${O}</div>`,
        )
        .join("")}</div>`,
    ce = Y(
      "Population &amp; Income (ACS)",
      lt({
        population: U,
        median_age: W,
        median_income: x,
        per_capita_income: j,
        poverty_rate: ct,
        unemployment_rate: Jt,
      }),
      lt(T.demographics || {}),
      lt(R.demographics || {}),
      '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    ut = (y = {}) =>
      `<div class="kv">${[
        [
          "Languages spoken",
          Array.isArray(y.languages) && y.languages.length
            ? y.languages.map((O) => D(O)).join(", ")
            : "Not available",
        ],
        [
          "People who speak a language other than English at home",
          k(y.language_other_than_english_pct),
        ],
        [
          'People who speak English less than "very well"',
          k(y.english_less_than_very_well_pct),
        ],
        ["People who speak Spanish at home", k(y.spanish_at_home_pct)],
      ]
        .map(
          ([O, K]) => `<div class="key">${O}</div><div class="val">${K}</div>`,
        )
        .join("")}</div>`,
    le = Y(
      "Language (ACS)",
      ut({
        languages: Xt,
        language_other_than_english_pct: r,
        english_less_than_very_well_pct: p,
        spanish_at_home_pct: f,
      }),
      ut(T.demographics || {}),
      ut(R.demographics || {}),
      '<p class="section-description">This section highlights the languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    pt = (y = {}) => {
      const z = y.enviroscreen_score ?? y.score,
        M = y.enviroscreen_percentile ?? y.percentile,
        O = Number.isFinite(Number(M)) && Number(M) <= 1 ? Number(M) * 100 : M;
      return `<div class="kv">${[
        ["Score", Bt(z)],
        ["Percentile", k(O)],
      ]
        .map(
          ([mt, Q]) =>
            `<div class="key">${mt}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`;
    },
    ue = Y(
      "EnviroScreen (CalEnviroScreen 4.0)",
      pt({ enviroscreen_score: Zt, enviroscreen_percentile: Kt }),
      pt(T.environment || {}),
      pt(R.environment || {}),
      '<p class="section-description">This section shows the CalEnviroScreen 4.0 score and percentile for the selected area and comparison regions.</p>',
    ),
    dt = (y = {}) =>
      `<div class="kv">${[
        ["White", k(y.white_pct)],
        ["Black or African American", k(y.black_pct)],
        ["American Indian / Alaska Native", k(y.native_pct)],
        ["Asian", k(y.asian_pct)],
        ["Native Hawaiian / Pacific Islander", k(y.pacific_pct)],
        ["Other race", k(y.other_race_pct)],
        ["Two or more races", k(y.two_or_more_races_pct)],
        ["Hispanic", k(y.hispanic_pct)],
        ["Not Hispanic", k(y.not_hispanic_pct)],
      ]
        .map(
          ([M, O]) => `<div class="key">${M}</div><div class="val">${O}</div>`,
        )
        .join("")}</div>`,
    pe = Y(
      "Race &amp; Ethnicity (ACS)",
      dt({
        white_pct: d,
        black_pct: a,
        native_pct: h,
        asian_pct: _,
        pacific_pct: b,
        other_race_pct: A,
        two_or_more_races_pct: P,
        hispanic_pct: S,
        not_hispanic_pct: $,
      }),
      dt(T.demographics || {}),
      dt(R.demographics || {}),
      '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    ht = (y = {}) =>
      `<div class="kv">${[
        ["Owner occupied", k(y.owner_occupied_pct)],
        ["Renter occupied", k(y.renter_occupied_pct)],
        ["Median home value", $t(y.median_home_value)],
        ["High school or higher", k(y.high_school_or_higher_pct)],
        ["Bachelor's degree or higher", k(y.bachelors_or_higher_pct)],
      ]
        .map(
          ([M, O]) => `<div class="key">${M}</div><div class="val">${O}</div>`,
        )
        .join("")}</div>`,
    de = Y(
      "Housing &amp; Education (ACS)",
      ht({
        owner_occupied_pct: C,
        renter_occupied_pct: F,
        median_home_value: L,
        high_school_or_higher_pct: H,
        bachelors_or_higher_pct: V,
      }),
      ht(T.demographics || {}),
      ht(R.demographics || {}),
      '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    _t = (y, z, M, O) => {
      const K = Array.isArray(z) ? z.length > 0 : !!y,
        mt = K ? "var(--success)" : "var(--border-strong)",
        Q = [`Disadvantaged community: <strong>${K ? "Yes" : "No"}</strong>`],
        it = [];
      return (
        Number.isFinite(M) &&
          it.push(`<li><strong>${k(M)}</strong> of population</li>`),
        Number.isFinite(O) &&
          it.push(`<li><strong>${k(O)}</strong> of tracts</li>`),
        it.length && Q.push(`<ul class="dac-stats">${it.join("")}</ul>`),
        Array.isArray(z) &&
          z.length &&
          Q.push(
            `<div class="dac-tracts">Tracts ${z.map((ge) => D(ge)).join(", ")}</div>`,
          ),
        `<div class="callout" style="border-left-color:${mt}">${Q.join("")}</div>`
      );
    },
    he = Y(
      "Disadvantaged Community (DAC) Status",
      _t(v),
      Array.isArray(T.dac_tracts)
        ? _t(null, T.dac_tracts, T.dac_population_pct, T.dac_tracts_pct)
        : "",
      Array.isArray(R.dac_tracts)
        ? _t(null, R.dac_tracts, R.dac_population_pct, R.dac_tracts_pct)
        : "",
      '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
    ),
    _e = Y(
      "Environmental Hardships",
      Nt.length
        ? `<div class="stats">${Nt.map((y) => `<span class="pill">${D(y)}</span>`).join("")}</div>`
        : "",
      Rt.length
        ? `<div class="stats">${Rt.map((y) => `<span class="pill">${D(y)}</span>`).join("")}</div>`
        : "",
      Tt.length
        ? `<div class="stats">${Tt.map((y) => `<span class="pill">${D(y)}</span>`).join("")}</div>`
        : "",
      '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
    ),
    me = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${Dt.length ? `<div class="stats">${Dt.map((y) => `<span class="pill">${D(y)}</span>`).join("")}</div>` : '<p class="note">No active alerts found for this location.</p>'}
    </section>
  `,
    fe = `
    <div class="comparison-grid column-headers">
      <div class="col">Census tract</div>
      <div class="col">10 mile radius</div>
      <div class="col">Water district</div>
    </div>
  `;
  ((document.getElementById("result").innerHTML = D(`
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${D(t)}</h2>
          <div class="card__actions">
            <button type="button" id="printBtn">Print</button>
            <button type="button" id="pdfBtn">Download PDF</button>
            <button type="button" id="rawBtn">Raw Data</button>
            <button type="button" id="shareBtn">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${we()}</span>
      </div>
      ${fe}
      ${oe}
      ${ce}
      ${le}
      ${pe}
      ${de}
      ${he}
      ${ue}
      ${_e}
      ${me}
      <p class="note">Search took ${be(i)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
    `)),
    $e());
}
async function Pt() {
  const t = document.getElementById("autocomplete"),
    s = document.getElementById("result"),
    i = ((t == null ? void 0 : t.value) || "").trim();
  if (i.length < 4) {
    Lt("Please enter a more complete address (at least 4 characters).", i, 0);
    return;
  }
  const o = i.toLowerCase();
  if (ft.has(o)) {
    const e = ft.get(o);
    J = { address: i, data: e };
    const n = new URL(window.location);
    (n.searchParams.set("address", i),
      window.history.replaceState(null, "", n.toString()),
      jt(i, e, 0));
    return;
  }
  (s.setAttribute("aria-busy", "true"), ve(i));
  const c = document.getElementById("spinnerOverlay");
  (c && (c.style.display = "flex"), Pe());
  let l = 0;
  try {
    const e = ot("/lookup", { address: i });
    console.log("Lookup request:", e);
    let n = await et(e);
    if (!n || typeof n != "object") throw new Error("Malformed response.");
    n = await G("enrichLocation", () => Ee(n));
    const [u, p, r, f, g] = await Promise.all([
      G("fetchLanguageAcs", () => ke(n)),
      G("enrichSurrounding", () => Ie(n)),
      G("enrichWaterDistrict", () => Be(n, i)),
      G("enrichEnglishProficiency", () => Me(n)),
      G("enrichNwsAlerts", () => Oe(n)),
    ]);
    rt(n, u, p, r, f, g);
    const m = await G("enrichTractDemographics", () => Ne(n));
    rt(n, m);
    const v = await G("enrichRegionBasics", () => De(n)),
      w = await G("enrichRegionHousingEducation", () => Fe(n));
    rt(n, v, w);
    const [d, a, h] = await Promise.all([
      G("enrichRegionLanguages", () => Te(n)),
      G("enrichRegionHardships", () => Le(n)),
      G("enrichUnemployment", () => Re(n)),
    ]);
    (rt(n, d, a, h), (J = { address: i, data: n }), ft.set(o, n));
    const _ = new URL(window.location);
    (_.searchParams.set("address", i),
      window.history.replaceState(null, "", _.toString()),
      (l = Mt()),
      jt(i, n, l));
  } catch (e) {
    (l || (l = Mt()), Lt(String(e), i, l));
  } finally {
    const e = document.getElementById("spinnerOverlay");
    (e && (e.style.display = "none"), s.removeAttribute("aria-busy"));
  }
}
function Ue() {
  const t = document.getElementById("lookupBtn");
  if (!t) return;
  const s = t.cloneNode(!0);
  (t.replaceWith(s),
    s.addEventListener("click", (o) => {
      (o.preventDefault(), Pt().catch(console.error));
    }));
  const i = document.getElementById("lookupForm");
  i == null ||
    i.addEventListener("submit", (o) => {
      (o.preventDefault(), Pt().catch(console.error));
    });
}
Vt().catch(() => {});
window.onload = () => {
  (ye(), Ue());
  const s = new URLSearchParams(window.location.search).get("address");
  if (s) {
    const i = document.getElementById("autocomplete");
    i && ((i.value = s), Pt().catch(console.error));
  }
};
