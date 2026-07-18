import { SlotComponentIcon as p, EmbedIcon as c, MarkdownEmbedIcon as d, TextIcon as u, PaintBrushIcon as y, WebhookFormIcon as h, BracesIcon as m, RadioCheckedIcon as f, CheckboxCheckedIcon as b, VimeoIcon as g, YoutubeIcon as v, ButtonElementIcon as w, BoxIcon as S, XmlIcon as q, CalendarIcon as k, HeaderIcon as M, ResourceIcon as $, WindowInfoIcon as T, WindowTitleIcon as x, VideoIcon as P } from "@webstudio-is/icons/svg";
import { descendantComponent as i } from "@webstudio-is/sdk";
import { body as V, section as I, nav as C, main as D, header as W, footer as A, figure as B, aside as L, article as E, address as O, div as t, h6 as R, h5 as N, h4 as Y, h3 as U, h2 as H, h1 as z, p as G, a as F, span as K, b as Z, i as _, sup as J, sub as j, button as l, input as X, form as s, img as Q, ul as ee, ol as te, li as oe, hr as re, code as ae, label as ne, textarea as ie, radio as le, checkbox as se, time as pe, select as ce } from "@webstudio-is/sdk/normalize.css";
const mt = {
  category: "general",
  description: "Slot is a container for content that you want to reference across the project. Changes made to a Slot's children will be reflected in all other instances of that Slot.",
  icon: p,
  order: 4
}, ft = {}, o = {
  className: {
    required: !1,
    control: "text",
    type: "string",
    description: ""
  },
  clientOnly: { required: !1, control: "boolean", type: "boolean" },
  code: { required: !0, control: "text", type: "string" },
  executeScriptOnCanvas: {
    required: !1,
    control: "boolean",
    type: "boolean"
  }
}, bt = {
  category: "general",
  label: "HTML Embed",
  description: "Used to add HTML code to the page, such as an SVG or script.",
  icon: c,
  order: 3,
  contentModel: {
    category: "instance",
    children: [i]
  },
  presetStyle: {
    div: [
      {
        property: "display",
        value: { type: "keyword", value: "contents" }
      },
      {
        property: "white-space-collapse",
        value: { type: "keyword", value: "collapse" }
      }
    ]
  },
  initialProps: ["class", "clientOnly", "executeScriptOnCanvas"],
  props: {
    ...o,
    clientOnly: {
      ...o.clientOnly,
      description: "Activate it for any scripts that can mutate the DOM or introduce interactivity. This only affects the published site."
    },
    executeScriptOnCanvas: {
      ...o.executeScriptOnCanvas,
      label: "Run scripts on canvas",
      description: "Dangerously allow script execution on canvas without switching to preview mode. This only affects build mode, but may result in unwanted side effects inside builder!"
    },
    code: {
      required: !0,
      control: "code",
      language: "html",
      type: "string"
    }
  }
}, de = {
  code: { required: !0, control: "text", type: "string" }
}, gt = {
  icon: d,
  contentModel: {
    category: "instance",
    children: [i]
  },
  presetStyle: {
    div: [
      {
        property: "display",
        value: { type: "keyword", value: "contents" }
      },
      {
        property: "white-space-collapse",
        value: { type: "keyword", value: "collapse" }
      }
    ]
  },
  initialProps: ["class"],
  props: {
    ...de,
    code: {
      required: !0,
      control: "code",
      language: "markdown",
      type: "string",
      contentMode: !0
    }
  }
}, ue = {}, vt = {
  presetStyle: { body: V },
  initialProps: ["id", "class"],
  props: ue
}, ye = {
  tag: { required: !1, control: "text", type: "string" }
}, wt = {
  presetStyle: {
    div: t,
    address: O,
    article: E,
    aside: L,
    figure: B,
    footer: A,
    header: W,
    main: D,
    nav: C,
    section: I
  },
  initialProps: ["tag", "id", "class"],
  props: {
    ...ye,
    tag: {
      required: !0,
      control: "tag",
      type: "string",
      options: [
        "div",
        "header",
        "footer",
        "nav",
        "main",
        "section",
        "article",
        "aside",
        "address",
        "figure",
        "span"
      ]
    }
  }
}, he = {
  tag: { required: !1, control: "text", type: "string" }
}, St = {
  icon: u,
  presetStyle: {
    div: [
      ...t,
      {
        property: "min-height",
        value: { type: "unit", unit: "em", value: 1 }
      }
    ]
  },
  initialProps: ["tag", "id", "class"],
  props: {
    ...he,
    tag: {
      required: !0,
      control: "tag",
      type: "string",
      options: ["div", "cite", "figcaption", "span"]
    }
  }
}, me = {
  tag: { required: !1, control: "text", type: "string" }
}, qt = {
  presetStyle: {
    h1: z,
    h2: H,
    h3: U,
    h4: Y,
    h5: N,
    h6: R
  },
  initialProps: ["tag", "id", "class"],
  props: {
    ...me,
    tag: {
      required: !0,
      control: "tag",
      type: "string",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"]
    }
  }
}, fe = {}, kt = {
  presetStyle: { p: G },
  initialProps: ["id", "class"],
  props: fe
}, be = {
  download: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether to download the resource instead of navigating to it, and its filename if so"
  },
  prefetch: {
    required: !1,
    control: "select",
    type: "string",
    options: ["none", "intent", "render", "viewport"]
  },
  preventScrollReset: { required: !1, control: "boolean", type: "boolean" },
  reloadDocument: { required: !1, control: "boolean", type: "boolean" },
  replace: { required: !1, control: "boolean", type: "boolean" },
  target: {
    required: !1,
    control: "select",
    type: "string",
    options: ["_self", "_blank", "_parent", "_top"],
    description: "Navigable for form submission"
  }
}, ge = {
  a: [
    ...F,
    {
      property: "display",
      value: { type: "keyword", value: "inline-block" }
    }
  ]
}, ve = {
  presetStyle: ge,
  states: [{ label: "Current page", selector: "[aria-current=page]" }],
  initialProps: ["id", "class", "href", "target", "prefetch", "download"],
  props: {
    ...be,
    href: {
      type: "string",
      control: "url",
      required: !1,
      contentMode: !0
    }
  }
}, Mt = ve, we = {}, $t = {
  label: "Text",
  icon: y,
  presetStyle: { span: K },
  initialProps: ["id", "class"],
  props: we
}, Se = {}, Tt = {
  label: "Bold Text",
  presetStyle: { b: Z },
  initialProps: ["id", "class"],
  props: Se
}, qe = {}, xt = {
  label: "Italic Text",
  presetStyle: { i: _ },
  initialProps: ["id", "class"],
  props: qe
}, ke = {}, Pt = {
  label: "Superscript Text",
  presetStyle: { sup: J },
  initialProps: ["id", "class"],
  props: ke
}, Me = {}, Vt = {
  label: "Subscript Text",
  presetStyle: { sub: j },
  initialProps: ["id", "class"],
  props: Me
}, $e = {}, It = {
  presetStyle: { button: l },
  initialProps: ["id", "class", "type", "aria-label"],
  props: $e
}, Te = {}, xe = {
  input: [
    ...X,
    {
      property: "display",
      value: { type: "keyword", value: "block" }
    }
  ]
}, Ct = {
  label: "Text Input",
  presetStyle: xe,
  initialProps: [
    "id",
    "class",
    "name",
    "value",
    "type",
    "placeholder",
    "required",
    "autofocus"
  ],
  props: Te
}, Pe = {
  state: {
    description: "Use this property to reveal the Success and Error states on the canvas so they can be styled. The Initial state is displayed when the page first opens. The Success and Error states are displayed depending on whether the Form submits successfully or unsuccessfully.",
    required: !1,
    control: "radio",
    type: "string",
    defaultValue: "initial",
    options: ["initial", "success", "error"]
  }
}, Dt = {
  label: "Webhook Form",
  icon: h,
  presetStyle: {
    form: s
  },
  states: [
    { selector: "[data-state=error]", label: "Error" },
    { selector: "[data-state=success]", label: "Success" }
  ],
  initialProps: ["id", "class", "state", "action"],
  props: {
    ...Pe,
    action: {
      type: "resource",
      control: "resource",
      description: "The URI of a program that processes the information submitted via the form.",
      required: !1
    }
  }
}, Ve = {}, Ie = {
  form: [
    ...s,
    { property: "min-height", value: { type: "unit", unit: "px", value: 20 } }
  ]
}, Wt = {
  label: "Form",
  presetStyle: Ie,
  initialProps: ["id", "class", "action"],
  props: Ve
}, Ce = {
  optimize: {
    description: "Optimize the image for enhanced performance.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  quality: { required: !1, control: "number", type: "number" }
}, De = {
  img: [
    ...Q,
    // Otherwise on new image insert onto canvas it can overfit screen size multiple times
    {
      property: "max-width",
      value: { type: "unit", unit: "%", value: 100 }
    },
    // inline | inline-block is not suitable because without line-height: 0 on the parent you get unsuitable spaces/margins
    // see https://stackoverflow.com/questions/24771194/is-the-margin-of-inline-block-4px-is-static-for-all-browsers
    {
      property: "display",
      value: { type: "keyword", value: "block" }
    },
    // Set image height to "auto" to reduce layout shift, improving compatibility across browsers like Safari.
    // Unlike "fit-content," "auto" preserves the aspect ratio when the width exceeds max-width. (in Safari)
    // See https://web.dev/articles/optimize-cls#best_practice_for_setting_image_dimensions
    {
      property: "height",
      value: { type: "keyword", value: "auto" }
    }
  ]
}, r = {
  category: "media",
  description: "Add an image asset to the page. Webstudio automatically converts images to WebP or AVIF format and makes them responsive for best performance.",
  presetStyle: De,
  order: 0,
  initialProps: [
    "id",
    "class",
    "src",
    "width",
    "height",
    "alt",
    "loading",
    "optimize"
  ],
  props: {
    ...Ce,
    // Automatically generated props don't have the right control.
    src: {
      type: "string",
      control: "file",
      label: "Source",
      required: !1,
      accept: "image/*",
      contentMode: !0
    },
    width: {
      type: "number",
      control: "number",
      required: !1,
      contentMode: !0
    },
    height: {
      type: "number",
      control: "number",
      required: !1,
      contentMode: !0
    },
    alt: {
      type: "string",
      control: "text",
      required: !1,
      contentMode: !0
    }
  }
}, We = {}, Ae = {
  blockquote: [
    {
      property: "margin-top",
      value: { type: "unit", value: 0, unit: "number" }
    },
    {
      property: "margin-right",
      value: { type: "unit", value: 0, unit: "number" }
    },
    {
      property: "margin-bottom",
      value: { type: "unit", value: 10, unit: "px" }
    },
    {
      property: "margin-left",
      value: { type: "unit", value: 0, unit: "number" }
    },
    {
      property: "padding-top",
      value: { type: "unit", value: 10, unit: "px" }
    },
    {
      property: "padding-bottom",
      value: { type: "unit", value: 10, unit: "px" }
    },
    {
      property: "padding-left",
      value: { type: "unit", value: 20, unit: "px" }
    },
    {
      property: "padding-right",
      value: { type: "unit", value: 20, unit: "px" }
    },
    {
      property: "border-left-width",
      value: { type: "unit", value: 5, unit: "px" }
    },
    {
      property: "border-left-style",
      value: { type: "keyword", value: "solid" }
    },
    {
      property: "border-left-color",
      value: { type: "rgb", r: 226, g: 226, b: 226, alpha: 1 }
    }
  ]
}, At = {
  presetStyle: Ae,
  initialProps: ["id", "class", "cite"],
  props: We
}, Be = {
  ordered: {
    description: "Shows numbers instead of bullets when toggled. See the “List Style Type” property under the “List Item” section in the Style panel for more options.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  }
}, Le = {
  ol: [
    ...te,
    {
      property: "margin-top",
      value: { type: "keyword", value: "0" }
    },
    {
      property: "margin-bottom",
      value: { type: "keyword", value: "10px" }
    },
    {
      property: "padding-left",
      value: { type: "keyword", value: "40px" }
    }
  ],
  ul: [
    ...ee,
    {
      property: "margin-top",
      value: { type: "keyword", value: "0" }
    },
    {
      property: "margin-bottom",
      value: { type: "keyword", value: "10px" }
    },
    {
      property: "padding-left",
      value: { type: "keyword", value: "40px" }
    }
  ]
}, Bt = {
  presetStyle: Le,
  initialProps: ["id", "class", "ordered", "start", "reversed"],
  props: Be
}, Ee = {}, Lt = {
  presetStyle: { li: oe },
  initialProps: ["id", "class"],
  props: Ee
}, Oe = {}, Re = {
  hr: [
    ...re,
    {
      property: "height",
      value: { type: "keyword", value: "1px" }
    },
    {
      property: "background-color",
      value: { type: "keyword", value: "gray" }
    },
    {
      property: "border-top-style",
      value: { type: "keyword", value: "none" }
    },
    {
      property: "border-right-style",
      value: { type: "keyword", value: "none" }
    },
    {
      property: "border-left-style",
      value: { type: "keyword", value: "none" }
    },
    {
      property: "border-bottom-style",
      value: { type: "keyword", value: "none" }
    }
  ]
}, Et = {
  presetStyle: Re,
  initialProps: ["id", "class"],
  props: Oe
}, Ne = {
  code: { required: !1, control: "text", type: "string" }
}, Ye = {
  code: [
    ...ae,
    {
      property: "display",
      value: { type: "keyword", value: "block" }
    },
    {
      property: "white-space-collapse",
      value: { type: "keyword", value: "preserve" }
    },
    {
      property: "text-wrap-mode",
      value: { type: "keyword", value: "wrap" }
    },
    {
      property: "padding-left",
      value: { type: "unit", value: 0.2, unit: "em" }
    },
    {
      property: "padding-right",
      value: { type: "unit", value: 0.2, unit: "em" }
    },
    {
      property: "background-color",
      value: { type: "rgb", r: 238, g: 238, b: 238, alpha: 1 }
    }
  ]
}, Ot = {
  icon: m,
  contentModel: {
    category: "instance",
    children: []
  },
  presetStyle: Ye,
  initialProps: ["id", "class", "lang", "code"],
  props: {
    ...Ne,
    code: {
      required: !0,
      control: "codetext",
      type: "string"
    }
  }
}, Ue = {}, He = {
  label: [
    ...ne,
    { property: "display", value: { type: "keyword", value: "block" } }
  ]
}, Rt = {
  label: "Input Label",
  presetStyle: He,
  initialProps: ["id", "class", "for"],
  props: Ue
}, ze = {}, Ge = {
  textarea: [
    ...ie,
    // resize doesn't work well while on canvas
    { property: "resize", value: { type: "keyword", value: "none" } },
    {
      property: "display",
      value: { type: "keyword", value: "block" }
    }
  ]
}, Nt = {
  label: "Text Area",
  presetStyle: Ge,
  contentModel: {
    category: "instance",
    children: []
  },
  initialProps: [
    "id",
    "class",
    "name",
    "value",
    "placeholder",
    "required",
    "autofocus"
  ],
  props: ze
}, Fe = {
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Value of the form control"
  }
}, Ke = {
  input: [
    ...le,
    {
      property: "margin-right",
      value: { type: "unit", unit: "em", value: 0.5 }
    }
  ]
}, Yt = {
  label: "Radio",
  icon: f,
  presetStyle: Ke,
  initialProps: ["id", "class", "name", "value", "required", "checked"],
  props: Fe
}, Ze = {
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Value of the form control"
  }
}, _e = {
  input: [
    ...se,
    {
      property: "margin-right",
      value: { type: "unit", unit: "em", value: 0.5 }
    }
  ]
}, Ut = {
  icon: b,
  presetStyle: _e,
  initialProps: ["id", "class", "name", "value", "required", "checked"],
  props: Ze
}, a = {
  autopause: {
    description: "Whether to pause the current video when another Vimeo video on the same page starts to play. Set this value to false to permit simultaneous playback of all the videos on the page. This option has no effect if you've disabled cookies in your browser, either through browser settings or with an extension or plugin.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  autopip: {
    description: "Whether to enable the browser to enter picture-in-picture mode automatically when switching tabs or windows, where supported.",
    required: !1,
    control: "boolean",
    type: "boolean"
  },
  autoplay: {
    description: "Whether to start playback of the video automatically. This feature might not work on all devices.\nSome browsers require the `muted` parameter to be set to `true` for autoplay to work.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  backgroundMode: {
    description: "Whether the player is in background mode, which hides the playback controls, enables autoplay, and loops the video.",
    required: !1,
    control: "boolean",
    type: "boolean"
  },
  controlsColor: {
    description: "A color value of the playback controls, which is normally #00ADEF. The embed settings of the video might override this value.",
    required: !1,
    control: "color",
    type: "string"
  },
  doNotTrack: {
    description: "Whether to prevent the player from tracking session data, including cookies. Keep in mind that setting this argument to true also blocks video stats.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  interactiveParams: {
    description: "Key-value pairs representing dynamic parameters that are utilized on interactive videos with live elements, such as title=my-video,subtitle=interactive.",
    required: !1,
    control: "text",
    type: "string"
  },
  keyboard: {
    description: "Whether to enable keyboard input to trigger player events. This setting doesn't affect tab control.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  loading: {
    description: "Not a Vimeo attribute: Loading attribute for the iframe allows to eager or lazy load the source",
    required: !1,
    control: "radio",
    type: "string",
    defaultValue: "lazy",
    options: ["eager", "lazy"]
  },
  loop: {
    description: "Whether to restart the video automatically after reaching the end.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  muted: {
    description: "Whether the video is muted upon loading. The true value is required for the autoplay behavior in some browsers.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  pip: {
    description: "Whether to include the picture-in-picture button among the player controls and enable the picture-in-picture API.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  playsinline: {
    description: "Whether the video plays inline on supported mobile devices. To force the device to play the video in fullscreen mode instead, set this value to false.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  quality: {
    description: "For videos on a Vimeo Plus account or higher: the playback quality of the video. Use auto for the best possible quality given available bandwidth and other factors. You can also specify 360p, 540p, 720p, 1080p, 2k, and 4k.",
    required: !1,
    control: "select",
    type: "string",
    defaultValue: "auto",
    options: ["auto", "360p", "540p", "720p", "1080p", "2k", "4k"]
  },
  responsive: {
    description: "Whether to return a responsive embed code, or one that provides intelligent adjustments based on viewing conditions. We recommend this option for mobile-optimized sites.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  showByline: {
    description: "Whether to display the video owner's name.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  showControls: {
    description: "Whether to display the player's interactive elements, including the play bar and sharing buttons. Set this option to false for a chromeless experience. To control playback when the play/pause button is hidden, set autoplay to true, use keyboard controls (which remain active), or implement our player SDK.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  showPortrait: {
    description: "Whether to display the video owner's portrait. Only works if either title or byline are also enabled",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  showPreview: {
    description: "Not a Vimeo attribute: Whether the preview image should be loaded from Vimeo API. Ideally don't use it, because it will show up with some delay and will make your project feel slower.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  showTitle: {
    description: "Whether the player displays the title overlay.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  speed: {
    description: "Whether the player displays speed controls in the preferences menu and enables the playback rate API.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  texttrack: {
    description: `The text track to display with the video. Specify the text track by its language code (en), the language code and locale (en-US), or the language code and kind (en.captions). For this argument to work, the video must already have a text track of the given type; see our Help Center or Working with Text Track Uploads for more information.
To enable automatically generated closed captions instead, provide the value en-x-autogen. Please note that, at the present time, automatic captions are always in English.`,
    required: !1,
    control: "text",
    type: "string"
  },
  transparent: {
    description: "Whether the responsive player and transparent background are enabled.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  url: {
    description: "The ID or the URL of the video on Vimeo. You must supply one of these values to identify the video. When the video's privacy setting is Private, you must use the URL, and the URL must include the h parameter. For more information, see Vimeo’s introductory guide.",
    required: !1,
    control: "text",
    type: "string"
  }
}, Je = [
  "id",
  "className",
  "url",
  "title",
  "quality",
  "loading",
  "showPreview",
  "autoplay",
  "doNotTrack",
  "loop",
  "muted",
  "showPortrait",
  "showByline",
  "showTitle",
  "showControls",
  "controlsColor",
  "playsinline"
], Ht = {
  icon: g,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: ["VimeoSpinner", "VimeoPlayButton", "VimeoPreviewImage"]
  },
  presetStyle: { div: t },
  initialProps: Je,
  props: {
    ...a,
    url: {
      ...a.url,
      contentMode: !0
    }
  }
}, n = {
  allowFullscreen: {
    description: "Whether to allow fullscreen mode.\nOriginal parameter: `fs`",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  autoplay: {
    description: "Whether the video should autoplay.\nSome browsers require the `muted` parameter to be set to `true` for autoplay to work.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  captionLanguage: {
    description: "Specifies the default language that the player will use to display captions.\nThe value is an ISO 639-1 two-letter language code.\nOriginal parameter: `cc_lang_pref`",
    required: !1,
    control: "text",
    type: "string"
  },
  color: {
    description: `Specifies the color that will be used in the player's video progress bar to highlight the amount of the video that the viewer has already seen.
Valid values are 'red' and 'white'.`,
    required: !1,
    control: "radio",
    type: "string",
    options: ["red", "white"]
  },
  disableKeyboard: {
    description: "Whether to disable keyboard controls.\nOriginal parameter: `disablekb`",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  endTime: {
    description: "End time of the video in seconds.\nOriginal parameter: `end`",
    required: !1,
    control: "number",
    type: "number"
  },
  inline: {
    description: "Whether to play inline on mobile (not fullscreen).",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  keyboard: {
    description: "Whether to enable keyboard controls.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  language: {
    description: "Sets the player's interface language. The value is an ISO 639-1 two-letter language code or a fully specified locale.\nOriginal parameter: `hl`",
    required: !1,
    control: "text",
    type: "string"
  },
  listId: {
    description: "ID of the playlist to load.\nOriginal parameter: `list`",
    required: !1,
    control: "text",
    type: "string"
  },
  listType: {
    description: "Type of playlist to load.",
    required: !1,
    control: "radio",
    type: "string",
    options: ["playlist", "user_uploads"]
  },
  loading: {
    description: "Loading strategy for iframe",
    required: !1,
    control: "radio",
    type: "string",
    defaultValue: "lazy",
    options: ["eager", "lazy"]
  },
  loop: {
    description: "Whether the video should loop continuously.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  muted: {
    description: "Whether the video should start muted.\nUseful for enabling autoplay in browsers that require videos to be muted.\nOriginal parameter: `mute`",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  origin: {
    description: "Your domain for API compliance (e.g., `https://yourdomain.com`).",
    required: !1,
    control: "text",
    type: "string"
  },
  playlist: {
    description: "This parameter specifies a comma-separated list of video IDs to play",
    required: !1,
    control: "text",
    type: "string"
  },
  privacyEnhancedMode: {
    description: `The Privacy Enhanced Mode of the YouTube embedded player prevents the use of views of embedded YouTube content from influencing the viewer’s browsing experience on YouTube.
https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode`,
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  referrer: {
    description: "Referrer URL for tracking purposes.\nOriginal parameter: `widget_referrer`",
    required: !1,
    control: "text",
    type: "string"
  },
  showAnnotations: {
    description: "Whether to show annotations on the video.\nOriginal parameter: `iv_load_policy`",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  showCaptions: {
    description: "Whether captions should be shown by default.\nOriginal parameter: `cc_load_policy`",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  showControls: {
    description: "Whether to show player controls.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  showPreview: { required: !1, control: "boolean", type: "boolean" },
  showRelatedVideos: {
    description: "Whether to show related videos at the end.\nOriginal parameter: `rel`",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  startTime: {
    description: "Start time of the video in seconds.\nOriginal parameter: `start`",
    required: !1,
    control: "number",
    type: "number"
  },
  url: {
    description: "The YouTube video URL or ID",
    required: !1,
    control: "text",
    type: "string"
  }
}, je = [
  "id",
  "className",
  "url",
  "privacyEnhancedMode",
  "title",
  "loading",
  "showPreview",
  "autoplay",
  "showControls",
  "showRelatedVideos",
  "keyboard",
  "loop",
  "inline",
  "allowFullscreen",
  "showCaptions",
  "showAnnotations",
  "startTime",
  "endTime",
  "disableKeyboard",
  "referrer",
  "listType",
  "listId",
  "origin",
  "captionLanguage",
  "language",
  "color",
  "playlist"
], zt = {
  icon: v,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: ["VimeoSpinner", "VimeoPlayButton", "VimeoPreviewImage"]
  },
  presetStyle: { div: t },
  initialProps: je,
  props: {
    ...n,
    url: {
      ...n.url,
      contentMode: !0
    }
  }
}, Xe = {
  optimize: {
    description: "Optimize the image for enhanced performance.",
    required: !1,
    control: "boolean",
    type: "boolean"
  },
  quality: { required: !1, control: "number", type: "number" }
}, Gt = {
  ...r,
  category: "hidden",
  label: "Preview Image",
  contentModel: {
    category: "none",
    children: []
  },
  initialProps: r.initialProps,
  props: {
    ...Xe,
    // Automatically generated props don't have the right control.
    src: {
      type: "string",
      control: "file",
      label: "Source",
      required: !1,
      contentMode: !0
    }
  }
}, Qe = {}, Ft = {
  category: "hidden",
  label: "Play Button",
  icon: w,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  presetStyle: { button: l },
  initialProps: ["id", "class"],
  props: Qe
}, et = {}, Kt = {
  icon: S,
  category: "hidden",
  label: "Spinner",
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  presetStyle: { div: t },
  initialProps: ["id", "class"],
  props: et
}, tt = {
  href: {
    required: !1,
    control: "text",
    type: "string",
    description: "Address of the hyperlink"
  },
  hreflang: {
    required: !1,
    control: "text",
    type: "string",
    description: "Language of the linked resource"
  },
  rel: {
    required: !1,
    control: "text",
    type: "string",
    description: "Relationship between the location in the document containing the hyperlink and the destination resource"
  },
  tag: { required: !1, control: "text", type: "string", defaultValue: "" },
  xmlns: { required: !1, control: "text", type: "string" },
  "xmlns:xhtml": { required: !1, control: "text", type: "string" }
}, Zt = {
  category: "xml",
  order: 6,
  icon: q,
  description: "XML Node",
  initialProps: ["tag"],
  props: tt
}, ot = {
  dateStyle: {
    required: !1,
    control: "radio",
    type: "string",
    defaultValue: "short",
    options: ["long", "short"]
  },
  datetime: {
    required: !1,
    control: "text",
    type: "string",
    defaultValue: "dateTime attribute is not set",
    description: "Machine-readable value"
  }
}, _t = {
  category: "xml",
  description: "Converts machine-readable date and time to ISO format.",
  icon: k,
  order: 7,
  initialProps: ["datetime", "dateStyle"],
  props: ot
}, e = {
  country: {
    required: !1,
    control: "select",
    type: "string",
    defaultValue: "GB",
    options: [
      "AF",
      "AL",
      "DZ",
      "AS",
      "AD",
      "AO",
      "AI",
      "AQ",
      "AG",
      "AR",
      "AM",
      "AW",
      "AU",
      "AT",
      "AZ",
      "BS",
      "BH",
      "BD",
      "BB",
      "BY",
      "BE",
      "BZ",
      "BJ",
      "BM",
      "BT",
      "BO",
      "BA",
      "BW",
      "BR",
      "BN",
      "BG",
      "BF",
      "BI",
      "CV",
      "KH",
      "CM",
      "CA",
      "KY",
      "CF",
      "TD",
      "CL",
      "CN",
      "CO",
      "KM",
      "CG",
      "CD",
      "CR",
      "HR",
      "CU",
      "CY",
      "CZ",
      "DK",
      "DJ",
      "DM",
      "DO",
      "EC",
      "EG",
      "SV",
      "GQ",
      "ER",
      "EE",
      "SZ",
      "ET",
      "FJ",
      "FI",
      "FR",
      "GA",
      "GM",
      "GE",
      "DE",
      "GH",
      "GR",
      "GD",
      "GT",
      "GN",
      "GW",
      "GY",
      "HT",
      "HN",
      "HU",
      "IS",
      "IN",
      "ID",
      "IR",
      "IQ",
      "IE",
      "IL",
      "IT",
      "JM",
      "JP",
      "JO",
      "KZ",
      "KE",
      "KI",
      "KP",
      "KR",
      "KW",
      "KG",
      "LA",
      "LV",
      "LB",
      "LS",
      "LR",
      "LY",
      "LI",
      "LT",
      "LU",
      "MG",
      "MW",
      "MY",
      "MV",
      "ML",
      "MT",
      "MH",
      "MR",
      "MU",
      "MX",
      "FM",
      "MD",
      "MC",
      "MN",
      "ME",
      "MA",
      "MZ",
      "MM",
      "NA",
      "NR",
      "NP",
      "NL",
      "NZ",
      "NI",
      "NE",
      "NG",
      "NO",
      "OM",
      "PK",
      "PW",
      "PA",
      "PG",
      "PY",
      "PE",
      "PH",
      "PL",
      "PT",
      "QA",
      "RO",
      "RU",
      "RW",
      "KN",
      "LC",
      "VC",
      "WS",
      "SM",
      "ST",
      "SA",
      "SN",
      "RS",
      "SC",
      "SL",
      "SG",
      "SK",
      "SI",
      "SB",
      "SO",
      "ZA",
      "SS",
      "ES",
      "LK",
      "SD",
      "SR",
      "SE",
      "CH",
      "SY",
      "TW",
      "TJ",
      "TZ",
      "TH",
      "TL",
      "TG",
      "TO",
      "TT",
      "TN",
      "TR",
      "TM",
      "TV",
      "UG",
      "UA",
      "AE",
      "GB",
      "US",
      "UY",
      "UZ",
      "VU",
      "VA",
      "VE",
      "VN",
      "YE",
      "ZM",
      "ZW"
    ]
  },
  dateStyle: {
    required: !1,
    control: "select",
    type: "string",
    defaultValue: "medium",
    options: ["full", "long", "medium", "short", "none"]
  },
  datetime: {
    required: !1,
    control: "text",
    type: "string",
    defaultValue: "dateTime attribute is not set",
    description: "Machine-readable value"
  },
  format: {
    description: `Custom format template. Overrides Date Style and Time Style.

Tokens: YYYY/YY (year), MMMM/MMM/MM/M (month), DDDD/DDD/DD/D (day), HH/H (hours), mm/m (minutes), ss/s (seconds)

Examples:
- "YYYY-MM-DD" → 2025-11-03
- "DDDD, MMMM D" → Monday, November 3
- "DDD, D. MMM YYYY" → Mon, 3. Nov 2025

Day and month names use the selected language.`,
    required: !1,
    control: "text",
    type: "string"
  },
  language: {
    required: !1,
    control: "select",
    type: "string",
    defaultValue: "en",
    options: [
      "hr",
      "th",
      "tr",
      "id",
      "is",
      "cy",
      "fr",
      "af",
      "am",
      "ar",
      "az",
      "be",
      "bg",
      "bn",
      "bs",
      "ca",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "es",
      "et",
      "eu",
      "fa",
      "fi",
      "ga",
      "gl",
      "gu",
      "he",
      "hi",
      "hu",
      "hy",
      "it",
      "ja",
      "ka",
      "kk",
      "km",
      "kn",
      "ko",
      "ky",
      "lb",
      "lt",
      "lv",
      "mk",
      "ml",
      "mn",
      "mr",
      "ms",
      "mt",
      "nb",
      "nl",
      "nn",
      "pl",
      "pt",
      "ro",
      "ru",
      "si",
      "sk",
      "sl",
      "sq",
      "sr",
      "sv",
      "sw",
      "ta",
      "te",
      "uk",
      "ur",
      "uz",
      "vi",
      "zh"
    ]
  },
  timeStyle: {
    required: !1,
    control: "select",
    type: "string",
    defaultValue: "none",
    options: ["full", "long", "medium", "short", "none"]
  },
  timeZone: {
    description: `Time zone used to format the date.

Use "UTC" for deterministic UTC output, "visitor" to use the browser time
zone after hydration, or an IANA time zone like "Europe/Berlin".`,
    required: !1,
    control: "text",
    type: "string",
    defaultValue: "UTC"
  }
}, Jt = {
  category: "localization",
  description: "Converts machine-readable date and time to a human-readable format.",
  contentModel: {
    category: "instance",
    children: []
  },
  presetStyle: {
    time: pe
  },
  initialProps: [
    "datetime",
    "language",
    "country",
    "dateStyle",
    "timeStyle",
    "timeZone",
    "format"
  ],
  props: {
    ...e,
    datetime: {
      type: "string",
      control: "text",
      required: !1,
      contentMode: !0
    },
    language: {
      ...e.language,
      contentMode: !0
    },
    country: {
      ...e.country,
      contentMode: !0
    },
    dateStyle: {
      ...e.dateStyle,
      contentMode: !0
    },
    timeStyle: {
      ...e.timeStyle,
      contentMode: !0
    },
    timeZone: {
      required: !1,
      control: "timeZone",
      type: "string",
      defaultValue: "UTC",
      options: ["UTC", "visitor"],
      description: 'Timezone used to display the date. Use "visitor" to display each visitor’s browser timezone after the page loads, or select/type an IANA timezone like "Europe/Berlin".',
      contentMode: !0
    },
    format: {
      ...e.format,
      contentMode: !0
    }
  }
}, rt = {}, at = {
  select: [
    ...ce,
    {
      property: "display",
      value: { type: "keyword", value: "block" }
    }
  ]
}, jt = {
  presetStyle: at,
  initialProps: [
    "id",
    "class",
    "name",
    "value",
    "multiple",
    "required",
    "autofocus"
  ],
  props: rt
}, nt = {}, it = {
  option: [
    {
      property: "background-color",
      state: ":checked",
      value: {
        type: "rgb",
        alpha: 1,
        r: 209,
        g: 209,
        b: 209
      }
    }
  ]
}, Xt = {
  category: "hidden",
  description: "An item within a drop-down menu that users can select as their chosen value.",
  presetStyle: it,
  states: [
    // Applies when option is being activated (clicked)
    { selector: ":active", label: "Active" },
    // Applies to the currently selected option
    { selector: ":checked", label: "Checked" },
    // For <option> elements: The :default pseudo-class selects the <option> that has the selected attribute when the page loads. This is true even if the user later selects a different option.
    { selector: ":default", label: "Default" },
    { selector: ":hover", label: "Hover" },
    { selector: ":disabled", label: "Disabled" }
  ],
  initialProps: ["label", "value", "label", "disabled"],
  props: nt
}, lt = {}, Qt = {
  icon: M,
  description: "Inserts children into the head of the document",
  contentModel: {
    category: "instance",
    children: ["HeadLink", "HeadMeta", "HeadTitle"]
  },
  props: lt
}, st = {}, eo = {
  icon: $,
  contentModel: {
    category: "none",
    children: []
  },
  initialProps: ["rel", "hrefLang", "href", "type", "as"],
  props: st
}, pt = {}, to = {
  icon: T,
  contentModel: {
    category: "none",
    children: []
  },
  initialProps: ["name", "property", "content"],
  props: pt
}, ct = {}, oo = {
  icon: x,
  contentModel: {
    category: "none",
    children: ["text"]
  },
  props: ct
}, dt = {}, ro = {
  icon: P,
  contentModel: {
    category: "instance",
    children: []
  },
  presetStyle: {
    video: [
      {
        property: "max-width",
        value: { type: "unit", unit: "%", value: 100 }
      }
    ]
  },
  initialProps: [
    "id",
    "class",
    "width",
    "height",
    "src",
    "autoPlay",
    "controls",
    "loop",
    "muted",
    "preload",
    "playsInline"
  ],
  props: {
    ...dt,
    // Automatically generated props don't have the right control.
    src: {
      type: "string",
      control: "file",
      label: "Source",
      required: !1,
      accept: ".mp4,.webm,.mpg,.mpeg,.mov",
      contentMode: !0
    },
    width: {
      type: "number",
      control: "number",
      required: !1,
      contentMode: !0
    },
    height: {
      type: "number",
      control: "number",
      required: !1,
      contentMode: !0
    }
  }
};
export {
  At as Blockquote,
  vt as Body,
  Tt as Bold,
  wt as Box,
  It as Button,
  Ut as Checkbox,
  Ot as CodeText,
  Dt as Form,
  ft as Fragment,
  eo as HeadLink,
  to as HeadMeta,
  Qt as HeadSlot,
  oo as HeadTitle,
  qt as Heading,
  bt as HtmlEmbed,
  r as Image,
  Ct as Input,
  xt as Italic,
  Rt as Label,
  ve as Link,
  Bt as List,
  Lt as ListItem,
  gt as MarkdownEmbed,
  Xt as Option,
  kt as Paragraph,
  Yt as RadioButton,
  Wt as RemixForm,
  Mt as RichTextLink,
  jt as Select,
  Et as Separator,
  mt as Slot,
  $t as Span,
  Vt as Subscript,
  Pt as Superscript,
  St as Text,
  Nt as Textarea,
  Jt as Time,
  ro as Video,
  Ht as Vimeo,
  Ft as VimeoPlayButton,
  Gt as VimeoPreviewImage,
  Kt as VimeoSpinner,
  Zt as XmlNode,
  _t as XmlTime,
  zt as YouTube
};
