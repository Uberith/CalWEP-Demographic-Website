import { _ as ln } from "./pdf.js";
import {
  A as bn,
  l as Dt,
  s as Rn,
  f as tt,
  b as mt,
  m as ce,
} from "./maps.js";
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */ const {
  entries: un,
  setPrototypeOf: jt,
  isFrozen: Cn,
  getPrototypeOf: Nn,
  getOwnPropertyDescriptor: Ln,
} = Object;
let { freeze: K, seal: se, create: pn } = Object,
  { apply: Ct, construct: Nt } = typeof Reflect < "u" && Reflect;
K ||
  (K = function (n) {
    return n;
  });
se ||
  (se = function (n) {
    return n;
  });
Ct ||
  (Ct = function (n, s, i) {
    return n.apply(s, i);
  });
Nt ||
  (Nt = function (n, s) {
    return new n(...s);
  });
const ct = Z(Array.prototype.forEach),
  Dn = Z(Array.prototype.lastIndexOf),
  Yt = Z(Array.prototype.pop),
  Xe = Z(Array.prototype.push),
  On = Z(Array.prototype.splice),
  pt = Z(String.prototype.toLowerCase),
  At = Z(String.prototype.toString),
  Vt = Z(String.prototype.match),
  Ke = Z(String.prototype.replace),
  kn = Z(String.prototype.indexOf),
  In = Z(String.prototype.trim),
  le = Z(Object.prototype.hasOwnProperty),
  X = Z(RegExp.prototype.test),
  Ze = Pn(TypeError);
