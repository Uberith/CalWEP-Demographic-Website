import { A as jt } from "./maps.js";
/*! @license DOMPurify 3.2.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.6/LICENSE */ const {
  entries: _t,
  setPrototypeOf: st,
  isFrozen: Xt,
  getPrototypeOf: Vt,
  getOwnPropertyDescriptor: qt,
} = Object;
let { freeze: S, seal: O, create: Et } = Object,
  { apply: xe, construct: Pe } = typeof Reflect < "u" && Reflect;
S ||
  (S = function (n) {
    return n;
  });
O ||
  (O = function (n) {
    return n;
  });
xe ||
  (xe = function (n, s, r) {
    return n.apply(s, r);
  });
Pe ||
  (Pe = function (n, s) {
    return new n(...s);
  });
const ce = R(Array.prototype.forEach),
  Kt = R(Array.prototype.lastIndexOf),
  lt = R(Array.prototype.pop),
  q = R(Array.prototype.push),
  Zt = R(Array.prototype.splice),
  ue = R(String.prototype.toLowerCase),
  Ie = R(String.prototype.toString),
  ct = R(String.prototype.match),
  K = R(String.prototype.replace),
  Jt = R(String.prototype.indexOf),
  Qt = R(String.prototype.trim),
  b = R(Object.prototype.hasOwnProperty),
  A = R(RegExp.prototype.test),
  Z = en(TypeError);
