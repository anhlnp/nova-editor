import { CollapsibleIcon as v, ContentIcon as r, TriggerIcon as o, DialogIcon as C, ButtonElementIcon as g, TextIcon as b, OverlayIcon as T, HeadingIcon as q, PopoverIcon as M, TooltipIcon as S, TabsIcon as x, HeaderIcon as y, LabelIcon as I, AccordionIcon as w, ItemIcon as h, NavigationMenuIcon as k, ListItemIcon as P, BoxIcon as D, ListIcon as V, ViewportIcon as f, SelectIcon as A, CheckMarkIcon as O, FormTextFieldIcon as N, SwitchIcon as W, CheckboxCheckedIcon as L, RadioGroupIcon as R } from "@webstudio-is/icons/svg";
import { div as t, p as G, h2 as H, button as a, label as U, h3 as z, span as c } from "@webstudio-is/sdk/normalize.css";
const B = (i) => new Proxy(
  {},
  {
    get(l, d) {
      return `${i}${d}`;
    }
  }
), e = B(
  "@webstudio-is/sdk-components-react-radix:"
), F = {
  disabled: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the form control is disabled"
  },
  open: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Show or hide the content of this component on the canvas. This will not affect the initial state of the component."
  }
}, $ = {}, E = {}, Ue = {
  icon: v,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.CollapsibleTrigger, e.CollapsibleContent]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    div: t
  },
  initialProps: ["open"],
  props: F
}, ze = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  props: $
}, Be = {
  icon: r,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    div: t
  },
  props: E
}, _ = {
  open: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Show or hide the content of this component on the canvas. This will not affect the initial state of the component."
  }
}, j = {}, J = {}, K = {}, Q = {}, X = {
  tag: {
    required: !1,
    control: "select",
    type: "string",
    options: ["h2", "h3", "h1", "h4", "h5", "h6"]
  }
}, Y = {}, n = (i, l, d) => ({
  property: i,
  value: { type: "unit", unit: d, value: l }
}), p = (i, l) => ({
  property: i,
  value: { type: "keyword", value: l }
}), u = (i, l, d, m) => ({
  property: i,
  value: { type: "rgb", alpha: 1, r: l, g: d, b: m }
}), s = [
  {
    property: "background-color",
    value: { type: "keyword", value: "transparent" }
  },
  {
    property: "background-image",
    value: { type: "keyword", value: "none" }
  },
  n("border-top-width", 0, "px"),
  n("border-right-width", 0, "px"),
  n("border-bottom-width", 0, "px"),
  n("border-left-width", 0, "px"),
  p("border-top-style", "solid"),
  p("border-right-style", "solid"),
  p("border-bottom-style", "solid"),
  p("border-left-style", "solid"),
  u("border-top-color", 226, 232, 240),
  u("border-right-color", 226, 232, 240),
  u("border-bottom-color", 226, 232, 240),
  u("border-left-color", 226, 232, 240),
  n("padding-top", 0, "px"),
  n("padding-right", 0, "px"),
  n("padding-bottom", 0, "px"),
  n("padding-left", 0, "px")
], Fe = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  props: j
}, $e = {
  icon: T,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.DialogContent]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: { div: t },
  props: J
}, Ee = {
  icon: r,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [
      e.DialogTitle,
      e.DialogDescription,
      e.DialogClose
    ]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: { div: t },
  props: K
}, _e = {
  icon: q,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  presetStyle: { h2: H },
  props: X
}, je = {
  icon: b,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  presetStyle: { p: G },
  props: Y
}, Je = {
  icon: g,
  label: "Close Button",
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  presetStyle: {
    button: [s, a].flat()
  },
  props: Q
}, Ke = {
  icon: C,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.DialogTrigger, e.DialogOverlay]
  },
  initialProps: ["open"],
  props: _
}, Z = {
  open: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Show or hide the content of this component on the canvas. This will not affect the initial state of the component."
  }
}, ee = {}, te = {
  align: {
    required: !1,
    control: "radio",
    type: "string",
    defaultValue: "center",
    options: ["center", "start", "end"]
  },
  alignOffset: {
    required: !1,
    control: "number",
    type: "number",
    description: "The offset in pixels from the “start“ or “end“ alignment options."
  },
  arrowPadding: { required: !1, control: "number", type: "number" },
  avoidCollisions: { required: !1, control: "boolean", type: "boolean" },
  hideWhenDetached: {
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  side: {
    required: !1,
    control: "select",
    type: "string",
    options: ["top", "right", "bottom", "left"],
    description: "The preferred alignment against the Trigger. May change when collisions occur."
  },
  sideOffset: {
    required: !1,
    control: "number",
    type: "number",
    defaultValue: 4,
    description: "The distance in pixels between the Content and the Trigger."
  },
  sticky: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["partial", "always"]
  },
  updatePositionStrategy: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["always", "optimized"]
  }
}, oe = {}, Qe = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  props: ee
}, Xe = {
  icon: r,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.PopoverClose]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    div: t
  },
  initialProps: ["side", "sideOffset", "align", "alignOffset"],
  props: te
}, Ye = {
  icon: M,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.PopoverTrigger, e.PopoverContent]
  },
  initialProps: ["open"],
  props: Z
}, Ze = {
  icon: g,
  label: "Close Button",
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  presetStyle: {
    button: [s, a].flat()
  },
  props: oe
}, ne = {
  delayDuration: {
    description: "The delay before the Tooltip shows after the Trigger is hovered, in milliseconds. If no value is specified, the default is 700ms",
    required: !1,
    control: "number",
    type: "number"
  },
  disableHoverableContent: {
    description: "When toggled, prevents the Tooltip content from showing when the Trigger is hovered.",
    required: !1,
    control: "boolean",
    type: "boolean"
  },
  open: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Show or hide the content of this component on the canvas. This will not affect the initial state of the component."
  }
}, re = {}, ae = {
  align: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["center", "start", "end"]
  },
  alignOffset: {
    required: !1,
    control: "number",
    type: "number",
    description: "The offset in pixels from the “start“ or “end“ alignment options."
  },
  "aria-label": {
    description: "A more descriptive label for accessibility purpose",
    required: !1,
    control: "text",
    type: "string"
  },
  arrowPadding: { required: !1, control: "number", type: "number" },
  avoidCollisions: { required: !1, control: "boolean", type: "boolean" },
  hideWhenDetached: {
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !0
  },
  side: {
    required: !1,
    control: "select",
    type: "string",
    options: ["top", "right", "bottom", "left"],
    description: "The preferred alignment against the Trigger. May change when collisions occur."
  },
  sideOffset: {
    required: !1,
    control: "number",
    type: "number",
    defaultValue: 4,
    description: "The distance in pixels between the Content and the Trigger."
  },
  sticky: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["partial", "always"]
  },
  updatePositionStrategy: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["always", "optimized"]
  }
}, et = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Closed", selector: '[data-state="closed"]' },
    { label: "Delayed open", selector: '[data-state="delayed-open"]' },
    { label: "Instant open", selector: '[data-state="instant-open"]' }
  ],
  props: re
}, tt = {
  icon: r,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Closed", selector: '[data-state="closed"]' },
    { label: "Delayed open", selector: '[data-state="delayed-open"]' },
    { label: "Instant open", selector: '[data-state="instant-open"]' }
  ],
  presetStyle: { div: t },
  initialProps: ["side", "sideOffset", "align", "alignOffset"],
  props: ae
}, ot = {
  icon: S,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.TooltipTrigger, e.TooltipContent]
  },
  initialProps: ["open", "delayDuration", "disableHoverableContent"],
  props: ne
}, ie = {
  activationMode: {
    description: `Whether a tab is activated automatically or manually.
@defaultValue automatic`,
    required: !1,
    control: "radio",
    type: "string",
    options: ["automatic", "manual"]
  },
  defaultValue: {
    description: "The value of the tab to select by default, if uncontrolled",
    required: !1,
    control: "text",
    type: "string"
  },
  dir: {
    description: "The direction of navigation between toolbar items.",
    required: !1,
    control: "radio",
    type: "string",
    options: ["ltr", "rtl"]
  },
  orientation: {
    description: `The orientation the tabs are layed out.
Mainly so arrow navigation is done accordingly (left & right vs. up & down)
@defaultValue horizontal`,
    required: !1,
    control: "radio",
    type: "string",
    options: ["horizontal", "vertical"]
  },
  value: {
    description: "The value for the selected tab, if controlled",
    required: !1,
    control: "text",
    type: "string"
  }
}, se = {
  loop: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether to loop the media resource"
  }
}, le = {
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, ce = {
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, nt = {
  icon: x,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.TabsList, e.TabsContent]
  },
  presetStyle: { div: t },
  props: ie
}, rt = {
  icon: y,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.TabsTrigger]
  },
  presetStyle: { div: t },
  props: se
}, at = {
  icon: o,
  label: "Tab Trigger",
  indexWithinAncestor: e.Tabs,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Active", selector: '[data-state="active"]' },
    { label: "Inactive", selector: '[data-state="inactive"]' }
  ],
  presetStyle: {
    button: [a, s].flat()
  },
  props: le
}, it = {
  label: "Tab Content",
  icon: r,
  indexWithinAncestor: e.Tabs,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Active", selector: '[data-state="active"]' },
    { label: "Inactive", selector: '[data-state="inactive"]' }
  ],
  presetStyle: { div: t },
  props: ce
}, de = {}, st = {
  icon: I,
  presetStyle: { label: U },
  initialProps: ["id", "class", "for"],
  props: de
}, pe = {
  collapsible: {
    description: "Whether an accordion item can be collapsed after it has been opened.",
    required: !1,
    control: "boolean",
    type: "boolean",
    defaultValue: !1
  },
  defaultValue: {
    description: "The value of the item whose content is expanded when the accordion is initially rendered. Use\n`defaultValue` if you do not need to control the state of an accordion.",
    required: !1,
    control: "text",
    type: "string"
  },
  dir: {
    description: "The language read direction.",
    required: !1,
    control: "radio",
    type: "string",
    options: ["ltr", "rtl"]
  },
  disabled: {
    description: `Whether or not an accordion is disabled from user interaction.
@defaultValue false`,
    required: !1,
    control: "boolean",
    type: "boolean"
  },
  orientation: {
    description: "The layout in which the Accordion operates.",
    required: !1,
    control: "radio",
    type: "string",
    defaultValue: "vertical",
    options: ["horizontal", "vertical"]
  },
  value: {
    description: "The controlled stateful value of the accordion item whose content is expanded.",
    required: !1,
    control: "text",
    type: "string"
  }
}, ue = {
  disabled: {
    description: `Whether or not an accordion item is disabled from user interaction.
@defaultValue false`,
    required: !1,
    control: "boolean",
    type: "boolean"
  },
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, he = {}, ge = {}, be = {
  forceMount: {
    description: "Used to force mounting when more control is needed. Useful when controlling animation with React animation libraries or keeping content available in the DOM.",
    required: !1,
    control: "boolean",
    type: "boolean"
  }
}, lt = {
  icon: w,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.AccordionItem]
  },
  presetStyle: { div: t },
  initialProps: ["value", "collapsible"],
  props: pe
}, ct = {
  label: "Item",
  icon: h,
  indexWithinAncestor: e.Accordion,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.AccordionHeader, e.AccordionContent]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: { div: t },
  initialProps: ["value"],
  props: ue
}, dt = {
  label: "Item Header",
  icon: y,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.AccordionTrigger]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    h3: [
      ...z,
      {
        property: "margin-top",
        value: { type: "unit", unit: "px", value: 0 }
      },
      {
        property: "margin-bottom",
        value: { type: "unit", unit: "px", value: 0 }
      }
    ]
  },
  props: he
}, pt = {
  label: "Item Trigger",
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    button: [a, s].flat()
  },
  props: ge
}, ut = {
  label: "Item Content",
  icon: r,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    div: t
  },
  props: be
}, ye = {
  defaultValue: { required: !1, control: "text", type: "string" },
  delayDuration: {
    description: `The duration from when the pointer enters the trigger until the tooltip gets opened.
@defaultValue 200`,
    required: !1,
    control: "number",
    type: "number"
  },
  dir: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["ltr", "rtl"],
    description: "The text directionality of the element"
  },
  skipDelayDuration: {
    description: `How much time a user has to enter another trigger without incurring a delay again.
@defaultValue 300`,
    required: !1,
    control: "number",
    type: "number"
  },
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, fe = {}, me = {}, ve = {}, Ce = {
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, Te = {
  active: { required: !1, control: "boolean", type: "boolean" }
}, qe = {}, ht = {
  icon: k,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.NavigationMenuList, e.NavigationMenuViewport]
  },
  presetStyle: {
    div: t
  },
  props: ye
}, gt = {
  icon: V,
  label: "Menu List",
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.NavigationMenuItem]
  },
  presetStyle: {
    div: t
  },
  props: fe
}, bt = {
  icon: P,
  label: "Menu Item",
  indexWithinAncestor: e.NavigationMenu,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [
      e.NavigationMenuTrigger,
      e.NavigationMenuContent,
      e.NavigationMenuLink
    ]
  },
  presetStyle: {
    div: t
  },
  props: Ce
}, yt = {
  icon: o,
  label: "Menu Trigger",
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  props: qe
}, ft = {
  icon: r,
  label: "Menu Content",
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.NavigationMenuLink]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    div: t
  },
  props: ve
}, mt = {
  icon: D,
  label: "Accessible Link Wrapper",
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  props: Te
}, vt = {
  icon: f,
  label: "Menu Viewport",
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: {
    div: t
  },
  props: me
}, Me = {
  autoComplete: {
    required: !1,
    control: "text",
    type: "string",
    description: "Hint for form autofill feature"
  },
  defaultValue: { required: !1, control: "text", type: "string" },
  dir: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["ltr", "rtl"],
    description: "The text directionality of the element"
  },
  disabled: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the form control is disabled"
  },
  form: {
    required: !1,
    control: "text",
    type: "string",
    description: "Associates the element with a form element"
  },
  name: {
    required: !1,
    control: "text",
    type: "string",
    description: "Name of the element to use for form submission and in the form.elements API"
  },
  open: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the dialog box is showing"
  },
  required: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is required for form submission"
  },
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, Se = {}, xe = {
  placeholder: {
    required: !1,
    control: "text",
    type: "string",
    description: "User-visible label to be placed within the form control"
  }
}, Ie = {
  align: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["center", "start", "end"]
  },
  alignOffset: { required: !1, control: "number", type: "number" },
  arrowPadding: { required: !1, control: "number", type: "number" },
  avoidCollisions: { required: !1, control: "boolean", type: "boolean" },
  hideWhenDetached: { required: !1, control: "boolean", type: "boolean" },
  sideOffset: { required: !1, control: "number", type: "number" },
  sticky: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["partial", "always"]
  },
  updatePositionStrategy: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["always", "optimized"]
  }
}, we = {
  nonce: {
    required: !1,
    control: "text",
    type: "string",
    description: "Cryptographic nonce used in Content Security Policy checks [CSP]"
  }
}, ke = {
  disabled: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the form control is disabled"
  },
  textValue: { required: !1, control: "text", type: "string" },
  value: {
    required: !0,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, Pe = {}, De = {}, Ct = {
  icon: A,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.SelectTrigger, e.SelectContent]
  },
  initialProps: ["name", "value", "open", "required"],
  props: Me
}, Tt = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.SelectValue]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: { button: a },
  props: Se
}, qt = {
  label: "Value",
  icon: N,
  contentModel: {
    category: "none",
    children: []
  },
  presetStyle: { span: c },
  initialProps: ["placeholder"],
  props: xe
}, Mt = {
  icon: r,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.SelectViewport]
  },
  states: [
    { label: "Open", selector: '[data-state="open"]' },
    { label: "Closed", selector: '[data-state="closed"]' }
  ],
  presetStyle: { div: t },
  props: Ie
}, St = {
  icon: f,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.SelectItem]
  },
  presetStyle: { div: t },
  props: we
}, xt = {
  icon: h,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.SelectItemIndicator, e.SelectItemText]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' }
  ],
  presetStyle: { div: t },
  initialProps: ["value"],
  props: ke
}, It = {
  label: "Indicator",
  icon: O,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  presetStyle: { span: c },
  props: Pe
}, wt = {
  label: "Item Text",
  icon: b,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  presetStyle: { span: c },
  props: De
}, Ve = {
  checked: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is checked"
  },
  required: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is required for form submission"
  }
}, Ae = {}, kt = {
  icon: W,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.SwitchThumb]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' }
  ],
  presetStyle: {
    button: [a, s].flat()
  },
  initialProps: ["id", "class", "name", "value", "checked", "required"],
  props: Ve
}, Pt = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' }
  ],
  presetStyle: {
    span: c
  },
  props: Ae
}, Oe = {
  checked: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is checked"
  },
  required: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is required for form submission"
  }
}, Ne = {}, Dt = {
  icon: L,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.CheckboxIndicator]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' },
    { label: "Indeterminate", selector: '[data-state="indeterminate"]' }
  ],
  presetStyle: {
    button: [a, s].flat()
  },
  initialProps: ["id", "class", "name", "value", "required", "checked"],
  props: Oe
}, Vt = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance", "rich-text"]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' },
    { label: "Indeterminate", selector: '[data-state="indeterminate"]' }
  ],
  presetStyle: {
    span: c
  },
  props: Ne
}, We = {
  defaultValue: { required: !1, control: "text", type: "string" },
  dir: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["ltr", "rtl"],
    description: "The text directionality of the element"
  },
  disabled: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the form control is disabled"
  },
  loop: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether to loop the media resource"
  },
  name: {
    required: !1,
    control: "text",
    type: "string",
    description: "Name of the element to use for form submission and in the form.elements API"
  },
  orientation: {
    required: !1,
    control: "radio",
    type: "string",
    options: ["horizontal", "vertical"]
  },
  required: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is required for form submission"
  },
  value: {
    required: !1,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, Le = {
  checked: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is checked"
  },
  required: {
    required: !1,
    control: "boolean",
    type: "boolean",
    description: "Whether the control is required for form submission"
  },
  value: {
    required: !0,
    control: "text",
    type: "string",
    description: "Current value of the element"
  }
}, Re = {}, At = {
  icon: R,
  contentModel: {
    category: "instance",
    children: ["instance"],
    descendants: [e.RadioGroupItem]
  },
  presetStyle: {
    div: t
  },
  initialProps: ["id", "class", "name", "value", "required"],
  props: We
}, Ot = {
  icon: h,
  contentModel: {
    category: "none",
    children: ["instance"],
    descendants: [e.RadioGroupIndicator]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' }
  ],
  presetStyle: {
    button: [a, s].flat()
  },
  initialProps: ["value"],
  props: Le
}, Nt = {
  icon: o,
  contentModel: {
    category: "none",
    children: ["instance"]
  },
  states: [
    { label: "Checked", selector: '[data-state="checked"]' },
    { label: "Unchecked", selector: '[data-state="unchecked"]' }
  ],
  presetStyle: {
    span: c
  },
  props: Re
};
export {
  lt as Accordion,
  ut as AccordionContent,
  dt as AccordionHeader,
  ct as AccordionItem,
  pt as AccordionTrigger,
  Dt as Checkbox,
  Vt as CheckboxIndicator,
  Ue as Collapsible,
  Be as CollapsibleContent,
  ze as CollapsibleTrigger,
  Ke as Dialog,
  Je as DialogClose,
  Ee as DialogContent,
  je as DialogDescription,
  $e as DialogOverlay,
  _e as DialogTitle,
  Fe as DialogTrigger,
  st as Label,
  ht as NavigationMenu,
  ft as NavigationMenuContent,
  bt as NavigationMenuItem,
  mt as NavigationMenuLink,
  gt as NavigationMenuList,
  yt as NavigationMenuTrigger,
  vt as NavigationMenuViewport,
  Ye as Popover,
  Ze as PopoverClose,
  Xe as PopoverContent,
  Qe as PopoverTrigger,
  At as RadioGroup,
  Nt as RadioGroupIndicator,
  Ot as RadioGroupItem,
  Ct as Select,
  Mt as SelectContent,
  xt as SelectItem,
  It as SelectItemIndicator,
  wt as SelectItemText,
  Tt as SelectTrigger,
  qt as SelectValue,
  St as SelectViewport,
  kt as Switch,
  Pt as SwitchThumb,
  nt as Tabs,
  it as TabsContent,
  rt as TabsList,
  at as TabsTrigger,
  ot as Tooltip,
  tt as TooltipContent,
  et as TooltipTrigger
};
