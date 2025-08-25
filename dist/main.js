import { _ as Gt } from "./pdf.js";
import { l as Et, s as ge, f as tt, b as at, m as M } from "./maps.js";
import {
  r as Tt,
  a as fe,
  d as it,
  s as k,
  n as ye,
  f as ve,
} from "./error.js";
var Wt;
const Rt =
  ((Wt = document.querySelector('meta[name="sentry-dsn"]')) == null
    ? void 0
    : Wt.content) || "";
Rt &&
  Gt(() => import("./index.js"), [])
    .then((t) => {
      ((window.Sentry = t), t.init({ dsn: Rt }), Et("Sentry initialized"));
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
const _t = new Map(),
  gt = new Map(),
  ft = new Map(),
  yt = new Map(),
  vt = new Map(),
  wt = new Map(),
  At = new Map();
function jt() {
  window.print();
}
window.printReport = jt;
function xt() {
  if (!J) return;
  const t = new Blob([JSON.stringify(J, null, 2)], {
      type: "application/json",
    }),
    s = URL.createObjectURL(t),
    r = document.createElement("a"),
    a = (J.address || "report").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  ((r.href = s),
    (r.download = `calwep_report_${a}.json`),
    document.body.appendChild(r),
    r.click(),
    document.body.removeChild(r),
    URL.revokeObjectURL(s));
}
window.downloadRawData = xt;
window.downloadPdf = async function () {
  const { downloadPdf: t } = await Gt(async () => {
    const { downloadPdf: s } = await import("./pdf.js").then((r) => r.p);
    return { downloadPdf: s };
  }, []);
  t(J);
};
function Ht() {
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
window.shareReport = Ht;
function we() {
  var t, s, r, a;
  ((t = document.getElementById("printBtn")) == null ||
    t.addEventListener("click", jt),
    (s = document.getElementById("pdfBtn")) == null ||
      s.addEventListener("click", window.downloadPdf),
    (r = document.getElementById("rawBtn")) == null ||
      r.addEventListener("click", xt),
    (a = document.getElementById("shareBtn")) == null ||
      a.addEventListener("click", Ht));
}
function R(t) {
  const s = Number(t);
  return t == null || !Number.isFinite(s) || s === -888888888;
}
const et = "No data available";
function Ae(t) {
  return !R(t) && Number.isFinite(Number(t)) ? Number(t).toLocaleString() : et;
}
function bt(t) {
  return R(t) || !Number.isFinite(Number(t))
    ? et
    : `$${Math.round(Number(t)).toLocaleString()}`;
}
function Lt(t) {
  return !R(t) && Number.isFinite(Number(t))
    ? Number(t).toLocaleString(void 0, { maximumFractionDigits: 1 })
    : et;
}
function S(t) {
  return !R(t) && Number.isFinite(Number(t)) ? `${Number(t).toFixed(1)}%` : et;
}
function st(t = [], s = 50) {
  const r = [];
  for (let a = 0; a < t.length; a += s) r.push(t.slice(a, a + s));
  return r;
}
let rt = null,
  Y = null;
function be() {
  Y = Date.now();
  const t = (s) => {
    const r = document.getElementById("searchTimer");
    r && (r.textContent = s);
    const a = document.getElementById("spinnerTime");
    a && (a.textContent = s);
  };
  (t("0m 00s"),
    (rt = setInterval(() => {
      if (!Y) return;
      const s = Date.now() - Y,
        r = Math.floor((s / 1e3) % 60),
        a = Math.floor(s / 6e4);
      t(`${a}m ${r.toString().padStart(2, "0")}s`);
    }, 1e3)));
}
function It() {
  rt && clearInterval(rt);
  const t = Y ? Date.now() - Y : 0;
  return ((rt = null), (Y = null), t);
}
async function Se(t = {}) {
  let {
    city: s,
    census_tract: r,
    lat: a,
    lon: o,
    state_fips: l,
    county_fips: e,
    tract_code: n,
  } = t;
  const u = [];
  return (
    !s &&
      a != null &&
      o != null &&
      u.push(
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${a}&longitude=${o}&localityLanguage=en`,
        )
          .then((p) => p.json())
          .then((p) => {
            var m, f;
            s =
              (Array.isArray(
                (m = p == null ? void 0 : p.localityInfo) == null
                  ? void 0
                  : m.administrative,
              )
                ? (f = p.localityInfo.administrative.find(
                    (h) => h.order === 8 || h.adminLevel === 8,
                  )) == null
                  ? void 0
                  : f.name
                : null) ||
              p.city ||
              p.locality ||
              s;
          })
          .catch(() => {}),
      ),
    (!r || !l || !e || !n) &&
      a != null &&
      o != null &&
      u.push(
        fetch(
          `https://geo.fcc.gov/api/census/block/find?latitude=${a}&longitude=${o}&format=json`,
        )
          .then((p) => p.json())
          .then((p) => {
            var m;
            const i =
              (m = p == null ? void 0 : p.Block) == null ? void 0 : m.FIPS;
            i &&
              i.length >= 11 &&
              ((l = i.slice(0, 2)),
              (e = i.slice(2, 5)),
              (n = i.slice(5, 11)),
              (r = `${n.slice(0, 4)}.${n.slice(4)}`));
          })
          .catch(() => {}),
      ),
    u.length && (await Promise.all(u)),
    {
      ...t,
      city: s,
      census_tract: r,
      state_fips: l,
      county_fips: e,
      tract_code: n,
    }
  );
}
let Q = null;
async function zt() {
  if (Q) return Q;
  try {
    const t = await tt(
        "https://api.census.gov/data/2022/acs/acs5/groups/C16001.json",
      ),
      s = (t == null ? void 0 : t.variables) || {},
      r = [],
      a = {};
    for (const [o, l] of Object.entries(s)) {
      if (!o.endsWith("E")) continue;
      const e = l.label || "",
        n = /^Estimate!!Total:!!([^:]+):$/.exec(e);
      n && (r.push(o), (a[o] = n[1]));
    }
    Q = { codes: r, names: a };
  } catch {
    Q = { codes: [], names: {} };
  }
  return Q;
}
async function St(t = []) {
  var y, v;
  const s = [...new Set(t.map(String))].sort().join(",");
  if (yt.has(s)) return { ...yt.get(s) };
  const { codes: r, names: a } = await zt();
  if (!r.length) return {};
  const o = {};
  for (const d of t) {
    const c = String(d)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (c.length !== 11) continue;
    const g = c.slice(0, 2),
      _ = c.slice(2, 5),
      A = c.slice(5),
      b = `${g}${_}`;
    (o[b] || (o[b] = { state: g, county: _, tracts: [] }), o[b].tracts.push(A));
  }
  let l = 0,
    e = 0,
    n = 0;
  const u = {},
    p = Object.values(o).map(async (d) => {
      const c = st(d.tracts, 50),
        g = await Promise.all(
          c.map(async (A) => {
            const b = A.join(","),
              C = 40,
              $ = [];
            for (let E = 0; E < r.length; E += C) {
              const D = r.slice(E, E + C),
                U = `https://api.census.gov/data/2022/acs/acs5?get=${(E === 0 ? ["C16001_001E", "C16001_002E", ...D] : D).join(",")}&for=tract:${b}&in=state:${d.state}%20county:${d.county}`;
              $.push(
                fetch(U)
                  .then((G) => G.json())
                  .then((G) => ({ type: "lang", rows: G, chunk: D }))
                  .catch(() => null),
              );
            }
            const P = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0115E&for=tract:${b}&in=state:${d.state}%20county:${d.county}`;
            $.push(
              fetch(P)
                .then((E) => E.json())
                .then((E) => ({ type: "english", rows: E }))
                .catch(() => null),
            );
            const T = await Promise.all($);
            let B = 0,
              O = 0,
              q = 0;
            const X = {};
            for (const E of T) {
              if (!E || !Array.isArray(E.rows) || E.rows.length <= 1) continue;
              const { rows: D } = E;
              if (E.type === "lang") {
                const V = D[0];
                for (let U = 1; U < D.length; U++) {
                  const G = D[U],
                    j = {};
                  (V.forEach((H, x) => (j[H] = Number(G[x]))),
                    (B += j.C16001_001E || 0),
                    (O += j.C16001_002E || 0));
                  for (const H of E.chunk) {
                    const x = a[H],
                      ot = j[H] || 0;
                    x && (X[x] = (X[x] || 0) + ot);
                  }
                }
              } else if (E.type === "english") {
                const V = D[0];
                for (let U = 1; U < D.length; U++) {
                  const G = D[U],
                    j = {};
                  (V.forEach((H, x) => (j[H] = Number(G[x]))),
                    (q += j.DP02_0115E || 0));
                }
              }
            }
            return { total: B, englishOnly: O, englishLess: q, langCounts: X };
          }),
        ),
        _ = { total: 0, englishOnly: 0, englishLess: 0, langCounts: {} };
      for (const A of g) {
        ((_.total += A.total),
          (_.englishOnly += A.englishOnly),
          (_.englishLess += A.englishLess));
        for (const [b, C] of Object.entries(A.langCounts))
          _.langCounts[b] = (_.langCounts[b] || 0) + C;
      }
      return _;
    }),
    i = await Promise.all(p);
  for (const d of i) {
    ((l += d.total), (e += d.englishOnly), (n += d.englishLess));
    for (const [c, g] of Object.entries(d.langCounts)) u[c] = (u[c] || 0) + g;
  }
  u.English = e;
  const m = u.Spanish || 0,
    f = Object.entries(u).sort((d, c) => c[1] - d[1]),
    h = {
      primary_language: (y = f[0]) == null ? void 0 : y[0],
      secondary_language: (v = f[1]) == null ? void 0 : v[0],
      language_other_than_english_pct: l ? ((l - e) / l) * 100 : null,
      english_less_than_very_well_pct: l ? (n / l) * 100 : null,
      spanish_at_home_pct: l ? (m / l) * 100 : null,
    };
  return (yt.set(s, h), { ...h });
}
async function $e({ state_fips: t, county_fips: s, tract_code: r } = {}) {
  if (!t || !s || !r) return {};
  const a = `${t}${s}${r}`;
  return St([a]);
}
async function Bt(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (gt.has(s)) return { ...gt.get(s) };
  const r = {};
  for (const p of t) {
    const i = String(p)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (i.length !== 11) continue;
    const m = i.slice(0, 2),
      f = i.slice(2, 5),
      h = i.slice(5),
      y = `${m}${f}`;
    (r[y] || (r[y] = { state: m, county: f, tracts: [] }), r[y].tracts.push(h));
  }
  let a = 0,
    o = 0,
    l = 0,
    e = 0,
    n = 0;
  for (const p of Object.values(r)) {
    const i = st(p.tracts, 50);
    for (const m of i) {
      const f =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE&for=tract:" +
        m.join(",") +
        `&in=state:${p.state}%20county:${p.county}`;
      try {
        const h = await fetch(f).then((y) => y.json());
        if (!Array.isArray(h) || h.length < 2) continue;
        for (let y = 1; y < h.length; y++) {
          const [v, d, c, g, _] = h[y].map(Number);
          Number.isFinite(v) &&
            v > 0 &&
            ((a += v),
            Number.isFinite(d) && (o += d * v),
            Number.isFinite(c) && (l += c * v),
            Number.isFinite(g) && (e += g * v),
            Number.isFinite(_) && _ >= 0 && (n += (_ / 100) * v));
        }
      } catch {}
    }
  }
  const u = {};
  return (
    a > 0 &&
      ((u.population = a),
      o > 0 && (u.median_age = o / a),
      l > 0 && (u.median_household_income = l / a),
      e > 0 && (u.per_capita_income = e / a),
      n > 0 && (u.poverty_rate = (n / a) * 100)),
    gt.set(s, u),
    { ...u }
  );
}
async function Mt(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (ft.has(s)) return { ...ft.get(s) };
  const r = {};
  for (const f of t) {
    const h = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (h.length !== 11) continue;
    const y = h.slice(0, 2),
      v = h.slice(2, 5),
      d = h.slice(5),
      c = `${y}${v}`;
    (r[c] || (r[c] = { state: y, county: v, tracts: [] }), r[c].tracts.push(d));
  }
  let a = 0,
    o = 0,
    l = 0,
    e = 0,
    n = 0,
    u = 0,
    p = 0;
  for (const f of Object.values(r)) {
    const h = st(f.tracts, 50);
    for (const y of h) {
      const v =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=" +
        [
          "DP04_0045E",
          "DP04_0046E",
          "DP04_0047E",
          "DP04_0089E",
          "DP02_0059E",
          "DP02_0067E",
          "DP02_0068E",
        ].join(",") +
        "&for=tract:" +
        y.join(",") +
        `&in=state:${f.state}%20county:${f.county}`;
      try {
        const d = await fetch(v).then((c) => c.json());
        if (!Array.isArray(d) || d.length < 2) continue;
        for (let c = 1; c < d.length; c++) {
          const [g, _, A, b, C, $, P] = d[c].slice(0, 7).map(Number);
          (Number.isFinite(g) && g > 0 && (a += g),
            Number.isFinite(_) &&
              _ > 0 &&
              ((o += _), Number.isFinite(b) && b > 0 && (e += b * _)),
            Number.isFinite(A) && A > 0 && (l += A),
            Number.isFinite(C) &&
              C > 0 &&
              ((n += C),
              Number.isFinite($) && $ > 0 && (u += $),
              Number.isFinite(P) && P > 0 && (p += P)));
        }
      } catch {}
    }
  }
  const i = {},
    m = o + l;
  return (
    m > 0 &&
      ((i.owner_occupied_pct = (o / m) * 100),
      (i.renter_occupied_pct = (l / m) * 100)),
    o > 0 && e > 0 && (i.median_home_value = e / o),
    n > 0 &&
      ((i.high_school_or_higher_pct = (u / n) * 100),
      (i.bachelors_or_higher_pct = (p / n) * 100)),
    ft.set(s, i),
    { ...i }
  );
}
async function Ee(t = []) {
  const s = {};
  for (const a of t) {
    const o = String(a)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (o.length !== 11) continue;
    const l = o.slice(0, 2),
      e = o.slice(2, 5),
      n = o.slice(5),
      u = `${l}${e}`;
    (s[u] || (s[u] = { state: l, county: e, tracts: [] }), s[u].tracts.push(n));
  }
  const r = {};
  for (const a of Object.values(s)) {
    const o = st(a.tracts, 50);
    for (const l of o) {
      const e =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE,DP03_0009PE&for=tract:" +
        l.join(",") +
        `&in=state:${a.state}%20county:${a.county}`;
      try {
        const n = await fetch(e).then((u) => u.json());
        if (!Array.isArray(n) || n.length < 2) continue;
        for (let u = 1; u < n.length; u++) {
          const [p, i, m, f, h, y, v, d, c] = n[u],
            g = `${v}${d}${c}`;
          r[g] = {
            population: Number(p),
            median_age: Number(i),
            median_household_income: Number(m),
            per_capita_income: Number(f),
            poverty_rate: Number(h),
            unemployment_rate: Number(y),
          };
        }
      } catch {}
    }
  }
  return r;
}
async function kt(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (vt.has(s)) return { ...vt.get(s) };
  const r = {};
  for (const o of t) {
    const l = String(o)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (l.length !== 11) continue;
    const e = l.slice(0, 2),
      n = l.slice(2, 5),
      u = l.slice(5),
      p = `${e}${n}`;
    (r[p] || (r[p] = { state: e, county: n, tracts: [] }), r[p].tracts.push(u));
  }
  const a = {};
  for (const o of Object.values(r)) {
    const l = st(o.tracts, 50);
    for (const e of l) {
      const n =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0009PE,DP05_0001E&for=tract:" +
        e.join(",") +
        `&in=state:${o.state}%20county:${o.county}`;
      try {
        const u = await fetch(n).then((p) => p.json());
        if (!Array.isArray(u) || u.length < 2) continue;
        for (let p = 1; p < u.length; p++) {
          const [i, m, f, h, y] = u[p],
            v = `${f}${h}${y}`;
          a[v] = { unemployment_rate: Number(i), population: Number(m) };
        }
      } catch {}
    }
  }
  return (vt.set(s, a), { ...a });
}
async function qt(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (wt.has(s)) return [...wt.get(s)];
  const r =
      "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query",
    a = new Set(),
    o = 50;
  for (let e = 0; e < t.length; e += o) {
    const n = t.slice(e, e + o);
    if (!n.length) continue;
    const u = `GEOID20 IN (${n.map((i) => `'${i}'`).join(",")})`,
      p =
        r +
        `?where=${encodeURIComponent(u)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    try {
      const i = await fetch(p).then((m) => m.json());
      for (const m of i.features || []) {
        const f = m.attributes || {},
          h = String(f.GEOID20);
        String(f.DAC20 || "").toUpperCase() === "Y" && a.add(h);
      }
    } catch {}
  }
  const l = Array.from(a);
  return (wt.set(s, l), [...l]);
}
async function Ot(t = []) {
  const s = [...new Set(t.map(String))].sort().join(",");
  if (At.has(s)) return [...At.get(s)];
  const r = new Set();
  await Promise.all(
    t.map(async (o) => {
      try {
        const l = at("/lookup", { fips: o, census_tract: o, geoid: o }),
          e = await tt(l);
        Array.isArray(e.environmental_hardships) &&
          e.environmental_hardships.forEach((n) => r.add(n));
      } catch {}
    }),
  );
  const a = Array.from(r).sort();
  return (At.set(s, a), [...a]);
}
async function ke(t = {}) {
  const { state_fips: s, county_fips: r, tract_code: a } = t || {},
    o = s && r && a ? `${s}${r}${a}` : null;
  if (
    !(
      o &&
      [
        "population",
        "median_age",
        "median_household_income",
        "per_capita_income",
        "poverty_rate",
        "unemployment_rate",
      ].some((i) => R(t[i]))
    )
  )
    return t;
  const u = (await Ee([o]))[o];
  if (!u) return t;
  const p = { ...t };
  p.demographics = { ...p.demographics, ...u };
  for (const [i, m] of Object.entries(u)) R(p[i]) && (p[i] = m);
  return p;
}
async function Ce(t = {}) {
  var n, u;
  const { surrounding_10_mile: s, water_district: r } = t || {},
    a = { ...t },
    o = s || {};
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length) {
    const p = await Bt(o.census_tracts_fips),
      i = o.demographics || {};
    a.surrounding_10_mile = { ...o, demographics: { ...i, ...p } };
  }
  const l = r || {},
    e = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (e.length) {
    const p = await Bt(e),
      i = l.demographics || {},
      m =
        (u = (n = a.surrounding_10_mile) == null ? void 0 : n.demographics) ==
        null
          ? void 0
          : u.median_household_income,
      f = { ...i, ...p };
    (m != null &&
      (!Number.isFinite(f.median_household_income) ||
        f.median_household_income < 0) &&
      (f.median_household_income = m),
      (a.water_district = { ...l, demographics: f }));
  }
  return a;
}
async function Ne(t = {}) {
  var n, u;
  const { surrounding_10_mile: s, water_district: r } = t || {},
    a = { ...t },
    o = s || {};
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length) {
    const p = o.demographics || {};
    if (
      [
        p.owner_occupied_pct,
        p.renter_occupied_pct,
        p.median_home_value,
        p.high_school_or_higher_pct,
        p.bachelors_or_higher_pct,
      ].some((m) => R(m) || (typeof m == "number" && m < 0))
    ) {
      const m = await Mt(o.census_tracts_fips);
      a.surrounding_10_mile = { ...o, demographics: { ...p, ...m } };
    }
  }
  const l = r || {},
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
      ].some((m) => R(m) || (typeof m == "number" && m < 0))
    ) {
      const m = await Mt(e);
      let f = { ...p, ...m };
      const h =
        (u = (n = a.surrounding_10_mile) == null ? void 0 : n.demographics) ==
        null
          ? void 0
          : u.median_home_value;
      (h != null &&
        (!Number.isFinite(f.median_home_value) || f.median_home_value < 0) &&
        (f.median_home_value = h),
        (a.water_district = { ...l, demographics: f }));
    }
  }
  return a;
}
async function Pe(t = {}) {
  const {
      state_fips: s,
      county_fips: r,
      tract_code: a,
      unemployment_rate: o,
      surrounding_10_mile: l,
      water_district: e,
    } = t || {},
    n = l || {},
    u = e || {},
    p = [],
    i = s && r && a ? `${s}${r}${a}` : null;
  R(o) && i && p.push(i);
  const m = Array.isArray(n.census_tracts_fips) ? n.census_tracts_fips : [];
  n.demographics &&
    R(n.demographics.unemployment_rate) &&
    m.length &&
    p.push(...m);
  const f = Array.isArray(u.census_tracts_fips)
    ? u.census_tracts_fips.map(String)
    : [];
  u.demographics &&
    R(u.demographics.unemployment_rate) &&
    f.length &&
    p.push(...f);
  const h = Array.from(new Set(p));
  if (!h.length) return t;
  const y = await kt(h),
    v = { ...t };
  if (
    (R(o) && i && y[i] && (v.unemployment_rate = y[i].unemployment_rate),
    n.demographics && R(n.demographics.unemployment_rate) && m.length)
  ) {
    let d = 0,
      c = 0;
    for (const g of m) {
      const _ = y[g];
      _ &&
        Number.isFinite(_.unemployment_rate) &&
        Number.isFinite(_.population) &&
        ((d += _.population), (c += _.unemployment_rate * _.population));
    }
    d > 0 &&
      (v.surrounding_10_mile = {
        ...n,
        demographics: { ...n.demographics, unemployment_rate: c / d },
      });
  }
  if (u.demographics && R(u.demographics.unemployment_rate) && f.length) {
    let d = 0,
      c = 0;
    for (const g of f) {
      const _ = y[g];
      _ &&
        Number.isFinite(_.unemployment_rate) &&
        Number.isFinite(_.population) &&
        ((d += _.population), (c += _.unemployment_rate * _.population));
    }
    d > 0 &&
      (v.water_district = {
        ...u,
        demographics: { ...u.demographics, unemployment_rate: c / d },
      });
  }
  return v;
}
async function De(t = {}) {
  const { surrounding_10_mile: s, water_district: r } = t || {},
    a = { ...t },
    o = s || {};
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length) {
    const n = await St(o.census_tracts_fips),
      u = o.demographics || {};
    a.surrounding_10_mile = { ...o, demographics: { ...u, ...n } };
  }
  const l = r || {},
    e = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (e.length) {
    const n = await St(e),
      u = l.demographics || {};
    a.water_district = { ...l, demographics: { ...u, ...n } };
  }
  return a;
}
async function Fe(t = {}) {
  const { surrounding_10_mile: s, water_district: r } = t || {},
    a = { ...t },
    o = s || {},
    l =
      Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length
        ? o.census_tracts_fips
        : Array.isArray(o.census_tracts)
          ? o.census_tracts
          : [];
  if (
    (!Array.isArray(o.environmental_hardships) ||
      !o.environmental_hardships.length) &&
    l.length
  ) {
    const u = await Ot(l);
    a.surrounding_10_mile = { ...o, environmental_hardships: u };
  }
  const e = r || {},
    n = Array.isArray(e.census_tracts_fips)
      ? e.census_tracts_fips.map(String)
      : [];
  if (
    (!Array.isArray(e.environmental_hardships) ||
      !e.environmental_hardships.length) &&
    n.length
  ) {
    const u = await Ot(n);
    a.water_district = { ...e, environmental_hardships: u };
  }
  return a;
}
async function Te(t = {}) {
  const { lat: s, lon: r, census_tract: a, surrounding_10_mile: o } = t || {};
  if (s == null || r == null) return t;
  const l = 1609.34 * 10,
    e = { ...(o || {}) },
    n = [];
  if (!Array.isArray(e.cities) || !e.cities.length) {
    const h = `[out:json];(node[place=city](around:${l},${s},${r});node[place=town](around:${l},${s},${r}););out;`,
      y =
        "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(h);
    n.push(
      fetch(y)
        .then((v) => v.json())
        .then((v) => {
          const d = (v.elements || [])
            .map((c) => {
              var g;
              return (g = c.tags) == null ? void 0 : g.name;
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
    i = { ...(e.census_tract_map || {}) },
    m = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query?where=1=1&geometry=${r},${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${l}&units=esriSRUnit_Meter&outFields=NAME,GEOID&f=json`;
  (n.push(
    fetch(m)
      .then((h) => h.json())
      .then((h) => {
        const y = h.features || [],
          v = [],
          d = [],
          c = {};
        for (const g of y) {
          const _ = g.attributes || {};
          let A = null;
          if (
            (_.NAME &&
              ((A = _.NAME.replace(/^Census Tract\s+/i, "")), v.push(A)),
            _.GEOID)
          ) {
            const b = String(_.GEOID);
            (d.push(b), A && (c[b] = A));
          }
        }
        ((e.census_tracts = Array.from(new Set([...u, ...v]))),
          (e.census_tracts_fips = Array.from(new Set([...p, ...d]))),
          (e.census_tract_map = { ...i, ...c }));
      })
      .catch(() => {}),
  ),
    n.length && (await Promise.all(n)),
    Array.isArray(e.cities) || (e.cities = []));
  const f = new Set(Array.isArray(e.census_tracts) ? e.census_tracts : []);
  if (
    (a && f.add(String(a)),
    (e.census_tracts = Array.from(f)),
    Array.isArray(e.census_tracts_fips))
  ) {
    const h = new Set(e.census_tracts_fips),
      { state_fips: y, county_fips: v, tract_code: d } = t || {};
    (y && v && d && h.add(`${y}${v}${d}`),
      (e.census_tracts_fips = Array.from(h)));
  }
  if (Array.isArray(e.census_tracts_fips) && e.census_tracts_fips.length)
    try {
      const h = await qt(e.census_tracts_fips),
        y = [];
      for (const v of h) {
        const d = (e.census_tract_map && e.census_tract_map[v]) || v;
        y.push(d);
      }
      if (((e.dac_tracts = y), (e.dac_tracts_fips = h), y.length)) {
        const v = new Set([...(e.census_tracts || []), ...y]);
        e.census_tracts = Array.from(v);
      }
    } catch {}
  if (Array.isArray(e.census_tracts_fips) && e.census_tracts_fips.length)
    try {
      const h = await kt(e.census_tracts_fips);
      let y = 0,
        v = 0;
      const d = new Set(e.dac_tracts_fips || []);
      for (const c of e.census_tracts_fips) {
        const g = h[c];
        g &&
          Number.isFinite(g.population) &&
          ((y += g.population), d.has(String(c)) && (v += g.population));
      }
      (y > 0 && (e.dac_population_pct = (v / y) * 100),
        e.census_tracts_fips.length > 0 &&
          (e.dac_tracts_pct = (d.size / e.census_tracts_fips.length) * 100));
    } catch {}
  return { ...t, surrounding_10_mile: e };
}
async function Re(t = {}, s = "") {
  var y, v;
  const {
    lat: r,
    lon: a,
    city: o,
    census_tract: l,
    state_fips: e,
    county_fips: n,
    tract_code: u,
    water_district: p,
  } = t || {};
  if (r == null || a == null) return t;
  const i = { ...p },
    m = [];
  if (s) {
    const d = at("/lookup", { address: s });
    m.push(
      tt(d)
        .then((c) => {
          var _, A, b, C;
          i.name =
            ((_ = c == null ? void 0 : c.agency) == null
              ? void 0
              : _.agency_name) ||
            ((A = c == null ? void 0 : c.agency) == null ? void 0 : A.name) ||
            (c == null ? void 0 : c.agency_name) ||
            (c == null ? void 0 : c.name) ||
            i.name;
          const g =
            ((b = c == null ? void 0 : c.agency) == null
              ? void 0
              : b.service_area_tracts) ||
            (c == null ? void 0 : c.service_area_tracts) ||
            (c == null ? void 0 : c.census_tracts) ||
            ((C = c == null ? void 0 : c.agency) == null
              ? void 0
              : C.census_tracts);
          if (typeof g == "string") {
            const $ = g.split(/\s*,\s*/).filter(Boolean);
            i.census_tracts = $;
            const P = $.filter((T) => /^\d{11}$/.test(T));
            P.length && (i.census_tracts_fips = P);
          } else if (Array.isArray(g)) {
            const $ = [...new Set(g.map(String))];
            i.census_tracts = $;
            const P = $.filter((T) => /^\d{11}$/.test(T));
            P.length &&
              (i.census_tracts_fips = [
                ...new Set([...(i.census_tracts_fips || []), ...P]),
              ]);
          }
        })
        .catch(() => {}),
    );
  }
  if (!i.name) {
    const d = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${a}%2C${r}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=false&f=json`;
    m.push(
      fetch(d)
        .then((c) => c.json())
        .then((c) => {
          var g, _, A;
          i.name =
            ((A =
              (_ =
                (g = c == null ? void 0 : c.features) == null
                  ? void 0
                  : g[0]) == null
                ? void 0
                : _.attributes) == null
              ? void 0
              : A.PWS_NAME) || i.name;
        })
        .catch(() => {}),
    );
  }
  if (
    ((!Array.isArray(i.cities) || !i.cities.length) && o && (i.cities = [o]),
    m.length && (await Promise.all(m)),
    i.name && (!Array.isArray(i.census_tracts) || !i.census_tracts.length))
  )
    try {
      const d = at("/census-tracts", { agency_name: i.name }),
        c = await tt(d),
        g = c == null ? void 0 : c.census_tracts;
      Array.isArray(g) && (i.census_tracts = [...new Set(g.map(String))]);
    } catch {}
  try {
    const d = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${a}%2C${r}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`,
      c = await fetch(d).then((_) => _.json()),
      g =
        (v = (y = c == null ? void 0 : c.features) == null ? void 0 : y[0]) ==
        null
          ? void 0
          : v.geometry;
    if (g) {
      const _ =
          "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query",
        A = new URLSearchParams({
          where: "1=1",
          geometry: JSON.stringify(g),
          geometryType: "esriGeometryPolygon",
          inSR: "4326",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "NAME,GEOID",
          returnGeometry: "false",
          f: "json",
        });
      let b;
      try {
        b = await fetch(_, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: A.toString(),
        }).then((T) => T.json());
      } catch {
        const T = `${_}?${A.toString()}`;
        b = await fetch(T).then((B) => B.json());
      }
      const C = [],
        $ = [],
        P = {};
      for (const T of b.features || []) {
        const B = T.attributes || {};
        let O = null;
        if (
          (B.NAME && ((O = B.NAME.replace(/^Census Tract\s+/i, "")), C.push(O)),
          B.GEOID)
        ) {
          const q = String(B.GEOID);
          ($.push(q), O && (P[q] = O));
        }
      }
      if (C.length || $.length) {
        const T = Array.isArray(i.census_tracts)
            ? i.census_tracts.map(String)
            : [],
          B = Array.isArray(i.census_tracts_fips)
            ? i.census_tracts_fips.map(String)
            : [],
          O = i.census_tract_map || {};
        (C.length && (i.census_tracts = [...new Set([...T, ...C])]),
          $.length && (i.census_tracts_fips = [...new Set([...B, ...$])]),
          Object.keys(P).length && (i.census_tract_map = { ...O, ...P }));
      }
    }
  } catch {}
  let f = [];
  (Array.isArray(i.census_tracts)
    ? (f = i.census_tracts.map(String))
    : typeof i.census_tracts == "string" &&
      (f = i.census_tracts.split(/\s*,\s*/).filter(Boolean)),
    l && f.unshift(String(l)),
    (i.census_tracts = [...new Set(f)]));
  let h = Array.isArray(i.census_tracts_fips)
    ? i.census_tracts_fips.map(String)
    : [];
  for (const d of i.census_tracts)
    if (/^\d{11}$/.test(d)) h.push(d);
    else if (e && n) {
      const c = String(d).replace(/[^0-9]/g, "");
      if (c) {
        const g = c.padStart(6, "0").slice(-6);
        h.push(`${e}${n}${g}`);
      }
    }
  if (
    (e && n && u && h.unshift(`${e}${n}${u}`),
    (i.census_tracts_fips = [...new Set(h)]),
    Array.isArray(i.census_tracts_fips) && i.census_tracts_fips.length)
  )
    try {
      const d = await qt(i.census_tracts_fips),
        c = [];
      for (const g of d) {
        const _ = (i.census_tract_map && i.census_tract_map[g]) || g;
        c.push(_);
      }
      if (((i.dac_tracts = c), (i.dac_tracts_fips = d), c.length)) {
        const g = new Set([...(i.census_tracts || []), ...c]);
        i.census_tracts = Array.from(g);
      }
    } catch {}
  if (Array.isArray(i.census_tracts_fips) && i.census_tracts_fips.length)
    try {
      const d = await kt(i.census_tracts_fips);
      let c = 0,
        g = 0;
      const _ = new Set(i.dac_tracts_fips || []);
      for (const A of i.census_tracts_fips) {
        const b = d[A];
        b &&
          Number.isFinite(b.population) &&
          ((c += b.population), _.has(String(A)) && (g += b.population));
      }
      (c > 0 && (i.dac_population_pct = (g / c) * 100),
        i.census_tracts_fips.length > 0 &&
          (i.dac_tracts_pct = (_.size / i.census_tracts_fips.length) * 100));
    } catch {}
  return (
    (i.environment = {
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
    { ...t, water_district: i }
  );
}
async function Le(t = {}) {
  var o, l;
  const { lat: s, lon: r, english_less_than_very_well_pct: a } = t || {};
  if (!R(a) || s == null || r == null) return t;
  try {
    const e = await fetch(
        `https://geo.fcc.gov/api/census/block/find?latitude=${s}&longitude=${r}&format=json`,
      ).then((u) => u.json()),
      n = (o = e == null ? void 0 : e.Block) == null ? void 0 : o.FIPS;
    if (n && n.length >= 11) {
      const u = n.slice(0, 2),
        p = n.slice(2, 5),
        m = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${n.slice(5, 11)}&in=state:${u}+county:${p}`,
        f = await fetch(m).then((v) => v.json()),
        h = (l = f == null ? void 0 : f[1]) == null ? void 0 : l[0],
        y = Number(h);
      if (Number.isFinite(y) && y >= 0)
        return { ...t, english_less_than_very_well_pct: y };
    }
  } catch {}
  return t;
}
async function Ie(t = {}) {
  const { lat: s, lon: r } = t || {};
  if (s == null || r == null) return { ...t, alerts: [] };
  try {
    const a = `https://api.weather.gov/alerts/active?point=${s},${r}`,
      o = await fetch(a, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "CalWEP-Demographic-Website (info@calwep.org)",
        },
      });
    if (!o.ok) throw new Error("NWS response not ok");
    const l = await o.json(),
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
function z(t, s, r, a, o = "") {
  const l = (e) => (e && String(e).trim() ? e : `<p class="note">${et}</p>`);
  return `
    <section class="section-block">
      <h3 class="section-header">${k(t)}</h3>
      ${o}
      <div class="comparison-grid" role="table" aria-label="${k(t)}">
        <div class="col local" role="cell" aria-label="Census tract">${l(s)}</div>
        <div class="col surrounding" role="cell" aria-label="10-mile radius">${l(r)}</div>
        <div class="col district" role="cell" aria-label="Water district">${l(a)}</div>
      </div>
    </section>
  `;
}
function Ut(t, s, r) {
  const {
      city: a,
      zip: o,
      county: l,
      census_tract: e,
      lat: n,
      lon: u,
      english_less_than_very_well_pct: p,
      language_other_than_english_pct: i,
      spanish_at_home_pct: m,
      languages: f,
      demographics: h = {},
      dac_status: y,
      environmental_hardships: v,
      white_pct: d,
      black_pct: c,
      native_pct: g,
      asian_pct: _,
      pacific_pct: A,
      other_race_pct: b,
      two_or_more_races_pct: C,
      hispanic_pct: $,
      not_hispanic_pct: P,
      owner_occupied_pct: T,
      renter_occupied_pct: B,
      median_home_value: O,
      high_school_or_higher_pct: q,
      bachelors_or_higher_pct: X,
      alerts: E,
      enviroscreen: D,
      surrounding_10_mile: V,
      water_district: U,
    } = s || {},
    G = s.population ?? h.population,
    j = s.median_age ?? h.median_age,
    H =
      s.median_income ??
      s.median_household_income ??
      h.median_income ??
      h.median_household_income,
    x = s.per_capita_income ?? h.per_capita_income,
    ot = s.poverty_rate ?? h.poverty_rate,
    Vt = s.unemployment_rate ?? h.unemployment_rate,
    Jt = Array.isArray(f) && f.length ? f : h.languages,
    Yt = s.enviroscreen_score ?? (D == null ? void 0 : D.score),
    Xt = s.enviroscreen_percentile ?? (D == null ? void 0 : D.percentile),
    Ct = Array.isArray(v) ? Array.from(new Set(v)) : [],
    Nt = Array.isArray(E) ? E : [],
    Zt =
      n != null && u != null
        ? `${Number(n).toFixed(6)}, ${Number(u).toFixed(6)}`
        : "—";
  let Pt = "";
  if (n != null && u != null) {
    const w = new URL("/api/staticmap", window.location.origin);
    (w.searchParams.set("lat", n),
      w.searchParams.set("lon", u),
      (Pt = `<img class="map-image" src="${w}" alt="Map of location" />`));
  }
  const F = V || {},
    N = U || {},
    Dt = Array.isArray(F.environmental_hardships)
      ? Array.from(new Set(F.environmental_hardships))
      : [],
    Ft = Array.isArray(N.environmental_hardships)
      ? Array.from(new Set(N.environmental_hardships))
      : [],
    Kt = Array.isArray(F.census_tracts)
      ? F.census_tracts.join(", ")
      : k(F.census_tracts) || "—",
    Qt = Array.isArray(F.cities) ? F.cities.join(", ") : k(F.cities) || "—",
    te = Array.isArray(N.census_tracts)
      ? N.census_tracts.join(", ")
      : k(N.census_tracts) || "—",
    ee = Array.isArray(N.cities) ? N.cities.join(", ") : k(N.cities) || "—",
    se = `
    <div class="kv">
      <div class="key">City</div><div class="val">${k(a) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${k(e) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${k(o) || "—"}</div>
      <div class="key">County</div><div class="val">${k(l) || "—"}</div>
      <div class="key">Coordinates</div><div class="val">${Zt}</div>
    </div>
    ${Pt}
  `,
    ne = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${Qt}</div>
      <div class="key">Census tracts</div><div class="val">${Kt}</div>
    </div>
  `,
    ie = `
    <div class="kv">
      <div class="key">District</div><div class="val">${k(N.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${ee}</div>
      <div class="key">Census tracts</div><div class="val">${te}</div>
    </div>
  `,
    re = z(
      "Location Summary",
      se,
      ne,
      ie,
      '<p class="section-description">This section lists basic geographic information for the census tract, surrounding 10&#8209;mile area, and water district, such as city, ZIP code, county, and coordinates.</p>',
    ),
    ct = (w = {}) =>
      `<div class="kv">${[
        ["Total population", Ae(w.population)],
        ["Median age", Lt(w.median_age)],
        [
          "Median household income",
          bt(w.median_income ?? w.median_household_income),
        ],
        ["Per capita income", bt(w.per_capita_income)],
        ["Poverty rate", S(w.poverty_rate)],
        ["Unemployment rate", S(w.unemployment_rate)],
      ]
        .map(
          ([L, I]) => `<div class="key">${L}</div><div class="val">${I}</div>`,
        )
        .join("")}</div>`,
    ae = z(
      "Population &amp; Income (ACS)",
      ct({
        population: G,
        median_age: j,
        median_income: H,
        per_capita_income: x,
        poverty_rate: ot,
        unemployment_rate: Vt,
      }),
      ct(F.demographics || {}),
      ct(N.demographics || {}),
      '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    lt = (w = {}) =>
      `<div class="kv">${[
        [
          "Languages spoken",
          Array.isArray(w.languages) && w.languages.length
            ? w.languages.map((I) => k(I)).join(", ")
            : "Not available",
        ],
        [
          "People who speak a language other than English at home",
          S(w.language_other_than_english_pct),
        ],
        [
          'People who speak English less than "very well"',
          S(w.english_less_than_very_well_pct),
        ],
        ["People who speak Spanish at home", S(w.spanish_at_home_pct)],
      ]
        .map(
          ([I, Z]) => `<div class="key">${I}</div><div class="val">${Z}</div>`,
        )
        .join("")}</div>`,
    oe = z(
      "Language (ACS)",
      lt({
        languages: Jt,
        language_other_than_english_pct: i,
        english_less_than_very_well_pct: p,
        spanish_at_home_pct: m,
      }),
      lt(F.demographics || {}),
      lt(N.demographics || {}),
      '<p class="section-description">This section highlights the languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    ut = (w = {}) => {
      const W = w.enviroscreen_score ?? w.score,
        L = w.enviroscreen_percentile ?? w.percentile,
        I = Number.isFinite(Number(L)) && Number(L) <= 1 ? Number(L) * 100 : L;
      return `<div class="kv">${[
        ["Score", Lt(W)],
        ["Percentile", S(I)],
      ]
        .map(
          ([mt, K]) =>
            `<div class="key">${mt}</div><div class="val">${K}</div>`,
        )
        .join("")}</div>`;
    },
    ce = z(
      "EnviroScreen (CalEnviroScreen 4.0)",
      ut({ enviroscreen_score: Yt, enviroscreen_percentile: Xt }),
      ut(F.environment || {}),
      ut(N.environment || {}),
      '<p class="section-description">This section shows the CalEnviroScreen 4.0 score and percentile for the selected area and comparison regions.</p>',
    ),
    pt = (w = {}) =>
      `<div class="kv">${[
        ["White", S(w.white_pct)],
        ["Black or African American", S(w.black_pct)],
        ["American Indian / Alaska Native", S(w.native_pct)],
        ["Asian", S(w.asian_pct)],
        ["Native Hawaiian / Pacific Islander", S(w.pacific_pct)],
        ["Other race", S(w.other_race_pct)],
        ["Two or more races", S(w.two_or_more_races_pct)],
        ["Hispanic", S(w.hispanic_pct)],
        ["Not Hispanic", S(w.not_hispanic_pct)],
      ]
        .map(
          ([L, I]) => `<div class="key">${L}</div><div class="val">${I}</div>`,
        )
        .join("")}</div>`,
    le = z(
      "Race &amp; Ethnicity (ACS)",
      pt({
        white_pct: d,
        black_pct: c,
        native_pct: g,
        asian_pct: _,
        pacific_pct: A,
        other_race_pct: b,
        two_or_more_races_pct: C,
        hispanic_pct: $,
        not_hispanic_pct: P,
      }),
      pt(F.demographics || {}),
      pt(N.demographics || {}),
      '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    dt = (w = {}) =>
      `<div class="kv">${[
        ["Owner occupied", S(w.owner_occupied_pct)],
        ["Renter occupied", S(w.renter_occupied_pct)],
        ["Median home value", bt(w.median_home_value)],
        ["High school or higher", S(w.high_school_or_higher_pct)],
        ["Bachelor's degree or higher", S(w.bachelors_or_higher_pct)],
      ]
        .map(
          ([L, I]) => `<div class="key">${L}</div><div class="val">${I}</div>`,
        )
        .join("")}</div>`,
    ue = z(
      "Housing &amp; Education (ACS)",
      dt({
        owner_occupied_pct: T,
        renter_occupied_pct: B,
        median_home_value: O,
        high_school_or_higher_pct: q,
        bachelors_or_higher_pct: X,
      }),
      dt(F.demographics || {}),
      dt(N.demographics || {}),
      '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    ht = (w, W, L, I) => {
      const Z = Array.isArray(W) ? W.length > 0 : !!w,
        mt = Z ? "var(--success)" : "var(--border-strong)",
        K = [`Disadvantaged community: <strong>${Z ? "Yes" : "No"}</strong>`],
        nt = [];
      return (
        Number.isFinite(L) &&
          nt.push(`<li><strong>${S(L)}</strong> of population</li>`),
        Number.isFinite(I) &&
          nt.push(`<li><strong>${S(I)}</strong> of tracts</li>`),
        nt.length && K.push(`<ul class="dac-stats">${nt.join("")}</ul>`),
        Array.isArray(W) &&
          W.length &&
          K.push(
            `<div class="dac-tracts">Tracts ${W.map((_e) => k(_e)).join(", ")}</div>`,
          ),
        `<div class="callout" style="border-left-color:${mt}">${K.join("")}</div>`
      );
    },
    pe = z(
      "Disadvantaged Community (DAC) Status",
      ht(y),
      Array.isArray(F.dac_tracts)
        ? ht(null, F.dac_tracts, F.dac_population_pct, F.dac_tracts_pct)
        : "",
      Array.isArray(N.dac_tracts)
        ? ht(null, N.dac_tracts, N.dac_population_pct, N.dac_tracts_pct)
        : "",
      '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
    ),
    de = z(
      "Environmental Hardships",
      Ct.length
        ? `<div class="stats">${Ct.map((w) => `<span class="pill">${k(w)}</span>`).join("")}</div>`
        : "",
      Dt.length
        ? `<div class="stats">${Dt.map((w) => `<span class="pill">${k(w)}</span>`).join("")}</div>`
        : "",
      Ft.length
        ? `<div class="stats">${Ft.map((w) => `<span class="pill">${k(w)}</span>`).join("")}</div>`
        : "",
      '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
    ),
    he = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${Nt.length ? `<div class="stats">${Nt.map((w) => `<span class="pill">${k(w)}</span>`).join("")}</div>` : '<p class="note">No active alerts found for this location.</p>'}
    </section>
  `,
    me = `
    <div class="comparison-grid column-headers">
      <div class="col">Census tract</div>
      <div class="col">10 mile radius</div>
      <div class="col">Water district</div>
    </div>
  `;
  ((document.getElementById("result").innerHTML = k(`
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${k(t)}</h2>
          <div class="card__actions">
            <button type="button" id="printBtn">Print</button>
            <button type="button" id="pdfBtn">Download PDF</button>
            <button type="button" id="rawBtn">Raw Data</button>
            <button type="button" id="shareBtn">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${ye()}</span>
      </div>
      ${me}
      ${re}
      ${ae}
      ${oe}
      ${le}
      ${ue}
      ${pe}
      ${ce}
      ${de}
      ${he}
      <p class="note">Search took ${ve(r)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
    `)),
    we());
}
async function $t() {
  const t = document.getElementById("autocomplete"),
    s = document.getElementById("result"),
    r = ((t == null ? void 0 : t.value) || "").trim();
  if (r.length < 4) {
    Tt("Please enter a more complete address (at least 4 characters).", r, 0);
    return;
  }
  const a = r.toLowerCase();
  if (_t.has(a)) {
    const e = _t.get(a);
    J = { address: r, data: e };
    const n = new URL(window.location);
    (n.searchParams.set("address", r),
      window.history.replaceState(null, "", n.toString()),
      Ut(r, e, 0));
    return;
  }
  (s.setAttribute("aria-busy", "true"), fe(r));
  const o = document.getElementById("spinnerOverlay");
  (o && (o.style.display = "flex"), be());
  let l = 0;
  try {
    const e = at("/lookup", { address: r });
    console.log("Lookup request:", e);
    let n = await tt(e);
    if (!n || typeof n != "object") throw new Error("Malformed response.");
    n = await M("enrichLocation", () => Se(n));
    const [u, p, i, m, f] = await Promise.all([
      M("fetchLanguageAcs", () => $e(n)),
      M("enrichSurrounding", () => Te(n)),
      M("enrichWaterDistrict", () => Re(n, r)),
      M("enrichEnglishProficiency", () => Le(n)),
      M("enrichNwsAlerts", () => Ie(n)),
    ]);
    it(n, u, p, i, m, f);
    const h = await M("enrichTractDemographics", () => ke(n));
    it(n, h);
    const y = await M("enrichRegionBasics", () => Ce(n)),
      v = await M("enrichRegionHousingEducation", () => Ne(n));
    it(n, y, v);
    const [d, c, g] = await Promise.all([
      M("enrichRegionLanguages", () => De(n)),
      M("enrichRegionHardships", () => Fe(n)),
      M("enrichUnemployment", () => Pe(n)),
    ]);
    (it(n, d, c, g), (J = { address: r, data: n }), _t.set(a, n));
    const _ = new URL(window.location);
    (_.searchParams.set("address", r),
      window.history.replaceState(null, "", _.toString()),
      (l = It()),
      Ut(r, n, l));
  } catch (e) {
    (l || (l = It()), Tt(String(e), r, l));
  } finally {
    const e = document.getElementById("spinnerOverlay");
    (e && (e.style.display = "none"), s.removeAttribute("aria-busy"));
  }
}
function Be() {
  const t = document.getElementById("lookupBtn");
  if (!t) return;
  const s = t.cloneNode(!0);
  (t.replaceWith(s),
    s.addEventListener("click", (a) => {
      (a.preventDefault(), $t().catch(console.error));
    }));
  const r = document.getElementById("lookupForm");
  r == null ||
    r.addEventListener("submit", (a) => {
      (a.preventDefault(), $t().catch(console.error));
    });
}
zt().catch(() => {});
window.onload = () => {
  (ge(), Be());
  const s = new URLSearchParams(window.location.search).get("address");
  if (s) {
    const r = document.getElementById("autocomplete");
    r && ((r.value = s), $t().catch(console.error));
  }
};
