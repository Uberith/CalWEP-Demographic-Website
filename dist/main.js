import { _ as pn } from "./pdf.js";
import { l as Nn, g as Ln } from "./maps.js";
const Dn = new URLSearchParams(window.location.search).has("debug");
let Xe = null;
function gt(...e) {
  Dn &&
    (console.log(...e),
    Xe ||
      ((Xe = document.createElement("pre")),
      (Xe.id = "debugLog"),
      document.body.appendChild(Xe)),
    (Xe.textContent +=
      e.map((n) => (typeof n == "string" ? n : JSON.stringify(n))).join(" ") +
      `
`));
}
async function se(e, n, s = {}) {
  var a, c, o;
  const i = performance.now();
  try {
    return await n();
  } catch (r) {
    throw (
      (a = window.Sentry) == null ||
        a.captureException(r, { extra: { name: e, ...s } }),
      r
    );
  } finally {
    const r = performance.now() - i;
    (gt(e, { ...s, duration: r }),
      (o = (c = window.Sentry) == null ? void 0 : c.addBreadcrumb) == null ||
        o.call(c, {
          category: "async",
          message: e,
          data: { ...s, duration: r },
        }));
  }
}
const dt = "https://nftapi.cyberwiz.io",
  dn = "/demographics";
function _t(e, n = {}) {
  const s = dt.endsWith("/") ? dt : dt + "/",
    i = new URL(e.replace(/^\//, ""), s);
  for (const [a, c] of Object.entries(n))
    c != null && String(c).length && i.searchParams.set(a, c);
  return i.toString();
}
async function nt(e) {
  return se(
    "fetchJsonWithDiagnostics",
    async () => {
      let n;
      try {
        n = await fetch(e, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
      } catch (i) {
        throw new Error(
          `Network error calling API: ${(i == null ? void 0 : i.message) || i}`,
        );
      }
      const s = await n.text().catch(() => "");
      if (!n.ok)
        throw new Error(
          `API ${n.status} ${n.statusText} for ${e} :: ${s || "<no body>"}`,
        );
      try {
        return JSON.parse(s);
      } catch {
        throw new Error(
          `API 200 but response was not valid JSON for ${e} :: ${s.slice(0, 200)}…`,
        );
      }
    },
    { url: e },
  );
}
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */ const {
  entries: fn,
  setPrototypeOf: Vt,
  isFrozen: On,
  getPrototypeOf: Pn,
  getOwnPropertyDescriptor: In,
} = Object;
let { freeze: J, seal: ie, create: mn } = Object,
  { apply: Dt, construct: Ot } = typeof Reflect < "u" && Reflect;
J ||
  (J = function (n) {
    return n;
  });
ie ||
  (ie = function (n) {
    return n;
  });
Dt ||
  (Dt = function (n, s, i) {
    return n.apply(s, i);
  });
Ot ||
  (Ot = function (n, s) {
    return new n(...s);
  });
const lt = K(Array.prototype.forEach),
  kn = K(Array.prototype.lastIndexOf),
  qt = K(Array.prototype.pop),
  Je = K(Array.prototype.push),
  $n = K(Array.prototype.splice),
  ft = K(String.prototype.toLowerCase),
  Et = K(String.prototype.toString),
  Xt = K(String.prototype.match),
  Ke = K(String.prototype.replace),
  Mn = K(String.prototype.indexOf),
  xn = K(String.prototype.trim),
  le = K(Object.prototype.hasOwnProperty),
  X = K(RegExp.prototype.test),
  Ze = Fn(TypeError);
function K(e) {
  return function (n) {
    n instanceof RegExp && (n.lastIndex = 0);
    for (
      var s = arguments.length, i = new Array(s > 1 ? s - 1 : 0), a = 1;
      a < s;
      a++
    )
      i[a - 1] = arguments[a];
    return Dt(e, n, i);
  };
}
function Fn(e) {
  return function () {
    for (var n = arguments.length, s = new Array(n), i = 0; i < n; i++)
      s[i] = arguments[i];
    return Ot(e, s);
  };
}
function R(e, n) {
  let s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : ft;
  Vt && Vt(e, null);
  let i = n.length;
  for (; i--; ) {
    let a = n[i];
    if (typeof a == "string") {
      const c = s(a);
      c !== a && (On(n) || (n[i] = c), (a = c));
    }
    e[a] = !0;
  }
  return e;
}
function Un(e) {
  for (let n = 0; n < e.length; n++) le(e, n) || (e[n] = null);
  return e;
}
function ge(e) {
  const n = mn(null);
  for (const [s, i] of fn(e))
    le(e, s) &&
      (Array.isArray(i)
        ? (n[s] = Un(i))
        : i && typeof i == "object" && i.constructor === Object
          ? (n[s] = ge(i))
          : (n[s] = i));
  return n;
}
function Qe(e, n) {
  for (; e !== null; ) {
    const i = In(e, n);
    if (i) {
      if (i.get) return K(i.get);
      if (typeof i.value == "function") return K(i.value);
    }
    e = Pn(e);
  }
  function s() {
    return null;
  }
  return s;
}
const Jt = J([
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "content",
    "data",
    "datalist",
    "dd",
    "decorator",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "nav",
    "nobr",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "section",
    "select",
    "shadow",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
  ]),
  Tt = J([
    "svg",
    "a",
    "altglyph",
    "altglyphdef",
    "altglyphitem",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "circle",
    "clippath",
    "defs",
    "desc",
    "ellipse",
    "filter",
    "font",
    "g",
    "glyph",
    "glyphref",
    "hkern",
    "image",
    "line",
    "lineargradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialgradient",
    "rect",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textpath",
    "title",
    "tref",
    "tspan",
    "view",
    "vkern",
  ]),
  St = J([
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
  ]),
  Hn = J([
    "animate",
    "color-profile",
    "cursor",
    "discard",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignobject",
    "hatch",
    "hatchpath",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "missing-glyph",
    "script",
    "set",
    "solidcolor",
    "unknown",
    "use",
  ]),
  bt = J([
    "math",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mglyph",
    "mi",
    "mlabeledtr",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "mprescripts",
  ]),
  Gn = J([
    "maction",
    "maligngroup",
    "malignmark",
    "mlongdiv",
    "mscarries",
    "mscarry",
    "msgroup",
    "mstack",
    "msline",
    "msrow",
    "semantics",
    "annotation",
    "annotation-xml",
    "mprescripts",
    "none",
  ]),
  Kt = J(["#text"]),
  Zt = J([
    "accept",
    "action",
    "align",
    "alt",
    "autocapitalize",
    "autocomplete",
    "autopictureinpicture",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "capture",
    "cellpadding",
    "cellspacing",
    "checked",
    "cite",
    "class",
    "clear",
    "color",
    "cols",
    "colspan",
    "controls",
    "controlslist",
    "coords",
    "crossorigin",
    "datetime",
    "decoding",
    "default",
    "dir",
    "disabled",
    "disablepictureinpicture",
    "disableremoteplayback",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "face",
    "for",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "id",
    "inputmode",
    "integrity",
    "ismap",
    "kind",
    "label",
    "lang",
    "list",
    "loading",
    "loop",
    "low",
    "max",
    "maxlength",
    "media",
    "method",
    "min",
    "minlength",
    "multiple",
    "muted",
    "name",
    "nonce",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "optimum",
    "pattern",
    "placeholder",
    "playsinline",
    "popover",
    "popovertarget",
    "popovertargetaction",
    "poster",
    "preload",
    "pubdate",
    "radiogroup",
    "readonly",
    "rel",
    "required",
    "rev",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "spellcheck",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "span",
    "srclang",
    "start",
    "src",
    "srcset",
    "step",
    "style",
    "summary",
    "tabindex",
    "title",
    "translate",
    "type",
    "usemap",
    "valign",
    "value",
    "width",
    "wrap",
    "xmlns",
    "slot",
  ]),
  Rt = J([
    "accent-height",
    "accumulate",
    "additive",
    "alignment-baseline",
    "amplitude",
    "ascent",
    "attributename",
    "attributetype",
    "azimuth",
    "basefrequency",
    "baseline-shift",
    "begin",
    "bias",
    "by",
    "class",
    "clip",
    "clippathunits",
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "cx",
    "cy",
    "d",
    "dx",
    "dy",
    "diffuseconstant",
    "direction",
    "display",
    "divisor",
    "dur",
    "edgemode",
    "elevation",
    "end",
    "exponent",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "filterunits",
    "flood-color",
    "flood-opacity",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyph-name",
    "glyphref",
    "gradientunits",
    "gradienttransform",
    "height",
    "href",
    "id",
    "image-rendering",
    "in",
    "in2",
    "intercept",
    "k",
    "k1",
    "k2",
    "k3",
    "k4",
    "kerning",
    "keypoints",
    "keysplines",
    "keytimes",
    "lang",
    "lengthadjust",
    "letter-spacing",
    "kernelmatrix",
    "kernelunitlength",
    "lighting-color",
    "local",
    "marker-end",
    "marker-mid",
    "marker-start",
    "markerheight",
    "markerunits",
    "markerwidth",
    "maskcontentunits",
    "maskunits",
    "max",
    "mask",
    "media",
    "method",
    "mode",
    "min",
    "name",
    "numoctaves",
    "offset",
    "operator",
    "opacity",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "paint-order",
    "path",
    "pathlength",
    "patterncontentunits",
    "patterntransform",
    "patternunits",
    "points",
    "preservealpha",
    "preserveaspectratio",
    "primitiveunits",
    "r",
    "rx",
    "ry",
    "radius",
    "refx",
    "refy",
    "repeatcount",
    "repeatdur",
    "restart",
    "result",
    "rotate",
    "scale",
    "seed",
    "shape-rendering",
    "slope",
    "specularconstant",
    "specularexponent",
    "spreadmethod",
    "startoffset",
    "stddeviation",
    "stitchtiles",
    "stop-color",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke",
    "stroke-width",
    "style",
    "surfacescale",
    "systemlanguage",
    "tabindex",
    "tablevalues",
    "targetx",
    "targety",
    "transform",
    "transform-origin",
    "text-anchor",
    "text-decoration",
    "text-rendering",
    "textlength",
    "type",
    "u1",
    "u2",
    "unicode",
    "values",
    "viewbox",
    "visibility",
    "version",
    "vert-adv-y",
    "vert-origin-x",
    "vert-origin-y",
    "width",
    "word-spacing",
    "wrap",
    "writing-mode",
    "xchannelselector",
    "ychannelselector",
    "x",
    "x1",
    "x2",
    "xmlns",
    "y",
    "y1",
    "y2",
    "z",
    "zoomandpan",
  ]),
  Qt = J([
    "accent",
    "accentunder",
    "align",
    "bevelled",
    "close",
    "columnsalign",
    "columnlines",
    "columnspan",
    "denomalign",
    "depth",
    "dir",
    "display",
    "displaystyle",
    "encoding",
    "fence",
    "frame",
    "height",
    "href",
    "id",
    "largeop",
    "length",
    "linethickness",
    "lspace",
    "lquote",
    "mathbackground",
    "mathcolor",
    "mathsize",
    "mathvariant",
    "maxsize",
    "minsize",
    "movablelimits",
    "notation",
    "numalign",
    "open",
    "rowalign",
    "rowlines",
    "rowspacing",
    "rowspan",
    "rspace",
    "rquote",
    "scriptlevel",
    "scriptminsize",
    "scriptsizemultiplier",
    "selection",
    "separator",
    "separators",
    "stretchy",
    "subscriptshift",
    "supscriptshift",
    "symmetric",
    "voffset",
    "width",
    "xmlns",
  ]),
  ut = J(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  Wn = ie(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
  zn = ie(/<%[\w\W]*|[\w\W]*%>/gm),
  Bn = ie(/\$\{[\w\W]*/gm),
  jn = ie(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  Yn = ie(/^aria-[\-\w]+$/),
  hn = ie(
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ),
  Vn = ie(/^(?:\w+script|data):/i),
  qn = ie(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  _n = ie(/^html$/i),
  Xn = ie(/^[a-z][.\w]*(-[.\w]+)+$/i);
var en = Object.freeze({
  __proto__: null,
  ARIA_ATTR: Yn,
  ATTR_WHITESPACE: qn,
  CUSTOM_ELEMENT: Xn,
  DATA_ATTR: jn,
  DOCTYPE_NAME: _n,
  ERB_EXPR: zn,
  IS_ALLOWED_URI: hn,
  IS_SCRIPT_OR_DATA: Vn,
  MUSTACHE_EXPR: Wn,
  TMPLIT_EXPR: Bn,
});
const et = {
    element: 1,
    text: 3,
    progressingInstruction: 7,
    comment: 8,
    document: 9,
  },
  Jn = function () {
    return typeof window > "u" ? null : window;
  },
  Kn = function (n, s) {
    if (typeof n != "object" || typeof n.createPolicy != "function")
      return null;
    let i = null;
    const a = "data-tt-policy-suffix";
    s && s.hasAttribute(a) && (i = s.getAttribute(a));
    const c = "dompurify" + (i ? "#" + i : "");
    try {
      return n.createPolicy(c, {
        createHTML(o) {
          return o;
        },
        createScriptURL(o) {
          return o;
        },
      });
    } catch {
      return (
        console.warn("TrustedTypes policy " + c + " could not be created."),
        null
      );
    }
  },
  tn = function () {
    return {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: [],
    };
  };
function gn() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Jn();
  const n = (T) => gn(T);
  if (
    ((n.version = "3.2.6"),
    (n.removed = []),
    !e || !e.document || e.document.nodeType !== et.document || !e.Element)
  )
    return ((n.isSupported = !1), n);
  let { document: s } = e;
  const i = s,
    a = i.currentScript,
    {
      DocumentFragment: c,
      HTMLTemplateElement: o,
      Node: r,
      Element: d,
      NodeFilter: f,
      NamedNodeMap: l = e.NamedNodeMap || e.MozNamedAttrMap,
      HTMLFormElement: y,
      DOMParser: v,
      trustedTypes: _,
    } = e,
    m = d.prototype,
    w = Qe(m, "cloneNode"),
    h = Qe(m, "remove"),
    p = Qe(m, "nextSibling"),
    g = Qe(m, "childNodes"),
    E = Qe(m, "parentNode");
  if (typeof o == "function") {
    const T = s.createElement("template");
    T.content && T.content.ownerDocument && (s = T.content.ownerDocument);
  }
  let b,
    C = "";
  const {
      implementation: F,
      createNodeIterator: k,
      createDocumentFragment: z,
      getElementsByTagName: G,
    } = s,
    { importNode: q } = i;
  let N = tn();
  n.isSupported =
    typeof fn == "function" &&
    typeof E == "function" &&
    F &&
    F.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: L,
    ERB_EXPR: B,
    TMPLIT_EXPR: ue,
    DATA_ATTR: te,
    ARIA_ATTR: oe,
    IS_SCRIPT_OR_DATA: re,
    ATTR_WHITESPACE: ae,
    CUSTOM_ELEMENT: ce,
  } = en;
  let { IS_ALLOWED_URI: Te } = en,
    $ = null;
  const st = R({}, [...Jt, ...Tt, ...St, ...bt, ...Kt]);
  let U = null;
  const Ue = R({}, [...Zt, ...Rt, ...Qt, ...ut]);
  let O = Object.seal(
      mn(null, {
        tagNameCheck: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: null,
        },
        attributeNameCheck: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: null,
        },
        allowCustomizedBuiltInElements: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: !1,
        },
      }),
    ),
    Se = null,
    He = null,
    M = !0,
    I = !0,
    Ge = !1,
    We = !0,
    ye = !1,
    Re = !0,
    fe = !1,
    ze = !1,
    Be = !1,
    Ae = !1,
    Ce = !1,
    Ne = !1,
    Le = !0,
    it = !1;
  const je = "user-content-";
  let Ye = !0,
    me = !1,
    we = {},
    pe = null;
  const ot = R({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp",
  ]);
  let De = null;
  const rt = R({}, ["audio", "video", "img", "source", "image", "track"]);
  let Ve = null;
  const at = R({}, [
      "alt",
      "class",
      "for",
      "id",
      "label",
      "name",
      "pattern",
      "placeholder",
      "role",
      "summary",
      "title",
      "value",
      "style",
      "xmlns",
    ]),
    Oe = "http://www.w3.org/1998/Math/MathML",
    Pe = "http://www.w3.org/2000/svg",
    S = "http://www.w3.org/1999/xhtml";
  let j = S,
    Z = !1,
    Q = null;
  const ct = R({}, [Oe, Pe, S], Et);
  let Ie = R({}, ["mi", "mo", "mn", "ms", "mtext"]),
    ve = R({}, ["annotation-xml"]);
  const ke = R({}, ["title", "style", "font", "a", "script"]);
  let be = null;
  const Tn = ["application/xhtml+xml", "text/html"],
    Sn = "text/html";
  let W = null,
    $e = null;
  const bn = s.createElement("form"),
    $t = function (t) {
      return t instanceof RegExp || t instanceof Function;
    },
    At = function () {
      let t =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (!($e && $e === t)) {
        if (
          ((!t || typeof t != "object") && (t = {}),
          (t = ge(t)),
          (be =
            Tn.indexOf(t.PARSER_MEDIA_TYPE) === -1 ? Sn : t.PARSER_MEDIA_TYPE),
          (W = be === "application/xhtml+xml" ? Et : ft),
          ($ = le(t, "ALLOWED_TAGS") ? R({}, t.ALLOWED_TAGS, W) : st),
          (U = le(t, "ALLOWED_ATTR") ? R({}, t.ALLOWED_ATTR, W) : Ue),
          (Q = le(t, "ALLOWED_NAMESPACES")
            ? R({}, t.ALLOWED_NAMESPACES, Et)
            : ct),
          (Ve = le(t, "ADD_URI_SAFE_ATTR")
            ? R(ge(at), t.ADD_URI_SAFE_ATTR, W)
            : at),
          (De = le(t, "ADD_DATA_URI_TAGS")
            ? R(ge(rt), t.ADD_DATA_URI_TAGS, W)
            : rt),
          (pe = le(t, "FORBID_CONTENTS") ? R({}, t.FORBID_CONTENTS, W) : ot),
          (Se = le(t, "FORBID_TAGS") ? R({}, t.FORBID_TAGS, W) : ge({})),
          (He = le(t, "FORBID_ATTR") ? R({}, t.FORBID_ATTR, W) : ge({})),
          (we = le(t, "USE_PROFILES") ? t.USE_PROFILES : !1),
          (M = t.ALLOW_ARIA_ATTR !== !1),
          (I = t.ALLOW_DATA_ATTR !== !1),
          (Ge = t.ALLOW_UNKNOWN_PROTOCOLS || !1),
          (We = t.ALLOW_SELF_CLOSE_IN_ATTR !== !1),
          (ye = t.SAFE_FOR_TEMPLATES || !1),
          (Re = t.SAFE_FOR_XML !== !1),
          (fe = t.WHOLE_DOCUMENT || !1),
          (Ae = t.RETURN_DOM || !1),
          (Ce = t.RETURN_DOM_FRAGMENT || !1),
          (Ne = t.RETURN_TRUSTED_TYPE || !1),
          (Be = t.FORCE_BODY || !1),
          (Le = t.SANITIZE_DOM !== !1),
          (it = t.SANITIZE_NAMED_PROPS || !1),
          (Ye = t.KEEP_CONTENT !== !1),
          (me = t.IN_PLACE || !1),
          (Te = t.ALLOWED_URI_REGEXP || hn),
          (j = t.NAMESPACE || S),
          (Ie = t.MATHML_TEXT_INTEGRATION_POINTS || Ie),
          (ve = t.HTML_INTEGRATION_POINTS || ve),
          (O = t.CUSTOM_ELEMENT_HANDLING || {}),
          t.CUSTOM_ELEMENT_HANDLING &&
            $t(t.CUSTOM_ELEMENT_HANDLING.tagNameCheck) &&
            (O.tagNameCheck = t.CUSTOM_ELEMENT_HANDLING.tagNameCheck),
          t.CUSTOM_ELEMENT_HANDLING &&
            $t(t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) &&
            (O.attributeNameCheck =
              t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),
          t.CUSTOM_ELEMENT_HANDLING &&
            typeof t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements ==
              "boolean" &&
            (O.allowCustomizedBuiltInElements =
              t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),
          ye && (I = !1),
          Ce && (Ae = !0),
          we &&
            (($ = R({}, Kt)),
            (U = []),
            we.html === !0 && (R($, Jt), R(U, Zt)),
            we.svg === !0 && (R($, Tt), R(U, Rt), R(U, ut)),
            we.svgFilters === !0 && (R($, St), R(U, Rt), R(U, ut)),
            we.mathMl === !0 && (R($, bt), R(U, Qt), R(U, ut))),
          t.ADD_TAGS && ($ === st && ($ = ge($)), R($, t.ADD_TAGS, W)),
          t.ADD_ATTR && (U === Ue && (U = ge(U)), R(U, t.ADD_ATTR, W)),
          t.ADD_URI_SAFE_ATTR && R(Ve, t.ADD_URI_SAFE_ATTR, W),
          t.FORBID_CONTENTS &&
            (pe === ot && (pe = ge(pe)), R(pe, t.FORBID_CONTENTS, W)),
          Ye && ($["#text"] = !0),
          fe && R($, ["html", "head", "body"]),
          $.table && (R($, ["tbody"]), delete Se.tbody),
          t.TRUSTED_TYPES_POLICY)
        ) {
          if (typeof t.TRUSTED_TYPES_POLICY.createHTML != "function")
            throw Ze(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.',
            );
          if (typeof t.TRUSTED_TYPES_POLICY.createScriptURL != "function")
            throw Ze(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.',
            );
          ((b = t.TRUSTED_TYPES_POLICY), (C = b.createHTML("")));
        } else
          (b === void 0 && (b = Kn(_, a)),
            b !== null && typeof C == "string" && (C = b.createHTML("")));
        (J && J(t), ($e = t));
      }
    },
    Mt = R({}, [...Tt, ...St, ...Hn]),
    xt = R({}, [...bt, ...Gn]),
    Rn = function (t) {
      let u = E(t);
      (!u || !u.tagName) && (u = { namespaceURI: j, tagName: "template" });
      const A = ft(t.tagName),
        P = ft(u.tagName);
      return Q[t.namespaceURI]
        ? t.namespaceURI === Pe
          ? u.namespaceURI === S
            ? A === "svg"
            : u.namespaceURI === Oe
              ? A === "svg" && (P === "annotation-xml" || Ie[P])
              : !!Mt[A]
          : t.namespaceURI === Oe
            ? u.namespaceURI === S
              ? A === "math"
              : u.namespaceURI === Pe
                ? A === "math" && ve[P]
                : !!xt[A]
            : t.namespaceURI === S
              ? (u.namespaceURI === Pe && !ve[P]) ||
                (u.namespaceURI === Oe && !Ie[P])
                ? !1
                : !xt[A] && (ke[A] || !Mt[A])
              : !!(be === "application/xhtml+xml" && Q[t.namespaceURI])
        : !1;
    },
    de = function (t) {
      Je(n.removed, { element: t });
      try {
        E(t).removeChild(t);
      } catch {
        h(t);
      }
    },
    Me = function (t, u) {
      try {
        Je(n.removed, { attribute: u.getAttributeNode(t), from: u });
      } catch {
        Je(n.removed, { attribute: null, from: u });
      }
      if ((u.removeAttribute(t), t === "is"))
        if (Ae || Ce)
          try {
            de(u);
          } catch {}
        else
          try {
            u.setAttribute(t, "");
          } catch {}
    },
    Ft = function (t) {
      let u = null,
        A = null;
      if (Be) t = "<remove></remove>" + t;
      else {
        const H = Xt(t, /^[\r\n\t ]+/);
        A = H && H[0];
      }
      be === "application/xhtml+xml" &&
        j === S &&
        (t =
          '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' +
          t +
          "</body></html>");
      const P = b ? b.createHTML(t) : t;
      if (j === S)
        try {
          u = new v().parseFromString(P, be);
        } catch {}
      if (!u || !u.documentElement) {
        u = F.createDocument(j, "template", null);
        try {
          u.documentElement.innerHTML = Z ? C : P;
        } catch {}
      }
      const Y = u.body || u.documentElement;
      return (
        t && A && Y.insertBefore(s.createTextNode(A), Y.childNodes[0] || null),
        j === S
          ? G.call(u, fe ? "html" : "body")[0]
          : fe
            ? u.documentElement
            : Y
      );
    },
    Ut = function (t) {
      return k.call(
        t.ownerDocument || t,
        t,
        f.SHOW_ELEMENT |
          f.SHOW_COMMENT |
          f.SHOW_TEXT |
          f.SHOW_PROCESSING_INSTRUCTION |
          f.SHOW_CDATA_SECTION,
        null,
      );
    },
    wt = function (t) {
      return (
        t instanceof y &&
        (typeof t.nodeName != "string" ||
          typeof t.textContent != "string" ||
          typeof t.removeChild != "function" ||
          !(t.attributes instanceof l) ||
          typeof t.removeAttribute != "function" ||
          typeof t.setAttribute != "function" ||
          typeof t.namespaceURI != "string" ||
          typeof t.insertBefore != "function" ||
          typeof t.hasChildNodes != "function")
      );
    },
    Ht = function (t) {
      return typeof r == "function" && t instanceof r;
    };
  function he(T, t, u) {
    lt(T, (A) => {
      A.call(n, t, u, $e);
    });
  }
  const Gt = function (t) {
      let u = null;
      if ((he(N.beforeSanitizeElements, t, null), wt(t))) return (de(t), !0);
      const A = W(t.nodeName);
      if (
        (he(N.uponSanitizeElement, t, { tagName: A, allowedTags: $ }),
        (Re &&
          t.hasChildNodes() &&
          !Ht(t.firstElementChild) &&
          X(/<[/\w!]/g, t.innerHTML) &&
          X(/<[/\w!]/g, t.textContent)) ||
          t.nodeType === et.progressingInstruction ||
          (Re && t.nodeType === et.comment && X(/<[/\w]/g, t.data)))
      )
        return (de(t), !0);
      if (!$[A] || Se[A]) {
        if (
          !Se[A] &&
          zt(A) &&
          ((O.tagNameCheck instanceof RegExp && X(O.tagNameCheck, A)) ||
            (O.tagNameCheck instanceof Function && O.tagNameCheck(A)))
        )
          return !1;
        if (Ye && !pe[A]) {
          const P = E(t) || t.parentNode,
            Y = g(t) || t.childNodes;
          if (Y && P) {
            const H = Y.length;
            for (let ee = H - 1; ee >= 0; --ee) {
              const _e = w(Y[ee], !0);
              ((_e.__removalCount = (t.__removalCount || 0) + 1),
                P.insertBefore(_e, p(t)));
            }
          }
        }
        return (de(t), !0);
      }
      return (t instanceof d && !Rn(t)) ||
        ((A === "noscript" || A === "noembed" || A === "noframes") &&
          X(/<\/no(script|embed|frames)/i, t.innerHTML))
        ? (de(t), !0)
        : (ye &&
            t.nodeType === et.text &&
            ((u = t.textContent),
            lt([L, B, ue], (P) => {
              u = Ke(u, P, " ");
            }),
            t.textContent !== u &&
              (Je(n.removed, { element: t.cloneNode() }), (t.textContent = u))),
          he(N.afterSanitizeElements, t, null),
          !1);
    },
    Wt = function (t, u, A) {
      if (Le && (u === "id" || u === "name") && (A in s || A in bn)) return !1;
      if (!(I && !He[u] && X(te, u))) {
        if (!(M && X(oe, u))) {
          if (!U[u] || He[u]) {
            if (
              !(
                (zt(t) &&
                  ((O.tagNameCheck instanceof RegExp && X(O.tagNameCheck, t)) ||
                    (O.tagNameCheck instanceof Function &&
                      O.tagNameCheck(t))) &&
                  ((O.attributeNameCheck instanceof RegExp &&
                    X(O.attributeNameCheck, u)) ||
                    (O.attributeNameCheck instanceof Function &&
                      O.attributeNameCheck(u)))) ||
                (u === "is" &&
                  O.allowCustomizedBuiltInElements &&
                  ((O.tagNameCheck instanceof RegExp && X(O.tagNameCheck, A)) ||
                    (O.tagNameCheck instanceof Function && O.tagNameCheck(A))))
              )
            )
              return !1;
          } else if (!Ve[u]) {
            if (!X(Te, Ke(A, ae, ""))) {
              if (
                !(
                  (u === "src" || u === "xlink:href" || u === "href") &&
                  t !== "script" &&
                  Mn(A, "data:") === 0 &&
                  De[t]
                )
              ) {
                if (!(Ge && !X(re, Ke(A, ae, "")))) {
                  if (A) return !1;
                }
              }
            }
          }
        }
      }
      return !0;
    },
    zt = function (t) {
      return t !== "annotation-xml" && Xt(t, ce);
    },
    Bt = function (t) {
      he(N.beforeSanitizeAttributes, t, null);
      const { attributes: u } = t;
      if (!u || wt(t)) return;
      const A = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: U,
        forceKeepAttr: void 0,
      };
      let P = u.length;
      for (; P--; ) {
        const Y = u[P],
          { name: H, namespaceURI: ee, value: _e } = Y,
          qe = W(H),
          vt = _e;
        let V = H === "value" ? vt : xn(vt);
        if (
          ((A.attrName = qe),
          (A.attrValue = V),
          (A.keepAttr = !0),
          (A.forceKeepAttr = void 0),
          he(N.uponSanitizeAttribute, t, A),
          (V = A.attrValue),
          it && (qe === "id" || qe === "name") && (Me(H, t), (V = je + V)),
          Re && X(/((--!?|])>)|<\/(style|title)/i, V))
        ) {
          Me(H, t);
          continue;
        }
        if (A.forceKeepAttr) continue;
        if (!A.keepAttr) {
          Me(H, t);
          continue;
        }
        if (!We && X(/\/>/i, V)) {
          Me(H, t);
          continue;
        }
        ye &&
          lt([L, B, ue], (Yt) => {
            V = Ke(V, Yt, " ");
          });
        const jt = W(t.nodeName);
        if (!Wt(jt, qe, V)) {
          Me(H, t);
          continue;
        }
        if (
          b &&
          typeof _ == "object" &&
          typeof _.getAttributeType == "function" &&
          !ee
        )
          switch (_.getAttributeType(jt, qe)) {
            case "TrustedHTML": {
              V = b.createHTML(V);
              break;
            }
            case "TrustedScriptURL": {
              V = b.createScriptURL(V);
              break;
            }
          }
        if (V !== vt)
          try {
            (ee ? t.setAttributeNS(ee, H, V) : t.setAttribute(H, V),
              wt(t) ? de(t) : qt(n.removed));
          } catch {
            Me(H, t);
          }
      }
      he(N.afterSanitizeAttributes, t, null);
    },
    Cn = function T(t) {
      let u = null;
      const A = Ut(t);
      for (he(N.beforeSanitizeShadowDOM, t, null); (u = A.nextNode()); )
        (he(N.uponSanitizeShadowNode, u, null),
          Gt(u),
          Bt(u),
          u.content instanceof c && T(u.content));
      he(N.afterSanitizeShadowDOM, t, null);
    };
  return (
    (n.sanitize = function (T) {
      let t =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
        u = null,
        A = null,
        P = null,
        Y = null;
      if (((Z = !T), Z && (T = "<!-->"), typeof T != "string" && !Ht(T)))
        if (typeof T.toString == "function") {
          if (((T = T.toString()), typeof T != "string"))
            throw Ze("dirty is not a string, aborting");
        } else throw Ze("toString is not a function");
      if (!n.isSupported) return T;
      if (
        (ze || At(t), (n.removed = []), typeof T == "string" && (me = !1), me)
      ) {
        if (T.nodeName) {
          const _e = W(T.nodeName);
          if (!$[_e] || Se[_e])
            throw Ze("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (T instanceof r)
        ((u = Ft("<!---->")),
          (A = u.ownerDocument.importNode(T, !0)),
          (A.nodeType === et.element && A.nodeName === "BODY") ||
          A.nodeName === "HTML"
            ? (u = A)
            : u.appendChild(A));
      else {
        if (!Ae && !ye && !fe && T.indexOf("<") === -1)
          return b && Ne ? b.createHTML(T) : T;
        if (((u = Ft(T)), !u)) return Ae ? null : Ne ? C : "";
      }
      u && Be && de(u.firstChild);
      const H = Ut(me ? T : u);
      for (; (P = H.nextNode()); )
        (Gt(P), Bt(P), P.content instanceof c && Cn(P.content));
      if (me) return T;
      if (Ae) {
        if (Ce)
          for (Y = z.call(u.ownerDocument); u.firstChild; )
            Y.appendChild(u.firstChild);
        else Y = u;
        return (
          (U.shadowroot || U.shadowrootmode) && (Y = q.call(i, Y, !0)),
          Y
        );
      }
      let ee = fe ? u.outerHTML : u.innerHTML;
      return (
        fe &&
          $["!doctype"] &&
          u.ownerDocument &&
          u.ownerDocument.doctype &&
          u.ownerDocument.doctype.name &&
          X(_n, u.ownerDocument.doctype.name) &&
          (ee =
            "<!DOCTYPE " +
            u.ownerDocument.doctype.name +
            `>
` +
            ee),
        ye &&
          lt([L, B, ue], (_e) => {
            ee = Ke(ee, _e, " ");
          }),
        b && Ne ? b.createHTML(ee) : ee
      );
    }),
    (n.setConfig = function () {
      let T =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      (At(T), (ze = !0));
    }),
    (n.clearConfig = function () {
      (($e = null), (ze = !1));
    }),
    (n.isValidAttribute = function (T, t, u) {
      $e || At({});
      const A = W(T),
        P = W(t);
      return Wt(A, P, u);
    }),
    (n.addHook = function (T, t) {
      typeof t == "function" && Je(N[T], t);
    }),
    (n.removeHook = function (T, t) {
      if (t !== void 0) {
        const u = kn(N[T], t);
        return u === -1 ? void 0 : $n(N[T], u, 1)[0];
      }
      return qt(N[T]);
    }),
    (n.removeHooks = function (T) {
      N[T] = [];
    }),
    (n.removeAllHooks = function () {
      N = tn();
    }),
    n
  );
}
var yn = gn();
const Es = Object.freeze(
  Object.defineProperty({ __proto__: null, default: yn }, Symbol.toStringTag, {
    value: "Module",
  }),
);
function D(e = "") {
  return e == null ? "" : yn(window).sanitize(String(e));
}
function It() {
  return new Date().toLocaleString();
}
function An(e = 0) {
  const n = Math.round(e / 1e3),
    s = Math.floor(n / 60),
    i = n % 60;
  return `${s} ${s === 1 ? "Minute" : "Minutes"} and ${i} ${i === 1 ? "Second" : "Seconds"}`;
}
function Zn(e) {
  document.getElementById("result").innerHTML = D(`
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${It()}</span>
      </div>
      ${e ? `<p class="note">Address: <strong>${D(e)}</strong></p>` : ""}
      <div class="callout">Fetching county, languages, English proficiency, population, income, DAC, and alerts…</div>
      <p class="note">Elapsed: <span id="searchTimer">0m 00s</span></p>
    </div>
  `);
}
function nn(e, n, s) {
  document.getElementById("result").innerHTML = D(`
    <div class="card" role="alert">
      <div class="card__header">
        <h2 class="card__title">Unable to retrieve data</h2>
        <span class="updated">${It()}</span>
      </div>
      ${n ? `<p class="note">Address: <strong>${D(n)}</strong></p>` : ""}
      <div class="callout" style="border-left-color:#b45309;">
        ${D(e || "Please try again with a different address.")}
      </div>
      <p class="note">Search took ${An(s)}.</p>
      <p class="note">API base: <code>${D(dt)}</code>. If your API has a prefix, adjust <code>API_PATH</code>.</p>
    </div>
  `);
}
var un;
const sn =
  ((un = document.querySelector('meta[name="sentry-dsn"]')) == null
    ? void 0
    : un.content) || "";
sn &&
  pn(() => import("./index.js"), [])
    .then((e) => {
      ((window.Sentry = e), e.init({ dsn: sn }), gt("Sentry initialized"));
    })
    .catch((e) => console.error("Sentry failed to load", e));
"serviceWorker" in navigator &&
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((e) => console.error("SW registration failed", e));
  });
window.addEventListener("error", (e) => {
  var n;
  (gt("window.onerror", e.message),
    (n = window.Sentry) == null ||
      n.captureException(e.error || new Error(e.message || "Unknown error")));
});
window.addEventListener("unhandledrejection", (e) => {
  var n;
  (gt("unhandledrejection", e.reason),
    (n = window.Sentry) == null || n.captureException(e.reason));
});
let xe = null;
const Ct = new Map();
function Qn() {
  window.print();
}
window.printReport = Qn;
function es() {
  if (!xe) return;
  const e = new Blob([JSON.stringify(xe, null, 2)], {
      type: "application/json",
    }),
    n = URL.createObjectURL(e),
    s = document.createElement("a"),
    i = (xe.address || "report").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  ((s.href = n),
    (s.download = `calwep_report_${i}.json`),
    document.body.appendChild(s),
    s.click(),
    document.body.removeChild(s),
    URL.revokeObjectURL(n));
}
window.downloadRawData = es;
window.downloadPdf = async function () {
  const { downloadPdf: e } = await pn(async () => {
    const { downloadPdf: n } = await import("./pdf.js").then((s) => s.p);
    return { downloadPdf: n };
  }, []);
  e(xe);
};
function ts() {
  const e = window.location.href;
  navigator.clipboard && window.isSecureContext
    ? navigator.clipboard
        .writeText(e)
        .then(() => alert("Link copied to clipboard"))
        .catch(() => {
          prompt("Copy this link:", e);
        })
    : prompt("Copy this link:", e);
}
window.shareReport = ts;
function ne(e) {
  return e == null || Number(e) === -888888888;
}
function ns(e) {
  return !ne(e) && Number.isFinite(Number(e))
    ? Number(e).toLocaleString()
    : "—";
}
function Nt(e) {
  return ne(e) || !Number.isFinite(Number(e))
    ? "—"
    : `$${Math.round(Number(e)).toLocaleString()}`;
}
function ss(e) {
  return !ne(e) && Number.isFinite(Number(e))
    ? Number(e).toLocaleString(void 0, { maximumFractionDigits: 1 })
    : "—";
}
function x(e) {
  return !ne(e) && Number.isFinite(Number(e))
    ? `${Number(e).toFixed(1)}%`
    : "—";
}
function is(e = "") {
  return e.replace(/_/g, " ").replace(/\b\w/g, (n) => n.toUpperCase());
}
function mt(e = {}, ...n) {
  const s = (i) => i && typeof i == "object" && !Array.isArray(i);
  for (const i of n)
    if (s(i))
      for (const [a, c] of Object.entries(i))
        s(c) ? (e[a] = mt(s(e[a]) ? e[a] : {}, c)) : (e[a] = c);
  return e;
}
function yt(e = [], n = 50) {
  const s = [];
  for (let i = 0; i < e.length; i += n) s.push(e.slice(i, i + n));
  return s;
}
const os = {
    pm25: "PM2.5",
    diesel: "Diesel PM",
    toxic_releases: "Toxic releases",
    drinking_water: "Drinking water",
    cleanup_sites: "Cleanup sites",
    groundwater_threats: "Groundwater threats",
    hazardous_waste: "Hazardous waste",
    impaired_waters: "Impaired waters",
    solid_waste: "Solid waste",
    low_birth_weight: "Low birth weight",
    cardiovascular_disease: "Cardiovascular disease",
    linguistic_isolation: "Linguistic isolation",
    housing_burden: "Housing burden",
  },
  pt = {
    exposures: [
      "ozone",
      "pm25",
      "diesel",
      "toxic_releases",
      "traffic",
      "pesticides",
      "drinking_water",
      "lead",
    ],
    environmental_effects: [
      "cleanup_sites",
      "groundwater_threats",
      "hazardous_waste",
      "impaired_waters",
      "solid_waste",
    ],
    sensitive_populations: [
      "asthma",
      "low_birth_weight",
      "cardiovascular_disease",
    ],
    socioeconomic_factors: [
      "education",
      "linguistic_isolation",
      "poverty",
      "unemployment",
      "housing_burden",
    ],
  };
let ht = null,
  Fe = null;
function rs() {
  Fe = Date.now();
  const e = (n) => {
    const s = document.getElementById("searchTimer");
    s && (s.textContent = n);
    const i = document.getElementById("spinnerTime");
    i && (i.textContent = n);
  };
  (e("0m 00s"),
    (ht = setInterval(() => {
      if (!Fe) return;
      const n = Date.now() - Fe,
        s = Math.floor((n / 1e3) % 60),
        i = Math.floor(n / 6e4);
      e(`${i}m ${s.toString().padStart(2, "0")}s`);
    }, 1e3)));
}
function on() {
  ht && clearInterval(ht);
  const e = Fe ? Date.now() - Fe : 0;
  return ((ht = null), (Fe = null), e);
}
async function as(e = {}) {
  let {
    city: n,
    census_tract: s,
    lat: i,
    lon: a,
    state_fips: c,
    county_fips: o,
    tract_code: r,
  } = e;
  const d = [];
  return (
    !n &&
      i != null &&
      a != null &&
      d.push(
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${i}&longitude=${a}&localityLanguage=en`,
        )
          .then((f) => f.json())
          .then((f) => {
            var y, v;
            n =
              (Array.isArray(
                (y = f == null ? void 0 : f.localityInfo) == null
                  ? void 0
                  : y.administrative,
              )
                ? (v = f.localityInfo.administrative.find(
                    (_) => _.order === 8 || _.adminLevel === 8,
                  )) == null
                  ? void 0
                  : v.name
                : null) ||
              f.city ||
              f.locality ||
              n;
          })
          .catch(() => {}),
      ),
    (!s || !c || !o || !r) &&
      i != null &&
      a != null &&
      d.push(
        fetch(
          `https://geo.fcc.gov/api/census/block/find?latitude=${i}&longitude=${a}&format=json`,
        )
          .then((f) => f.json())
          .then((f) => {
            var y;
            const l =
              (y = f == null ? void 0 : f.Block) == null ? void 0 : y.FIPS;
            l &&
              l.length >= 11 &&
              ((c = l.slice(0, 2)),
              (o = l.slice(2, 5)),
              (r = l.slice(5, 11)),
              (s = `${r.slice(0, 4)}.${r.slice(4)}`));
          })
          .catch(() => {}),
      ),
    d.length && (await Promise.all(d)),
    {
      ...e,
      city: n,
      census_tract: s,
      state_fips: c,
      county_fips: o,
      tract_code: r,
    }
  );
}
let tt = null;
async function wn() {
  if (tt) return tt;
  try {
    const e = await nt(
        "https://api.census.gov/data/2022/acs/acs5/groups/C16001.json",
      ),
      n = (e == null ? void 0 : e.variables) || {},
      s = [],
      i = {};
    for (const [a, c] of Object.entries(n)) {
      if (!a.endsWith("E")) continue;
      const o = c.label || "",
        r = /^Estimate!!Total:!!([^:]+):$/.exec(o);
      r && (s.push(a), (i[a] = r[1]));
    }
    tt = { codes: s, names: i };
  } catch {
    tt = { codes: [], names: {} };
  }
  return tt;
}
async function Pt(e = []) {
  var v, _;
  const { codes: n, names: s } = await wn();
  if (!n.length) return {};
  const i = {};
  for (const m of e) {
    const w = String(m)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (w.length !== 11) continue;
    const h = w.slice(0, 2),
      p = w.slice(2, 5),
      g = w.slice(5),
      E = `${h}${p}`;
    (i[E] || (i[E] = { state: h, county: p, tracts: [] }), i[E].tracts.push(g));
  }
  let a = 0,
    c = 0,
    o = 0;
  const r = {},
    d = Object.values(i).map(async (m) => {
      const w = yt(m.tracts, 50),
        h = await Promise.all(
          w.map(async (g) => {
            const E = g.join(","),
              b = 40,
              C = [];
            for (let L = 0; L < n.length; L += b) {
              const B = n.slice(L, L + b),
                te = `https://api.census.gov/data/2022/acs/acs5?get=${(L === 0 ? ["C16001_001E", "C16001_002E", ...B] : B).join(",")}&for=tract:${E}&in=state:${m.state}%20county:${m.county}`;
              C.push(
                fetch(te)
                  .then((oe) => oe.json())
                  .then((oe) => ({ type: "lang", rows: oe, chunk: B }))
                  .catch(() => null),
              );
            }
            const F = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0115E&for=tract:${E}&in=state:${m.state}%20county:${m.county}`;
            C.push(
              fetch(F)
                .then((L) => L.json())
                .then((L) => ({ type: "english", rows: L }))
                .catch(() => null),
            );
            const k = await Promise.all(C);
            let z = 0,
              G = 0,
              q = 0;
            const N = {};
            for (const L of k) {
              if (!L || !Array.isArray(L.rows) || L.rows.length <= 1) continue;
              const { rows: B } = L;
              if (L.type === "lang") {
                const ue = B[0];
                for (let te = 1; te < B.length; te++) {
                  const oe = B[te],
                    re = {};
                  (ue.forEach((ae, ce) => (re[ae] = Number(oe[ce]))),
                    (z += re.C16001_001E || 0),
                    (G += re.C16001_002E || 0));
                  for (const ae of L.chunk) {
                    const ce = s[ae],
                      Te = re[ae] || 0;
                    ce && (N[ce] = (N[ce] || 0) + Te);
                  }
                }
              } else if (L.type === "english") {
                const ue = B[0];
                for (let te = 1; te < B.length; te++) {
                  const oe = B[te],
                    re = {};
                  (ue.forEach((ae, ce) => (re[ae] = Number(oe[ce]))),
                    (q += re.DP02_0115E || 0));
                }
              }
            }
            return { total: z, englishOnly: G, englishLess: q, langCounts: N };
          }),
        ),
        p = { total: 0, englishOnly: 0, englishLess: 0, langCounts: {} };
      for (const g of h) {
        ((p.total += g.total),
          (p.englishOnly += g.englishOnly),
          (p.englishLess += g.englishLess));
        for (const [E, b] of Object.entries(g.langCounts))
          p.langCounts[E] = (p.langCounts[E] || 0) + b;
      }
      return p;
    }),
    f = await Promise.all(d);
  for (const m of f) {
    ((a += m.total), (c += m.englishOnly), (o += m.englishLess));
    for (const [w, h] of Object.entries(m.langCounts)) r[w] = (r[w] || 0) + h;
  }
  r.English = c;
  const l = r.Spanish || 0,
    y = Object.entries(r).sort((m, w) => w[1] - m[1]);
  return {
    primary_language: (v = y[0]) == null ? void 0 : v[0],
    secondary_language: (_ = y[1]) == null ? void 0 : _[0],
    language_other_than_english_pct: a ? ((a - c) / a) * 100 : null,
    english_less_than_very_well_pct: a ? (o / a) * 100 : null,
    spanish_at_home_pct: a ? (l / a) * 100 : null,
  };
}
async function cs({ state_fips: e, county_fips: n, tract_code: s } = {}) {
  if (!e || !n || !s) return {};
  const i = `${e}${n}${s}`;
  return Pt([i]);
}
async function rn(e = []) {
  const n = {};
  for (const d of e) {
    const f = String(d)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (f.length !== 11) continue;
    const l = f.slice(0, 2),
      y = f.slice(2, 5),
      v = f.slice(5),
      _ = `${l}${y}`;
    (n[_] || (n[_] = { state: l, county: y, tracts: [] }), n[_].tracts.push(v));
  }
  let s = 0,
    i = 0,
    a = 0,
    c = 0,
    o = 0;
  for (const d of Object.values(n)) {
    const f = yt(d.tracts, 50);
    for (const l of f) {
      const y =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE&for=tract:" +
        l.join(",") +
        `&in=state:${d.state}%20county:${d.county}`;
      try {
        const v = await fetch(y).then((_) => _.json());
        if (!Array.isArray(v) || v.length < 2) continue;
        for (let _ = 1; _ < v.length; _++) {
          const [m, w, h, p, g] = v[_].map(Number);
          Number.isFinite(m) &&
            m > 0 &&
            ((s += m),
            Number.isFinite(w) && (i += w * m),
            Number.isFinite(h) && (a += h * m),
            Number.isFinite(p) && (c += p * m),
            Number.isFinite(g) && g >= 0 && (o += (g / 100) * m));
        }
      } catch {}
    }
  }
  const r = {};
  return (
    s > 0 &&
      ((r.population = s),
      i > 0 && (r.median_age = i / s),
      a > 0 && (r.median_household_income = a / s),
      c > 0 && (r.per_capita_income = c / s),
      o > 0 && (r.poverty_rate = (o / s) * 100)),
    r
  );
}
async function an(e = []) {
  const n = {};
  for (const y of e) {
    const v = String(y)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (v.length !== 11) continue;
    const _ = v.slice(0, 2),
      m = v.slice(2, 5),
      w = v.slice(5),
      h = `${_}${m}`;
    (n[h] || (n[h] = { state: _, county: m, tracts: [] }), n[h].tracts.push(w));
  }
  let s = 0,
    i = 0,
    a = 0,
    c = 0,
    o = 0,
    r = 0,
    d = 0;
  for (const y of Object.values(n)) {
    const v = yt(y.tracts, 50);
    for (const _ of v) {
      const m =
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
        _.join(",") +
        `&in=state:${y.state}%20county:${y.county}`;
      try {
        const w = await fetch(m).then((h) => h.json());
        if (!Array.isArray(w) || w.length < 2) continue;
        for (let h = 1; h < w.length; h++) {
          const [p, g, E, b, C, F, k] = w[h].slice(0, 7).map(Number);
          (Number.isFinite(p) && p > 0 && (s += p),
            Number.isFinite(g) &&
              g > 0 &&
              ((i += g), Number.isFinite(b) && b > 0 && (c += b * g)),
            Number.isFinite(E) && E > 0 && (a += E),
            Number.isFinite(C) &&
              C > 0 &&
              ((o += C),
              Number.isFinite(F) && F > 0 && (r += F),
              Number.isFinite(k) && k > 0 && (d += k)));
        }
      } catch {}
    }
  }
  const f = {},
    l = i + a;
  return (
    l > 0 &&
      ((f.owner_occupied_pct = (i / l) * 100),
      (f.renter_occupied_pct = (a / l) * 100)),
    i > 0 && c > 0 && (f.median_home_value = c / i),
    o > 0 &&
      ((f.high_school_or_higher_pct = (r / o) * 100),
      (f.bachelors_or_higher_pct = (d / o) * 100)),
    f
  );
}
async function kt(e = []) {
  const n = {};
  for (const i of e) {
    const a = String(i)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (a.length !== 11) continue;
    const c = a.slice(0, 2),
      o = a.slice(2, 5),
      r = a.slice(5),
      d = `${c}${o}`;
    (n[d] || (n[d] = { state: c, county: o, tracts: [] }), n[d].tracts.push(r));
  }
  const s = {};
  for (const i of Object.values(n)) {
    const a = yt(i.tracts, 50);
    for (const c of a) {
      const o =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0009PE,DP05_0001E&for=tract:" +
        c.join(",") +
        `&in=state:${i.state}%20county:${i.county}`;
      try {
        const r = await fetch(o).then((d) => d.json());
        if (!Array.isArray(r) || r.length < 2) continue;
        for (let d = 1; d < r.length; d++) {
          const [f, l, y, v, _] = r[d],
            m = `${y}${v}${_}`;
          s[m] = { unemployment_rate: Number(f), population: Number(l) };
        }
      } catch {}
    }
  }
  return s;
}
async function vn(e = []) {
  const n =
      "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query",
    s = new Set(),
    i = 50;
  for (let a = 0; a < e.length; a += i) {
    const c = e.slice(a, a + i);
    if (!c.length) continue;
    const o = `GEOID20 IN (${c.map((d) => `'${d}'`).join(",")})`,
      r =
        n +
        `?where=${encodeURIComponent(o)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    try {
      const d = await fetch(r).then((f) => f.json());
      for (const f of d.features || []) {
        const l = f.attributes || {},
          y = String(l.GEOID20);
        String(l.DAC20 || "").toUpperCase() === "Y" && s.add(y);
      }
    } catch {}
  }
  return Array.from(s);
}
async function cn(e = []) {
  const n = new Set();
  return (
    await Promise.all(
      e.map(async (s) => {
        try {
          const i = _t(dn, { fips: s, census_tract: s, geoid: s }),
            a = await nt(i);
          Array.isArray(a.environmental_hardships) &&
            a.environmental_hardships.forEach((c) => n.add(c));
        } catch {}
      }),
    ),
    Array.from(n).sort()
  );
}
async function ls(e = {}) {
  var r, d;
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    a = n || {};
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length) {
    const f = await rn(a.census_tracts_fips),
      l = a.demographics || {};
    i.surrounding_10_mile = { ...a, demographics: { ...l, ...f } };
  }
  const c = s || {},
    o = Array.isArray(c.census_tracts_fips)
      ? c.census_tracts_fips.map(String)
      : [];
  if (o.length) {
    const f = await rn(o),
      l = c.demographics || {},
      y =
        (d = (r = i.surrounding_10_mile) == null ? void 0 : r.demographics) ==
        null
          ? void 0
          : d.median_household_income,
      v = { ...l, ...f };
    (y != null &&
      (!Number.isFinite(v.median_household_income) ||
        v.median_household_income < 0) &&
      (v.median_household_income = y),
      (i.water_district = { ...c, demographics: v }));
  }
  return i;
}
async function us(e = {}) {
  var r, d;
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    a = n || {};
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length) {
    const f = a.demographics || {};
    if (
      [
        f.owner_occupied_pct,
        f.renter_occupied_pct,
        f.median_home_value,
        f.high_school_or_higher_pct,
        f.bachelors_or_higher_pct,
      ].some((y) => ne(y) || (typeof y == "number" && y < 0))
    ) {
      const y = await an(a.census_tracts_fips);
      i.surrounding_10_mile = { ...a, demographics: { ...f, ...y } };
    }
  }
  const c = s || {},
    o = Array.isArray(c.census_tracts_fips)
      ? c.census_tracts_fips.map(String)
      : [];
  if (o.length) {
    const f = c.demographics || {};
    if (
      [
        f.owner_occupied_pct,
        f.renter_occupied_pct,
        f.median_home_value,
        f.high_school_or_higher_pct,
        f.bachelors_or_higher_pct,
      ].some((y) => ne(y) || (typeof y == "number" && y < 0))
    ) {
      const y = await an(o);
      let v = { ...f, ...y };
      const _ =
        (d = (r = i.surrounding_10_mile) == null ? void 0 : r.demographics) ==
        null
          ? void 0
          : d.median_home_value;
      (_ != null &&
        (!Number.isFinite(v.median_home_value) || v.median_home_value < 0) &&
        (v.median_home_value = _),
        (i.water_district = { ...c, demographics: v }));
    }
  }
  return i;
}
async function ps(e = {}) {
  const {
      state_fips: n,
      county_fips: s,
      tract_code: i,
      unemployment_rate: a,
      surrounding_10_mile: c,
      water_district: o,
    } = e || {},
    r = c || {},
    d = o || {},
    f = [],
    l = n && s && i ? `${n}${s}${i}` : null;
  ne(a) && l && f.push(l);
  const y = Array.isArray(r.census_tracts_fips) ? r.census_tracts_fips : [];
  r.demographics &&
    ne(r.demographics.unemployment_rate) &&
    y.length &&
    f.push(...y);
  const v = Array.isArray(d.census_tracts_fips)
    ? d.census_tracts_fips.map(String)
    : [];
  d.demographics &&
    ne(d.demographics.unemployment_rate) &&
    v.length &&
    f.push(...v);
  const _ = Array.from(new Set(f));
  if (!_.length) return e;
  const m = await kt(_),
    w = { ...e };
  if (
    (ne(a) && l && m[l] && (w.unemployment_rate = m[l].unemployment_rate),
    r.demographics && ne(r.demographics.unemployment_rate) && y.length)
  ) {
    let h = 0,
      p = 0;
    for (const g of y) {
      const E = m[g];
      E &&
        Number.isFinite(E.unemployment_rate) &&
        Number.isFinite(E.population) &&
        ((h += E.population), (p += E.unemployment_rate * E.population));
    }
    h > 0 &&
      (w.surrounding_10_mile = {
        ...r,
        demographics: { ...r.demographics, unemployment_rate: p / h },
      });
  }
  if (d.demographics && ne(d.demographics.unemployment_rate) && v.length) {
    let h = 0,
      p = 0;
    for (const g of v) {
      const E = m[g];
      E &&
        Number.isFinite(E.unemployment_rate) &&
        Number.isFinite(E.population) &&
        ((h += E.population), (p += E.unemployment_rate * E.population));
    }
    h > 0 &&
      (w.water_district = {
        ...d,
        demographics: { ...d.demographics, unemployment_rate: p / h },
      });
  }
  return w;
}
async function ds(e = {}) {
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    a = n || {};
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length) {
    const r = await Pt(a.census_tracts_fips),
      d = a.demographics || {};
    i.surrounding_10_mile = { ...a, demographics: { ...d, ...r } };
  }
  const c = s || {},
    o = Array.isArray(c.census_tracts_fips)
      ? c.census_tracts_fips.map(String)
      : [];
  if (o.length) {
    const r = await Pt(o),
      d = c.demographics || {};
    i.water_district = { ...c, demographics: { ...d, ...r } };
  }
  return i;
}
async function fs(e = {}) {
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    a = n || {},
    c =
      Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length
        ? a.census_tracts_fips
        : Array.isArray(a.census_tracts)
          ? a.census_tracts
          : [];
  if (
    (!Array.isArray(a.environmental_hardships) ||
      !a.environmental_hardships.length) &&
    c.length
  ) {
    const d = await cn(c);
    i.surrounding_10_mile = { ...a, environmental_hardships: d };
  }
  const o = s || {},
    r = Array.isArray(o.census_tracts_fips)
      ? o.census_tracts_fips.map(String)
      : [];
  if (
    (!Array.isArray(o.environmental_hardships) ||
      !o.environmental_hardships.length) &&
    r.length
  ) {
    const d = await cn(r);
    i.water_district = { ...o, environmental_hardships: d };
  }
  return i;
}
async function ms(e = {}) {
  const { lat: n, lon: s, census_tract: i, surrounding_10_mile: a } = e || {};
  if (n == null || s == null) return e;
  const c = 1609.34 * 10,
    o = { ...(a || {}) },
    r = [];
  if (!Array.isArray(o.cities) || !o.cities.length) {
    const _ = `[out:json];(node[place=city](around:${c},${n},${s});node[place=town](around:${c},${n},${s}););out;`,
      m =
        "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(_);
    r.push(
      fetch(m)
        .then((w) => w.json())
        .then((w) => {
          const h = (w.elements || [])
            .map((p) => {
              var g;
              return (g = p.tags) == null ? void 0 : g.name;
            })
            .filter(Boolean);
          o.cities = Array.from(new Set(h)).slice(0, 10);
        })
        .catch(() => {}),
    );
  }
  const d = Array.isArray(o.census_tracts) ? o.census_tracts.map(String) : [],
    f = Array.isArray(o.census_tracts_fips)
      ? o.census_tracts_fips.map(String)
      : [],
    l = { ...(o.census_tract_map || {}) },
    y = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query?where=1=1&geometry=${s},${n}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${c}&units=esriSRUnit_Meter&outFields=NAME,GEOID&f=json`;
  (r.push(
    fetch(y)
      .then((_) => _.json())
      .then((_) => {
        const m = _.features || [],
          w = [],
          h = [],
          p = {};
        for (const g of m) {
          const E = g.attributes || {};
          let b = null;
          if (
            (E.NAME &&
              ((b = E.NAME.replace(/^Census Tract\s+/i, "")), w.push(b)),
            E.GEOID)
          ) {
            const C = String(E.GEOID);
            (h.push(C), b && (p[C] = b));
          }
        }
        ((o.census_tracts = Array.from(new Set([...d, ...w]))),
          (o.census_tracts_fips = Array.from(new Set([...f, ...h]))),
          (o.census_tract_map = { ...l, ...p }));
      })
      .catch(() => {}),
  ),
    r.length && (await Promise.all(r)),
    Array.isArray(o.cities) || (o.cities = []));
  const v = new Set(Array.isArray(o.census_tracts) ? o.census_tracts : []);
  if (
    (i && v.add(String(i)),
    (o.census_tracts = Array.from(v)),
    Array.isArray(o.census_tracts_fips))
  ) {
    const _ = new Set(o.census_tracts_fips),
      { state_fips: m, county_fips: w, tract_code: h } = e || {};
    (m && w && h && _.add(`${m}${w}${h}`),
      (o.census_tracts_fips = Array.from(_)));
  }
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length)
    try {
      const _ = await vn(o.census_tracts_fips),
        m = [];
      for (const w of _) {
        const h = (o.census_tract_map && o.census_tract_map[w]) || w;
        m.push(h);
      }
      if (((o.dac_tracts = m), (o.dac_tracts_fips = _), m.length)) {
        const w = new Set([...(o.census_tracts || []), ...m]);
        o.census_tracts = Array.from(w);
      }
    } catch {}
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length)
    try {
      const _ = await kt(o.census_tracts_fips);
      let m = 0,
        w = 0;
      const h = new Set(o.dac_tracts_fips || []);
      for (const p of o.census_tracts_fips) {
        const g = _[p];
        g &&
          Number.isFinite(g.population) &&
          ((m += g.population), h.has(String(p)) && (w += g.population));
      }
      (m > 0 && (o.dac_population_pct = (w / m) * 100),
        o.census_tracts_fips.length > 0 &&
          (o.dac_tracts_pct = (h.size / o.census_tracts_fips.length) * 100));
    } catch {}
  return { ...e, surrounding_10_mile: o };
}
async function hs(e = {}, n = "") {
  var m, w;
  const {
    lat: s,
    lon: i,
    city: a,
    census_tract: c,
    state_fips: o,
    county_fips: r,
    tract_code: d,
    water_district: f,
  } = e || {};
  if (s == null || i == null) return e;
  const l = { ...f },
    y = [];
  if (n) {
    const h = _t("/lookup", { address: n });
    y.push(
      nt(h)
        .then((p) => {
          var E, b, C, F;
          l.name =
            ((E = p == null ? void 0 : p.agency) == null
              ? void 0
              : E.agency_name) ||
            ((b = p == null ? void 0 : p.agency) == null ? void 0 : b.name) ||
            (p == null ? void 0 : p.agency_name) ||
            (p == null ? void 0 : p.name) ||
            l.name;
          const g =
            ((C = p == null ? void 0 : p.agency) == null
              ? void 0
              : C.service_area_tracts) ||
            (p == null ? void 0 : p.service_area_tracts) ||
            (p == null ? void 0 : p.census_tracts) ||
            ((F = p == null ? void 0 : p.agency) == null
              ? void 0
              : F.census_tracts);
          if (typeof g == "string") {
            const k = g.split(/\s*,\s*/).filter(Boolean);
            l.census_tracts = k;
            const z = k.filter((G) => /^\d{11}$/.test(G));
            z.length && (l.census_tracts_fips = z);
          } else if (Array.isArray(g)) {
            const k = [...new Set(g.map(String))];
            l.census_tracts = k;
            const z = k.filter((G) => /^\d{11}$/.test(G));
            z.length &&
              (l.census_tracts_fips = [
                ...new Set([...(l.census_tracts_fips || []), ...z]),
              ]);
          }
        })
        .catch(() => {}),
    );
  }
  if (!l.name) {
    const h = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${i}%2C${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=false&f=json`;
    y.push(
      fetch(h)
        .then((p) => p.json())
        .then((p) => {
          var g, E, b;
          l.name =
            ((b =
              (E =
                (g = p == null ? void 0 : p.features) == null
                  ? void 0
                  : g[0]) == null
                ? void 0
                : E.attributes) == null
              ? void 0
              : b.PWS_NAME) || l.name;
        })
        .catch(() => {}),
    );
  }
  if (
    ((!Array.isArray(l.cities) || !l.cities.length) && a && (l.cities = [a]),
    y.length && (await Promise.all(y)),
    l.name && (!Array.isArray(l.census_tracts) || !l.census_tracts.length))
  )
    try {
      const h = _t("/census-tracts", { agency_name: l.name }),
        p = await nt(h),
        g = p == null ? void 0 : p.census_tracts;
      Array.isArray(g) && (l.census_tracts = [...new Set(g.map(String))]);
    } catch {}
  try {
    const h = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${i}%2C${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`,
      p = await fetch(h).then((E) => E.json()),
      g =
        (w = (m = p == null ? void 0 : p.features) == null ? void 0 : m[0]) ==
        null
          ? void 0
          : w.geometry;
    if (g) {
      const E =
          "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query",
        b = new URLSearchParams({
          where: "1=1",
          geometry: JSON.stringify(g),
          geometryType: "esriGeometryPolygon",
          inSR: "4326",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "NAME,GEOID",
          returnGeometry: "false",
          f: "json",
        });
      let C;
      try {
        C = await fetch(E, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: b.toString(),
        }).then((G) => G.json());
      } catch {
        const G = `${E}?${b.toString()}`;
        C = await fetch(G).then((q) => q.json());
      }
      const F = [],
        k = [],
        z = {};
      for (const G of C.features || []) {
        const q = G.attributes || {};
        let N = null;
        if (
          (q.NAME && ((N = q.NAME.replace(/^Census Tract\s+/i, "")), F.push(N)),
          q.GEOID)
        ) {
          const L = String(q.GEOID);
          (k.push(L), N && (z[L] = N));
        }
      }
      if (F.length || k.length) {
        const G = Array.isArray(l.census_tracts)
            ? l.census_tracts.map(String)
            : [],
          q = Array.isArray(l.census_tracts_fips)
            ? l.census_tracts_fips.map(String)
            : [],
          N = l.census_tract_map || {};
        (F.length && (l.census_tracts = [...new Set([...G, ...F])]),
          k.length && (l.census_tracts_fips = [...new Set([...q, ...k])]),
          Object.keys(z).length && (l.census_tract_map = { ...N, ...z }));
      }
    }
  } catch {}
  let v = [];
  (Array.isArray(l.census_tracts)
    ? (v = l.census_tracts.map(String))
    : typeof l.census_tracts == "string" &&
      (v = l.census_tracts.split(/\s*,\s*/).filter(Boolean)),
    c && v.unshift(String(c)),
    (l.census_tracts = [...new Set(v)]));
  let _ = Array.isArray(l.census_tracts_fips)
    ? l.census_tracts_fips.map(String)
    : [];
  for (const h of l.census_tracts)
    if (/^\d{11}$/.test(h)) _.push(h);
    else if (o && r) {
      const p = String(h).replace(/[^0-9]/g, "");
      if (p) {
        const g = p.padStart(6, "0").slice(-6);
        _.push(`${o}${r}${g}`);
      }
    }
  if (
    (o && r && d && _.unshift(`${o}${r}${d}`),
    (l.census_tracts_fips = [...new Set(_)]),
    Array.isArray(l.census_tracts_fips) && l.census_tracts_fips.length)
  )
    try {
      const h = await vn(l.census_tracts_fips),
        p = [];
      for (const g of h) {
        const E = (l.census_tract_map && l.census_tract_map[g]) || g;
        p.push(E);
      }
      if (((l.dac_tracts = p), (l.dac_tracts_fips = h), p.length)) {
        const g = new Set([...(l.census_tracts || []), ...p]);
        l.census_tracts = Array.from(g);
      }
    } catch {}
  if (Array.isArray(l.census_tracts_fips) && l.census_tracts_fips.length)
    try {
      const h = await kt(l.census_tracts_fips);
      let p = 0,
        g = 0;
      const E = new Set(l.dac_tracts_fips || []);
      for (const b of l.census_tracts_fips) {
        const C = h[b];
        C &&
          Number.isFinite(C.population) &&
          ((p += C.population), E.has(String(b)) && (g += C.population));
      }
      (p > 0 && (l.dac_population_pct = (g / p) * 100),
        l.census_tracts_fips.length > 0 &&
          (l.dac_tracts_pct = (E.size / l.census_tracts_fips.length) * 100));
    } catch {}
  return (
    (l.environment = {
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
    { ...e, water_district: l }
  );
}
async function _s(e = {}) {
  var a, c;
  const { lat: n, lon: s, english_less_than_very_well_pct: i } = e || {};
  if (!ne(i) || n == null || s == null) return e;
  try {
    const o = await fetch(
        `https://geo.fcc.gov/api/census/block/find?latitude=${n}&longitude=${s}&format=json`,
      ).then((d) => d.json()),
      r = (a = o == null ? void 0 : o.Block) == null ? void 0 : a.FIPS;
    if (r && r.length >= 11) {
      const d = r.slice(0, 2),
        f = r.slice(2, 5),
        y = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${r.slice(5, 11)}&in=state:${d}+county:${f}`,
        v = await fetch(y).then((w) => w.json()),
        _ = (c = v == null ? void 0 : v[1]) == null ? void 0 : c[0],
        m = Number(_);
      if (Number.isFinite(m) && m >= 0)
        return { ...e, english_less_than_very_well_pct: m };
    }
  } catch {}
  return e;
}
async function gs(e = {}) {
  const { lat: n, lon: s } = e || {};
  if (n == null || s == null) return { ...e, alerts: [] };
  try {
    const i = `https://api.weather.gov/alerts/active?point=${n},${s}`,
      a = await fetch(i, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "CalWEP-Demographic-Website (info@calwep.org)",
        },
      });
    if (!a.ok) throw new Error("NWS response not ok");
    const c = await a.json(),
      o = Array.isArray(c == null ? void 0 : c.features)
        ? c.features
            .map((r) => {
              var d;
              return (d = r == null ? void 0 : r.properties) == null
                ? void 0
                : d.headline;
            })
            .filter(Boolean)
        : [];
    return { ...e, alerts: o };
  } catch {
    return { ...e, alerts: [] };
  }
}
function ys(e) {
  const n = Number(e);
  if (!Number.isFinite(n)) return { bg: "#fff", fg: "#000" };
  const s = [
    { max: 10, color: "#006837", fg: "#fff" },
    { max: 20, color: "#1A9850", fg: "#fff" },
    { max: 30, color: "#66BD63" },
    { max: 40, color: "#A6D96A" },
    { max: 50, color: "#FEE08B" },
    { max: 60, color: "#FDAE61" },
    { max: 70, color: "#F46D43", fg: "#fff" },
    { max: 80, color: "#D73027", fg: "#fff" },
    { max: 90, color: "#A50026", fg: "#fff" },
    { max: 100, color: "#6E0000", fg: "#fff" },
  ];
  for (const i of s) if (n <= i.max) return { bg: i.color, fg: i.fg || "#000" };
  return { bg: "#6E0000", fg: "#fff" };
}
function Ee(e, n, s, i, a = "") {
  const c = (o) => (o && String(o).trim() ? o : '<p class="note">No data</p>');
  return `
    <section class="section-block">
      <h3 class="section-header">${e}</h3>
      ${a}
      <div class="comparison-grid">
        <div class="col local">${c(n)}</div>
        <div class="col surrounding">${c(s)}</div>
        <div class="col district">${c(i)}</div>
      </div>
    </section>
  `;
}
function Lt(e) {
  var o, r;
  if (!e || typeof e != "object") return '<p class="note">No data</p>';
  const n = (d) => {
      const { bg: f, fg: l } = ys(d),
        y = Number.isFinite(Number(d)) ? Number(d).toFixed(1) : "—";
      return `<span class="ces-badge" style="background:${f};color:${l};">${y}</span>`;
    },
    s = e.percentile,
    i = (o = e.overall_percentiles) == null ? void 0 : o.pollution_burden,
    a =
      (r = e.overall_percentiles) == null
        ? void 0
        : r.population_characteristics,
    c = (d, f, l = []) => {
      if (!f || typeof f != "object") return "";
      const v = Object.entries(f)
        .sort(([_], [m]) => {
          const w = l.indexOf(_),
            h = l.indexOf(m);
          return w !== -1 && h !== -1
            ? w - h
            : w !== -1
              ? -1
              : h !== -1
                ? 1
                : _.localeCompare(m);
        })
        .map(
          ([_, m]) =>
            `<div class="key">${D(os[_] || is(_))}</div><div class="val">${n(m)}</div>`,
        )
        .join("");
      return `<h4 class="sub-section-header">${d}</h4><div class="kv">${v}</div>`;
    };
  return `
    <div class="kv">
      <div class="key">Overall percentile</div><div class="val">${n(s)}</div>
      <div class="key">Pollution burden</div><div class="val">${n(i)}</div>
      <div class="key">Population characteristics</div><div class="val">${n(a)}</div>
    </div>
    ${c("Exposures", e.exposures, pt.exposures)}
    ${c("Environmental effects", e.environmental_effects, pt.environmental_effects)}
    ${c("Sensitive populations", e.sensitive_populations, pt.sensitive_populations)}
    ${c("Socioeconomic factors", e.socioeconomic_factors, pt.socioeconomic_factors)}
  `;
}
function ln(e, n, s) {
  const {
      city: i,
      zip: a,
      county: c,
      census_tract: o,
      lat: r,
      lon: d,
      english_less_than_very_well_pct: f,
      language_other_than_english_pct: l,
      spanish_at_home_pct: y,
      primary_language: v,
      secondary_language: _,
      median_household_income: m,
      per_capita_income: w,
      median_age: h,
      poverty_rate: p,
      unemployment_rate: g,
      population: E,
      dac_status: b,
      environmental_hardships: C,
      white_pct: F,
      black_pct: k,
      native_pct: z,
      asian_pct: G,
      pacific_pct: q,
      other_race_pct: N,
      two_or_more_races_pct: L,
      hispanic_pct: B,
      not_hispanic_pct: ue,
      owner_occupied_pct: te,
      renter_occupied_pct: oe,
      median_home_value: re,
      high_school_or_higher_pct: ae,
      bachelors_or_higher_pct: ce,
      alerts: Te,
      enviroscreen: $,
      surrounding_10_mile: st,
      water_district: U,
    } = n || {},
    Ue = Array.isArray(C) ? Array.from(new Set(C)) : [],
    O = Array.isArray(Te) ? Te : [],
    Se =
      r != null && d != null
        ? `${Number(r).toFixed(6)}, ${Number(d).toFixed(6)}`
        : "—",
    He =
      r != null && d != null
        ? `<img class="map-image" src="https://maps.googleapis.com/maps/api/staticmap?center=${r},${d}&zoom=13&size=600x300&markers=color:red|${r},${d}&key=${Ln()}" alt="Map of location" />`
        : "",
    M = st || {},
    I = U || {},
    Ge = Array.isArray(M.environmental_hardships)
      ? Array.from(new Set(M.environmental_hardships))
      : [],
    We = Array.isArray(I.environmental_hardships)
      ? Array.from(new Set(I.environmental_hardships))
      : [],
    ye = Array.isArray(M.census_tracts)
      ? M.census_tracts.join(", ")
      : D(M.census_tracts) || "—",
    Re = Array.isArray(M.cities) ? M.cities.join(", ") : D(M.cities) || "—",
    fe = Array.isArray(I.census_tracts)
      ? I.census_tracts.join(", ")
      : D(I.census_tracts) || "—",
    ze = Array.isArray(I.cities) ? I.cities.join(", ") : D(I.cities) || "—",
    Be = `
    <div class="kv">
      <div class="key">City</div><div class="val">${D(i) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${D(o) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${D(a) || "—"}</div>
      <div class="key">County</div><div class="val">${D(c) || "—"}</div>
      <div class="key">Coordinates</div><div class="val">${Se}</div>
    </div>
    ${He}
  `,
    Ae = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${Re}</div>
      <div class="key">Census tracts</div><div class="val">${ye}</div>
    </div>
  `,
    Ce = `
    <div class="kv">
      <div class="key">District</div><div class="val">${D(I.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${ze}</div>
      <div class="key">Census tracts</div><div class="val">${fe}</div>
    </div>
  `,
    Ne = Ee(
      "Location Summary",
      Be,
      Ae,
      Ce,
      '<p class="section-description">This section lists basic geographic information for the census tract, surrounding 10&#8209;mile area, and water district, such as city, ZIP code, county, and coordinates.</p>',
    ),
    Le = (S = {}) =>
      `<div class="kv">${[
        ["Total population", ns(S.population)],
        ["Median age", ss(S.median_age)],
        ["Median household income", Nt(S.median_household_income)],
        ["Per capita income", Nt(S.per_capita_income)],
        ["Poverty rate", x(S.poverty_rate)],
        ["Unemployment rate", x(S.unemployment_rate)],
      ]
        .map(
          ([Z, Q]) => `<div class="key">${Z}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    it = Ee(
      "Population &amp; Income (ACS)",
      Le({
        population: E,
        median_age: h,
        median_household_income: m,
        per_capita_income: w,
        poverty_rate: p,
        unemployment_rate: g,
      }),
      Le(M.demographics || {}),
      Le(I.demographics || {}),
      '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    je = (S = {}) =>
      `<div class="kv">${[
        ["Primary language", D(S.primary_language) || "—"],
        ["Second most common", D(S.secondary_language) || "—"],
        [
          "People who speak a language other than English at home",
          x(S.language_other_than_english_pct),
        ],
        [
          'People who speak English less than "very well"',
          x(S.english_less_than_very_well_pct),
        ],
        ["People who speak Spanish at home", x(S.spanish_at_home_pct)],
      ]
        .map(
          ([Z, Q]) => `<div class="key">${Z}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    Ye = Ee(
      "Language (ACS)",
      je({
        primary_language: v,
        secondary_language: _,
        language_other_than_english_pct: l,
        english_less_than_very_well_pct: f,
        spanish_at_home_pct: y,
      }),
      je(M.demographics || {}),
      je(I.demographics || {}),
      '<p class="section-description">This section highlights the primary and secondary languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    me = (S = {}) =>
      `<div class="kv">${[
        ["White", x(S.white_pct)],
        ["Black or African American", x(S.black_pct)],
        ["American Indian / Alaska Native", x(S.native_pct)],
        ["Asian", x(S.asian_pct)],
        ["Native Hawaiian / Pacific Islander", x(S.pacific_pct)],
        ["Other race", x(S.other_race_pct)],
        ["Two or more races", x(S.two_or_more_races_pct)],
        ["Hispanic", x(S.hispanic_pct)],
        ["Not Hispanic", x(S.not_hispanic_pct)],
      ]
        .map(
          ([Z, Q]) => `<div class="key">${Z}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    we = Ee(
      "Race &amp; Ethnicity (ACS)",
      me({
        white_pct: F,
        black_pct: k,
        native_pct: z,
        asian_pct: G,
        pacific_pct: q,
        other_race_pct: N,
        two_or_more_races_pct: L,
        hispanic_pct: B,
        not_hispanic_pct: ue,
      }),
      me(M.demographics || {}),
      me(I.demographics || {}),
      '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    pe = (S = {}) =>
      `<div class="kv">${[
        ["Owner occupied", x(S.owner_occupied_pct)],
        ["Renter occupied", x(S.renter_occupied_pct)],
        ["Median home value", Nt(S.median_home_value)],
        ["High school or higher", x(S.high_school_or_higher_pct)],
        ["Bachelor's degree or higher", x(S.bachelors_or_higher_pct)],
      ]
        .map(
          ([Z, Q]) => `<div class="key">${Z}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    ot = Ee(
      "Housing &amp; Education (ACS)",
      pe({
        owner_occupied_pct: te,
        renter_occupied_pct: oe,
        median_home_value: re,
        high_school_or_higher_pct: ae,
        bachelors_or_higher_pct: ce,
      }),
      pe(M.demographics || {}),
      pe(I.demographics || {}),
      '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    De = (S, j, Z, Q) => {
      const ct = Array.isArray(j) ? j.length > 0 : !!S,
        Ie = ct ? "var(--success)" : "var(--border-strong)",
        ve = [`Disadvantaged community: <strong>${ct ? "Yes" : "No"}</strong>`],
        ke = [];
      return (
        Number.isFinite(Z) &&
          ke.push(`<li><strong>${x(Z)}</strong> of population</li>`),
        Number.isFinite(Q) &&
          ke.push(`<li><strong>${x(Q)}</strong> of tracts</li>`),
        ke.length && ve.push(`<ul class="dac-stats">${ke.join("")}</ul>`),
        Array.isArray(j) &&
          j.length &&
          ve.push(
            `<div class="dac-tracts">Tracts ${j.map((be) => D(be)).join(", ")}</div>`,
          ),
        `<div class="callout" style="border-left-color:${Ie}">${ve.join("")}</div>`
      );
    },
    rt = Ee(
      "Disadvantaged Community (DAC) Status",
      De(b),
      Array.isArray(M.dac_tracts)
        ? De(null, M.dac_tracts, M.dac_population_pct, M.dac_tracts_pct)
        : "",
      Array.isArray(I.dac_tracts)
        ? De(null, I.dac_tracts, I.dac_population_pct, I.dac_tracts_pct)
        : "",
      '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
    ),
    Ve = Ee(
      "Environmental Indicators (CalEPA Enviroscreen)",
      Lt($),
      Lt(M.environment),
      Lt(I.environment),
      '<p class="section-description">This section shows environmental and community health indicators from California’s Enviroscreen tool. Results are presented as percentiles, with higher numbers (and darker colors) indicating greater environmental burdens compared to other areas in the state. These measures include factors such as air quality, traffic pollution, and access to safe drinking water.</p><p class="section-description">Staff can use this information to understand potential environmental challenges facing a neighborhood, strengthen grant applications that require equity or environmental justice considerations, and design outreach that addresses local concerns. For example, if an event is planned in an area with a high Enviroscreen percentile, staff may want to highlight programs or benefits related to clean water, pollution reduction, or community health.</p><p class="section-description"><strong>How to Read This</strong><br>Green = Low burden (fewer environmental and health challenges)<br>Yellow/Orange = Moderate burden<br>Red = High burden (greater environmental and health challenges)<br>Percentile score shows how the community compares to others across California.</p>',
    ),
    at = Ee(
      "Environmental Hardships",
      Ue.length
        ? `<div class="stats">${Ue.map((S) => `<span class="pill">${D(S)}</span>`).join("")}</div>`
        : "",
      Ge.length
        ? `<div class="stats">${Ge.map((S) => `<span class="pill">${D(S)}</span>`).join("")}</div>`
        : "",
      We.length
        ? `<div class="stats">${We.map((S) => `<span class="pill">${D(S)}</span>`).join("")}</div>`
        : "",
      '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
    ),
    Oe = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${O.length ? `<div class="stats">${O.map((S) => `<span class="pill">${D(S)}</span>`).join("")}</div>` : '<p class="note">No active alerts found for this location.</p>'}
    </section>
  `,
    Pe = `
    <div class="comparison-grid column-headers">
      <div class="col">Census tract</div>
      <div class="col">10 mile radius</div>
      <div class="col">Water district</div>
    </div>
  `;
  document.getElementById("result").innerHTML = D(`
    <article class="card">
      <div class="card__header">
        <div class="card__head-left">
          <h2 class="card__title">Results for: ${D(e)}</h2>
          <div class="card__actions">
            <button type="button" onclick="printReport()">Print</button>
            <button type="button" onclick="downloadPdf()">Download PDF</button>
            <button type="button" onclick="downloadRawData()">Raw Data</button>
            <button type="button" onclick="shareReport()">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${It()}</span>
      </div>
      ${Pe}
      ${Ne}
      ${it}
      ${Ye}
      ${we}
      ${ot}
      ${rt}
      ${Ve}
      ${at}
      ${Oe}
      <p class="note">Search took ${An(s)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
    `);
}
async function En() {
  const e = document.getElementById("autocomplete"),
    n = document.getElementById("result"),
    s = ((e == null ? void 0 : e.value) || "").trim();
  if (s.length < 4) {
    nn("Please enter a more complete address (at least 4 characters).", s, 0);
    return;
  }
  const i = s.toLowerCase();
  if (Ct.has(i)) {
    const o = Ct.get(i);
    xe = { address: s, data: o };
    const r = new URL(window.location);
    (r.searchParams.set("address", s),
      window.history.replaceState(null, "", r.toString()),
      ln(s, o, 0));
    return;
  }
  (n.setAttribute("aria-busy", "true"), Zn(s));
  const a = document.getElementById("spinnerOverlay");
  (a && (a.style.display = "flex"), rs());
  let c = 0;
  try {
    const o = _t(dn, { address: s });
    let r = await nt(o);
    if (!r || typeof r != "object") throw new Error("Malformed response.");
    r = await se("enrichLocation", () => as(r));
    const [d, f, l, y, v] = await Promise.all([
      se("fetchLanguageAcs", () => cs(r)),
      se("enrichSurrounding", () => ms(r)),
      se("enrichWaterDistrict", () => hs(r, s)),
      se("enrichEnglishProficiency", () => _s(r)),
      se("enrichNwsAlerts", () => gs(r)),
    ]);
    mt(r, d, f, l, y, v);
    const _ = await se("enrichRegionBasics", () => ls(r)),
      m = await se("enrichRegionHousingEducation", () => us(r));
    mt(r, _, m);
    const [w, h, p] = await Promise.all([
      se("enrichRegionLanguages", () => ds(r)),
      se("enrichRegionHardships", () => fs(r)),
      se("enrichUnemployment", () => ps(r)),
    ]);
    (mt(r, w, h, p), (xe = { address: s, data: r }), Ct.set(i, r));
    const g = new URL(window.location);
    (g.searchParams.set("address", s),
      window.history.replaceState(null, "", g.toString()),
      (c = on()),
      ln(s, r, c));
  } catch (o) {
    (c || (c = on()), nn(String(o), s, c));
  } finally {
    const o = document.getElementById("spinnerOverlay");
    (o && (o.style.display = "none"), n.removeAttribute("aria-busy"));
  }
}
function As() {
  const e = document.getElementById("lookupBtn");
  if (!e) return;
  const n = e.cloneNode(!0);
  (e.replaceWith(n),
    n.addEventListener("click", (s) => {
      (s.preventDefault(), En().catch(console.error));
    }));
}
wn().catch(() => {});
window.onload = () => {
  (Nn(), As());
  const n = new URLSearchParams(window.location.search).get("address");
  if (n) {
    const s = document.getElementById("autocomplete");
    s && ((s.value = n), En().catch(console.error));
  }
};
export { Es as p };
