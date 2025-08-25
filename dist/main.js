import { _ as un } from "./pdf.js";
import {
  A as Rn,
  l as De,
  s as Cn,
  f as ie,
  b as he,
  m as st,
} from "./maps.js";
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */ const {
  entries: pn,
  setPrototypeOf: je,
  isFrozen: Ln,
  getPrototypeOf: Dn,
  getOwnPropertyDescriptor: On,
} = Object;
let { freeze: tt, seal: it, create: fn } = Object,
  { apply: Re, construct: Ce } = typeof Reflect < "u" && Reflect;
tt ||
  (tt = function (n) {
    return n;
  });
it ||
  (it = function (n) {
    return n;
  });
Re ||
  (Re = function (n, s, i) {
    return n.apply(s, i);
  });
Ce ||
  (Ce = function (n, s) {
    return new n(...s);
  });
const pe = et(Array.prototype.forEach),
  In = et(Array.prototype.lastIndexOf),
  Ye = et(Array.prototype.pop),
  Zt = et(Array.prototype.push),
  Pn = et(Array.prototype.splice),
  de = et(String.prototype.toLowerCase),
  ve = et(String.prototype.toString),
  Ve = et(String.prototype.match),
  Jt = et(String.prototype.replace),
  kn = et(String.prototype.indexOf),
  Mn = et(String.prototype.trim),
  ft = et(Object.prototype.hasOwnProperty),
  J = et(RegExp.prototype.test),
  Qt = $n(TypeError);