function R(a) {
  return function (n) {
    n instanceof RegExp && (n.lastIndex = 0);
    for (
      var s = arguments.length, r = new Array(s > 1 ? s - 1 : 0), f = 1;
      f < s;
      f++
    )
      r[f - 1] = arguments[f];
    return xe(a, n, r);
  };
}
function en(a) {
  return function () {
    for (var n = arguments.length, s = new Array(n), r = 0; r < n; r++)
      s[r] = arguments[r];
    return Pe(a, s);
  };
}
function l(a, n) {
  let s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : ue;
  st && st(a, null);
  let r = n.length;
  for (; r--; ) {
    let f = n[r];
    if (typeof f == "string") {
      const y = s(f);
      y !== f && (Xt(n) || (n[r] = y), (f = y));
    }
    a[f] = !0;
  }
  return a;
}
function tn(a) {
  for (let n = 0; n < a.length; n++) b(a, n) || (a[n] = null);
  return a;
}
function C(a) {
  const n = Et(null);
  for (const [s, r] of _t(a))
    b(a, s) &&
      (Array.isArray(r)
        ? (n[s] = tn(r))
        : r && typeof r == "object" && r.constructor === Object
          ? (n[s] = C(r))
          : (n[s] = r));
  return n;
}
function J(a, n) {
  for (; a !== null; ) {
    const r = qt(a, n);
    if (r) {
      if (r.get) return R(r.get);
      if (typeof r.value == "function") return R(r.value);
    }
    a = Vt(a);
  }
  function s() {
    return null;
  }
  return s;
}
const ft = S([
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
  Me = S([
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
  Ne = S([
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
  nn = S([
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
  Ce = S([
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
  on = S([
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
  ut = S(["#text"]),
  pt = S([
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
  we = S([
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
  mt = S([
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
  fe = S(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  an = O(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
  rn = O(/<%[\w\W]*|[\w\W]*%>/gm),
  sn = O(/\$\{[\w\W]*/gm),
  ln = O(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  cn = O(/^aria-[\-\w]+$/),
  gt = O(
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ),
  fn = O(/^(?:\w+script|data):/i),
  un = O(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  ht = O(/^html$/i),
  pn = O(/^[a-z][.\w]*(-[.\w]+)+$/i);
var dt = Object.freeze({
  __proto__: null,
  ARIA_ATTR: cn,
  ATTR_WHITESPACE: un,
  CUSTOM_ELEMENT: pn,
  DATA_ATTR: ln,
  DOCTYPE_NAME: ht,
  ERB_EXPR: rn,
  IS_ALLOWED_URI: gt,
  IS_SCRIPT_OR_DATA: fn,
  MUSTACHE_EXPR: an,
  TMPLIT_EXPR: sn,
});
const Q = {
    element: 1,
    text: 3,
    progressingInstruction: 7,
    comment: 8,
    document: 9,
  },
  mn = function () {
    return typeof window > "u" ? null : window;
  },
  dn = function (n, s) {
    if (typeof n != "object" || typeof n.createPolicy != "function")
      return null;
    let r = null;
    const f = "data-tt-policy-suffix";
    s && s.hasAttribute(f) && (r = s.getAttribute(f));
    const y = "dompurify" + (r ? "#" + r : "");
    try {
      return n.createPolicy(y, {
        createHTML(x) {
          return x;
        },
        createScriptURL(x) {
          return x;
        },
      });
    } catch {
      return (
        console.warn("TrustedTypes policy " + y + " could not be created."),
        null
      );
    }
  },
  Tt = function () {
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
function At() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : mn();
  const n = (i) => At(i);
  if (
    ((n.version = "3.2.6"),
    (n.removed = []),
    !a || !a.document || a.document.nodeType !== Q.document || !a.Element)
  )
    return ((n.isSupported = !1), n);
  let { document: s } = a;
  const r = s,
    f = r.currentScript,
    {
      DocumentFragment: y,
      HTMLTemplateElement: x,
      Node: pe,
      Element: ve,
      NodeFilter: W,
      NamedNodeMap: yt = a.NamedNodeMap || a.MozNamedAttrMap,
      HTMLFormElement: Lt,
      DOMParser: Ot,
      trustedTypes: ee,
    } = a,
    B = ve.prototype,
    bt = J(B, "cloneNode"),
    Dt = J(B, "remove"),
    It = J(B, "nextSibling"),
    Mt = J(B, "childNodes"),
    te = J(B, "parentNode");
  if (typeof x == "function") {
    const i = s.createElement("template");
    i.content && i.content.ownerDocument && (s = i.content.ownerDocument);
  }
  let g,
    Y = "";
  const {
      implementation: me,
      createNodeIterator: Nt,
      createDocumentFragment: Ct,
      getElementsByTagName: wt,
    } = s,
    { importNode: xt } = r;
  let h = Tt();
  n.isSupported =
    typeof _t == "function" &&
    typeof te == "function" &&
    me &&
    me.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: de,
    ERB_EXPR: Te,
    TMPLIT_EXPR: _e,
    DATA_ATTR: Pt,
    ARIA_ATTR: vt,
    IS_SCRIPT_OR_DATA: kt,
    ATTR_WHITESPACE: ke,
    CUSTOM_ELEMENT: Ut,
  } = dt;
  let { IS_ALLOWED_URI: Ue } = dt,
    m = null;
  const Fe = l({}, [...ft, ...Me, ...Ne, ...Ce, ...ut]);
  let T = null;
  const He = l({}, [...pt, ...we, ...mt, ...fe]);
  let u = Object.seal(
      Et(null, {
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
    $ = null,
    Ee = null,
    ze = !0,
    ge = !0,
    Ge = !1,
    We = !0,
    P = !1,
    ne = !0,
    w = !1,
    he = !1,
    Ae = !1,
    v = !1,
    oe = !1,
    ie = !1,
    Be = !0,
    Ye = !1;
  const Ft = "user-content-";
  let Se = !0,
    j = !1,
    k = {},
    U = null;
  const $e = l({}, [
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
  let je = null;
  const Xe = l({}, ["audio", "video", "img", "source", "image", "track"]);
  let Re = null;
  const Ve = l({}, [
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
    ae = "http://www.w3.org/1998/Math/MathML",
    re = "http://www.w3.org/2000/svg",
    I = "http://www.w3.org/1999/xhtml";
  let F = I,
    ye = !1,
    Le = null;
  const Ht = l({}, [ae, re, I], Ie);
  let se = l({}, ["mi", "mo", "mn", "ms", "mtext"]),
    le = l({}, ["annotation-xml"]);
  const zt = l({}, ["title", "style", "font", "a", "script"]);
  let X = null;
  const Gt = ["application/xhtml+xml", "text/html"],
    Wt = "text/html";
  let d = null,
    H = null;
  const Bt = s.createElement("form"),
    qe = function (e) {
      return e instanceof RegExp || e instanceof Function;
    },
    Oe = function () {
      let e =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (!(H && H === e)) {
        if (
          ((!e || typeof e != "object") && (e = {}),
          (e = C(e)),
          (X =
            Gt.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? Wt : e.PARSER_MEDIA_TYPE),
          (d = X === "application/xhtml+xml" ? Ie : ue),
          (m = b(e, "ALLOWED_TAGS") ? l({}, e.ALLOWED_TAGS, d) : Fe),
          (T = b(e, "ALLOWED_ATTR") ? l({}, e.ALLOWED_ATTR, d) : He),
          (Le = b(e, "ALLOWED_NAMESPACES")
            ? l({}, e.ALLOWED_NAMESPACES, Ie)
            : Ht),
          (Re = b(e, "ADD_URI_SAFE_ATTR")
            ? l(C(Ve), e.ADD_URI_SAFE_ATTR, d)
            : Ve),
          (je = b(e, "ADD_DATA_URI_TAGS")
            ? l(C(Xe), e.ADD_DATA_URI_TAGS, d)
            : Xe),
          (U = b(e, "FORBID_CONTENTS") ? l({}, e.FORBID_CONTENTS, d) : $e),
          ($ = b(e, "FORBID_TAGS") ? l({}, e.FORBID_TAGS, d) : C({})),
          (Ee = b(e, "FORBID_ATTR") ? l({}, e.FORBID_ATTR, d) : C({})),
          (k = b(e, "USE_PROFILES") ? e.USE_PROFILES : !1),
          (ze = e.ALLOW_ARIA_ATTR !== !1),
          (ge = e.ALLOW_DATA_ATTR !== !1),
          (Ge = e.ALLOW_UNKNOWN_PROTOCOLS || !1),
          (We = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1),
          (P = e.SAFE_FOR_TEMPLATES || !1),
          (ne = e.SAFE_FOR_XML !== !1),
          (w = e.WHOLE_DOCUMENT || !1),
          (v = e.RETURN_DOM || !1),
          (oe = e.RETURN_DOM_FRAGMENT || !1),
          (ie = e.RETURN_TRUSTED_TYPE || !1),
          (Ae = e.FORCE_BODY || !1),
          (Be = e.SANITIZE_DOM !== !1),
          (Ye = e.SANITIZE_NAMED_PROPS || !1),
          (Se = e.KEEP_CONTENT !== !1),
          (j = e.IN_PLACE || !1),
          (Ue = e.ALLOWED_URI_REGEXP || gt),
          (F = e.NAMESPACE || I),
          (se = e.MATHML_TEXT_INTEGRATION_POINTS || se),
          (le = e.HTML_INTEGRATION_POINTS || le),
          (u = e.CUSTOM_ELEMENT_HANDLING || {}),
          e.CUSTOM_ELEMENT_HANDLING &&
            qe(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck) &&
            (u.tagNameCheck = e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),
          e.CUSTOM_ELEMENT_HANDLING &&
            qe(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) &&
            (u.attributeNameCheck =
              e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),
          e.CUSTOM_ELEMENT_HANDLING &&
            typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements ==
              "boolean" &&
            (u.allowCustomizedBuiltInElements =
              e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),
          P && (ge = !1),
          oe && (v = !0),
          k &&
            ((m = l({}, ut)),
            (T = []),
            k.html === !0 && (l(m, ft), l(T, pt)),
            k.svg === !0 && (l(m, Me), l(T, we), l(T, fe)),
            k.svgFilters === !0 && (l(m, Ne), l(T, we), l(T, fe)),
            k.mathMl === !0 && (l(m, Ce), l(T, mt), l(T, fe))),
          e.ADD_TAGS && (m === Fe && (m = C(m)), l(m, e.ADD_TAGS, d)),
          e.ADD_ATTR && (T === He && (T = C(T)), l(T, e.ADD_ATTR, d)),
          e.ADD_URI_SAFE_ATTR && l(Re, e.ADD_URI_SAFE_ATTR, d),
          e.FORBID_CONTENTS &&
            (U === $e && (U = C(U)), l(U, e.FORBID_CONTENTS, d)),
          Se && (m["#text"] = !0),
          w && l(m, ["html", "head", "body"]),
          m.table && (l(m, ["tbody"]), delete $.tbody),
          e.TRUSTED_TYPES_POLICY)
        ) {
          if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function")
            throw Z(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.',
            );
          if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function")
            throw Z(
              'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.',
            );
          ((g = e.TRUSTED_TYPES_POLICY), (Y = g.createHTML("")));
        } else
          (g === void 0 && (g = dn(ee, f)),
            g !== null && typeof Y == "string" && (Y = g.createHTML("")));
        (S && S(e), (H = e));
      }
    },
    Ke = l({}, [...Me, ...Ne, ...nn]),
    Ze = l({}, [...Ce, ...on]),
    Yt = function (e) {
      let t = te(e);
      (!t || !t.tagName) && (t = { namespaceURI: F, tagName: "template" });
      const o = ue(e.tagName),
        c = ue(t.tagName);
      return Le[e.namespaceURI]
        ? e.namespaceURI === re
          ? t.namespaceURI === I
            ? o === "svg"
            : t.namespaceURI === ae
              ? o === "svg" && (c === "annotation-xml" || se[c])
              : !!Ke[o]
          : e.namespaceURI === ae
            ? t.namespaceURI === I
              ? o === "math"
              : t.namespaceURI === re
                ? o === "math" && le[c]
                : !!Ze[o]
            : e.namespaceURI === I
              ? (t.namespaceURI === re && !le[c]) ||
                (t.namespaceURI === ae && !se[c])
                ? !1
                : !Ze[o] && (zt[o] || !Ke[o])
              : !!(X === "application/xhtml+xml" && Le[e.namespaceURI])
        : !1;
    },
    D = function (e) {
      q(n.removed, { element: e });
      try {
        te(e).removeChild(e);
      } catch {
        Dt(e);
      }
    },
    z = function (e, t) {
      try {
        q(n.removed, { attribute: t.getAttributeNode(e), from: t });
      } catch {
        q(n.removed, { attribute: null, from: t });
      }
      if ((t.removeAttribute(e), e === "is"))
        if (v || oe)
          try {
            D(t);
          } catch {}
        else
          try {
            t.setAttribute(e, "");
          } catch {}
    },
    Je = function (e) {
      let t = null,
        o = null;
      if (Ae) e = "<remove></remove>" + e;
      else {
        const p = ct(e, /^[\r\n\t ]+/);
        o = p && p[0];
      }
      X === "application/xhtml+xml" &&
        F === I &&
        (e =
          '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' +
          e +
          "</body></html>");
      const c = g ? g.createHTML(e) : e;
      if (F === I)
        try {
          t = new Ot().parseFromString(c, X);
        } catch {}
      if (!t || !t.documentElement) {
        t = me.createDocument(F, "template", null);
        try {
          t.documentElement.innerHTML = ye ? Y : c;
        } catch {}
      }
      const _ = t.body || t.documentElement;
      return (
        e && o && _.insertBefore(s.createTextNode(o), _.childNodes[0] || null),
        F === I ? wt.call(t, w ? "html" : "body")[0] : w ? t.documentElement : _
      );
    },
    Qe = function (e) {
      return Nt.call(
        e.ownerDocument || e,
        e,
        W.SHOW_ELEMENT |
          W.SHOW_COMMENT |
          W.SHOW_TEXT |
          W.SHOW_PROCESSING_INSTRUCTION |
          W.SHOW_CDATA_SECTION,
        null,
      );
    },
    be = function (e) {
      return (
        e instanceof Lt &&
        (typeof e.nodeName != "string" ||
          typeof e.textContent != "string" ||
          typeof e.removeChild != "function" ||
          !(e.attributes instanceof yt) ||
          typeof e.removeAttribute != "function" ||
          typeof e.setAttribute != "function" ||
          typeof e.namespaceURI != "string" ||
          typeof e.insertBefore != "function" ||
          typeof e.hasChildNodes != "function")
      );
    },
    et = function (e) {
      return typeof pe == "function" && e instanceof pe;
    };
  function M(i, e, t) {
    ce(i, (o) => {
      o.call(n, e, t, H);
    });
  }
  const tt = function (e) {
      let t = null;
      if ((M(h.beforeSanitizeElements, e, null), be(e))) return (D(e), !0);
      const o = d(e.nodeName);
      if (
        (M(h.uponSanitizeElement, e, { tagName: o, allowedTags: m }),
        (ne &&
          e.hasChildNodes() &&
          !et(e.firstElementChild) &&
          A(/<[/\w!]/g, e.innerHTML) &&
          A(/<[/\w!]/g, e.textContent)) ||
          e.nodeType === Q.progressingInstruction ||
          (ne && e.nodeType === Q.comment && A(/<[/\w]/g, e.data)))
      )
        return (D(e), !0);
      if (!m[o] || $[o]) {
        if (
          !$[o] &&
          ot(o) &&
          ((u.tagNameCheck instanceof RegExp && A(u.tagNameCheck, o)) ||
            (u.tagNameCheck instanceof Function && u.tagNameCheck(o)))
        )
          return !1;
        if (Se && !U[o]) {
          const c = te(e) || e.parentNode,
            _ = Mt(e) || e.childNodes;
          if (_ && c) {
            const p = _.length;
            for (let L = p - 1; L >= 0; --L) {
              const N = bt(_[L], !0);
              ((N.__removalCount = (e.__removalCount || 0) + 1),
                c.insertBefore(N, It(e)));
            }
          }
        }
        return (D(e), !0);
      }
      return (e instanceof ve && !Yt(e)) ||
        ((o === "noscript" || o === "noembed" || o === "noframes") &&
          A(/<\/no(script|embed|frames)/i, e.innerHTML))
        ? (D(e), !0)
        : (P &&
            e.nodeType === Q.text &&
            ((t = e.textContent),
            ce([de, Te, _e], (c) => {
              t = K(t, c, " ");
            }),
            e.textContent !== t &&
              (q(n.removed, { element: e.cloneNode() }), (e.textContent = t))),
          M(h.afterSanitizeElements, e, null),
          !1);
    },
    nt = function (e, t, o) {
      if (Be && (t === "id" || t === "name") && (o in s || o in Bt)) return !1;
      if (!(ge && !Ee[t] && A(Pt, t))) {
        if (!(ze && A(vt, t))) {
          if (!T[t] || Ee[t]) {
            if (
              !(
                (ot(e) &&
                  ((u.tagNameCheck instanceof RegExp && A(u.tagNameCheck, e)) ||
                    (u.tagNameCheck instanceof Function &&
                      u.tagNameCheck(e))) &&
                  ((u.attributeNameCheck instanceof RegExp &&
                    A(u.attributeNameCheck, t)) ||
                    (u.attributeNameCheck instanceof Function &&
                      u.attributeNameCheck(t)))) ||
                (t === "is" &&
                  u.allowCustomizedBuiltInElements &&
                  ((u.tagNameCheck instanceof RegExp && A(u.tagNameCheck, o)) ||
                    (u.tagNameCheck instanceof Function && u.tagNameCheck(o))))
              )
            )
              return !1;
          } else if (!Re[t]) {
            if (!A(Ue, K(o, ke, ""))) {
              if (
                !(
                  (t === "src" || t === "xlink:href" || t === "href") &&
                  e !== "script" &&
                  Jt(o, "data:") === 0 &&
                  je[e]
                )
              ) {
                if (!(Ge && !A(kt, K(o, ke, "")))) {
                  if (o) return !1;
                }
              }
            }
          }
        }
      }
      return !0;
    },
    ot = function (e) {
      return e !== "annotation-xml" && ct(e, Ut);
    },
    it = function (e) {
      M(h.beforeSanitizeAttributes, e, null);
      const { attributes: t } = e;
      if (!t || be(e)) return;
      const o = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: T,
        forceKeepAttr: void 0,
      };
      let c = t.length;
      for (; c--; ) {
        const _ = t[c],
          { name: p, namespaceURI: L, value: N } = _,
          V = d(p),
          De = N;
        let E = p === "value" ? De : Qt(De);
        if (
          ((o.attrName = V),
          (o.attrValue = E),
          (o.keepAttr = !0),
          (o.forceKeepAttr = void 0),
          M(h.uponSanitizeAttribute, e, o),
          (E = o.attrValue),
          Ye && (V === "id" || V === "name") && (z(p, e), (E = Ft + E)),
          ne && A(/((--!?|])>)|<\/(style|title)/i, E))
        ) {
          z(p, e);
          continue;
        }
        if (o.forceKeepAttr) continue;
        if (!o.keepAttr) {
          z(p, e);
          continue;
        }
        if (!We && A(/\/>/i, E)) {
          z(p, e);
          continue;
        }
        P &&
          ce([de, Te, _e], (rt) => {
            E = K(E, rt, " ");
          });
        const at = d(e.nodeName);
        if (!nt(at, V, E)) {
          z(p, e);
          continue;
        }
        if (
          g &&
          typeof ee == "object" &&
          typeof ee.getAttributeType == "function" &&
          !L
        )
          switch (ee.getAttributeType(at, V)) {
            case "TrustedHTML": {
              E = g.createHTML(E);
              break;
            }
            case "TrustedScriptURL": {
              E = g.createScriptURL(E);
              break;
            }
          }
        if (E !== De)
          try {
            (L ? e.setAttributeNS(L, p, E) : e.setAttribute(p, E),
              be(e) ? D(e) : lt(n.removed));
          } catch {
            z(p, e);
          }
      }
      M(h.afterSanitizeAttributes, e, null);
    },
    $t = function i(e) {
      let t = null;
      const o = Qe(e);
      for (M(h.beforeSanitizeShadowDOM, e, null); (t = o.nextNode()); )
        (M(h.uponSanitizeShadowNode, t, null),
          tt(t),
          it(t),
          t.content instanceof y && i(t.content));
      M(h.afterSanitizeShadowDOM, e, null);
    };
  return (
    (n.sanitize = function (i) {
      let e =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
        t = null,
        o = null,
        c = null,
        _ = null;
      if (((ye = !i), ye && (i = "<!-->"), typeof i != "string" && !et(i)))
        if (typeof i.toString == "function") {
          if (((i = i.toString()), typeof i != "string"))
            throw Z("dirty is not a string, aborting");
        } else throw Z("toString is not a function");
      if (!n.isSupported) return i;
      if (
        (he || Oe(e), (n.removed = []), typeof i == "string" && (j = !1), j)
      ) {
        if (i.nodeName) {
          const N = d(i.nodeName);
          if (!m[N] || $[N])
            throw Z("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (i instanceof pe)
        ((t = Je("<!---->")),
          (o = t.ownerDocument.importNode(i, !0)),
          (o.nodeType === Q.element && o.nodeName === "BODY") ||
          o.nodeName === "HTML"
            ? (t = o)
            : t.appendChild(o));
      else {
        if (!v && !P && !w && i.indexOf("<") === -1)
          return g && ie ? g.createHTML(i) : i;
        if (((t = Je(i)), !t)) return v ? null : ie ? Y : "";
      }
      t && Ae && D(t.firstChild);
      const p = Qe(j ? i : t);
      for (; (c = p.nextNode()); )
        (tt(c), it(c), c.content instanceof y && $t(c.content));
      if (j) return i;
      if (v) {
        if (oe)
          for (_ = Ct.call(t.ownerDocument); t.firstChild; )
            _.appendChild(t.firstChild);
        else _ = t;
        return (
          (T.shadowroot || T.shadowrootmode) && (_ = xt.call(r, _, !0)),
          _
        );
      }
      let L = w ? t.outerHTML : t.innerHTML;
      return (
        w &&
          m["!doctype"] &&
          t.ownerDocument &&
          t.ownerDocument.doctype &&
          t.ownerDocument.doctype.name &&
          A(ht, t.ownerDocument.doctype.name) &&
          (L =
            "<!DOCTYPE " +
            t.ownerDocument.doctype.name +
            `>
` +
            L),
        P &&
          ce([de, Te, _e], (N) => {
            L = K(L, N, " ");
          }),
        g && ie ? g.createHTML(L) : L
      );
    }),
    (n.setConfig = function () {
      let i =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      (Oe(i), (he = !0));
    }),
    (n.clearConfig = function () {
      ((H = null), (he = !1));
    }),
    (n.isValidAttribute = function (i, e, t) {
      H || Oe({});
      const o = d(i),
        c = d(e);
      return nt(o, c, t);
    }),
    (n.addHook = function (i, e) {
      typeof e == "function" && q(h[i], e);
    }),
    (n.removeHook = function (i, e) {
      if (e !== void 0) {
        const t = Kt(h[i], e);
        return t === -1 ? void 0 : Zt(h[i], t, 1)[0];
      }
      return lt(h[i]);
    }),
    (n.removeHooks = function (i) {
      h[i] = [];
    }),
    (n.removeAllHooks = function () {
      h = Tt();
    }),
    n
  );
}
var St = At();
const gn = Object.freeze(
  Object.defineProperty({ __proto__: null, default: St }, Symbol.toStringTag, {
    value: "Module",
  }),
);
function G(a = "") {
  return a == null ? "" : St(window).sanitize(String(a));
}
function Rt() {
  return new Date().toLocaleString();
}
function Tn(a = 0) {
  const n = Math.round(a / 1e3),
    s = Math.floor(n / 60),
    r = n % 60;
  return `${s} ${s === 1 ? "Minute" : "Minutes"} and ${r} ${r === 1 ? "Second" : "Seconds"}`;
}
function _n(a = {}, ...n) {
  const s = (r) => r && typeof r == "object" && !Array.isArray(r);
  for (const r of n)
    if (s(r))
      for (const [f, y] of Object.entries(r))
        s(y) ? (a[f] = _n(s(a[f]) ? a[f] : {}, y)) : (a[f] = y);
  return a;
}
function hn(a) {
  document.getElementById("result").innerHTML = G(`
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Looking up demographics…</h2>
        <span class="updated">Started ${Rt()}</span>
      </div>
      ${a ? `<p class="note">Address: <strong>${G(a)}</strong></p>` : ""}
      <div class="callout">Fetching county, languages, English proficiency, population, income, DAC, and alerts…</div>
      <p class="note">Elapsed: <span id="searchTimer">0m 00s</span></p>
    </div>
  `);
}
function An(a, n, s) {
  document.getElementById("result").innerHTML = G(`
    <div class="card" role="alert">
      <div class="card__header">
        <h2 class="card__title">Unable to retrieve data</h2>
        <span class="updated">${Rt()}</span>
      </div>
      ${n ? `<p class="note">Address: <strong>${G(n)}</strong></p>` : ""}
      <div class="callout" style="border-left-color:#b45309;">
        ${G(a || "Please try again with a different address.")}
      </div>
      <p class="note">Search took ${Tn(s)}.</p>
      <p class="note">API base: <code>${G(jt || "/api")}</code>.</p>
    </div>
  `);
}
export { hn as a, _n as d, Tn as f, Rt as n, gn as p, An as r, G as s };