function Z(t) {
  return function (n) {
    n instanceof RegExp && (n.lastIndex = 0);
    for (
      var s = arguments.length, i = new Array(s > 1 ? s - 1 : 0), a = 1;
      a < s;
      a++
    )
      i[a - 1] = arguments[a];
    return Ct(t, n, i);
  };
}
function Pn(t) {
  return function () {
    for (var n = arguments.length, s = new Array(n), i = 0; i < n; i++)
      s[i] = arguments[i];
    return Nt(t, s);
  };
}
function R(t, n) {
  let s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : pt;
  jt && jt(t, null);
  let i = n.length;
  for (; i--; ) {
    let a = n[i];
    if (typeof a == "string") {
      const l = s(a);
      l !== a && (Cn(n) || (n[i] = l), (a = l));
    }
    t[a] = !0;
  }
  return t;
}
function Mn(t) {
  for (let n = 0; n < t.length; n++) le(t, n) || (t[n] = null);
  return t;
}
function ge(t) {
  const n = pn(null);
  for (const [s, i] of un(t))
    le(t, s) &&
      (Array.isArray(i)
        ? (n[s] = Mn(i))
        : i && typeof i == "object" && i.constructor === Object
          ? (n[s] = ge(i))
          : (n[s] = i));
  return n;
}
function Je(t, n) {
  for (; t !== null; ) {
    const i = Ln(t, n);
    if (i) {
      if (i.get) return Z(i.get);
      if (typeof i.value == "function") return Z(i.value);
    }
    t = Nn(t);
  }
  function s() {
    return null;
  }
  return s;
}
const qt = K([
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
  vt = K([
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
  wt = K([
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
  $n = K([
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
  Et = K([
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
  xn = K([
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
  Xt = K(["#text"]),
  Kt = K([
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
  Tt = K([
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
  Zt = K([
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
  lt = K(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  Fn = se(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
  Un = se(/<%[\w\W]*|[\w\W]*%>/gm),
  Hn = se(/\$\{[\w\W]*/gm),
  Gn = se(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  Wn = se(/^aria-[\-\w]+$/),
  fn = se(
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ),
  zn = se(/^(?:\w+script|data):/i),
  Bn = se(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  dn = se(/^html$/i),
  jn = se(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Jt = Object.freeze({
  __proto__: null,
  ARIA_ATTR: Wn,
  ATTR_WHITESPACE: Bn,
  CUSTOM_ELEMENT: jn,
  DATA_ATTR: Gn,
  DOCTYPE_NAME: dn,
  ERB_EXPR: Un,
  IS_ALLOWED_URI: fn,
  IS_SCRIPT_OR_DATA: zn,
  MUSTACHE_EXPR: Fn,
  TMPLIT_EXPR: Hn,
});
const Qe = {
    element: 1,
    text: 3,
    progressingInstruction: 7,
    comment: 8,
    document: 9,
  },
  Yn = function () {
    return typeof window > "u" ? null : window;
  },
  Vn = function (n, s) {
    if (typeof n != "object" || typeof n.createPolicy != "function")
      return null;
    let i = null;
    const a = "data-tt-policy-suffix";
    s && s.hasAttribute(a) && (i = s.getAttribute(a));
    const l = "dompurify" + (i ? "#" + i : "");
    try {
      return n.createPolicy(l, {
        createHTML(o) {
          return o;
        },
        createScriptURL(o) {
          return o;
        },
      });
    } catch {
      return (
        console.warn("TrustedTypes policy " + l + " could not be created."),
        null
      );
    }
  },
  Qt = function () {
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
function mn() {
  let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Yn();
  const n = (T) => mn(T);
  if (
    ((n.version = "3.2.6"),
    (n.removed = []),
    !t || !t.document || t.document.nodeType !== Qe.document || !t.Element)
  )
    return ((n.isSupported = !1), n);
  let { document: s } = t;
  const i = s,
    a = i.currentScript,
    {
      DocumentFragment: l,
      HTMLTemplateElement: o,
      Node: r,
      Element: d,
      NodeFilter: f,
      NamedNodeMap: c = t.NamedNodeMap || t.MozNamedAttrMap,
      HTMLFormElement: y,
      DOMParser: w,
      trustedTypes: _,
    } = t,
    m = d.prototype,
    v = Je(m, "cloneNode"),
    h = Je(m, "remove"),
    p = Je(m, "nextSibling"),
    g = Je(m, "childNodes"),
    E = Je(m, "parentNode");
  if (typeof o == "function") {
    const T = s.createElement("template");
    T.content && T.content.ownerDocument && (s = T.content.ownerDocument);
  }
  let b,
    C = "";
  const {
      implementation: F,
      createNodeIterator: P,
      createDocumentFragment: z,
      getElementsByTagName: G,
    } = s,
    { importNode: q } = i;
  let N = Qt();
  n.isSupported =
    typeof un == "function" &&
    typeof E == "function" &&
    F &&
    F.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: L,
    ERB_EXPR: B,
    TMPLIT_EXPR: ue,
    DATA_ATTR: te,
    ARIA_ATTR: ie,
    IS_SCRIPT_OR_DATA: oe,
    ATTR_WHITESPACE: ae,
    CUSTOM_ELEMENT: re,
  } = Jt;
  let { IS_ALLOWED_URI: Te } = Jt,
    M = null;
  const nt = R({}, [...qt, ...vt, ...wt, ...Et, ...Xt]);
  let U = null;
  const Ue = R({}, [...Kt, ...Tt, ...Zt, ...lt]);
  let O = Object.seal(
      pn(null, {
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
    $ = !0,
    I = !0,
    Ge = !1,
    We = !0,
    ye = !1,
    Re = !0,
    de = !1,
    ze = !1,
    Be = !1,
    Ae = !1,
    Ce = !1,
    Ne = !1,
    Le = !0,
    st = !1;
  const je = "user-content-";
  let Ye = !0,
    me = !1,
    ve = {},
    pe = null;
  const it = R({}, [
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
  const ot = R({}, ["audio", "video", "img", "source", "image", "track"]);
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
    ke = "http://www.w3.org/2000/svg",
    S = "http://www.w3.org/1999/xhtml";
  let j = S,
    J = !1,
    Q = null;
  const rt = R({}, [Oe, ke, S], At);
  let Ie = R({}, ["mi", "mo", "mn", "ms", "mtext"]),
    we = R({}, ["annotation-xml"]);
  const Pe = R({}, ["title", "style", "font", "a", "script"]);
  let be = null;
  const vn = ["application/xhtml+xml", "text/html"],
    wn = "text/html";
  let W = null,
    Me = null;
  const En = s.createElement("form"),
    It = function (e) {
      return e instanceof RegExp || e instanceof Function;
    },
    _t = function () {
      let e =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (!(Me && Me === e)) {
        if (
          ((!e || typeof e != "object") && (e = {}),
          (e = ge(e)),
          (be =
            vn.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? wn : e.PARSER_MEDIA_TYPE),
          (W = be === "application/xhtml+xml" ? At : pt),
          (M = le(e, "ALLOWED_TAGS") ? R({}, e.ALLOWED_TAGS, W) : nt),
          (U = le(e, "ALLOWED_ATTR") ? R({}, e.ALLOWED_ATTR, W) : Ue),
          (Q = le(e, "ALLOWED_NAMESPACES")
            ? R({}, e.ALLOWED_NAMESPACES, At)
            : rt),
          (Ve = le(e, "ADD_URI_SAFE_ATTR")
            ? R(ge(at), e.ADD_URI_SAFE_ATTR, W)
            : at),
          (De = le(e, "ADD_DATA_URI_TAGS")
            ? R(ge(ot), e.ADD_DATA_URI_TAGS, W)
            : ot),
          (pe = le(e, "FORBID_CONTENTS") ? R({}, e.FORBID_CONTENTS, W) : it),
          (Se = le(e, "FORBID_TAGS") ? R({}, e.FORBID_TAGS, W) : ge({})),
          (He = le(e, "FORBID_ATTR") ? R({}, e.FORBID_ATTR, W) : ge({})),
          (ve = le(e, "USE_PROFILES") ? e.USE_PROFILES : !1),
          ($ = e.ALLOW_ARIA_ATTR !== !1),
          (I = e.ALLOW_DATA_ATTR !== !1),
          (Ge = e.ALLOW_UNKNOWN_PROTOCOLS || !1),
          (We = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1),
          (ye = e.SAFE_FOR_TEMPLATES || !1),
          (Re = e.SAFE_FOR_XML !== !1),
          (de = e.WHOLE_DOCUMENT || !1),
          (Ae = e.RETURN_DOM || !1),
          (Ce = e.RETURN_DOM_FRAGMENT || !1),
          (Ne = e.RETURN_TRUSTED_TYPE || !1),
          (Be = e.FORCE_BODY || !1),
          (Le = e.SANITIZE_DOM !== !1),
          (st = e.SANITIZE_NAMED_PROPS || !1),
          (Ye = e.KEEP_CONTENT !== !1),
          (me = e.IN_PLACE || !1),
          (Te = e.ALLOWED_URI_REGEXP || fn),
          (j = e.NAMESPACE || S),
          (Ie = e.MATHML_TEXT_INTEGRATION_POINTS || Ie),
          (we = e.HTML_INTEGRATION_POINTS || we),
          (O = e.CUSTOM_ELEMENT_HANDLING || {}),
          e.CUSTOM_ELEMENT_HANDLING &&
            It(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck) &&
            (O.tagNameCheck = e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),
          e.CUSTOM_ELEMENT_HANDLING &&
            It(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) &&
            (O.attributeNameCheck =
              e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),
          e.CUSTOM_ELEMENT_HANDLING &&
            typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements ==
              "boolean" &&
            (O.allowCustomizedBuiltInElements =
              e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),
          ye && (I = !1),
          Ce && (Ae = !0),
          ve &&
            ((M = R({}, Xt)),
            (U = []),
            ve.html === !0 && (R(M, qt), R(U, Kt)),
            ve.svg === !0 && (R(M, vt), R(U, Tt), R(U, lt)),
            ve.svgFilters === !0 && (R(M, wt), R(U, Tt), R(U, lt)),
            ve.mathMl === !0 && (R(M, Et), R(U, Zt), R(U, lt))),
          e.ADD_TAGS && (M === nt && (M = ge(M)), R(M, e.ADD_TAGS, W)),
          e.ADD_ATTR && (U === Ue && (U = ge(U)), R(U, e.ADD_ATTR, W)),
          e.ADD_URI_SAFE_ATTR && R(Ve, e.ADD_URI_SAFE_ATTR, W),
          e.FORBID_CONTENTS &&
            (pe === it && (pe = ge(pe)), R(pe, e.FORBID_CONTENTS, W)),
          Ye && (M["#text"] = !0),
          de && R(M, ["html", "head", "body"]),
          M.table && (R(M, ["tbody"]), delete Se.tbody),
          e.TRUSTED_TYPES_POLICY)
        ) {
          if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function")
            throw Ze(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.',
            );
          if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function")
            throw Ze(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.',
            );
          ((b = e.TRUSTED_TYPES_POLICY), (C = b.createHTML("")));
        } else
          (b === void 0 && (b = Vn(_, a)),
            b !== null && typeof C == "string" && (C = b.createHTML("")));
        (K && K(e), (Me = e));
      }
    },
    Pt = R({}, [...vt, ...wt, ...$n]),
    Mt = R({}, [...Et, ...xn]),
    Tn = function (e) {
      let u = E(e);
      (!u || !u.tagName) && (u = { namespaceURI: j, tagName: "template" });
      const A = pt(e.tagName),
        k = pt(u.tagName);
      return Q[e.namespaceURI]
        ? e.namespaceURI === ke
          ? u.namespaceURI === S
            ? A === "svg"
            : u.namespaceURI === Oe
              ? A === "svg" && (k === "annotation-xml" || Ie[k])
              : !!Pt[A]
          : e.namespaceURI === Oe
            ? u.namespaceURI === S
              ? A === "math"
              : u.namespaceURI === ke
                ? A === "math" && we[k]
                : !!Mt[A]
            : e.namespaceURI === S
              ? (u.namespaceURI === ke && !we[k]) ||
                (u.namespaceURI === Oe && !Ie[k])
                ? !1
                : !Mt[A] && (Pe[A] || !Pt[A])
              : !!(be === "application/xhtml+xml" && Q[e.namespaceURI])
        : !1;
    },
    fe = function (e) {
      Xe(n.removed, { element: e });
      try {
        E(e).removeChild(e);
      } catch {
        h(e);
      }
    },
    $e = function (e, u) {
      try {
        Xe(n.removed, { attribute: u.getAttributeNode(e), from: u });
      } catch {
        Xe(n.removed, { attribute: null, from: u });
      }
      if ((u.removeAttribute(e), e === "is"))
        if (Ae || Ce)
          try {
            fe(u);
          } catch {}
        else
          try {
            u.setAttribute(e, "");
          } catch {}
    },
    $t = function (e) {
      let u = null,
        A = null;
      if (Be) e = "<remove></remove>" + e;
      else {
        const H = Vt(e, /^[\r\n\t ]+/);
        A = H && H[0];
      }
      be === "application/xhtml+xml" &&
        j === S &&
        (e =
          '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' +
          e +
          "</body></html>");
      const k = b ? b.createHTML(e) : e;
      if (j === S)
        try {
          u = new w().parseFromString(k, be);
        } catch {}
      if (!u || !u.documentElement) {
        u = F.createDocument(j, "template", null);
        try {
          u.documentElement.innerHTML = J ? C : k;
        } catch {}
      }
      const Y = u.body || u.documentElement;
      return (
        e && A && Y.insertBefore(s.createTextNode(A), Y.childNodes[0] || null),
        j === S
          ? G.call(u, de ? "html" : "body")[0]
          : de
            ? u.documentElement
            : Y
      );
    },
    xt = function (e) {
      return P.call(
        e.ownerDocument || e,
        e,
        f.SHOW_ELEMENT |
          f.SHOW_COMMENT |
          f.SHOW_TEXT |
          f.SHOW_PROCESSING_INSTRUCTION |
          f.SHOW_CDATA_SECTION,
        null,
      );
    },
    gt = function (e) {
      return (
        e instanceof y &&
        (typeof e.nodeName != "string" ||
          typeof e.textContent != "string" ||
          typeof e.removeChild != "function" ||
          !(e.attributes instanceof c) ||
          typeof e.removeAttribute != "function" ||
          typeof e.setAttribute != "function" ||
          typeof e.namespaceURI != "string" ||
          typeof e.insertBefore != "function" ||
          typeof e.hasChildNodes != "function")
      );
    },
    Ft = function (e) {
      return typeof r == "function" && e instanceof r;
    };
  function he(T, e, u) {
    ct(T, (A) => {
      A.call(n, e, u, Me);
    });
  }
  const Ut = function (e) {
      let u = null;
      if ((he(N.beforeSanitizeElements, e, null), gt(e))) return (fe(e), !0);
      const A = W(e.nodeName);
      if (
        (he(N.uponSanitizeElement, e, { tagName: A, allowedTags: M }),
        (Re &&
          e.hasChildNodes() &&
          !Ft(e.firstElementChild) &&
          X(/<[/\w!]/g, e.innerHTML) &&
          X(/<[/\w!]/g, e.textContent)) ||
          e.nodeType === Qe.progressingInstruction ||
          (Re && e.nodeType === Qe.comment && X(/<[/\w]/g, e.data)))
      )
        return (fe(e), !0);
      if (!M[A] || Se[A]) {
        if (
          !Se[A] &&
          Gt(A) &&
          ((O.tagNameCheck instanceof RegExp && X(O.tagNameCheck, A)) ||
            (O.tagNameCheck instanceof Function && O.tagNameCheck(A)))
        )
          return !1;
        if (Ye && !pe[A]) {
          const k = E(e) || e.parentNode,
            Y = g(e) || e.childNodes;
          if (Y && k) {
            const H = Y.length;
            for (let ee = H - 1; ee >= 0; --ee) {
              const _e = v(Y[ee], !0);
              ((_e.__removalCount = (e.__removalCount || 0) + 1),
                k.insertBefore(_e, p(e)));
            }
          }
        }
        return (fe(e), !0);
      }
      return (e instanceof d && !Tn(e)) ||
        ((A === "noscript" || A === "noembed" || A === "noframes") &&
          X(/<\/no(script|embed|frames)/i, e.innerHTML))
        ? (fe(e), !0)
        : (ye &&
            e.nodeType === Qe.text &&
            ((u = e.textContent),
            ct([L, B, ue], (k) => {
              u = Ke(u, k, " ");
            }),
            e.textContent !== u &&
              (Xe(n.removed, { element: e.cloneNode() }), (e.textContent = u))),
          he(N.afterSanitizeElements, e, null),
          !1);
    },
    Ht = function (e, u, A) {
      if (Le && (u === "id" || u === "name") && (A in s || A in En)) return !1;
      if (!(I && !He[u] && X(te, u))) {
        if (!($ && X(ie, u))) {
          if (!U[u] || He[u]) {
            if (
              !(
                (Gt(e) &&
                  ((O.tagNameCheck instanceof RegExp && X(O.tagNameCheck, e)) ||
                    (O.tagNameCheck instanceof Function &&
                      O.tagNameCheck(e))) &&
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
                  e !== "script" &&
                  kn(A, "data:") === 0 &&
                  De[e]
                )
              ) {
                if (!(Ge && !X(oe, Ke(A, ae, "")))) {
                  if (A) return !1;
                }
              }
            }
          }
        }
      }
      return !0;
    },
    Gt = function (e) {
      return e !== "annotation-xml" && Vt(e, re);
    },
    Wt = function (e) {
      he(N.beforeSanitizeAttributes, e, null);
      const { attributes: u } = e;
      if (!u || gt(e)) return;
      const A = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: U,
        forceKeepAttr: void 0,
      };
      let k = u.length;
      for (; k--; ) {
        const Y = u[k],
          { name: H, namespaceURI: ee, value: _e } = Y,
          qe = W(H),
          yt = _e;
        let V = H === "value" ? yt : In(yt);
        if (
          ((A.attrName = qe),
          (A.attrValue = V),
          (A.keepAttr = !0),
          (A.forceKeepAttr = void 0),
          he(N.uponSanitizeAttribute, e, A),
          (V = A.attrValue),
          st && (qe === "id" || qe === "name") && ($e(H, e), (V = je + V)),
          Re && X(/((--!?|])>)|<\/(style|title)/i, V))
        ) {
          $e(H, e);
          continue;
        }
        if (A.forceKeepAttr) continue;
        if (!A.keepAttr) {
          $e(H, e);
          continue;
        }
        if (!We && X(/\/>/i, V)) {
          $e(H, e);
          continue;
        }
        ye &&
          ct([L, B, ue], (Bt) => {
            V = Ke(V, Bt, " ");
          });
        const zt = W(e.nodeName);
        if (!Ht(zt, qe, V)) {
          $e(H, e);
          continue;
        }
        if (
          b &&
          typeof _ == "object" &&
          typeof _.getAttributeType == "function" &&
          !ee
        )
          switch (_.getAttributeType(zt, qe)) {
            case "TrustedHTML": {
              V = b.createHTML(V);
              break;
            }
            case "TrustedScriptURL": {
              V = b.createScriptURL(V);
              break;
            }
          }
        if (V !== yt)
          try {
            (ee ? e.setAttributeNS(ee, H, V) : e.setAttribute(H, V),
              gt(e) ? fe(e) : Yt(n.removed));
          } catch {
            $e(H, e);
          }
      }
      he(N.afterSanitizeAttributes, e, null);
    },
    Sn = function T(e) {
      let u = null;
      const A = xt(e);
      for (he(N.beforeSanitizeShadowDOM, e, null); (u = A.nextNode()); )
        (he(N.uponSanitizeShadowNode, u, null),
          Ut(u),
          Wt(u),
          u.content instanceof l && T(u.content));
      he(N.afterSanitizeShadowDOM, e, null);
    };
  return (
    (n.sanitize = function (T) {
      let e =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
        u = null,
        A = null,
        k = null,
        Y = null;
      if (((J = !T), J && (T = "<!-->"), typeof T != "string" && !Ft(T)))
        if (typeof T.toString == "function") {
          if (((T = T.toString()), typeof T != "string"))
            throw Ze("dirty is not a string, aborting");
        } else throw Ze("toString is not a function");
      if (!n.isSupported) return T;
      if (
        (ze || _t(e), (n.removed = []), typeof T == "string" && (me = !1), me)
      ) {
        if (T.nodeName) {
          const _e = W(T.nodeName);
          if (!M[_e] || Se[_e])
            throw Ze("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (T instanceof r)
        ((u = $t("<!---->")),
          (A = u.ownerDocument.importNode(T, !0)),
          (A.nodeType === Qe.element && A.nodeName === "BODY") ||
          A.nodeName === "HTML"
            ? (u = A)
            : u.appendChild(A));
      else {
        if (!Ae && !ye && !de && T.indexOf("<") === -1)
          return b && Ne ? b.createHTML(T) : T;
        if (((u = $t(T)), !u)) return Ae ? null : Ne ? C : "";
      }
      u && Be && fe(u.firstChild);
      const H = xt(me ? T : u);
      for (; (k = H.nextNode()); )
        (Ut(k), Wt(k), k.content instanceof l && Sn(k.content));
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
      let ee = de ? u.outerHTML : u.innerHTML;
      return (
        de &&
          M["!doctype"] &&
          u.ownerDocument &&
          u.ownerDocument.doctype &&
          u.ownerDocument.doctype.name &&
          X(dn, u.ownerDocument.doctype.name) &&
          (ee =
            "<!DOCTYPE " +
            u.ownerDocument.doctype.name +
            `>
` +
            ee),
        ye &&
          ct([L, B, ue], (_e) => {
            ee = Ke(ee, _e, " ");
          }),
        b && Ne ? b.createHTML(ee) : ee
      );
    }),
    (n.setConfig = function () {
      let T =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      (_t(T), (ze = !0));
    }),
    (n.clearConfig = function () {
      ((Me = null), (ze = !1));
    }),
    (n.isValidAttribute = function (T, e, u) {
      Me || _t({});
      const A = W(T),
        k = W(e);
      return Ht(A, k, u);
    }),
    (n.addHook = function (T, e) {
      typeof e == "function" && Xe(N[T], e);
    }),
    (n.removeHook = function (T, e) {
      if (e !== void 0) {
        const u = Dn(N[T], e);
        return u === -1 ? void 0 : On(N[T], u, 1)[0];
      }
      return Yt(N[T]);
    }),
    (n.removeHooks = function (T) {
      N[T] = [];
    }),
    (n.removeAllHooks = function () {
      N = Qt();
    }),
    n
  );
}
var hn = mn();
const ys = Object.freeze(
  Object.defineProperty({ __proto__: null, default: hn }, Symbol.toStringTag, {
    value: "Module",
  }),
);
function D(t = "") {
  return t == null ? "" : hn(window).sanitize(String(t));
}
function Ot() {
  return new Date().toLocaleString();
}
function _n(t = 0) {
  const n = Math.round(t / 1e3),
    s = Math.floor(n / 60),
    i = n % 60;
  return `${s} ${s === 1 ? "Minute" : "Minutes"} and ${i} ${i === 1 ? "Second" : "Seconds"}`;
}
function qn(t) {
  document.getElementById("result").innerHTML = D(`
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${Ot()}</span>
      </div>
      ${t ? `<p class="note">Address: <strong>${D(t)}</strong></p>` : ""}
      <div class="callout">Fetching county, languages, English proficiency, population, income, DAC, and alerts…</div>
      <p class="note">Elapsed: <span id="searchTimer">0m 00s</span></p>
    </div>
  `);
}
function en(t, n, s) {
  document.getElementById("result").innerHTML = D(`
    <div class="card" role="alert">
      <div class="card__header">
        <h2 class="card__title">Unable to retrieve data</h2>
        <span class="updated">${Ot()}</span>
      </div>
      ${n ? `<p class="note">Address: <strong>${D(n)}</strong></p>` : ""}
      <div class="callout" style="border-left-color:#b45309;">
        ${D(t || "Please try again with a different address.")}
      </div>
      <p class="note">Search took ${_n(s)}.</p>
      <p class="note">API base: <code>${D(bn || "/api")}</code>.</p>
    </div>
  `);
}
var cn;
const tn =
  ((cn = document.querySelector('meta[name="sentry-dsn"]')) == null
    ? void 0
    : cn.content) || "";
tn &&
  ln(() => import("./index.js"), [])
    .then((t) => {
      ((window.Sentry = t), t.init({ dsn: tn }), Dt("Sentry initialized"));
    })
    .catch((t) => console.error("Sentry failed to load", t));
"serviceWorker" in navigator &&
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((t) => console.error("SW registration failed", t));
  });
window.addEventListener("error", (t) => {
  var n;
  (Dt("window.onerror", t.message),
    (n = window.Sentry) == null ||
      n.captureException(t.error || new Error(t.message || "Unknown error")));
});
window.addEventListener("unhandledrejection", (t) => {
  var n;
  (Dt("unhandledrejection", t.reason),
    (n = window.Sentry) == null || n.captureException(t.reason));
});
let xe = null;
const St = new Map();
function Xn() {
  window.print();
}
window.printReport = Xn;
function Kn() {
  if (!xe) return;
  const t = new Blob([JSON.stringify(xe, null, 2)], {
      type: "application/json",
    }),
    n = URL.createObjectURL(t),
    s = document.createElement("a"),
    i = (xe.address || "report").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  ((s.href = n),
    (s.download = `calwep_report_${i}.json`),
    document.body.appendChild(s),
    s.click(),
    document.body.removeChild(s),
    URL.revokeObjectURL(n));
}
window.downloadRawData = Kn;
window.downloadPdf = async function () {
  const { downloadPdf: t } = await ln(async () => {
    const { downloadPdf: n } = await import("./pdf.js").then((s) => s.p);
    return { downloadPdf: n };
  }, []);
  t(xe);
};
function Zn() {
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
window.shareReport = Zn;
function ne(t) {
  return t == null || Number(t) === -888888888;
}
function Jn(t) {
  return !ne(t) && Number.isFinite(Number(t))
    ? Number(t).toLocaleString()
    : "—";
}
function bt(t) {
  return ne(t) || !Number.isFinite(Number(t))
    ? "—"
    : `$${Math.round(Number(t)).toLocaleString()}`;
}
function Qn(t) {
  return !ne(t) && Number.isFinite(Number(t))
    ? Number(t).toLocaleString(void 0, { maximumFractionDigits: 1 })
    : "—";
}
function x(t) {
  return !ne(t) && Number.isFinite(Number(t))
    ? `${Number(t).toFixed(1)}%`
    : "—";
}
function es(t = "") {
  return t.replace(/_/g, " ").replace(/\b\w/g, (n) => n.toUpperCase());
}
function ft(t = {}, ...n) {
  const s = (i) => i && typeof i == "object" && !Array.isArray(i);
  for (const i of n)
    if (s(i))
      for (const [a, l] of Object.entries(i))
        s(l) ? (t[a] = ft(s(t[a]) ? t[a] : {}, l)) : (t[a] = l);
  return t;
}
function ht(t = [], n = 50) {
  const s = [];
  for (let i = 0; i < t.length; i += n) s.push(t.slice(i, i + n));
  return s;
}
const ts = {
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
  ut = {
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
let dt = null,
  Fe = null;
function ns() {
  Fe = Date.now();
  const t = (n) => {
    const s = document.getElementById("searchTimer");
    s && (s.textContent = n);
    const i = document.getElementById("spinnerTime");
    i && (i.textContent = n);
  };
  (t("0m 00s"),
    (dt = setInterval(() => {
      if (!Fe) return;
      const n = Date.now() - Fe,
        s = Math.floor((n / 1e3) % 60),
        i = Math.floor(n / 6e4);
      t(`${i}m ${s.toString().padStart(2, "0")}s`);
    }, 1e3)));
}
function nn() {
  dt && clearInterval(dt);
  const t = Fe ? Date.now() - Fe : 0;
  return ((dt = null), (Fe = null), t);
}
async function ss(t = {}) {
  let {
    city: n,
    census_tract: s,
    lat: i,
    lon: a,
    state_fips: l,
    county_fips: o,
    tract_code: r,
  } = t;
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
            var y, w;
            n =
              (Array.isArray(
                (y = f == null ? void 0 : f.localityInfo) == null
                  ? void 0
                  : y.administrative,
              )
                ? (w = f.localityInfo.administrative.find(
                    (_) => _.order === 8 || _.adminLevel === 8,
                  )) == null
                  ? void 0
                  : w.name
                : null) ||
              f.city ||
              f.locality ||
              n;
          })
          .catch(() => {}),
      ),
    (!s || !l || !o || !r) &&
      i != null &&
      a != null &&
      d.push(
        fetch(
          `https://geo.fcc.gov/api/census/block/find?latitude=${i}&longitude=${a}&format=json`,
        )
          .then((f) => f.json())
          .then((f) => {
            var y;
            const c =
              (y = f == null ? void 0 : f.Block) == null ? void 0 : y.FIPS;
            c &&
              c.length >= 11 &&
              ((l = c.slice(0, 2)),
              (o = c.slice(2, 5)),
              (r = c.slice(5, 11)),
              (s = `${r.slice(0, 4)}.${r.slice(4)}`));
          })
          .catch(() => {}),
      ),
    d.length && (await Promise.all(d)),
    {
      ...t,
      city: n,
      census_tract: s,
      state_fips: l,
      county_fips: o,
      tract_code: r,
    }
  );
}
let et = null;
async function gn() {
  if (et) return et;
  try {
    const t = await tt(
        "https://api.census.gov/data/2022/acs/acs5/groups/C16001.json",
      ),
      n = (t == null ? void 0 : t.variables) || {},
      s = [],
      i = {};
    for (const [a, l] of Object.entries(n)) {
      if (!a.endsWith("E")) continue;
      const o = l.label || "",
        r = /^Estimate!!Total:!!([^:]+):$/.exec(o);
      r && (s.push(a), (i[a] = r[1]));
    }
    et = { codes: s, names: i };
  } catch {
    et = { codes: [], names: {} };
  }
  return et;
}
async function Lt(t = []) {
  var w, _;
  const { codes: n, names: s } = await gn();
  if (!n.length) return {};
  const i = {};
  for (const m of t) {
    const v = String(m)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (v.length !== 11) continue;
    const h = v.slice(0, 2),
      p = v.slice(2, 5),
      g = v.slice(5),
      E = `${h}${p}`;
    (i[E] || (i[E] = { state: h, county: p, tracts: [] }), i[E].tracts.push(g));
  }
  let a = 0,
    l = 0,
    o = 0;
  const r = {},
    d = Object.values(i).map(async (m) => {
      const v = ht(m.tracts, 50),
        h = await Promise.all(
          v.map(async (g) => {
            const E = g.join(","),
              b = 40,
              C = [];
            for (let L = 0; L < n.length; L += b) {
              const B = n.slice(L, L + b),
                te = `https://api.census.gov/data/2022/acs/acs5?get=${(L === 0 ? ["C16001_001E", "C16001_002E", ...B] : B).join(",")}&for=tract:${E}&in=state:${m.state}%20county:${m.county}`;
              C.push(
                fetch(te)
                  .then((ie) => ie.json())
                  .then((ie) => ({ type: "lang", rows: ie, chunk: B }))
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
            const P = await Promise.all(C);
            let z = 0,
              G = 0,
              q = 0;
            const N = {};
            for (const L of P) {
              if (!L || !Array.isArray(L.rows) || L.rows.length <= 1) continue;
              const { rows: B } = L;
              if (L.type === "lang") {
                const ue = B[0];
                for (let te = 1; te < B.length; te++) {
                  const ie = B[te],
                    oe = {};
                  (ue.forEach((ae, re) => (oe[ae] = Number(ie[re]))),
                    (z += oe.C16001_001E || 0),
                    (G += oe.C16001_002E || 0));
                  for (const ae of L.chunk) {
                    const re = s[ae],
                      Te = oe[ae] || 0;
                    re && (N[re] = (N[re] || 0) + Te);
                  }
                }
              } else if (L.type === "english") {
                const ue = B[0];
                for (let te = 1; te < B.length; te++) {
                  const ie = B[te],
                    oe = {};
                  (ue.forEach((ae, re) => (oe[ae] = Number(ie[re]))),
                    (q += oe.DP02_0115E || 0));
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
    ((a += m.total), (l += m.englishOnly), (o += m.englishLess));
    for (const [v, h] of Object.entries(m.langCounts)) r[v] = (r[v] || 0) + h;
  }
  r.English = l;
  const c = r.Spanish || 0,
    y = Object.entries(r).sort((m, v) => v[1] - m[1]);
  return {
    primary_language: (w = y[0]) == null ? void 0 : w[0],
    secondary_language: (_ = y[1]) == null ? void 0 : _[0],
    language_other_than_english_pct: a ? ((a - l) / a) * 100 : null,
    english_less_than_very_well_pct: a ? (o / a) * 100 : null,
    spanish_at_home_pct: a ? (c / a) * 100 : null,
  };
}
async function is({ state_fips: t, county_fips: n, tract_code: s } = {}) {
  if (!t || !n || !s) return {};
  const i = `${t}${n}${s}`;
  return Lt([i]);
}
async function sn(t = []) {
  const n = {};
  for (const d of t) {
    const f = String(d)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (f.length !== 11) continue;
    const c = f.slice(0, 2),
      y = f.slice(2, 5),
      w = f.slice(5),
      _ = `${c}${y}`;
    (n[_] || (n[_] = { state: c, county: y, tracts: [] }), n[_].tracts.push(w));
  }
  let s = 0,
    i = 0,
    a = 0,
    l = 0,
    o = 0;
  for (const d of Object.values(n)) {
    const f = ht(d.tracts, 50);
    for (const c of f) {
      const y =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP05_0001E,DP05_0018E,DP03_0062E,DP03_0088E,DP03_0128PE&for=tract:" +
        c.join(",") +
        `&in=state:${d.state}%20county:${d.county}`;
      try {
        const w = await fetch(y).then((_) => _.json());
        if (!Array.isArray(w) || w.length < 2) continue;
        for (let _ = 1; _ < w.length; _++) {
          const [m, v, h, p, g] = w[_].map(Number);
          Number.isFinite(m) &&
            m > 0 &&
            ((s += m),
            Number.isFinite(v) && (i += v * m),
            Number.isFinite(h) && (a += h * m),
            Number.isFinite(p) && (l += p * m),
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
      l > 0 && (r.per_capita_income = l / s),
      o > 0 && (r.poverty_rate = (o / s) * 100)),
    r
  );
}
async function on(t = []) {
  const n = {};
  for (const y of t) {
    const w = String(y)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (w.length !== 11) continue;
    const _ = w.slice(0, 2),
      m = w.slice(2, 5),
      v = w.slice(5),
      h = `${_}${m}`;
    (n[h] || (n[h] = { state: _, county: m, tracts: [] }), n[h].tracts.push(v));
  }
  let s = 0,
    i = 0,
    a = 0,
    l = 0,
    o = 0,
    r = 0,
    d = 0;
  for (const y of Object.values(n)) {
    const w = ht(y.tracts, 50);
    for (const _ of w) {
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
        const v = await fetch(m).then((h) => h.json());
        if (!Array.isArray(v) || v.length < 2) continue;
        for (let h = 1; h < v.length; h++) {
          const [p, g, E, b, C, F, P] = v[h].slice(0, 7).map(Number);
          (Number.isFinite(p) && p > 0 && (s += p),
            Number.isFinite(g) &&
              g > 0 &&
              ((i += g), Number.isFinite(b) && b > 0 && (l += b * g)),
            Number.isFinite(E) && E > 0 && (a += E),
            Number.isFinite(C) &&
              C > 0 &&
              ((o += C),
              Number.isFinite(F) && F > 0 && (r += F),
              Number.isFinite(P) && P > 0 && (d += P)));
        }
      } catch {}
    }
  }
  const f = {},
    c = i + a;
  return (
    c > 0 &&
      ((f.owner_occupied_pct = (i / c) * 100),
      (f.renter_occupied_pct = (a / c) * 100)),
    i > 0 && l > 0 && (f.median_home_value = l / i),
    o > 0 &&
      ((f.high_school_or_higher_pct = (r / o) * 100),
      (f.bachelors_or_higher_pct = (d / o) * 100)),
    f
  );
}
async function kt(t = []) {
  const n = {};
  for (const i of t) {
    const a = String(i)
      .replace(/[^0-9]/g, "")
      .padStart(11, "0");
    if (a.length !== 11) continue;
    const l = a.slice(0, 2),
      o = a.slice(2, 5),
      r = a.slice(5),
      d = `${l}${o}`;
    (n[d] || (n[d] = { state: l, county: o, tracts: [] }), n[d].tracts.push(r));
  }
  const s = {};
  for (const i of Object.values(n)) {
    const a = ht(i.tracts, 50);
    for (const l of a) {
      const o =
        "https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0009PE,DP05_0001E&for=tract:" +
        l.join(",") +
        `&in=state:${i.state}%20county:${i.county}`;
      try {
        const r = await fetch(o).then((d) => d.json());
        if (!Array.isArray(r) || r.length < 2) continue;
        for (let d = 1; d < r.length; d++) {
          const [f, c, y, w, _] = r[d],
            m = `${y}${w}${_}`;
          s[m] = { unemployment_rate: Number(f), population: Number(c) };
        }
      } catch {}
    }
  }
  return s;
}
async function yn(t = []) {
  const n =
      "https://gis.water.ca.gov/arcgis/rest/services/Society/i16_Census_Tract_DisadvantagedCommunities_2020/MapServer/0/query",
    s = new Set(),
    i = 50;
  for (let a = 0; a < t.length; a += i) {
    const l = t.slice(a, a + i);
    if (!l.length) continue;
    const o = `GEOID20 IN (${l.map((d) => `'${d}'`).join(",")})`,
      r =
        n +
        `?where=${encodeURIComponent(o)}&outFields=GEOID20,DAC20&returnGeometry=false&f=json`;
    try {
      const d = await fetch(r).then((f) => f.json());
      for (const f of d.features || []) {
        const c = f.attributes || {},
          y = String(c.GEOID20);
        String(c.DAC20 || "").toUpperCase() === "Y" && s.add(y);
      }
    } catch {}
  }
  return Array.from(s);
}
async function an(t = []) {
  const n = new Set();
  return (
    await Promise.all(
      t.map(async (s) => {
        try {
          const i = mt("/lookup", { fips: s, census_tract: s, geoid: s }),
            a = await tt(i);
          Array.isArray(a.environmental_hardships) &&
            a.environmental_hardships.forEach((l) => n.add(l));
        } catch {}
      }),
    ),
    Array.from(n).sort()
  );
}
async function os(t = {}) {
  var r, d;
  const { surrounding_10_mile: n, water_district: s } = t || {},
    i = { ...t },
    a = n || {};
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length) {
    const f = await sn(a.census_tracts_fips),
      c = a.demographics || {};
    i.surrounding_10_mile = { ...a, demographics: { ...c, ...f } };
  }
  const l = s || {},
    o = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (o.length) {
    const f = await sn(o),
      c = l.demographics || {},
      y =
        (d = (r = i.surrounding_10_mile) == null ? void 0 : r.demographics) ==
        null
          ? void 0
          : d.median_household_income,
      w = { ...c, ...f };
    (y != null &&
      (!Number.isFinite(w.median_household_income) ||
        w.median_household_income < 0) &&
      (w.median_household_income = y),
      (i.water_district = { ...l, demographics: w }));
  }
  return i;
}
async function as(t = {}) {
  var r, d;
  const { surrounding_10_mile: n, water_district: s } = t || {},
    i = { ...t },
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
      const y = await on(a.census_tracts_fips);
      i.surrounding_10_mile = { ...a, demographics: { ...f, ...y } };
    }
  }
  const l = s || {},
    o = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (o.length) {
    const f = l.demographics || {};
    if (
      [
        f.owner_occupied_pct,
        f.renter_occupied_pct,
        f.median_home_value,
        f.high_school_or_higher_pct,
        f.bachelors_or_higher_pct,
      ].some((y) => ne(y) || (typeof y == "number" && y < 0))
    ) {
      const y = await on(o);
      let w = { ...f, ...y };
      const _ =
        (d = (r = i.surrounding_10_mile) == null ? void 0 : r.demographics) ==
        null
          ? void 0
          : d.median_home_value;
      (_ != null &&
        (!Number.isFinite(w.median_home_value) || w.median_home_value < 0) &&
        (w.median_home_value = _),
        (i.water_district = { ...l, demographics: w }));
    }
  }
  return i;
}
async function rs(t = {}) {
  const {
      state_fips: n,
      county_fips: s,
      tract_code: i,
      unemployment_rate: a,
      surrounding_10_mile: l,
      water_district: o,
    } = t || {},
    r = l || {},
    d = o || {},
    f = [],
    c = n && s && i ? `${n}${s}${i}` : null;
  ne(a) && c && f.push(c);
  const y = Array.isArray(r.census_tracts_fips) ? r.census_tracts_fips : [];
  r.demographics &&
    ne(r.demographics.unemployment_rate) &&
    y.length &&
    f.push(...y);
  const w = Array.isArray(d.census_tracts_fips)
    ? d.census_tracts_fips.map(String)
    : [];
  d.demographics &&
    ne(d.demographics.unemployment_rate) &&
    w.length &&
    f.push(...w);
  const _ = Array.from(new Set(f));
  if (!_.length) return t;
  const m = await kt(_),
    v = { ...t };
  if (
    (ne(a) && c && m[c] && (v.unemployment_rate = m[c].unemployment_rate),
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
      (v.surrounding_10_mile = {
        ...r,
        demographics: { ...r.demographics, unemployment_rate: p / h },
      });
  }
  if (d.demographics && ne(d.demographics.unemployment_rate) && w.length) {
    let h = 0,
      p = 0;
    for (const g of w) {
      const E = m[g];
      E &&
        Number.isFinite(E.unemployment_rate) &&
        Number.isFinite(E.population) &&
        ((h += E.population), (p += E.unemployment_rate * E.population));
    }
    h > 0 &&
      (v.water_district = {
        ...d,
        demographics: { ...d.demographics, unemployment_rate: p / h },
      });
  }
  return v;
}
async function cs(t = {}) {
  const { surrounding_10_mile: n, water_district: s } = t || {},
    i = { ...t },
    a = n || {};
  if (Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length) {
    const r = await Lt(a.census_tracts_fips),
      d = a.demographics || {};
    i.surrounding_10_mile = { ...a, demographics: { ...d, ...r } };
  }
  const l = s || {},
    o = Array.isArray(l.census_tracts_fips)
      ? l.census_tracts_fips.map(String)
      : [];
  if (o.length) {
    const r = await Lt(o),
      d = l.demographics || {};
    i.water_district = { ...l, demographics: { ...d, ...r } };
  }
  return i;
}
async function ls(t = {}) {
  const { surrounding_10_mile: n, water_district: s } = t || {},
    i = { ...t },
    a = n || {},
    l =
      Array.isArray(a.census_tracts_fips) && a.census_tracts_fips.length
        ? a.census_tracts_fips
        : Array.isArray(a.census_tracts)
          ? a.census_tracts
          : [];
  if (
    (!Array.isArray(a.environmental_hardships) ||
      !a.environmental_hardships.length) &&
    l.length
  ) {
    const d = await an(l);
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
    const d = await an(r);
    i.water_district = { ...o, environmental_hardships: d };
  }
  return i;
}
async function us(t = {}) {
  const { lat: n, lon: s, census_tract: i, surrounding_10_mile: a } = t || {};
  if (n == null || s == null) return t;
  const l = 1609.34 * 10,
    o = { ...(a || {}) },
    r = [];
  if (!Array.isArray(o.cities) || !o.cities.length) {
    const _ = `[out:json];(node[place=city](around:${l},${n},${s});node[place=town](around:${l},${n},${s}););out;`,
      m =
        "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(_);
    r.push(
      fetch(m)
        .then((v) => v.json())
        .then((v) => {
          const h = (v.elements || [])
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
    c = { ...(o.census_tract_map || {}) },
    y = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/10/query?where=1=1&geometry=${s},${n}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${l}&units=esriSRUnit_Meter&outFields=NAME,GEOID&f=json`;
  (r.push(
    fetch(y)
      .then((_) => _.json())
      .then((_) => {
        const m = _.features || [],
          v = [],
          h = [],
          p = {};
        for (const g of m) {
          const E = g.attributes || {};
          let b = null;
          if (
            (E.NAME &&
              ((b = E.NAME.replace(/^Census Tract\s+/i, "")), v.push(b)),
            E.GEOID)
          ) {
            const C = String(E.GEOID);
            (h.push(C), b && (p[C] = b));
          }
        }
        ((o.census_tracts = Array.from(new Set([...d, ...v]))),
          (o.census_tracts_fips = Array.from(new Set([...f, ...h]))),
          (o.census_tract_map = { ...c, ...p }));
      })
      .catch(() => {}),
  ),
    r.length && (await Promise.all(r)),
    Array.isArray(o.cities) || (o.cities = []));
  const w = new Set(Array.isArray(o.census_tracts) ? o.census_tracts : []);
  if (
    (i && w.add(String(i)),
    (o.census_tracts = Array.from(w)),
    Array.isArray(o.census_tracts_fips))
  ) {
    const _ = new Set(o.census_tracts_fips),
      { state_fips: m, county_fips: v, tract_code: h } = t || {};
    (m && v && h && _.add(`${m}${v}${h}`),
      (o.census_tracts_fips = Array.from(_)));
  }
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length)
    try {
      const _ = await yn(o.census_tracts_fips),
        m = [];
      for (const v of _) {
        const h = (o.census_tract_map && o.census_tract_map[v]) || v;
        m.push(h);
      }
      if (((o.dac_tracts = m), (o.dac_tracts_fips = _), m.length)) {
        const v = new Set([...(o.census_tracts || []), ...m]);
        o.census_tracts = Array.from(v);
      }
    } catch {}
  if (Array.isArray(o.census_tracts_fips) && o.census_tracts_fips.length)
    try {
      const _ = await kt(o.census_tracts_fips);
      let m = 0,
        v = 0;
      const h = new Set(o.dac_tracts_fips || []);
      for (const p of o.census_tracts_fips) {
        const g = _[p];
        g &&
          Number.isFinite(g.population) &&
          ((m += g.population), h.has(String(p)) && (v += g.population));
      }
      (m > 0 && (o.dac_population_pct = (v / m) * 100),
        o.census_tracts_fips.length > 0 &&
          (o.dac_tracts_pct = (h.size / o.census_tracts_fips.length) * 100));
    } catch {}
  return { ...t, surrounding_10_mile: o };
}
async function ps(t = {}, n = "") {
  var m, v;
  const {
    lat: s,
    lon: i,
    city: a,
    census_tract: l,
    state_fips: o,
    county_fips: r,
    tract_code: d,
    water_district: f,
  } = t || {};
  if (s == null || i == null) return t;
  const c = { ...f },
    y = [];
  if (n) {
    const h = mt("/lookup", { address: n });
    y.push(
      tt(h)
        .then((p) => {
          var E, b, C, F;
          c.name =
            ((E = p == null ? void 0 : p.agency) == null
              ? void 0
              : E.agency_name) ||
            ((b = p == null ? void 0 : p.agency) == null ? void 0 : b.name) ||
            (p == null ? void 0 : p.agency_name) ||
            (p == null ? void 0 : p.name) ||
            c.name;
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
            const P = g.split(/\s*,\s*/).filter(Boolean);
            c.census_tracts = P;
            const z = P.filter((G) => /^\d{11}$/.test(G));
            z.length && (c.census_tracts_fips = z);
          } else if (Array.isArray(g)) {
            const P = [...new Set(g.map(String))];
            c.census_tracts = P;
            const z = P.filter((G) => /^\d{11}$/.test(G));
            z.length &&
              (c.census_tracts_fips = [
                ...new Set([...(c.census_tracts_fips || []), ...z]),
              ]);
          }
        })
        .catch(() => {}),
    );
  }
  if (!c.name) {
    const h = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${i}%2C${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=false&f=json`;
    y.push(
      fetch(h)
        .then((p) => p.json())
        .then((p) => {
          var g, E, b;
          c.name =
            ((b =
              (E =
                (g = p == null ? void 0 : p.features) == null
                  ? void 0
                  : g[0]) == null
                ? void 0
                : E.attributes) == null
              ? void 0
              : b.PWS_NAME) || c.name;
        })
        .catch(() => {}),
    );
  }
  if (
    ((!Array.isArray(c.cities) || !c.cities.length) && a && (c.cities = [a]),
    y.length && (await Promise.all(y)),
    c.name && (!Array.isArray(c.census_tracts) || !c.census_tracts.length))
  )
    try {
      const h = mt("/census-tracts", { agency_name: c.name }),
        p = await tt(h),
        g = p == null ? void 0 : p.census_tracts;
      Array.isArray(g) && (c.census_tracts = [...new Set(g.map(String))]);
    } catch {}
  try {
    const h = `https://services.arcgis.com/8DFNJhY7CUN8E0bX/ArcGIS/rest/services/Public_Water_System_Boundaries/FeatureServer/0/query?geometry=${i}%2C${s}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PWS_NAME&returnGeometry=true&outSR=4326&f=json`,
      p = await fetch(h).then((E) => E.json()),
      g =
        (v = (m = p == null ? void 0 : p.features) == null ? void 0 : m[0]) ==
        null
          ? void 0
          : v.geometry;
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
        P = [],
        z = {};
      for (const G of C.features || []) {
        const q = G.attributes || {};
        let N = null;
        if (
          (q.NAME && ((N = q.NAME.replace(/^Census Tract\s+/i, "")), F.push(N)),
          q.GEOID)
        ) {
          const L = String(q.GEOID);
          (P.push(L), N && (z[L] = N));
        }
      }
      if (F.length || P.length) {
        const G = Array.isArray(c.census_tracts)
            ? c.census_tracts.map(String)
            : [],
          q = Array.isArray(c.census_tracts_fips)
            ? c.census_tracts_fips.map(String)
            : [],
          N = c.census_tract_map || {};
        (F.length && (c.census_tracts = [...new Set([...G, ...F])]),
          P.length && (c.census_tracts_fips = [...new Set([...q, ...P])]),
          Object.keys(z).length && (c.census_tract_map = { ...N, ...z }));
      }
    }
  } catch {}
  let w = [];
  (Array.isArray(c.census_tracts)
    ? (w = c.census_tracts.map(String))
    : typeof c.census_tracts == "string" &&
      (w = c.census_tracts.split(/\s*,\s*/).filter(Boolean)),
    l && w.unshift(String(l)),
    (c.census_tracts = [...new Set(w)]));
  let _ = Array.isArray(c.census_tracts_fips)
    ? c.census_tracts_fips.map(String)
    : [];
  for (const h of c.census_tracts)
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
    (c.census_tracts_fips = [...new Set(_)]),
    Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length)
  )
    try {
      const h = await yn(c.census_tracts_fips),
        p = [];
      for (const g of h) {
        const E = (c.census_tract_map && c.census_tract_map[g]) || g;
        p.push(E);
      }
      if (((c.dac_tracts = p), (c.dac_tracts_fips = h), p.length)) {
        const g = new Set([...(c.census_tracts || []), ...p]);
        c.census_tracts = Array.from(g);
      }
    } catch {}
  if (Array.isArray(c.census_tracts_fips) && c.census_tracts_fips.length)
    try {
      const h = await kt(c.census_tracts_fips);
      let p = 0,
        g = 0;
      const E = new Set(c.dac_tracts_fips || []);
      for (const b of c.census_tracts_fips) {
        const C = h[b];
        C &&
          Number.isFinite(C.population) &&
          ((p += C.population), E.has(String(b)) && (g += C.population));
      }
      (p > 0 && (c.dac_population_pct = (g / p) * 100),
        c.census_tracts_fips.length > 0 &&
          (c.dac_tracts_pct = (E.size / c.census_tracts_fips.length) * 100));
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
    { ...t, water_district: c }
  );
}
async function fs(t = {}) {
  var a, l;
  const { lat: n, lon: s, english_less_than_very_well_pct: i } = t || {};
  if (!ne(i) || n == null || s == null) return t;
  try {
    const o = await fetch(
        `https://geo.fcc.gov/api/census/block/find?latitude=${n}&longitude=${s}&format=json`,
      ).then((d) => d.json()),
      r = (a = o == null ? void 0 : o.Block) == null ? void 0 : a.FIPS;
    if (r && r.length >= 11) {
      const d = r.slice(0, 2),
        f = r.slice(2, 5),
        y = `https://api.census.gov/data/2022/acs/acs5/profile?get=DP02_0111PE&for=tract:${r.slice(5, 11)}&in=state:${d}+county:${f}`,
        w = await fetch(y).then((v) => v.json()),
        _ = (l = w == null ? void 0 : w[1]) == null ? void 0 : l[0],
        m = Number(_);
      if (Number.isFinite(m) && m >= 0)
        return { ...t, english_less_than_very_well_pct: m };
    }
  } catch {}
  return t;
}
async function ds(t = {}) {
  const { lat: n, lon: s } = t || {};
  if (n == null || s == null) return { ...t, alerts: [] };
  try {
    const i = `https://api.weather.gov/alerts/active?point=${n},${s}`,
      a = await fetch(i, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "CalWEP-Demographic-Website (info@calwep.org)",
        },
      });
    if (!a.ok) throw new Error("NWS response not ok");
    const l = await a.json(),
      o = Array.isArray(l == null ? void 0 : l.features)
        ? l.features
            .map((r) => {
              var d;
              return (d = r == null ? void 0 : r.properties) == null
                ? void 0
                : d.headline;
            })
            .filter(Boolean)
        : [];
    return { ...t, alerts: o };
  } catch {
    return { ...t, alerts: [] };
  }
}
function ms(t) {
  const n = Number(t);
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
function Ee(t, n, s, i, a = "") {
  const l = (o) => (o && String(o).trim() ? o : '<p class="note">No data</p>');
  return `
    <section class="section-block">
      <h3 class="section-header">${t}</h3>
      ${a}
      <div class="comparison-grid">
        <div class="col local">${l(n)}</div>
        <div class="col surrounding">${l(s)}</div>
        <div class="col district">${l(i)}</div>
      </div>
    </section>
  `;
}
function Rt(t) {
  var o, r;
  if (!t || typeof t != "object") return '<p class="note">No data</p>';
  const n = (d) => {
      const { bg: f, fg: c } = ms(d),
        y = Number.isFinite(Number(d)) ? Number(d).toFixed(1) : "—";
      return `<span class="ces-badge" style="background:${f};color:${c};">${y}</span>`;
    },
    s = t.percentile,
    i = (o = t.overall_percentiles) == null ? void 0 : o.pollution_burden,
    a =
      (r = t.overall_percentiles) == null
        ? void 0
        : r.population_characteristics,
    l = (d, f, c = []) => {
      if (!f || typeof f != "object") return "";
      const w = Object.entries(f)
        .sort(([_], [m]) => {
          const v = c.indexOf(_),
            h = c.indexOf(m);
          return v !== -1 && h !== -1
            ? v - h
            : v !== -1
              ? -1
              : h !== -1
                ? 1
                : _.localeCompare(m);
        })
        .map(
          ([_, m]) =>
            `<div class="key">${D(ts[_] || es(_))}</div><div class="val">${n(m)}</div>`,
        )
        .join("");
      return `<h4 class="sub-section-header">${d}</h4><div class="kv">${w}</div>`;
    };
  return `
    <div class="kv">
      <div class="key">Overall percentile</div><div class="val">${n(s)}</div>
      <div class="key">Pollution burden</div><div class="val">${n(i)}</div>
      <div class="key">Population characteristics</div><div class="val">${n(a)}</div>
    </div>
    ${l("Exposures", t.exposures, ut.exposures)}
    ${l("Environmental effects", t.environmental_effects, ut.environmental_effects)}
    ${l("Sensitive populations", t.sensitive_populations, ut.sensitive_populations)}
    ${l("Socioeconomic factors", t.socioeconomic_factors, ut.socioeconomic_factors)}
  `;
}
function rn(t, n, s) {
  const {
      city: i,
      zip: a,
      county: l,
      census_tract: o,
      lat: r,
      lon: d,
      english_less_than_very_well_pct: f,
      language_other_than_english_pct: c,
      spanish_at_home_pct: y,
      primary_language: w,
      secondary_language: _,
      median_household_income: m,
      per_capita_income: v,
      median_age: h,
      poverty_rate: p,
      unemployment_rate: g,
      population: E,
      dac_status: b,
      environmental_hardships: C,
      white_pct: F,
      black_pct: P,
      native_pct: z,
      asian_pct: G,
      pacific_pct: q,
      other_race_pct: N,
      two_or_more_races_pct: L,
      hispanic_pct: B,
      not_hispanic_pct: ue,
      owner_occupied_pct: te,
      renter_occupied_pct: ie,
      median_home_value: oe,
      high_school_or_higher_pct: ae,
      bachelors_or_higher_pct: re,
      alerts: Te,
      enviroscreen: M,
      surrounding_10_mile: nt,
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
        ? `<img class="map-image" src="/api/staticmap?lat=${r}&lon=${d}" alt="Map of location" />`
        : "",
    $ = nt || {},
    I = U || {},
    Ge = Array.isArray($.environmental_hardships)
      ? Array.from(new Set($.environmental_hardships))
      : [],
    We = Array.isArray(I.environmental_hardships)
      ? Array.from(new Set(I.environmental_hardships))
      : [],
    ye = Array.isArray($.census_tracts)
      ? $.census_tracts.join(", ")
      : D($.census_tracts) || "—",
    Re = Array.isArray($.cities) ? $.cities.join(", ") : D($.cities) || "—",
    de = Array.isArray(I.census_tracts)
      ? I.census_tracts.join(", ")
      : D(I.census_tracts) || "—",
    ze = Array.isArray(I.cities) ? I.cities.join(", ") : D(I.cities) || "—",
    Be = `
    <div class="kv">
      <div class="key">City</div><div class="val">${D(i) || "—"}</div>
      <div class="key">Census tract</div><div class="val">${D(o) || "—"}</div>
      <div class="key">ZIP code</div><div class="val">${D(a) || "—"}</div>
      <div class="key">County</div><div class="val">${D(l) || "—"}</div>
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
      <div class="key">Census tracts</div><div class="val">${de}</div>
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
        ["Total population", Jn(S.population)],
        ["Median age", Qn(S.median_age)],
        ["Median household income", bt(S.median_household_income)],
        ["Per capita income", bt(S.per_capita_income)],
        ["Poverty rate", x(S.poverty_rate)],
        ["Unemployment rate", x(S.unemployment_rate)],
      ]
        .map(
          ([J, Q]) => `<div class="key">${J}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    st = Ee(
      "Population &amp; Income (ACS)",
      Le({
        population: E,
        median_age: h,
        median_household_income: m,
        per_capita_income: v,
        poverty_rate: p,
        unemployment_rate: g,
      }),
      Le($.demographics || {}),
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
          ([J, Q]) => `<div class="key">${J}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    Ye = Ee(
      "Language (ACS)",
      je({
        primary_language: w,
        secondary_language: _,
        language_other_than_english_pct: c,
        english_less_than_very_well_pct: f,
        spanish_at_home_pct: y,
      }),
      je($.demographics || {}),
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
          ([J, Q]) => `<div class="key">${J}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    ve = Ee(
      "Race &amp; Ethnicity (ACS)",
      me({
        white_pct: F,
        black_pct: P,
        native_pct: z,
        asian_pct: G,
        pacific_pct: q,
        other_race_pct: N,
        two_or_more_races_pct: L,
        hispanic_pct: B,
        not_hispanic_pct: ue,
      }),
      me($.demographics || {}),
      me(I.demographics || {}),
      '<p class="section-description">This section shows the racial and ethnic composition of the community, expressed as percentages of the total population using American Community Survey (ACS) data. These insights help identify the diversity of the area and support efforts to ensure programs, outreach, and engagement strategies reflect and serve all community groups.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    pe = (S = {}) =>
      `<div class="kv">${[
        ["Owner occupied", x(S.owner_occupied_pct)],
        ["Renter occupied", x(S.renter_occupied_pct)],
        ["Median home value", bt(S.median_home_value)],
        ["High school or higher", x(S.high_school_or_higher_pct)],
        ["Bachelor's degree or higher", x(S.bachelors_or_higher_pct)],
      ]
        .map(
          ([J, Q]) => `<div class="key">${J}</div><div class="val">${Q}</div>`,
        )
        .join("")}</div>`,
    it = Ee(
      "Housing &amp; Education (ACS)",
      pe({
        owner_occupied_pct: te,
        renter_occupied_pct: ie,
        median_home_value: oe,
        high_school_or_higher_pct: ae,
        bachelors_or_higher_pct: re,
      }),
      pe($.demographics || {}),
      pe(I.demographics || {}),
      '<p class="section-description">This section combines information on housing and educational attainment in the community. It includes the percentage of owner&#8209;occupied and renter&#8209;occupied homes, median home value, and levels of education such as high school completion and bachelor’s degree or higher. These indicators provide insight into community stability, affordability, and educational opportunities, helping inform outreach strategies and program planning.</p><p class="section-description"><em>Values for the surrounding 10-mile area and water district are population-weighted averages.</em></p>',
    ),
    De = (S, j, J, Q) => {
      const rt = Array.isArray(j) ? j.length > 0 : !!S,
        Ie = rt ? "var(--success)" : "var(--border-strong)",
        we = [`Disadvantaged community: <strong>${rt ? "Yes" : "No"}</strong>`],
        Pe = [];
      return (
        Number.isFinite(J) &&
          Pe.push(`<li><strong>${x(J)}</strong> of population</li>`),
        Number.isFinite(Q) &&
          Pe.push(`<li><strong>${x(Q)}</strong> of tracts</li>`),
        Pe.length && we.push(`<ul class="dac-stats">${Pe.join("")}</ul>`),
        Array.isArray(j) &&
          j.length &&
          we.push(
            `<div class="dac-tracts">Tracts ${j.map((be) => D(be)).join(", ")}</div>`,
          ),
        `<div class="callout" style="border-left-color:${Ie}">${we.join("")}</div>`
      );
    },
    ot = Ee(
      "Disadvantaged Community (DAC) Status",
      De(b),
      Array.isArray($.dac_tracts)
        ? De(null, $.dac_tracts, $.dac_population_pct, $.dac_tracts_pct)
        : "",
      Array.isArray(I.dac_tracts)
        ? De(null, I.dac_tracts, I.dac_population_pct, I.dac_tracts_pct)
        : "",
      '<p class="section-description">This section indicates whether the selected area is designated as a Disadvantaged Community (DAC) using the California Department of Water Resources (DWR) mapping tool. DAC status is determined by household income and is shown as a simple yes/no outcome. This designation is important for identifying areas eligible for certain state and federal funding opportunities and for ensuring that equity considerations are included in outreach and program planning.</p>',
    ),
    Ve = Ee(
      "Environmental Indicators (CalEPA Enviroscreen)",
      Rt(M),
      Rt($.environment),
      Rt(I.environment),
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
    ke = `
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
          <h2 class="card__title">Results for: ${D(t)}</h2>
          <div class="card__actions">
            <button type="button" onclick="printReport()">Print</button>
            <button type="button" onclick="downloadPdf()">Download PDF</button>
            <button type="button" onclick="downloadRawData()">Raw Data</button>
            <button type="button" onclick="shareReport()">Share Link</button>
          </div>
        </div>
        <span class="updated">Updated ${Ot()}</span>
      </div>
      ${ke}
      ${Ne}
      ${st}
      ${Ye}
      ${ve}
      ${it}
      ${ot}
      ${Ve}
      ${at}
      ${Oe}
      <p class="note">Search took ${_n(s)}.</p>
      <p class="note">Values for the surrounding 10-mile area and water district are population-weighted averages.</p>
      <span class="updated--footer">
        Sources: FCC Block for county &amp; tract; US Census ACS 5‑year (languages, population, median income); CalEnviroScreen 4.0; NWS alerts.
      </span>
    </article>
    `);
}
async function An() {
  const t = document.getElementById("autocomplete"),
    n = document.getElementById("result"),
    s = ((t == null ? void 0 : t.value) || "").trim();
  if (s.length < 4) {
    en("Please enter a more complete address (at least 4 characters).", s, 0);
    return;
  }
  const i = s.toLowerCase();
  if (St.has(i)) {
    const o = St.get(i);
    xe = { address: s, data: o };
    const r = new URL(window.location);
    (r.searchParams.set("address", s),
      window.history.replaceState(null, "", r.toString()),
      rn(s, o, 0));
    return;
  }
  (n.setAttribute("aria-busy", "true"), qn(s));
  const a = document.getElementById("spinnerOverlay");
  (a && (a.style.display = "flex"), ns());
  let l = 0;
  try {
    const o = mt("/lookup", { address: s });
    console.log("Lookup request:", o);
    let r = await tt(o);
    if (!r || typeof r != "object") throw new Error("Malformed response.");
    r = await ce("enrichLocation", () => ss(r));
    const [d, f, c, y, w] = await Promise.all([
      ce("fetchLanguageAcs", () => is(r)),
      ce("enrichSurrounding", () => us(r)),
      ce("enrichWaterDistrict", () => ps(r, s)),
      ce("enrichEnglishProficiency", () => fs(r)),
      ce("enrichNwsAlerts", () => ds(r)),
    ]);
    ft(r, d, f, c, y, w);
    const _ = await ce("enrichRegionBasics", () => os(r)),
      m = await ce("enrichRegionHousingEducation", () => as(r));
    ft(r, _, m);
    const [v, h, p] = await Promise.all([
      ce("enrichRegionLanguages", () => cs(r)),
      ce("enrichRegionHardships", () => ls(r)),
      ce("enrichUnemployment", () => rs(r)),
    ]);
    (ft(r, v, h, p), (xe = { address: s, data: r }), St.set(i, r));
    const g = new URL(window.location);
    (g.searchParams.set("address", s),
      window.history.replaceState(null, "", g.toString()),
      (l = nn()),
      rn(s, r, l));
  } catch (o) {
    (l || (l = nn()), en(String(o), s, l));
  } finally {
    const o = document.getElementById("spinnerOverlay");
    (o && (o.style.display = "none"), n.removeAttribute("aria-busy"));
  }
}
function hs() {
  const t = document.getElementById("lookupBtn");
  if (!t) return;
  const n = t.cloneNode(!0);
  (t.replaceWith(n),
    n.addEventListener("click", (s) => {
      (s.preventDefault(), An().catch(console.error));
    }));
}
gn().catch(() => {});
window.onload = () => {
  (Rn(), hs());
  const n = new URLSearchParams(window.location.search).get("address");
  if (n) {
    const s = document.getElementById("autocomplete");
    s && ((s.value = n), An().catch(console.error));
  }
};
export { ys as p };