function et(e) {
  return function (n) {
    n instanceof RegExp && (n.lastIndex = 0);
    for (
      var s = arguments.length, i = new Array(s > 1 ? s - 1 : 0), o = 1;
      o < s;
      o++
    )
      i[o - 1] = arguments[o];
    return Re(e, n, i);
  };
}
function $n(e) {
  return function () {
    for (var n = arguments.length, s = new Array(n), i = 0; i < n; i++)
      s[i] = arguments[i];
    return Ce(e, s);
  };
}
function N(e, n) {
  let s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : de;
  je && je(e, null);
  let i = n.length;
  for (; i--; ) {
    let o = n[i];
    if (typeof o == "string") {
      const l = s(o);
      l !== o && (Ln(n) || (n[i] = l), (o = l));
    }
    e[o] = !0;
  }
  return e;
}
function Fn(e) {
  for (let n = 0; n < e.length; n++) ft(e, n) || (e[n] = null);
  return e;
}
function yt(e) {
  const n = fn(null);
  for (const [s, i] of pn(e))
    ft(e, s) &&
      (Array.isArray(i)
        ? (n[s] = Fn(i))
        : i && typeof i == "object" && i.constructor === Object
          ? (n[s] = yt(i))
          : (n[s] = i));
  return n;
}
function te(e, n) {
  for (; e !== null; ) {
    const i = On(e, n);
    if (i) {
      if (i.get) return et(i.get);
      if (typeof i.value == "function") return et(i.value);
    }
    e = Dn(e);
  }
  function s() {
    return null;
  }
  return s;
}
const Xe = tt([
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
  Ee = tt([
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
  we = tt([
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
  xn = tt([
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
  Te = tt([
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
  Un = tt([
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
  qe = tt(["#text"]),
  Ke = tt([
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
  Se = tt([
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
  Ze = tt([
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
  fe = tt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  Hn = it(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
  Bn = it(/<%[\w\W]*|[\w\W]*%>/gm),
  Wn = it(/\$\{[\w\W]*/gm),
  Gn = it(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  zn = it(/^aria-[\-\w]+$/),
  dn = it(
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ),
  jn = it(/^(?:\w+script|data):/i),
  Yn = it(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  mn = it(/^html$/i),
  Vn = it(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Je = Object.freeze({
  __proto__: null,
  ARIA_ATTR: zn,
  ATTR_WHITESPACE: Yn,
  CUSTOM_ELEMENT: Vn,
  DATA_ATTR: Gn,
  DOCTYPE_NAME: mn,
  ERB_EXPR: Bn,
  IS_ALLOWED_URI: dn,
  IS_SCRIPT_OR_DATA: jn,
  MUSTACHE_EXPR: Hn,
  TMPLIT_EXPR: Wn,
});
const ee = {
    element: 1,
    text: 3,
    progressingInstruction: 7,
    comment: 8,
    document: 9,
  },
  Xn = function () {
    return typeof window > "u" ? null : window;
  },
  qn = function (n, s) {
    if (typeof n != "object" || typeof n.createPolicy != "function")
      return null;
    let i = null;
    const o = "data-tt-policy-suffix";
    s && s.hasAttribute(o) && (i = s.getAttribute(o));
    const l = "dompurify" + (i ? "#" + i : "");
    try {
      return n.createPolicy(l, {
        createHTML(a) {
          return a;
        },
        createScriptURL(a) {
          return a;
        },
      });
    } catch {
      return (
        console.warn("TrustedTypes policy " + l + " could not be created."),
        null
      );
    }
  },
  Qe = function () {
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
function hn() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Xn();
  const n = (T) => hn(T);
  if (
    ((n.version = "3.2.6"),
    (n.removed = []),
    !e || !e.document || e.document.nodeType !== ee.document || !e.Element)
  )
    return ((n.isSupported = !1), n);
  let { document: s } = e;
  const i = s,
    o = i.currentScript,
    {
      DocumentFragment: l,
      HTMLTemplateElement: a,
      Node: r,
      Element: f,
      NodeFilter: d,
      NamedNodeMap: c = e.NamedNodeMap || e.MozNamedAttrMap,
      HTMLFormElement: y,
      DOMParser: v,
      trustedTypes: h,
    } = e,
    m = f.prototype,
    E = te(m, "cloneNode"),
    _ = te(m, "remove"),
    u = te(m, "nextSibling"),
    g = te(m, "childNodes"),
    w = te(m, "parentNode");
  if (typeof a == "function") {
    const T = s.createElement("template");
    T.content && T.content.ownerDocument && (s = T.content.ownerDocument);
  }
  let b,
    R = "";
  const {
      implementation: U,
      createNodeIterator: $,
      createDocumentFragment: j,
      getElementsByTagName: G,
    } = s,
    { importNode: Z } = i;
  let C = Qe();
  n.isSupported =
    typeof pn == "function" &&
    typeof w == "function" &&
    U &&
    U.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: L,
    ERB_EXPR: Y,
    TMPLIT_EXPR: ot,
    DATA_ATTR: z,
    ARIA_ATTR: at,
    IS_SCRIPT_OR_DATA: rt,
    ATTR_WHITESPACE: ct,
    CUSTOM_ELEMENT: lt,
  } = Je;
  let { IS_ALLOWED_URI: Dt } = Je,
    F = null;
  const ae = N({}, [...Xe, ...Ee, ...we, ...Te, ...qe]);
  let H = null;
  const re = N({}, [...Ke, ...Se, ...Ze, ...fe]);
  let I = Object.seal(
      fn(null, {
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
    bt = null,
    Ot = null,
    Bt = !0,
    Wt = !0,
    Gt = !1,
    x = !0,
    D = !1,
    Nt = !0,
    dt = !1,
    zt = !1,
    jt = !1,
    At = !1,
    It = !1,
    Pt = !1,
    ce = !0,
    le = !1;
  const _e = "user-content-";
  let Rt = !0,
    Ct = !1,
    mt = {},
    vt = null;
  const kt = N({}, [
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
  let ue = null;
  const Mt = N({}, ["audio", "video", "img", "source", "image", "track"]);
  let Yt = null;
  const $t = N({}, [
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
    Ft = "http://www.w3.org/1998/Math/MathML",
    Et = "http://www.w3.org/2000/svg",
    ut = "http://www.w3.org/1999/xhtml";
  let wt = ut,
    Vt = !1,
    Xt = null;
  const S = N({}, [Ft, Et, ut], ve);
  let V = N({}, ["mi", "mo", "mn", "ms", "mtext"]),
    B = N({}, ["annotation-xml"]);
  const X = N({}, ["title", "style", "font", "a", "script"]);
  let pt = null;
  const qt = ["application/xhtml+xml", "text/html"],
    Lt = "text/html";
  let P = null,
    Tt = null;
  const Sn = s.createElement("form"),
    Pe = function (t) {
      return t instanceof RegExp || t instanceof Function;
    },
    ge = function () {
      let t =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (!(Tt && Tt === t)) {
        if (
          ((!t || typeof t != "object") && (t = {}),
          (t = yt(t)),
          (pt =
            qt.indexOf(t.PARSER_MEDIA_TYPE) === -1 ? Lt : t.PARSER_MEDIA_TYPE),
          (P = pt === "application/xhtml+xml" ? ve : de),
          (F = ft(t, "ALLOWED_TAGS") ? N({}, t.ALLOWED_TAGS, P) : ae),
          (H = ft(t, "ALLOWED_ATTR") ? N({}, t.ALLOWED_ATTR, P) : re),
          (Xt = ft(t, "ALLOWED_NAMESPACES")
            ? N({}, t.ALLOWED_NAMESPACES, ve)
            : S),
          (Yt = ft(t, "ADD_URI_SAFE_ATTR")
            ? N(yt($t), t.ADD_URI_SAFE_ATTR, P)
            : $t),
          (ue = ft(t, "ADD_DATA_URI_TAGS")
            ? N(yt(Mt), t.ADD_DATA_URI_TAGS, P)
            : Mt),
          (vt = ft(t, "FORBID_CONTENTS") ? N({}, t.FORBID_CONTENTS, P) : kt),
          (bt = ft(t, "FORBID_TAGS") ? N({}, t.FORBID_TAGS, P) : yt({})),
          (Ot = ft(t, "FORBID_ATTR") ? N({}, t.FORBID_ATTR, P) : yt({})),
          (mt = ft(t, "USE_PROFILES") ? t.USE_PROFILES : !1),
          (Bt = t.ALLOW_ARIA_ATTR !== !1),
          (Wt = t.ALLOW_DATA_ATTR !== !1),
          (Gt = t.ALLOW_UNKNOWN_PROTOCOLS || !1),
          (x = t.ALLOW_SELF_CLOSE_IN_ATTR !== !1),
          (D = t.SAFE_FOR_TEMPLATES || !1),
          (Nt = t.SAFE_FOR_XML !== !1),
          (dt = t.WHOLE_DOCUMENT || !1),
          (At = t.RETURN_DOM || !1),
          (It = t.RETURN_DOM_FRAGMENT || !1),
          (Pt = t.RETURN_TRUSTED_TYPE || !1),
          (jt = t.FORCE_BODY || !1),
          (ce = t.SANITIZE_DOM !== !1),
          (le = t.SANITIZE_NAMED_PROPS || !1),
          (Rt = t.KEEP_CONTENT !== !1),
          (Ct = t.IN_PLACE || !1),
          (Dt = t.ALLOWED_URI_REGEXP || dn),
          (wt = t.NAMESPACE || ut),
          (V = t.MATHML_TEXT_INTEGRATION_POINTS || V),
          (B = t.HTML_INTEGRATION_POINTS || B),
          (I = t.CUSTOM_ELEMENT_HANDLING || {}),
          t.CUSTOM_ELEMENT_HANDLING &&
            Pe(t.CUSTOM_ELEMENT_HANDLING.tagNameCheck) &&
            (I.tagNameCheck = t.CUSTOM_ELEMENT_HANDLING.tagNameCheck),
          t.CUSTOM_ELEMENT_HANDLING &&
            Pe(t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) &&
            (I.attributeNameCheck =
              t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),
          t.CUSTOM_ELEMENT_HANDLING &&
            typeof t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements ==
              "boolean" &&
            (I.allowCustomizedBuiltInElements =
              t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),
          D && (Wt = !1),
          It && (At = !0),
          mt &&
            ((F = N({}, qe)),
            (H = []),
            mt.html === !0 && (N(F, Xe), N(H, Ke)),
            mt.svg === !0 && (N(F, Ee), N(H, Se), N(H, fe)),
            mt.svgFilters === !0 && (N(F, we), N(H, Se), N(H, fe)),
            mt.mathMl === !0 && (N(F, Te), N(H, Ze), N(H, fe))),
          t.ADD_TAGS && (F === ae && (F = yt(F)), N(F, t.ADD_TAGS, P)),
          t.ADD_ATTR && (H === re && (H = yt(H)), N(H, t.ADD_ATTR, P)),
          t.ADD_URI_SAFE_ATTR && N(Yt, t.ADD_URI_SAFE_ATTR, P),
          t.FORBID_CONTENTS &&
            (vt === kt && (vt = yt(vt)), N(vt, t.FORBID_CONTENTS, P)),
          Rt && (F["#text"] = !0),
          dt && N(F, ["html", "head", "body"]),
          F.table && (N(F, ["tbody"]), delete bt.tbody),
          t.TRUSTED_TYPES_POLICY)
        ) {
          if (typeof t.TRUSTED_TYPES_POLICY.createHTML != "function")
            throw Qt(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.',
            );
          if (typeof t.TRUSTED_TYPES_POLICY.createScriptURL != "function")
            throw Qt(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.',
            );
          ((b = t.TRUSTED_TYPES_POLICY), (R = b.createHTML("")));
        } else
          (b === void 0 && (b = qn(h, o)),
            b !== null && typeof R == "string" && (R = b.createHTML("")));
        (tt && tt(t), (Tt = t));
      }
    },
    ke = N({}, [...Ee, ...we, ...xn]),
    Me = N({}, [...Te, ...Un]),
    bn = function (t) {
      let p = w(t);
      (!p || !p.tagName) && (p = { namespaceURI: wt, tagName: "template" });
      const A = de(t.tagName),
        O = de(p.tagName);
      return Xt[t.namespaceURI]
        ? t.namespaceURI === Et
          ? p.namespaceURI === ut
            ? A === "svg"
            : p.namespaceURI === Ft
              ? A === "svg" && (O === "annotation-xml" || V[O])
              : !!ke[A]
          : t.namespaceURI === Ft
            ? p.namespaceURI === ut
              ? A === "math"
              : p.namespaceURI === Et
                ? A === "math" && B[O]
                : !!Me[A]
            : t.namespaceURI === ut
              ? (p.namespaceURI === Et && !B[O]) ||
                (p.namespaceURI === Ft && !V[O])
                ? !1
                : !Me[A] && (X[A] || !ke[A])
              : !!(pt === "application/xhtml+xml" && Xt[t.namespaceURI])
        : !1;
    },
    ht = function (t) {
      Zt(n.removed, { element: t });
      try {
        w(t).removeChild(t);
      } catch {
        _(t);
      }
    },
    xt = function (t, p) {
      try {
        Zt(n.removed, { attribute: p.getAttributeNode(t), from: p });
      } catch {
        Zt(n.removed, { attribute: null, from: p });
      }
      if ((p.removeAttribute(t), t === "is"))
        if (At || It)
          try {
            ht(p);
          } catch {}
        else
          try {
            p.setAttribute(t, "");
          } catch {}
    },
    $e = function (t) {
      let p = null,
        A = null;
      if (jt) t = "<remove></remove>" + t;
      else {
        const W = Ve(t, /^[\r\n\t ]+/);
        A = W && W[0];
      }
      pt === "application/xhtml+xml" &&
        wt === ut &&
        (t =
          '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' +
          t +
          "</body></html>");
      const O = b ? b.createHTML(t) : t;
      if (wt === ut)
        try {
          p = new v().parseFromString(O, pt);
        } catch {}
      if (!p || !p.documentElement) {
        p = U.createDocument(wt, "template", null);
        try {
          p.documentElement.innerHTML = Vt ? R : O;
        } catch {}
      }
      const q = p.body || p.documentElement;
      return (
        t && A && q.insertBefore(s.createTextNode(A), q.childNodes[0] || null),
        wt === ut
          ? G.call(p, dt ? "html" : "body")[0]
          : dt
            ? p.documentElement
            : q
      );
    },
    Fe = function (t) {
      return $.call(
        t.ownerDocument || t,
        t,
        d.SHOW_ELEMENT |
          d.SHOW_COMMENT |
          d.SHOW_TEXT |
          d.SHOW_PROCESSING_INSTRUCTION |
          d.SHOW_CDATA_SECTION,
        null,
      );
    },
    ye = function (t) {
      return (
        t instanceof y &&
        (typeof t.nodeName != "string" ||
          typeof t.textContent != "string" ||
          typeof t.removeChild != "function" ||
          !(t.attributes instanceof c) ||
          typeof t.removeAttribute != "function" ||
          typeof t.setAttribute != "function" ||
          typeof t.namespaceURI != "string" ||
          typeof t.insertBefore != "function" ||
          typeof t.hasChildNodes != "function")
      );
    },
    xe = function (t) {
      return typeof r == "function" && t instanceof r;
    };
  function _t(T, t, p) {
    pe(T, (A) => {
      A.call(n, t, p, Tt);
    });
  }
  const Ue = function (t) {
      let p = null;
      if ((_t(C.beforeSanitizeElements, t, null), ye(t))) return (ht(t), !0);
      const A = P(t.nodeName);
      if (
        (_t(C.uponSanitizeElement, t, { tagName: A, allowedTags: F }),
        (Nt &&
          t.hasChildNodes() &&
          !xe(t.firstElementChild) &&
          J(/<[/\w!]/g, t.innerHTML) &&
          J(/<[/\w!]/g, t.textContent)) ||
          t.nodeType === ee.progressingInstruction ||
          (Nt && t.nodeType === ee.comment && J(/<[/\w]/g, t.data)))
      )
        return (ht(t), !0);
      if (!F[A] || bt[A]) {
        if (
          !bt[A] &&
          Be(A) &&
          ((I.tagNameCheck instanceof RegExp && J(I.tagNameCheck, A)) ||
            (I.tagNameCheck instanceof Function && I.tagNameCheck(A)))
        )
          return !1;
        if (Rt && !vt[A]) {
          const O = w(t) || t.parentNode,
            q = g(t) || t.childNodes;
          if (q && O) {
            const W = q.length;
            for (let nt = W - 1; nt >= 0; --nt) {
              const gt = E(q[nt], !0);
              ((gt.__removalCount = (t.__removalCount || 0) + 1),
                O.insertBefore(gt, u(t)));
            }
          }
        }
        return (ht(t), !0);
      }
      return (t instanceof f && !bn(t)) ||
        ((A === "noscript" || A === "noembed" || A === "noframes") &&
          J(/<\/no(script|embed|frames)/i, t.innerHTML))
        ? (ht(t), !0)
        : (D &&
            t.nodeType === ee.text &&
            ((p = t.textContent),
            pe([L, Y, ot], (O) => {
              p = Jt(p, O, " ");
            }),
            t.textContent !== p &&
              (Zt(n.removed, { element: t.cloneNode() }), (t.textContent = p))),
          _t(C.afterSanitizeElements, t, null),
          !1);
    },
    He = function (t, p, A) {
      if (ce && (p === "id" || p === "name") && (A in s || A in Sn)) return !1;
      if (!(Wt && !Ot[p] && J(z, p))) {
        if (!(Bt && J(at, p))) {
          if (!H[p] || Ot[p]) {
            if (
              !(
                (Be(t) &&
                  ((I.tagNameCheck instanceof RegExp && J(I.tagNameCheck, t)) ||
                    (I.tagNameCheck instanceof Function &&
                      I.tagNameCheck(t))) &&
                  ((I.attributeNameCheck instanceof RegExp &&
                    J(I.attributeNameCheck, p)) ||
                    (I.attributeNameCheck instanceof Function &&
                      I.attributeNameCheck(p)))) ||
                (p === "is" &&
                  I.allowCustomizedBuiltInElements &&
                  ((I.tagNameCheck instanceof RegExp && J(I.tagNameCheck, A)) ||
                    (I.tagNameCheck instanceof Function && I.tagNameCheck(A))))
              )
            )
              return !1;
          } else if (!Yt[p]) {
            if (!J(Dt, Jt(A, ct, ""))) {
              if (
                !(
                  (p === "src" || p === "xlink:href" || p === "href") &&
                  t !== "script" &&
                  kn(A, "data:") === 0 &&
                  ue[t]
                )
              ) {
                if (!(Gt && !J(rt, Jt(A, ct, "")))) {
                  if (A) return !1;
                }
              }
            }
          }
        }
      }
      return !0;
    },
    Be = function (t) {
      return t !== "annotation-xml" && Ve(t, lt);
    },
    We = function (t) {
      _t(C.beforeSanitizeAttributes, t, null);
      const { attributes: p } = t;
      if (!p || ye(t)) return;
      const A = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: H,
        forceKeepAttr: void 0,
      };
      let O = p.length;
      for (; O--; ) {
        const q = p[O],
          { name: W, namespaceURI: nt, value: gt } = q,
          Kt = P(W),
          Ae = gt;
        let K = W === "value" ? Ae : Mn(Ae);
        if (
          ((A.attrName = Kt),
          (A.attrValue = K),
          (A.keepAttr = !0),
          (A.forceKeepAttr = void 0),
          _t(C.uponSanitizeAttribute, t, A),
          (K = A.attrValue),
          le && (Kt === "id" || Kt === "name") && (xt(W, t), (K = _e + K)),
          Nt && J(/((--!?|])>)|<\/(style|title)/i, K))
        ) {
          xt(W, t);
          continue;
        }
        if (A.forceKeepAttr) continue;
        if (!A.keepAttr) {
          xt(W, t);
          continue;
        }
        if (!x && J(/\/>/i, K)) {
          xt(W, t);
          continue;
        }
        D &&
          pe([L, Y, ot], (ze) => {
            K = Jt(K, ze, " ");
          });
        const Ge = P(t.nodeName);
        if (!He(Ge, Kt, K)) {
          xt(W, t);
          continue;
        }
        if (
          b &&
          typeof h == "object" &&
          typeof h.getAttributeType == "function" &&
          !nt
        )
          switch (h.getAttributeType(Ge, Kt)) {
            case "TrustedHTML": {
              K = b.createHTML(K);
              break;
            }
            case "TrustedScriptURL": {
              K = b.createScriptURL(K);
              break;
            }
          }
        if (K !== Ae)
          try {
            (nt ? t.setAttributeNS(nt, W, K) : t.setAttribute(W, K),
              ye(t) ? ht(t) : Ye(n.removed));
          } catch {
            xt(W, t);
          }
      }
      _t(C.afterSanitizeAttributes, t, null);
    },
    Nn = function T(t) {
      let p = null;
      const A = Fe(t);
      for (_t(C.beforeSanitizeShadowDOM, t, null); (p = A.nextNode()); )
        (_t(C.uponSanitizeShadowNode, p, null),
          Ue(p),
          We(p),
          p.content instanceof l && T(p.content));
      _t(C.afterSanitizeShadowDOM, t, null);
    };
  return (
    (n.sanitize = function (T) {
      let t =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
        p = null,
        A = null,
        O = null,
        q = null;
      if (((Vt = !T), Vt && (T = "<!-->"), typeof T != "string" && !xe(T)))
        if (typeof T.toString == "function") {
          if (((T = T.toString()), typeof T != "string"))
            throw Qt("dirty is not a string, aborting");
        } else throw Qt("toString is not a function");
      if (!n.isSupported) return T;
      if (
        (zt || ge(t), (n.removed = []), typeof T == "string" && (Ct = !1), Ct)
      ) {
        if (T.nodeName) {
          const gt = P(T.nodeName);
          if (!F[gt] || bt[gt])
            throw Qt("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (T instanceof r)
        ((p = $e("<!---->")),
          (A = p.ownerDocument.importNode(T, !0)),
          (A.nodeType === ee.element && A.nodeName === "BODY") ||
          A.nodeName === "HTML"
            ? (p = A)
            : p.appendChild(A));
      else {
        if (!At && !D && !dt && T.indexOf("<") === -1)
          return b && Pt ? b.createHTML(T) : T;
        if (((p = $e(T)), !p)) return At ? null : Pt ? R : "";
      }
      p && jt && ht(p.firstChild);
      const W = Fe(Ct ? T : p);
      for (; (O = W.nextNode()); )
        (Ue(O), We(O), O.content instanceof l && Nn(O.content));
      if (Ct) return T;
      if (At) {
        if (It)
          for (q = j.call(p.ownerDocument); p.firstChild; )
            q.appendChild(p.firstChild);
        else q = p;
        return (
          (H.shadowroot || H.shadowrootmode) && (q = Z.call(i, q, !0)),
          q
        );
      }
      let nt = dt ? p.outerHTML : p.innerHTML;
      return (
        dt &&
          F["!doctype"] &&
          p.ownerDocument &&
          p.ownerDocument.doctype &&
          p.ownerDocument.doctype.name &&
          J(mn, p.ownerDocument.doctype.name) &&
          (nt =
            "<!DOCTYPE " +
            p.ownerDocument.doctype.name +
            `>
` +
            nt),
        D &&
          pe([L, Y, ot], (gt) => {
            nt = Jt(nt, gt, " ");
          }),
        b && Pt ? b.createHTML(nt) : nt
      );
    }),
    (n.setConfig = function () {
      let T =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      (ge(T), (zt = !0));
    }),
    (n.clearConfig = function () {
      ((Tt = null), (zt = !1));
    }),
    (n.isValidAttribute = function (T, t, p) {
      Tt || ge({});
      const A = P(T),
        O = P(t);
      return He(A, O, p);
    }),
    (n.addHook = function (T, t) {
      typeof t == "function" && Zt(C[T], t);
    }),
    (n.removeHook = function (T, t) {
      if (t !== void 0) {
        const p = In(C[T], t);
        return p === -1 ? void 0 : Pn(C[T], p, 1)[0];
      }
      return Ye(C[T]);
    }),
    (n.removeHooks = function (T) {
      C[T] = [];
    }),
    (n.removeAllHooks = function () {
      C = Qe();
    }),
    n
  );
}
var _n = hn();
const _s = Object.freeze(
  Object.defineProperty({ __proto__: null, default: _n }, Symbol.toStringTag, {
    value: "Module",
  }),
);
function k(e = "") {
  return e == null ? "" : _n(window).sanitize(String(e));
}
function Oe() {
  return new Date().toLocaleString();
}
function gn(e = 0) {
  const n = Math.round(e / 1e3),
    s = Math.floor(n / 60),
    i = n % 60;
  return `${s} ${s === 1 ? "Minute" : "Minutes"} and ${i} ${i === 1 ? "Second" : "Seconds"}`;
}
function Kn(e) {
  document.getElementById("result").innerHTML = k(`
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${Oe()}</span>
      </div>
      ${e ? `<p class="note">Address: <strong>${k(e)}</strong></p>` : ""}
      <div class="callout">Fetching county, languages, English proficiency, population, income, DAC, and alerts…</div>
      <p class="note">Elapsed: <span id="searchTimer">0m 00s</span></p>
    </div>
  `);
}
function tn(e, n, s) {
  document.getElementById("result").innerHTML = k(`
    <div class="card" role="alert">
      <div class="card__header">
        <h2 class="card__title">Unable to retrieve data</h2>
        <span class="updated">${Oe()}</span>
      </div>
      ${n ? `<p class="note">Address: <strong>${k(n)}</strong></p>` : ""}
      <div class="callout" style="border-left-color:#b45309;">
        ${k(e || "Please try again with a different address.")}
      </div>
      <p class="note">Search took ${gn(s)}.</p>
      <p class="note">API base: <code>${k(Rn || "/api")}</code>.</p>
    </div>
  `);
}
var ln;
const en =
  ((ln = document.querySelector('meta[name="sentry-dsn"]')) == null
    ? void 0
    : ln.content) || "";
en &&
  un(() => import("./index.js"), [])
    .then((e) => {
      ((window.Sentry = e), e.init({ dsn: en }), De("Sentry initialized"));
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
  (De("window.onerror", e.message),
    (n = window.Sentry) == null ||
      n.captureException(e.error || new Error(e.message || "Unknown error")));
});
window.addEventListener("unhandledrejection", (e) => {
  var n;
  (De("unhandledrejection", e.reason),
    (n = window.Sentry) == null || n.captureException(e.reason));
});
let Ut = null;
const be = new Map();
function yn() {
  window.print();
}
window.printReport = yn;
function An() {
  if (!Ut) return;
  const e = new Blob([JSON.stringify(Ut, null, 2)], {
      type: "application/json",
    }),
    n = URL.createObjectURL(e),
    s = document.createElement("a"),
    i = (Ut.address || "report").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  ((s.href = n),
    (s.download = `calwep_report_${i}.json`),
    document.body.appendChild(s),
    s.click(),
    document.body.removeChild(s),
    URL.revokeObjectURL(n));
}
window.downloadRawData = An;
window.downloadPdf = async function () {
  const { downloadPdf: e } = await un(async () => {
    const { downloadPdf: n } = await import("./pdf.js").then((s) => s.p);
    return { downloadPdf: n };
  }, []);
  e(Ut);
};
function vn() {
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
window.shareReport = vn;
function Zn() {
  var e, n, s, i;
  ((e = document.getElementById("printBtn")) == null ||
    e.addEventListener("click", yn),
    (n = document.getElementById("pdfBtn")) == null ||
      n.addEventListener("click", window.downloadPdf),
    (s = document.getElementById("rawBtn")) == null ||
      s.addEventListener("click", An),
    (i = document.getElementById("shareBtn")) == null ||
      i.addEventListener("click", vn));
}
function Q(e) {
  return e == null || Number(e) === -888888888;
}
function Jn(e) {
  return !Q(e) && Number.isFinite(Number(e))
    ? Number(e).toLocaleString()
    : "Not available";
}
function Ne(e) {
  return Q(e) || !Number.isFinite(Number(e))
    ? "Not available"
    : `$${Math.round(Number(e)).toLocaleString()}`;
}
function nn(e) {
  return !Q(e) && Number.isFinite(Number(e))
    ? Number(e).toLocaleString(void 0, { maximumFractionDigits: 1 })
    : "Not available";
}
function M(e) {
  return !Q(e) && Number.isFinite(Number(e))
    ? `${Number(e).toFixed(1)}%`
    : "Not available";
}
function se(e = {}, ...n) {
  const s = (i) => i && typeof i == "object" && !Array.isArray(i);
  for (const i of n)
    if (s(i))
      for (const [o, l] of Object.entries(i))
        s(l) ? (e[o] = se(s(e[o]) ? e[o] : {}, l)) : (e[o] = l);
  return e;
}
function oe(e = [], n = 50) {
  const s = [];
  for (let i = 0; i < e.length; i += n) s.push(e.slice(i, i + n));
  return s;
}
let me = null,
  Ht = null;
function Qn() {
  Ht = Date.now();
  const e = (n) => {
    const s = document.getElementById("searchTimer");
    s && (s.textContent = n);
    const i = document.getElementById("spinnerTime");
    i && (i.textContent = n);
  };
  (e("0m 00s"),
    (me = setInterval(() => {
      if (!Ht) return;
      const n = Date.now() - Ht,
        s = Math.floor((n / 1e3) % 60),
        i = Math.floor(n / 6e4);
      e(`${i}m ${s.toString().padStart(2, "0")}s`);
    }, 1e3)));
}
function sn() {
  me && clearInterval(me);
  const e = Ht ? Date.now() - Ht : 0;
  return ((me = null), (Ht = null), e);
}
async function ts(e = {}) {
  let {
    city: n,
    census_tract: s,
    lat: i,
    lon: o,
    state_fips: l,
    county_fips: a,
    tract_code: r,
  } = e;
  const f = [];
  return (
    !n &&
      i != null &&
      o != null &&
      f.push(
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${i}&longitude=${o}&localityLanguage=en`,
        )
          .then((d) => d.json())
          .then((d) => {
            var y, v;
            n =
              (Array.isArray(
                (y = d == null ? void 0 : d.localityInfo) == null
                  ? void 0
                  : y.administrative,
              )
                ? (v = d.localityInfo.administrative.find(
                    (h) => h.order === 8 || h.adminLevel === 8,
                  )) == null
                  ? void 0
                  : v.name
                : null) ||
              d.city ||
              d.locality ||
              n;
          })
          .catch(() => {}),
      ),
    (!s || !l || !a || !r) &&
      i != null &&
      o != null &&
      f.push(
        fetch(
          `https://geo.fcc.gov/api/census/block/find?latitude=${i}&longitude=${o}&format=json`,
        )
          .then((d) => d.json())
          .then((d) => {
            var y;
            const c =
              (y = d == null ? void 0 : d.Block) == null ? void 0 : y.FIPS;
            c &&
              c.length >= 11 &&
              ((l = c.slice(0, 2)),
              (a = c.slice(2, 5)),
              (r = c.slice(5, 11)),
              (s = `${r.slice(0, 4)}.${r.slice(4)}`));
          })
          .catch(() => {}),
      ),
    f.length && (await Promise.all(f)),
    {
      ...e,
      city: n,
      census_tract: s,
      state_fips: l,
      county_fips: a,
      tract_code: r,
    }
  );
}
let ne = null;
async function En() {
  if (ne) return ne;
  try {
    const e = await ie(
        "https://api.census.gov/data/2022/acs/acs5/groups/C16001.json",
      ),
      n = (e == null ? void 0 : e.variables) || {},
      s = [],
      i = {};
    for (const [o, l] of Object.entries(n)) {
      if (!o.endsWith("E")) continue;
      const a = l.label || "",
        r = /^Estimate!!Total:!!([^:]+):$/.exec(a);
      r && (s.push(o), (i[o] = r[1]));
    }
    ne = { codes: s, names: i };
  } catch {
    ne = { codes: [], names: {} };
  }
  return ne;
}
async function Le(e = []) {
  var v, h;
  const { codes: n, names: s } = await En();
  if (!n.length) return {};
  const i = {};
  for (const m of e) {
    const E = String(m)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (E.length !== 11) continue;
    const _ = E.slice(0, 2),
      u = E.slice(2, 5),
      g = E.slice(5),
      w = `${_}${u}`;
    (i[w] || (i[w] = { state: _, county: u, tracts: [] }), i[w].tracts.push(g));
  }
  let o = 0,
    l = 0,
    a = 0;
  const r = {},
    f = Object.values(i).map(async (m) => {
      const E = oe(m.tracts, 50),
        _ = await Promise.all(
          E.map(async (g) => {
            const w = g.join(","),
              b = 40,
              R = [];
            for (let L = 0; L < n.length; L += b) {
              const Y = n.slice(L, L + b),
                z = `https://api.census.gov/data/2022/acs/acs5?get=${(L === 0 ? ["C16001_001E", "C16001_002E", ...Y] : Y).join(",")}&for=tract:${w}&in=state:${m.state}%20county:${m.county}`;
              R.push(
                fetch(z)
                  .then((at) => at.json())
                  .then((at) => ({ type: "lang", rows: at, chunk: Y }))
                  .catch(() => null),
              );
            }
            const U = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0115E&for=tract:${w}&in=state:${m.state}%20county:${m.county}`;
            R.push(
              fetch(U)
                .then((L) => L.json())
                .then((L) => ({ type: "english", rows: L }))
                .catch(() => null),
            );
            const $ = await Promise.all(R);
            let j = 0,
              G = 0,
              Z = 0;
            const C = {};
            for (const L of $) {
              if (!L || !Array.isArray(L.rows) || L.rows.length <= 1) continue;
              const { rows: Y } = L;
              if (L.type === "lang") {
                const ot = Y[0];
                for (let z = 1; z < Y.length; z++) {
                  const at = Y[z],
                    rt = {};
                  (ot.forEach((ct, lt) => (rt[ct] = Number(at[lt]))),
                    (j += rt.C16001_001E || 0),
                    (G += rt.C16001_002E || 0));
                  for (const ct of L.chunk) {
                    const lt = s[ct],
                      Dt = rt[ct] || 0;
                    lt && (C[lt] = (C[lt] || 0) + Dt);
                  }
                }
              } else if (L.type === "english") {
                const ot = Y[0];
                for (let z = 1; z < Y.length; z++) {
                  const at = Y[z],
                    rt = {};
                  (ot.forEach((ct, lt) => (rt[ct] = Number(at[lt]))),
                    (Z += rt.DP02_0115E || 0));
                }
              }
            }
            return { total: j, englishOnly: G, englishLess: Z, langCounts: C };
          }),
        ),
        u = { total: 0, englishOnly: 0, englishLess: 0, langCounts: {} };
      for (const g of _) {
        ((u.total += g.total),
          (u.englishOnly += g.englishOnly),
          (u.englishLess += g.englishLess));
        for (const [w, b] of Object.entries(g.langCounts))
          u.langCounts[w] = (u.langCounts[w] || 0) + b;
      }
      return u;
    }),
    d = await Promise.all(f);
  for (const m of d) {
    ((o += m.total), (l += m.englishOnly), (a += m.englishLess));
    for (const [E, _] of Object.entries(m.langCounts)) r[E] = (r[E] || 0) + _;
  }
  r.English = l;
  const c = r.Spanish || 0,
    y = Object.entries(r).sort((m, E) => E[1] - m[1]);
  return {
    primary_language: (v = y[0]) == null ? void 0 : v[0],
    secondary_language: (h = y[1]) == null ? void 0 : h[0],
    language_other_than_english_pct: o ? ((o - l) / o) * 100 : null,
    english_less_than_very_well_pct: o ? (a / o) * 100 : null,
    spanish_at_home_pct: o ? (c / o) * 100 : null,
  };
}
async function es({ state_fips: e, county_fips: n, tract_code: s } = {}) {
  if (!e || !n || !s) return {};
  const i = `${e}${n}${s}`;
  return Le([i]);
}
async function on(e = []) {
  const n = {};
  for (const f of e) {
    const d = String(f)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (d.length !== 11) continue;
    const c = d.slice(0, 2),
      y = d.slice(2, 5),
      v = d.slice(5),
      h = `${c}${y}`;
    (n[h] || (n[h] = { state: c, county: y, tracts: [] }), n[h].tracts.push(v));
  }
  let s = 0,
    i = 0,
    o = 0,
    l = 0,
    a = 0;
  for (const f of Object.values(n)) {
    const d = oe(f.tracts, 50);
    for (const c of d) {
      const y =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE&for=tract:" +
        c.join(",") +
        `&in=state:${f.state}%20county:${f.county}`;
      try {
        const v = await fetch(y).then((h) => h.json());
        if (!Array.isArray(v) || v.length < 2) continue;
        for (let h = 1; h < v.length; h++) {
          const [m, E, _, u, g] = v[h].map(Number);
          Number.isFinite(m) &&
            m > 0 &&
            ((s += m),
            Number.isFinite(E) && (i += E * m),
            Number.isFinite(_) && (o += _ * m),
            Number.isFinite(u) && (l += u * m),
            Number.isFinite(g) && g >= 0 && (a += (g / 100) * m));
        }
      } catch {}
    }
  }
  const r = {};
  return (
    s > 0 &&
      ((r.population = s),
      i > 0 && (r.median_age = i / s),
      o > 0 && (r.median_household_income = o / s),
      l > 0 && (r.per_capita_income = l / s),
      a > 0 && (r.poverty_rate = (a / s) * 100)),
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
    const h = v.slice(0, 2),
      m = v.slice(2, 5),
      E = v.slice(5),
      _ = `${h}${m}`;
    (n[_] || (n[_] = { state: h, county: m, tracts: [] }), n[_].tracts.push(E));
  }
  let s = 0,
    i = 0,
    o = 0,
    l = 0,
    a = 0,
    r = 0,
    f = 0;
  for (const y of Object.values(n)) {
    const v = oe(y.tracts, 50);
    for (const h of v) {
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
        h.join(",") +
        `&in=state:${y.state}%20county:${y.county}`;
      try {
        const E = await fetch(m).then((_) => _.json());
        if (!Array.isArray(E) || E.length < 2) continue;
        for (let _ = 1; _ < E.length; _++) {
          const [u, g, w, b, R, U, $] = E[_].slice(0, 7).map(Number);
          (Number.isFinite(u) && u > 0 && (s += u),
            Number.isFinite(g) &&
              g > 0 &&
              ((i += g), Number.isFinite(b) && b > 0 && (l += b * g)),
            Number.isFinite(w) && w > 0 && (o += w),
            Number.isFinite(R) &&
              R > 0 &&
              ((a += R),
              Number.isFinite(U) && U > 0 && (r += U),
              Number.isFinite($) && $ > 0 && (f += $)));
        }
      } catch {}
    }
  }
  const d = {},
    c = i + o;
  return (
    c > 0 &&
      ((d.owner_occupied_pct = (i / c) * 100),
      (d.renter_occupied_pct = (o / c) * 100)),
    i > 0 && l > 0 && (d.median_home_value = l / i),
    a > 0 &&
      ((d.high_school_or_higher_pct = (r / a) * 100),
      (d.bachelors_or_higher_pct = (f / a) * 100)),
    d
  );
}
async function ns(e = []) {
  const n = {};
  for (const i of e) {
    const o = String(i)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (o.length !== 11) continue;
    const l = o.slice(0, 2),
      a = o.slice(2, 5),
      r = o.slice(5),
      f = `${l}${a}`;
    (n[f] || (n[f] = { state: l, county: a, tracts: [] }), n[f].tracts.push(r));
  }
  const s = {};
  for (const i of Object.values(n)) {
    const o = oe(i.tracts, 50);
    for (const l of o) {
      const a =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE,DP03_0009PE&for=tract:" +
        l.join(",") +
        `&in=state:${i.state}%20county:${i.county}`;
      try {
        const r = await fetch(a).then((f) => f.json());
        if (!Array.isArray(r) || r.length < 2) continue;
        for (let f = 1; f < r.length; f++) {
          const [d, c, y, v, h, m, E, _, u] = r[f],
            g = `${E}${_}${u}`;
          s[g] = {
            population: Number(d),
            median_age: Number(c),
            median_household_income: Number(y),
            per_capita_income: Number(v),
            poverty_rate: Number(h),
            unemployment_rate: Number(m),
          };
        }
      } catch {}
    }
  }
  return s;
}
async function Ie(e = []) {
  const n = {};
  for (const i of e) {
    const o = String(i)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (o.length !== 11) continue;
    const l = o.slice(0, 2),
      a = o.slice(2, 5),
      r = o.slice(5),
      f = `${l}${a}`;
    (n[f] || (n[f] = { state: l, county: a, tracts: [] }), n[f].tracts.push(r));
  }
  const s = {};
  for (const i of Object.values(n)) {
    const o = oe(i.tracts, 50);
    for (const l of o) {
      const a =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0009PE,DP05_0001E&for=tract:" +
        l.join(",") +
        `&in=state:${i.state}%20county:${i.county}`;
      try {
        const r = await fetch(a).then((f) => f.json());
        if (!Array.isArray(r) || r.length < 2) continue;
        for (let f = 1; f < r.length; f++) {
          const [d, c, y, v, h] = r[f],
            m = `${y}${v}${h}`;
          s[m] = { unemployment_rate: Number(d), population: Number(c) };
        }
      } catch {}
    }
  }
  return s;
}
async function wn(e = []) {
  const n =
      "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query",
    s = new Set(),
    i = 50;
  for (let o = 0; o < e.length; o += i) {
    const l = e.slice(o, o + i);
    if (!l.length) continue;
    const a = `GEOID20 IN (${l.map((f) => `'${f}'`).join(",")})`,
      r =
        n +
        `?where=${encodeURIComponent(a)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    try {
      const f = await fetch(r).then((d) => d.json());
      for (const d of f.features || []) {
        const c = d.attributes || {},
          y = String(c.GEOID20);
        String(c.DAC20 || "").toUpperCase() === "Y" && s.add(y);
      }
    } catch {}
  }
  return Array.from(s);
}
async function rn(e = []) {
  const n = new Set();
  return (
    await Promise.all(
      e.map(async (s) => {
        try {
          const i = he("/lookup", { fips: s, census_tract: s, geoid: s }),
            o = await ie(i);
          Array.isArray(o.environmental_hardships) &&
            o.environmental_hardships.forEach((l) => n.add(l));
        } catch {}
      }),
    ),
    Array.from(n).sort()
  );
}
async function ss(e = {}) {
  const { state_fips: n, county_fips: s, tract_code: i } = e || {},
    o = n && s && i ? `${n}${s}${i}` : null;
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
      ].some((c) => Q(e[c]))
    )
  )
    return e;
  const f = (await ns([o]))[o];
  if (!f) return e;
  const d = { ...e };
  d.demographics = { ...d.demographics, ...f };
  for (const [c, y] of Object.entries(f)) Q(d[c]) && (d[c] = y);
  return d;
}
async function is(e = {}) {
  var r, f;
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    o = n || {};
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length) {
    const d = await on(o.census_tracts_fips),
      c = o.demographics || {};
    i.surrounding_10_mile = { ...o, demographics: { ...c, ...d } };
  }
  const l = s || {},
    a = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (a.length) {
    const d = await on(a),
      c = l.demographics || {},
      y =
        (f = (r = i.surrounding_10_mile) == null ? void 0 : r.demographics) ==
        null
          ? void 0
          : f.median_household_income,
      v = { ...c, ...d };
    (y != null &&
      (!Number.isFinite(v.median_household_income) ||
        v.median_household_income < 0) &&
      (v.median_household_income = y),
      (i.water_district = { ...l, demographics: v }));
  }
  return i;
}
async function os(e = {}) {
  var r, f;
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    o = n || {};
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length) {
    const d = o.demographics || {};
    if (
      [
        d.owner_occupied_pct,
        d.renter_occupied_pct,
        d.median_home_value,
        d.high_school_or_higher_pct,
        d.bachelors_or_higher_pct,
      ].some((y) => Q(y) || (typeof y == "number" && y < 0))
    ) {
      const y = await an(o.census_tracts_fips);
      i.surrounding_10_mile = { ...o, demographics: { ...d, ...y } };
    }
  }
  const l = s || {},
    a = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (a.length) {
    const d = l.demographics || {};
    if (
      [
        d.owner_occupied_pct,
        d.renter_occupied_pct,
        d.median_home_value,
        d.high_school_or_higher_pct,
        d.bachelors_or_higher_pct,
      ].some((y) => Q(y) || (typeof y == "number" && y < 0))
    ) {
      const y = await an(a);
      let v = { ...d, ...y };
      const h =
        (f = (r = i.surrounding_10_mile) == null ? void 0 : r.demographics) ==
        null
          ? void 0
          : f.median_home_value;
      (h != null &&
        (!Number.isFinite(v.median_home_value) || v.median_home_value < 0) &&
        (v.median_home_value = h),
        (i.water_district = { ...l, demographics: v }));
    }
  }
  return i;
}
async function as(e = {}) {
  const {
      state_fips: n,
      county_fips: s,
      tract_code: i,
      unemployment_rate: o,
      surrounding_10_mile: l,
      water_district: a,
    } = e || {},
    r = l || {},
    f = a || {},
    d = [],
    c = n && s && i ? `${n}${s}${i}` : null;
  Q(o) && c && d.push(c);
  const y = Array.isArray(r.census_tracts_fips) ? r.census_tracts_fips : [];
  r.demographics &&
    Q(r.demographics.unemployment_rate) &&
    y.length &&
    d.push(...y);
  const v = Array.isArray(f.census_tracts_fips)
    ? f.census_tracts_fips.map(String)
    : [];
  f.demographics &&
    Q(f.demographics.unemployment_rate) &&
    v.length &&
    d.push(...v);
  const h = Array.from(new Set(d));
  if (!h.length) return e;
  const m = await Ie(h),
    E = { ...e };
  if (
    (Q(o) && c && m[c] && (E.unemployment_rate = m[c].unemployment_rate),
    r.demographics && Q(r.demographics.unemployment_rate) && y.length)
  ) {
    let _ = 0,
      u = 0;
    for (const g of y) {
      const w = m[g];
      w &&
        Number.isFinite(w.unemployment_rate) &&
        Number.isFinite(w.population) &&
        ((_ += w.population), (u += w.unemployment_rate * w.population));
    }
    _ > 0 &&
      (E.surrounding_10_mile = {
        ...r,
        demographics: { ...r.demographics, unemployment_rate: u / _ },
      });
  }
  if (f.demographics && Q(f.demographics.unemployment_rate) && v.length) {
    let _ = 0,
      u = 0;
    for (const g of v) {
      const w = m[g];
      w &&
        Number.isFinite(w.unemployment_rate) &&
        Number.isFinite(w.population) &&
        ((_ += w.population), (u += w.unemployment_rate * w.population));
    }
    _ > 0 &&
      (E.water_district = {
        ...f,
        demographics: { ...f.demographics, unemployment_rate: u / _ },
      });
  }
  return E;
}
async function rs(e = {}) {
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    o = n || {};
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length) {
    const r = await Le(o.census_tracts_fips),
      f = o.demographics || {};
    i.surrounding_10_mile = { ...o, demographics: { ...f, ...r } };
  }
  const l = s || {},
    a = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (a.length) {
    const r = await Le(a),
      f = l.demographics || {};
    i.water_district = { ...l, demographics: { ...f, ...r } };
  }
  return i;
}
async function cs(e = {}) {
  const { surrounding_10_mile: n, water_district: s } = e || {},
    i = { ...e },
    o = n || {},
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
    const f = await rn(l);
    i.surrounding_10_mile = { ...o, environmental_hardships: f };
  }
  const a = s || {},
    r = Array.isArray(a.census_tracts_fips)
      ? a.census_tracts_fips.map(String)
      : [];
  if (
    (!Array.isArray(a.environmental_hardships) ||
      !a.environmental_hardships.length) &&
    r.length
  ) {
    const f = await rn(r);
    i.water_district = { ...a, environmental_hardships: f };
  }
  return i;
}
async function ls(e = {}) {
  const { lat: n, lon: s, census_tract: i, surrounding_10_mile: o } = e || {};
  if (n == null || s == null) return e;
  const l = 1609.34 * 10,
    a = { ...(o || {}) },
    r = [];
  if (!Array.isArray(a.cities) || !a.cities.length) {
    const h = `[out:json];(node[place=city](around:${l},${n},${s});node[place=town](around:${l},${n},${s}););out;`,
      m =
        "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(h);
    r.push(
      fetch(m)
        .then((E) => E.json())
        .then((E) => {
          const _ = (E.elements || [])
            .map((u) => {
              var g;
              return (g = u.tags) == null ? void 0 : g.name;
            })
            .filter(Boolean);
          a.cities = Array.from(new Set(_)).slice(0, 10);
        })
        .catch(() => {}),
    );
  }
  const f = Array.isArray(a.census_tracts) ? a.census_tracts.map(String) : [],
    d = Array.isArray(a.census_tracts_fips)
      ? a.census_tracts_fips.map(String)
      : [],
    c = { ...(a.census_tract_map || {}) },
    y = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query?where=1=1&geometry=${s},${n}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${l}&units=esriSRUnit_Meter&outFields=NAME,GEOID&f=json`;
  (r.push(
    fetch(y)
      .then((h) => h.json())
      .then((h) => {
        const m = h.features || [],
          E = [],
          _ = [],
          u = {};
        for (const g of m) {
          const w = g.attributes || {};
          let b = null;
          if (
            (w.NAME &&
              ((b = w.NAME.replace(/^Census Tract\s+/i, "")), E.push(b)),
            w.GEOID)
          ) {
            const R = String(w.GEOID);
            (_.push(R), b && (u[R] = b));
          }
        }
        ((a.census_tracts = Array.from(new Set([...f, ...E]))),
          (a.census_tracts_fips = Array.from(new Set([...d, ..._]))),
          (a.census_tract_map = { ...c, ...u }));
      })
      .catch(() => {}),
  ),
    r.length && (await Promise.all(r)),
    Array.isArray(a.cities) || (a.cities = []));
  const v = new Set(Array.isArray(a.census_tracts) ? a.census_tracts : []);
  if (
    (i && v.add(String(i)),
    (a.census_tracts = Array.from(v)),
    Array.isArray(a.census_tracts_fips))
  ) {
    const h = new Set(a.census_tracts_fips),
      { state_fips: m, county_fips: E, tract_code: _ } = e || {};
    (m && E && _ && h.add(`${m}${E}${_}`),
      (a.census_tracts_fips = Array.from(h)));
  }
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length)
    try {
      const h = await wn(a.census_tracts_fips),
        m = [];
      for (const E of h) {
        const _ = (a.census_tract_map && a.census_tract_map[E]) || E;
        m.push(_);
      }
      if (((a.dac_tracts = m), (a.dac_tracts_fips = h), m.length)) {
        const E = new Set([...(a.census_tracts || []), ...m]);
        a.census_tracts = Array.from(E);
      }
    } catch {}
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length)
    try {
      const h = await Ie(a.census_tracts_fips);
      let m = 0,
        E = 0;
      const _ = new Set(a.dac_tracts_fips || []);
      for (const u of a.census_tracts_fips) {
        const g = h[u];
        g &&
          Number.isFinite(g.population) &&
          ((m += g.population), _.has(String(u)) && (E += g.population));
      }
      (m > 0 && (a.dac_population_pct = (E / m) * 100),
        a.census_tracts_fips.length > 0 &&
          (a.dac_tracts_pct = (_.size / a.census_tracts_fips.length) * 100));
    } catch {}
  return { ...e, surrounding_10_mile: a };
}
async function us(e = {}, n = "") {
  var m, E;
  const {
    lat: s,
    lon: i,
    city: o,
    census_tract: l,
    state_fips: a,
    county_fips: r,
    tract_code: f,
    water_district: d,
  } = e || {};
  if (s == null || i == null) return e;
  const c = { ...d },
    y = [];
  if (n) {
    const _ = he("/lookup", { address: n });
    y.push(
      ie(_)
        .then((u) => {
          var w, b, R, U;
          c.name =
            ((w = u == null ? void 0 : u.agency) == null
              ? void 0
              : w.agency_name) ||
            ((b = u == null ? void 0 : u.agency) == null ? void 0 : b.name) ||
            (u == null ? void 0 : u.agency_name) ||
            (u == null ? void 0 : u.name) ||
            c.name;
          const g =
            ((R = u == null ? void 0 : u.agency) == null
              ? void 0
              : R.service_area_tracts) ||
            (u == null ? void 0 : u.service_area_tracts) ||
            (u == null ? void 0 : u.census_tracts) ||
            ((U = u == null ? void 0 : u.agency) == null
              ? void 0
              : U.census_tracts);
          if (typeof g == "string") {
            const $ = g.split(/\s*,\s*/).filter(Boolean);
            c.census_tracts = $;
            const j = $.filter((G) => /^\d{11}$/.test(G));
            j.length && (c.census_tracts_fips = j);
          } else if (Array.isArray(g)) {
            const $ = [...new Set(g.map(String))];
            c.census_tracts = $;
            const j = $.filter((G) => /^\d{11}$/.test(G));
            j.length &&
              (c.census_tracts_fips = [
                ...new Set([...(c.census_tracts_fips || []), ...j]),
              ]);
          }
        })
        .catch(() => {}),
    );
  }
  if (!c.name) {
    const _ = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${i}%2C${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=false&f=json`;
    y.push(
      fetch(_)
        .then((u) => u.json())
        .then((u) => {
          var g, w, b;
          c.name =
            ((b =
              (w =
                (g = u == null ? void 0 : u.features) == null
                  ? void 0
                  : g[0]) == null
                ? void 0
                : w.attributes) == null
              ? void 0
              : b.PWS_NAME) || c.name;
        })
        .catch(() => {}),
    );
  }
  if (
    ((!Array.isArray(c.cities) || !c.cities.length) && o && (c.cities = [o]),
    y.length && (await Promise.all(y)),
    c.name && (!Array.isArray(c.census_tracts) || !c.census_tracts.length))
  )
    try {
      const _ = he("/census-tracts", { agency_name: c.name }),
        u = await ie(_),
        g = u == null ? void 0 : u.census_tracts;
      Array.isArray(g) && (c.census_tracts = [...new Set(g.map(String))]);
    } catch {}
  try {
    const _ = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${i}%2C${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`,
      u = await fetch(_).then((w) => w.json()),
      g =
        (E = (m = u == null ? void 0 : u.features) == null ? void 0 : m[0]) ==
        null
          ? void 0
          : E.geometry;
    if (g) {
      const w =
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
      let R;
      try {
        R = await fetch(w, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: b.toString(),
        }).then((G) => G.json());
      } catch {
        const G = `${w}?${b.toString()}`;
        R = await fetch(G).then((Z) => Z.json());
      }
      const U = [],
        $ = [],
        j = {};
      for (const G of R.features || []) {
        const Z = G.attributes || {};
        let C = null;
        if (
          (Z.NAME && ((C = Z.NAME.replace(/^Census Tract\s+/i, "")), U.push(C)),
          Z.GEOID)
        ) {
          const L = String(Z.GEOID);
          ($.push(L), C && (j[L] = C));
        }
      }
      if (U.length || $.length) {
        const G = Array.isArray(c.census_tracts)
            ? c.census_tracts.map(String)
            : [],
          Z = Array.isArray(c.census_tracts_fips)
            ? c.census_tracts_fips.map(String)
            : [],
          C = c.census_tract_map || {};
        (U.length && (c.census_tracts = [...new Set([...G, ...U])]),
          $.length && (c.census_tracts_fips = [...new Set([...Z, ...$])]),
          Object.keys(j).length && (c.census_tract_map = { ...C, ...j }));
      }
    }
  } catch {}
  let v = [];
  (Array.isArray(c.census_tracts)
    ? (v = c.census_tracts.map(String))
    : typeof c.census_tracts == "string" &&
      (v = c.census_tracts.split(/\s*,\s*/).filter(Boolean)),
    l && v.unshift(String(l)),
    (c.census_tracts = [...new Set(v)]));
  let h = Array.isArray(c.census_tracts_fips)
    ? c.census_tracts_fips.map(String)
    : [];
  for (const _ of c.census_tracts)
    if (/^\d{11}$/.test(_)) h.push(_);
    else if (a && r) {
      const u = String(_).replace(/[^0-9]/g, "");
      if (u) {
        const g = u.padStart(6, "0").slice(-6);
        h.push(`${a}${r}${g}`);
      }
    }
  if (
    (a && r && f && h.unshift(`${a}${r}${f}`),
    (c.census_tracts_fips = [...new Set(h)]),
    Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length)
  )
    try {
      const _ = await wn(c.census_tracts_fips),
        u = [];
      for (const g of _) {
        const w = (c.census_tract_map && c.census_tract_map[g]) || g;
        u.push(w);
      }
      if (((c.dac_tracts = u), (c.dac_tracts_fips = _), u.length)) {
        const g = new Set([...(c.census_tracts || []), ...u]);
        c.census_tracts = Array.from(g);
      }
    } catch {}
  if (Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length)
    try {
      const _ = await Ie(c.census_tracts_fips);
      let u = 0,
        g = 0;
      const w = new Set(c.dac_tracts_fips || []);
      for (const b of c.census_tracts_fips) {
        const R = _[b];
        R &&
          Number.isFinite(R.population) &&
          ((u += R.population), w.has(String(b)) && (g += R.population));
      }
      (u > 0 && (c.dac_population_pct = (g / u) * 100),
        c.census_tracts_fips.length > 0 &&
          (c.dac_tracts_pct = (w.size / c.census_tracts_fips.length) * 100));
    } catch {}
  return (
    (c.environment = {
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
    { ...e, water_district: c }
  );
}
async function ps(e = {}) {
  var o, l;
  const { lat: n, lon: s, english_less_than_very_well_pct: i } = e || {};
  if (!Q(i) || n == null || s == null) return e;
  try {
    const a = await fetch(
        `https://geo.fcc.gov/api/census/block/find?latitude=${n}&longitude=${s}&format=json`,
      ).then((f) => f.json()),
      r = (o = a == null ? void 0 : a.Block) == null ? void 0 : o.FIPS;
    if (r && r.length >= 11) {
      const f = r.slice(0, 2),
        d = r.slice(2, 5),
        y = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${r.slice(5, 11)}&in=state:${f}+county:${d}`,
        v = await fetch(y).then((E) => E.json()),
        h = (l = v == null ? void 0 : v[1]) == null ? void 0 : l[0],
        m = Number(h);
      if (Number.isFinite(m) && m >= 0)
        return { ...e, english_less_than_very_well_pct: m };
    }
  } catch {}
  return e;
}
async function fs(e = {}) {
  const { lat: n, lon: s } = e || {};
  if (n == null || s == null) return { ...e, alerts: [] };
  try {
    const i = `https://api.weather.gov/alerts/active?point=${n},${s}`,
      o = await fetch(i, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "CalWEP-Demographic-Website (info@calwep.org)",
        },
      });
    if (!o.ok) throw new Error("NWS response not ok");
    const l = await o.json(),
      a = Array.isArray(l == null ? void 0 : l.features)
        ? l.features
            .map((r) => {
              var f;
              return (f = r == null ? void 0 : r.properties) == null
                ? void 0
                : f.headline;
            })
            .filter(Boolean)
        : [];
    return { ...e, alerts: a };
  } catch {
    return { ...e, alerts: [] };
  }
}
function St(e, n, s, i, o = "") {
  const l = (a) => (a && String(a).trim() ? a : '<p class="note">No data</p>');
  return `
    <section class="section-block">
      <h3 class="section-header">${e}</h3>
      ${o}
      <div class="comparison-grid">
        <div class="col local">${l(n)}</div>
        <div class="col surrounding">${l(s)}</div>
        <div class="col district">${l(i)}</div>
      </div>
    </section>
  `;
}
function cn(e, n, s) {
  const {
      city: i,
      zip: o,
      county: l,
      census_tract: a,
      lat: r,
      lon: f,
      english_less_than_very_well_pct: d,
      language_other_than_english_pct: c,
      spanish_at_home_pct: y,
      languages: v,
      demographics: h = {},
      dac_status: m,
      environmental_hardships: E,
      white_pct: _,
      black_pct: u,
      native_pct: g,
      asian_pct: w,
      pacific_pct: b,
      other_race_pct: R,
      two_or_more_races_pct: U,
      hispanic_pct: $,
      not_hispanic_pct: j,
      owner_occupied_pct: G,
      renter_occupied_pct: Z,
      median_home_value: C,
      high_school_or_higher_pct: L,
      bachelors_or_higher_pct: Y,
      alerts: ot,
      enviroscreen: z,
      surrounding_10_mile: at,
      water_district: rt,
    } = n || {},
    ct = n.population ?? h.population,
    lt = n.median_age ?? h.median_age,
    Dt =
      n.median_income ??
      n.median_household_income ??
      h.median_income ??
      h.median_household_income,
    F = n.per_capita_income ?? h.per_capita_income,
    ae = n.poverty_rate ?? h.poverty_rate,
    H = n.unemployment_rate ?? h.unemployment_rate,
    re = Array.isArray(v) && v.length ? v : h.languages,
    I = n.enviroscreen_score ?? (z == null ? void 0 : z.score),
    bt = n.enviroscreen_percentile ?? (z == null ? void 0 : z.percentile),
    Ot = Array.isArray(E) ? Array.from(new Set(E)) : [],
    Bt = Array.isArray(ot) ? ot : [],
    Wt =
      r != null && f != null
        ? `${Number(r).toFixed(6)}, ${Number(f).toFixed(6)}`
        : "—";
  let Gt = "";
  if (r != null && f != null) {
    const S = new URL("/api/staticmap", window.location.origin);
    (S.searchParams.set("lat", r),
      S.searchParams.set("lon", f),
      (Gt = `<img class="map-image" src="${S}" alt="Map of location" />`));
  }
  const x = at || {},
    D = rt || {},
    Nt = Array.isArray(x.environmental_hardships)
      ? Array.from(new Set(x.environmental_hardships))
      : [],
    dt = Array.isArray(D.environmental_hardships)
      ? Array.from(new Set(D.environmental_hardships))
      : [],
    zt = Array.isArray(x.census_tracts)
      ? x.census_tracts.join(", ")
      : k(x.census_tracts) || "—",
    jt = Array.isArray(x.cities) ? x.cities.join(", ") : k(x.cities) || "—",
    At = Array.isArray(D.census_tracts)
      ? D.census_tracts.join(", ")
      : k(D.census_tracts) || "—",
    It = Array.isArray(D.cities) ? D.cities.join(", ") : k(D.cities) || "—",
    Pt = `
    <div class="kv">
      <div class="key">City</div><div class="val">${k(i) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${k(a) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${k(o) || "—"}</div>
      <div class="key">County</div><div class="val">${k(l) || "—"}</div>
      <div class="key">Coordinates</div><div class="val">${Wt}</div>
    </div>
    ${Gt}
  `,
    ce = `
    <div class="kv">
      <div class="key">Cities</div><div class="val">${jt}</div>
      <div class="key">Census tracts</div><div class="val">${zt}</div>
    </div>
  `,
    le = `
    <div class="kv">
      <div class="key">District</div><div class="val">${k(D.name) || "—"}</div>
      <div class="key">Cities</div><div class="val">${It}</div>
      <div class="key">Census tracts</div><div class="val">${At}</div>
    </div>
  `,
    _e = St(
      "Location Summary",
      Pt,
      ce,
      le,
      '<p class="section-description">This section lists basic geographic information for the census tract, surrounding 10&#8209;mile area, and water district, such as city, ZIP code, county, and coordinates.</p>',
    ),
    Rt = (S = {}) =>
      `<div class="kv">${[
        ["Total population", Jn(S.population)],
        ["Median age", nn(S.median_age)],
        [
          "Median household income",
          Ne(S.median_income ?? S.median_household_income),
        ],
        ["Per capita income", Ne(S.per_capita_income)],
        ["Poverty rate", M(S.poverty_rate)],
        ["Unemployment rate", M(S.unemployment_rate)],
      ]
        .map(
          ([B, X]) => `<div class="key">${B}</div><div class="val">${X}</div>`,
        )
        .join("")}</div>`,
    Ct = St(
      "Population &amp; Income (ACS)",
      Rt({
        population: ct,
        median_age: lt,
        median_income: Dt,
        per_capita_income: F,
        poverty_rate: ae,
        unemployment_rate: H,
      }),
      Rt(x.demographics || {}),
      Rt(D.demographics || {}),
      '<p class="section-description">This section provides a snapshot of the people living in the selected area, drawn from the American Community Survey (ACS). It includes the total population, median age, household income, poverty rate, and unemployment rate. These indicators offer a quick view of community size, economic stability, and social conditions.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    mt = (S = {}) =>
      `<div class="kv">${[
        [
          "Languages spoken",
          Array.isArray(S.languages) && S.languages.length
            ? S.languages.map((X) => k(X)).join(", ")
            : "Not available",
        ],
        [
          "People who speak a language other than English at home",
          M(S.language_other_than_english_pct),
        ],
        [
          'People who speak English less than "very well"',
          M(S.english_less_than_very_well_pct),
        ],
        ["People who speak Spanish at home", M(S.spanish_at_home_pct)],
      ]
        .map(
          ([X, pt]) =>
            `<div class="key">${X}</div><div class="val">${pt}</div>`,
        )
        .join("")}</div>`,
    vt = St(
      "Language (ACS)",
      mt({
        languages: re,
        language_other_than_english_pct: c,
        english_less_than_very_well_pct: d,
        spanish_at_home_pct: y,
      }),
      mt(x.demographics || {}),
      mt(D.demographics || {}),
      '<p class="section-description">This section highlights the languages spoken in the community and key language indicators based on American Community Survey (ACS) 5&#8209;year estimates.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    kt = (S = {}) => {
      const V = S.enviroscreen_score ?? S.score,
        B = S.enviroscreen_percentile ?? S.percentile,
        X = Number.isFinite(Number(B)) && Number(B) <= 1 ? Number(B) * 100 : B;
      return `<div class="kv">${[
        ["Score", nn(V)],
        ["Percentile", M(X)],
      ]
        .map(
          ([qt, Lt]) =>
            `<div class="key">${qt}</div><div class="val">${Lt}</div>`,
        )
        .join("")}</div>`;
    },
    ue = St(
      "EnviroScreen (CalEnviroScreen 4.0)",
      kt({ enviroscreen_score: I, enviroscreen_percentile: bt }),
      kt(x.environment || {}),
      kt(D.environment || {}),
      '<p class="section-description">This section shows the CalEnviroScreen 4.0 score and percentile for the selected area and comparison regions.</p>',
    ),
    Mt = (S = {}) =>
      `<div class="kv">${[
        ["White", M(S.white_pct)],
        ["Black or African American", M(S.black_pct)],
        ["American Indian / Alaska Native", M(S.native_pct)],
        ["Asian", M(S.asian_pct)],
        ["Native Hawaiian / Pacific Islander", M(S.pacific_pct)],
        ["Other race", M(S.other_race_pct)],
        ["Two or more races", M(S.two_or_more_races_pct)],
        ["Hispanic", M(S.hispanic_pct)],
        ["Not Hispanic", M(S.not_hispanic_pct)],
      ]
        .map(
          ([B, X]) => `<div class="key">${B}</div><div class="val">${X}</div>`,
        )
        .join("")}</div>`,
    Yt = St(
      "Race &amp; Ethnicity (ACS)",
      Mt({
        white_pct: _,
        black_pct: u,
        native_pct: g,
        asian_pct: w,
        pacific_pct: b,
        other_race_pct: R,
        two_or_more_races_pct: U,
        hispanic_pct: $,
        not_hispanic_pct: j,
      }),
      Mt(x.demographics || {}),
      Mt(D.demographics || {}),
      '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    $t = (S = {}) =>
      `<div class="kv">${[
        ["Owner occupied", M(S.owner_occupied_pct)],
        ["Renter occupied", M(S.renter_occupied_pct)],
        ["Median home value", Ne(S.median_home_value)],
        ["High school or higher", M(S.high_school_or_higher_pct)],
        ["Bachelor's degree or higher", M(S.bachelors_or_higher_pct)],
      ]
        .map(
          ([B, X]) => `<div class="key">${B}</div><div class="val">${X}</div>`,
        )
        .join("")}</div>`,
    Ft = St(
      "Housing &amp; Education (ACS)",
      $t({
        owner_occupied_pct: G,
        renter_occupied_pct: Z,
        median_home_value: C,
        high_school_or_higher_pct: L,
        bachelors_or_higher_pct: Y,
      }),
      $t(x.demographics || {}),
      $t(D.demographics || {}),
      '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    Et = (S, V, B, X) => {
      const pt = Array.isArray(V) ? V.length > 0 : !!S,
        qt = pt ? "var(--success)" : "var(--border-strong)",
        Lt = [`Disadvantaged community: <strong>${pt ? "Yes" : "No"}</strong>`],
        P = [];
      return (
        Number.isFinite(B) &&
          P.push(`<li><strong>${M(B)}</strong> of population</li>`),
        Number.isFinite(X) &&
          P.push(`<li><strong>${M(X)}</strong> of tracts</li>`),
        P.length && Lt.push(`<ul class="dac-stats">${P.join("")}</ul>`),
        Array.isArray(V) &&
          V.length &&
          Lt.push(
            `<div class="dac-tracts">Tracts ${V.map((Tt) => k(Tt)).join(", ")}</div>`,
          ),
        `<div class="callout" style="border-left-color:${qt}">${Lt.join("")}</div>`
      );
    },
    ut = St(
      "Disadvantaged Community (DAC) Status",
      Et(m),
      Array.isArray(x.dac_tracts)
        ? Et(null, x.dac_tracts, x.dac_population_pct, x.dac_tracts_pct)
        : "",
      Array.isArray(D.dac_tracts)
        ? Et(null, D.dac_tracts, D.dac_population_pct, D.dac_tracts_pct)
        : "",
      '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
    ),
    wt = St(
      "Environmental Hardships",
      Ot.length
        ? `<div class="stats">${Ot.map((S) => `<span class="pill">${k(S)}</span>`).join("")}</div>`
        : "",
      Nt.length
        ? `<div class="stats">${Nt.map((S) => `<span class="pill">${k(S)}</span>`).join("")}</div>`
        : "",
      dt.length
        ? `<div class="stats">${dt.map((S) => `<span class="pill">${k(S)}</span>`).join("")}</div>`
        : "",
      '<p class="section-description">This section lists environmental hardships reported for the selected location, highlighting challenges that may affect residents and program planning.</p>',
    ),
    Vt = `
    <section class="section-block">
      <h3 class="section-header">Active Alerts (National Weather Service)</h3>
      <p class="section-description">This section displays any current weather alerts issued by the National Weather Service (NWS) for the selected location. Alerts may include warnings for extreme heat, flooding, wildfire smoke, or other hazardous conditions. Having this information alongside demographic and environmental data helps staff anticipate safety concerns for events, tailor outreach, and ensure programs are responsive to current community conditions.</p>
      ${Bt.length ? `<div class="stats">${Bt.map((S) => `<span class="pill">${k(S)}</span>`).join("")}</div>` : '<p class="note">No active alerts found for this location.</p>'}
    </section>
  `,
    Xt = `
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
          <h2 class="card__title">Results for: ${k(e)}</h2>
          <div class="card__actions">
            <button type="button" id="printBtn">Print</button>
            <button type="button" id="pdfBtn">Download PDF</button>
            <button type="button" id="rawBtn">Raw Data</button>
            <button type="button" id="shareBtn">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${Oe()}</span>
      </div>
      ${Xt}
      ${_e}
      ${Ct}
      ${vt}
      ${Yt}
      ${Ft}
      ${ut}
      ${ue}
      ${wt}
      ${Vt}
      <p class="note">Search took ${gn(s)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
    `)),
    Zn());
}
async function Tn() {
  const e = document.getElementById("autocomplete"),
    n = document.getElementById("result"),
    s = ((e == null ? void 0 : e.value) || "").trim();
  if (s.length < 4) {
    tn("Please enter a more complete address (at least 4 characters).", s, 0);
    return;
  }
  const i = s.toLowerCase();
  if (be.has(i)) {
    const a = be.get(i);
    Ut = { address: s, data: a };
    const r = new URL(window.location);
    (r.searchParams.set("address", s),
      window.history.replaceState(null, "", r.toString()),
      cn(s, a, 0));
    return;
  }
  (n.setAttribute("aria-busy", "true"), Kn(s));
  const o = document.getElementById("spinnerOverlay");
  (o && (o.style.display = "flex"), Qn());
  let l = 0;
  try {
    const a = he("/lookup", { address: s });
    console.log("Lookup request:", a);
    let r = await ie(a);
    if (!r || typeof r != "object") throw new Error("Malformed response.");
    r = await st("enrichLocation", () => ts(r));
    const [f, d, c, y, v] = await Promise.all([
      st("fetchLanguageAcs", () => es(r)),
      st("enrichSurrounding", () => ls(r)),
      st("enrichWaterDistrict", () => us(r, s)),
      st("enrichEnglishProficiency", () => ps(r)),
      st("enrichNwsAlerts", () => fs(r)),
    ]);
    se(r, f, d, c, y, v);
    const h = await st("enrichTractDemographics", () => ss(r));
    se(r, h);
    const m = await st("enrichRegionBasics", () => is(r)),
      E = await st("enrichRegionHousingEducation", () => os(r));
    se(r, m, E);
    const [_, u, g] = await Promise.all([
      st("enrichRegionLanguages", () => rs(r)),
      st("enrichRegionHardships", () => cs(r)),
      st("enrichUnemployment", () => as(r)),
    ]);
    (se(r, _, u, g), (Ut = { address: s, data: r }), be.set(i, r));
    const w = new URL(window.location);
    (w.searchParams.set("address", s),
      window.history.replaceState(null, "", w.toString()),
      (l = sn()),
      cn(s, r, l));
  } catch (a) {
    (l || (l = sn()), tn(String(a), s, l));
  } finally {
    const a = document.getElementById("spinnerOverlay");
    (a && (a.style.display = "none"), n.removeAttribute("aria-busy"));
  }
}
function ds() {
  const e = document.getElementById("lookupBtn");
  if (!e) return;
  const n = e.cloneNode(!0);
  (e.replaceWith(n),
    n.addEventListener("click", (s) => {
      (s.preventDefault(), Tn().catch(console.error));
    }));
}
En().catch(() => {});
window.onload = () => {
  (Cn(), ds());
  const n = new URLSearchParams(window.location.search).get("address");
  if (n) {
    const s = document.getElementById("autocomplete");
    s && ((s.value = n), Tn().catch(console.error));
  }
};
export { _s as p };
