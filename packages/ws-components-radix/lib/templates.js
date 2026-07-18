import { jsx as e, jsxs as l } from "react/jsx-runtime";
import { createProxy as N, PlaceholderValue as a, css as o, $ as r } from "@webstudio-is/template";
import { MenuIcon as A, LargeXIcon as S, CheckMarkIcon as M, ChevronDownIcon as E, DotIcon as P } from "@webstudio-is/icons/svg";
const t = N("@webstudio-is/sdk-components-react-radix:"), p = {
  sm: "0.875rem",
  lg: "1.125rem"
}, $ = {
  sm: "1.25rem"
}, x = {
  none: "1",
  snug: "1.375"
}, k = {
  medium: "500"
}, H = {
  tight: "-0.025em"
}, n = {
  0: "0px",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
  px: "1px",
  "0.5": "0.125rem",
  "1.5": "0.375rem",
  "2.5": "0.625rem",
  "3.5": "0.875rem"
}, g = {
  ...n,
  full: "100%"
}, h = {
  ...n
}, U = {
  sm: "24rem",
  lg: "32rem"
}, b = {
  2: "2px",
  DEFAULT: "1px"
}, c = {
  sm: "0.125rem",
  md: "0.375rem",
  full: "9999px"
}, i = {
  popover: "rgb(255, 255, 255)",
  popoverForeground: "rgb(2, 8, 23)",
  border: "rgb(226, 232, 240)",
  background: "rgb(255, 255, 255)",
  foreground: "hsl(222.2 84% 4.9%)",
  ring: "rgb(148, 163, 184)",
  mutedForeground: "rgb(100, 116, 139)",
  muted: "hsl(210 40% 96.1%)",
  primary: "rgb(15, 23, 42)",
  primaryForeground: "hsl(210 40% 98%)",
  accent: "rgb(241, 245, 249)",
  accentForeground: "rgb(15, 23, 42)",
  input: "rgb(226, 232, 240)"
}, v = {
  all: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  transform: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
}, u = {
  50: "0.5",
  70: "0.7",
  100: "1"
}, R = {
  2: "2px"
}, F = {
  2: "2px"
}, d = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  // 0 0 0 ringOffsetWidth ringOffsetColor
  // 0 0 0 ringWidth + ringOffsetWidth ringColor
  ring: `0 0 0 ${F[2]} ${i.background}, 0 0 0 calc(${R[2]} + ${F[2]}) ${i.ring}`
}, w = {
  50: "50"
}, j = {
  sm: "blur(0 1px 2px 0 rgb(0 0 0 / 0.05))"
}, oe = {
  category: "radix",
  description: "An accessible label to describe the purpose of an input. Match the “For” property on the label with the “ID” of the input to connect them.",
  order: 102,
  template: /* @__PURE__ */ e(
    t.Label,
    {
      "ws:style": o`
        font-size: ${p.sm};
        line-height: ${x.none};
        font-weight: ${k.medium};
      `,
      children: new a("Form Label")
    }
  )
}, B = o`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: ${c.md};
  padding: ${n[1.5]} ${n[3]};
  font-size: ${p.sm};
  line-height: ${$.sm};
  font-weight: ${k.medium};
  transition: ${v.all};
  &:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: ${d.ring};
  }
  &:disabled {
    pointer-events: none;
    opacity: ${u[50]};
  }
  &[data-state="active"] {
    background-color: ${i.background};
    color: ${i.foreground};
    box-shadow: ${d.sm};
  }
`, L = o`
  margin-top: ${n[2]};
  &:focus-visible {
    outline: none;
    box-shadow: ${d.ring};
  }
`, ne = {
  category: "radix",
  description: "A set of panels with content that are displayed one at a time. Duplicate both a tab trigger and tab content to add more tabs. Triggers and content are connected according to their order in the Navigator.",
  order: 2,
  template: /* @__PURE__ */ l(t.Tabs, { value: "0", children: [
    /* @__PURE__ */ l(
      t.TabsList,
      {
        "ws:style": o`
          display: inline-flex;
          height: ${h[10]};
          align-items: center;
          justify-content: center;
          border-radius: ${c.md};
          background-color: ${i.muted};
          padding: ${n[1]};
          color: ${i.mutedForeground};
        `,
        children: [
          /* @__PURE__ */ e(t.TabsTrigger, { "ws:style": B, children: new a("Account") }),
          /* @__PURE__ */ e(t.TabsTrigger, { "ws:style": B, children: new a("Password") })
        ]
      }
    ),
    /* @__PURE__ */ e(t.TabsContent, { "ws:style": L, children: new a("Make changes to your account here.") }),
    /* @__PURE__ */ e(t.TabsContent, { "ws:style": L, children: new a("Change your password here.") })
  ] })
}, G = o`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 0 solid ${i.border};
  border-radius: ${c.md};
  font-size: ${p.sm};
  line-height: ${$.sm};
  font-weight: ${k.medium};
  &:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: ${d.ring};
  }
  &:disabled {
    pointer-events: none;
    opacity: ${u[50]};
  }
`, V = o`
  &:hover {
    background-color: ${i.accent};
    color: ${i.accentForeground};
  }
`, W = o`
  border: ${b.DEFAULT} solid ${i.input};
  background-color: ${i.background};
  &:hover {
    background-color: ${i.accent};
    color: ${i.accentForeground};
  }
`, O = o`
  height: ${h[10]};
  padding: ${n[2]} ${n[4]};
`, Y = o`
  height: ${h[9]};
  border-radius: ${c.md};
  padding: 0 ${n[3]};
`, X = o`
  height: ${n[10]};
  width: ${n[10]};
  padding: ${n[0]} ${n[1.5]};
`, f = (s, m = "default") => {
  const y = [...G];
  return s === "ghost" && y.push(...V), s === "outline" && y.push(...W), m === "default" && y.push(...O), m === "sm" && y.push(...Y), m === "icon" && y.push(...X), y;
}, ie = {
  category: "radix",
  icon: A,
  description: "Displays content in a menu that slides out from the side of the screen, triggered by a button. Use this component for a typical mobile hamburger menu.",
  order: 1,
  template: /* @__PURE__ */ l(t.Dialog, { "ws:label": "Sheet", children: [
    /* @__PURE__ */ e(t.DialogTrigger, { "ws:label": "Sheet Trigger", children: /* @__PURE__ */ e(r.Button, { "ws:style": f("ghost", "icon"), children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Hamburger Menu Svg", code: A }) }) }),
    /* @__PURE__ */ e(
      t.DialogOverlay,
      {
        "ws:label": "Sheet Overlay",
        "ws:style": o`
          position: fixed;
          inset: 0;
          z-index: ${w[50]};
          background-color: rgb(255 255 255 / 0.8);
          backdrop-filter: ${j.sm};
          /* To allow positioning Content */
          display: flex;
          flex-direction: column;
          overflow: auto;
        `,
        children: /* @__PURE__ */ l(
          t.DialogContent,
          {
            "ws:label": "Sheet Content",
            "ws:style": o`
            width: ${g.full};
            z-index: ${w[50]};
            display: flex;
            flex-direction: column;
            gap: ${n[4]};
            border: ${b.DEFAULT} solid ${i.border};
            background-color: ${i.background};
            padding: ${n[6]};
            box-shadow: ${d.lg};
            position: relative;
            /* side=left */
            margin-right: auto;
            max-width: ${U.sm};
            flex-grow: 1;
          `,
            children: [
              /* @__PURE__ */ l(r.Box, { "ws:label": "Navigation", "ws:tag": "nav", children: [
                /* @__PURE__ */ l(
                  r.Box,
                  {
                    "ws:label": "Sheet Header",
                    "ws:style": o`
                display: flex;
                flex-direction: column;
                gap: ${n[2]};
              `,
                    children: [
                      /* @__PURE__ */ e(
                        t.DialogTitle,
                        {
                          "ws:label": "Sheet Title",
                          "ws:style": o`
                  font-size: ${p.lg};
                  line-height: ${x.none};
                  letter-spacing: ${H.tight};
                  margin: 0;
                `,
                          children: new a("Sheet Title")
                        }
                      ),
                      /* @__PURE__ */ e(
                        t.DialogDescription,
                        {
                          "ws:label": "Sheet Description",
                          "ws:style": o`
                  font-size: ${p.sm};
                  line-height: ${$.sm};
                  color: ${i.mutedForeground};
                  margin: 0;
                `,
                          children: new a("Sheet description text you can edit")
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ e(r.Text, { children: new a("The text you can edit") })
              ] }),
              /* @__PURE__ */ e(
                t.DialogClose,
                {
                  "ws:label": "Close Button",
                  "ws:style": o`
              position: absolute;
              right: ${n[4]};
              top: ${n[4]};
              border-radius: ${c.sm};
              opacity: ${u[70]};
              display: flex;
              align-items: center;
              justify-content: center;
              height: ${h[4]};
              width: ${h[4]};
              border: 0;
              background-color: transparent;
              outline: none;
              &:hover {
                opacity: ${u[100]};
              }
              &:focus-visible {
                box-shadow: ${d.ring};
              }
            `,
                  children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Close Icon", code: S })
                }
              )
            ]
          }
        )
      }
    )
  ] })
}, re = {
  category: "radix",
  description: "Displays content with an overlay that covers the window, triggered by a button. Clicking the overlay will close the dialog.",
  order: 4,
  template: /* @__PURE__ */ l(t.Dialog, { children: [
    /* @__PURE__ */ e(t.DialogTrigger, { children: /* @__PURE__ */ e(r.Button, { "ws:style": f("outline"), children: new a("Button") }) }),
    /* @__PURE__ */ e(
      t.DialogOverlay,
      {
        "ws:style": o`
          position: fixed;
          inset: 0;
          z-index: ${w[50]};
          background-color: rgb(255 255 255 / 0.8);
          backdrop-filter: ${j.sm};
          /* To allow positioning Content */
          display: flex;
          overflow: auto;
        `,
        children: /* @__PURE__ */ l(
          t.DialogContent,
          {
            "ws:style": o`
            width: ${g.full};
            z-index: ${w[50]};
            display: flex;
            flex-direction: column;
            gap: ${n[4]};
            margin: auto;
            max-width: ${U.lg};
            border: ${b.DEFAULT} solid ${i.border};
            background-color: ${i.background};
            padding: ${n[6]};
            box-shadow: ${d.lg};
            position: relative;
          `,
            children: [
              /* @__PURE__ */ l(
                r.Box,
                {
                  "ws:label": "Dialog Header",
                  "ws:style": o`
              display: flex;
              flex-direction: column;
              gap: ${n[2]};
            `,
                  children: [
                    /* @__PURE__ */ e(
                      t.DialogTitle,
                      {
                        "ws:style": o`
                font-size: ${p.lg};
                line-height: ${x.none};
                letter-spacing: ${H.tight};
                margin: 0;
              `,
                        children: new a("Dialog Title you can edit")
                      }
                    ),
                    /* @__PURE__ */ e(
                      t.DialogDescription,
                      {
                        "ws:style": o`
                font-size: ${p.sm};
                line-height: ${$.sm};
                color: ${i.mutedForeground};
                margin: 0;
              `,
                        children: new a("Dialog description text you can edit")
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ e(r.Text, { children: new a("The text you can edit") }),
              /* @__PURE__ */ e(
                t.DialogClose,
                {
                  "ws:label": "Close Button",
                  "ws:style": o`
              position: absolute;
              right: ${n[4]};
              top: ${n[4]};
              border-radius: ${c.sm};
              opacity: ${u[70]};
              display: flex;
              align-items: center;
              justify-content: center;
              height: ${h[4]};
              width: ${h[4]};
              border: 0;
              background-color: transparent;
              outline: none;
              &:hover {
                opacity: ${u[100]};
              }
              &:focus-visible {
                box-shadow: ${d.ring};
              }
            `,
                  children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Close Icon", code: S })
                }
              )
            ]
          }
        )
      }
    )
  ] })
}, le = {
  category: "radix",
  description: "A control that allows the user to toggle between checked and not checked.",
  order: 11,
  template: /* @__PURE__ */ e(
    t.Switch,
    {
      "ws:style": o`
        display: inline-flex;
        height: 24px;
        width: 44px;
        flex-shrink: 0;
        cursor: pointer;
        align-items: center;
        border-radius: ${c.full};
        border: ${b[2]} solid transparent;
        transition: ${v.all};
        &:focus-visible {
          outline: none;
          box-shadow: ${d.ring};
        }
        &:disabled {
          cursor: not-allowed;
          opacity: ${u[50]};
        }
        &[data-state="checked"] {
          background-color: ${i.primary};
        }
        &[data-state="unchecked"] {
          background-color: ${i.input};
        }
      `,
      children: /* @__PURE__ */ e(
        t.SwitchThumb,
        {
          "ws:style": o`
          pointer-events: none;
          display: block;
          height: ${h[5]};
          width: ${g[5]};
          border-radius: ${c.full};
          background-color: ${i.background};
          box-shadow: ${d.lg};
          transition: ${v.transform};
          &[data-state="checked"] {
            transform: translateX(20px);
          }
          &[data-state="unchecked"] {
            transform: translateX(0px);
          }
        `
        }
      )
    }
  )
}, ae = {
  category: "radix",
  description: "Use within a form to allow your users to toggle between checked and not checked. Group checkboxes by matching their “Name” properties. Unlike radios, any number of checkboxes in a group can be checked.",
  order: 101,
  template: /* @__PURE__ */ l(
    t.Label,
    {
      "ws:label": "Checkbox Field",
      "ws:style": o`
        display: flex;
        gap: ${n[2]};
        align-items: center;
      `,
      children: [
        /* @__PURE__ */ e(
          t.Checkbox,
          {
            "ws:style": o`
          height: ${h[4]};
          width: ${g[4]};
          flex-shrink: 0;
          border-radius: ${c.sm};
          border: ${b.DEFAULT} solid ${i.primary};
          &:focus-visible {
            outline: none;
            box-shadow: ${d.ring};
          }
          &:disabled {
            cursor: not-allowed;
            opacity: ${u[50]};
          }
          &[data-state="checked"] {
            background-color: ${i.primary};
            color: ${i.primaryForeground};
          }
        `,
            children: /* @__PURE__ */ e(
              t.CheckboxIndicator,
              {
                "ws:style": o`
            display: flex;
            align-items: center;
            justify-content: center;
            color: currentColor;
          `,
                children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Indicator Icon", code: M })
              }
            )
          }
        ),
        /* @__PURE__ */ e(r.Text, { "ws:label": "Checkbox Label", "ws:tag": "span", children: new a("Checkbox") })
      ]
    }
  )
}, se = {
  category: "radix",
  description: "An interactive component which expands and collapses some content, triggered by a button.",
  order: 5,
  template: /* @__PURE__ */ l(t.Collapsible, { children: [
    /* @__PURE__ */ e(t.CollapsibleTrigger, { children: /* @__PURE__ */ e(r.Button, { "ws:style": f("outline"), children: new a("Click to toggle content") }) }),
    /* @__PURE__ */ e(t.CollapsibleContent, { children: /* @__PURE__ */ e(r.Text, { children: new a("Collapsible Content") }) })
  ] })
}, T = (s, m) => /* @__PURE__ */ l(
  t.AccordionItem,
  {
    "ws:style": o`
        border-bottom: ${b.DEFAULT} solid ${i.border};
      `,
    children: [
      /* @__PURE__ */ e(
        t.AccordionHeader,
        {
          "ws:style": o`
          display: flex;
        `,
          children: /* @__PURE__ */ l(
            t.AccordionTrigger,
            {
              "ws:style": o`
            display: flex;
            flex: 1 1 0;
            align-items: center;
            justify-content: between;
            padding: ${n[4]} 0;
            font-weight: ${k.medium};
            --accordion-trigger-icon-transform: 0deg;
            &:hover {
              text-decoration-line: underline;
            }
            &[data-state="open"] {
              --accordion-trigger-icon-transform: 180deg;
            }
          `,
              children: [
                /* @__PURE__ */ e(r.Text, { children: new a(s) }),
                /* @__PURE__ */ e(
                  r.Box,
                  {
                    "ws:label": "Icon Container",
                    "ws:style": o`
              rotate: var(--accordion-trigger-icon-transform);
              height: ${h[4]};
              width: ${g[4]};
              flex-shrink: 0;
              transition: ${v.all};
              transition-duration: 200ms;
            `,
                    children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Chevron Icon", code: E })
                  }
                )
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ e(
        t.AccordionContent,
        {
          forceMount: !0,
          "ws:style": o`
          overflow: hidden;
          font-size: ${p.sm};
          line-height: ${$.sm};
          transition: ${v.all};
          &[data-state="closed"] {
            height: 0;
          }
          &[data-state="open"] {
            height: var(--radix-accordion-content-height);
          }
        `,
          children: new a(m)
        }
      )
    ]
  }
), ce = {
  category: "radix",
  description: "A vertically stacked set of interactive headings that each reveal an associated section of content. Clicking on the heading will open the item and close other items.",
  order: 3,
  template: /* @__PURE__ */ l(t.Accordion, { collapsible: !0, value: "0", children: [
    T(
      "Is it accessible?",
      "Yes. It adheres to the WAI-ARIA design pattern."
    ),
    T(
      "Is it styled?",
      "Yes. It comes with default styles that matches the other components' aesthetic."
    ),
    T(
      "Is it animated?",
      "Yes. It's animated by default, but you can disable it if you prefer."
    )
  ] })
}, de = {
  category: "radix",
  description: "Displays content that is related to the trigger, when the trigger is hovered with the mouse or focused with the keyboard. You are reading an example of a tooltip right now.",
  order: 7,
  template: /* @__PURE__ */ l(t.Tooltip, { children: [
    /* @__PURE__ */ e(t.TooltipTrigger, { children: /* @__PURE__ */ e(r.Button, { "ws:style": f("outline"), children: new a("Button") }) }),
    /* @__PURE__ */ e(
      t.TooltipContent,
      {
        "ws:style": o`
          z-index: ${w[50]};
          overflow: hidden;
          border-radius: ${c.md};
          background-color: ${i.popover};
          padding: ${n[1.5]} ${n[3]};
          font-size: ${p.sm};
          line-height: ${$.sm};
          color: ${i.popoverForeground};
          box-shadow: ${d.md};
        `,
        children: /* @__PURE__ */ e(r.Text, { children: new a("The text you can edit") })
      }
    )
  ] })
}, he = {
  category: "radix",
  description: "Displays rich content in a portal, triggered by a button.",
  order: 6,
  template: /* @__PURE__ */ l(t.Popover, { children: [
    /* @__PURE__ */ e(t.PopoverTrigger, { children: /* @__PURE__ */ e(r.Button, { "ws:style": f("outline"), children: new a("Button") }) }),
    /* @__PURE__ */ l(
      t.PopoverContent,
      {
        "ws:style": o`
          z-index: ${w[50]};
          width: ${g[72]};
          border-radius: ${c.md};
          border: ${b.DEFAULT} solid ${i.border};
          background-color: ${i.popover};
          padding: ${n[4]};
          color: ${i.popoverForeground};
          box-shadow: ${d.md};
          outline: none;
        `,
        children: [
          /* @__PURE__ */ e(r.Text, { children: new a("The text you can edit") }),
          /* @__PURE__ */ e(
            t.PopoverClose,
            {
              "ws:label": "Close Button",
              "ws:style": o`
            position: absolute;
            right: ${n[4]};
            top: ${n[4]};
            border-radius: ${c.sm};
            display: flex;
            align-items: center;
            justify-content: center;
            height: ${h[4]};
            width: ${h[4]};
            border: 0;
            background-color: transparent;
            outline: none;
            &:hover {
              opacity: ${u[100]};
            }
            &:focus-visible {
              box-shadow: ${d.ring};
            }
          `,
              children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Close Icon", code: S })
            }
          )
        ]
      }
    )
  ] })
}, C = ({
  value: s,
  label: m
}) => /* @__PURE__ */ l(
  t.Label,
  {
    "ws:style": o`
      display: flex;
      align-items: center;
      gap: ${n[2]};
    `,
    children: [
      /* @__PURE__ */ e(
        t.RadioGroupItem,
        {
          value: s,
          "ws:style": o`
        aspect-ratio: 1 / 1;
        height: ${h[4]};
        width: ${g[4]};
        border-radius: ${c.full};
        border: ${b.DEFAULT} solid ${i.primary};
        color: ${i.primary};
        &:focus-visible {
          outline: none;
          box-shadow: ${d.ring};
        }
        &:disabled {
          cursor: not-allowed;
          opacity: ${u[50]};
        }
      `,
          children: /* @__PURE__ */ e(t.RadioGroupIndicator, { children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Indicator Icon", code: P }) })
        }
      ),
      /* @__PURE__ */ e(r.Text, { children: new a(m) })
    ]
  }
), ge = {
  category: "radix",
  order: 100,
  description: "A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.",
  template: /* @__PURE__ */ l(
    t.RadioGroup,
    {
      "ws:style": o`
        display: flex;
        flex-direction: column;
        gap: ${n[2]};
      `,
      children: [
        C({ value: "default", label: "Default" }),
        C({ value: "comfortable", label: "Comfortable" }),
        C({ value: "compact", label: "Compact" })
      ]
    }
  )
}, D = (s, m) => /* @__PURE__ */ l(
  t.SelectItem,
  {
    value: s,
    "ws:style": o`
        position: relative;
        display: flex;
        width: ${g.full};
        cursor: default;
        user-select: none;
        align-items: center;
        border-radius: ${c.md};
        padding: ${n[1.5]} ${n[2]} ${n[1.5]} ${n[8]};
        font-size: ${p.sm};
        line-height: ${$.sm};
        outline: none;
        &:focus {
          background-color: ${i.accent};
          color: ${i.accentForeground};
        }
        &[data-disabled] {
          pointer-events: none;
          opacity: ${u[50]};
        }
      `,
    children: [
      /* @__PURE__ */ e(
        t.SelectItemIndicator,
        {
          "ws:style": o`
          position: absolute;
          left: ${n[2]};
          display: flex;
          height: ${h[3.5]};
          width: ${g[3.5]};
          align-items: center;
          justify-content: center;
        `,
          children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Indicator Icon", code: M })
        }
      ),
      /* @__PURE__ */ e(t.SelectItemText, { children: new a(m) })
    ]
  }
), pe = {
  category: "radix",
  description: "Use within a form to give your users a list of options to choose from.",
  order: 10,
  template: /* @__PURE__ */ l(t.Select, { children: [
    /* @__PURE__ */ e(
      t.SelectTrigger,
      {
        "ws:style": o`
          display: flex;
          height: ${h[10]};
          width: ${g.full};
          align-items: center;
          justify-content: between;
          border-radius: ${c.md};
          border: ${b.DEFAULT} solid ${i.input};
          background-color: ${i.background};
          padding: ${n[2]} ${n[3]};
          font-size: ${p.sm};
          line-height: ${$.sm};
          &::placeholder {
            color: ${i.mutedForeground};
          }
          &:focus-visible {
            outline: none;
            box-shadow: ${d.ring};
          }
          &:disabled {
            cursor: not-allowed;
            opacity: ${u[50]};
          }
        `,
        children: /* @__PURE__ */ e(t.SelectValue, { placeholder: "Theme" })
      }
    ),
    /* @__PURE__ */ e(
      t.SelectContent,
      {
        "ws:style": o`
          position: relative;
          z-index: ${w[50]};
          min-width: 8rem;
          overflow: hidden;
          border-radius: ${c.md};
          border: ${b.DEFAULT} solid ${i.border};
          background-color: ${i.popover};
          color: ${i.popoverForeground};
          box-shadow: ${d.md};
        `,
        children: /* @__PURE__ */ l(
          t.SelectViewport,
          {
            "ws:style": o`
            padding: ${n[1]};
            height: var(--radix-select-trigger-height);
            width: ${g.full};
            min-width: var(--radix-select-trigger-width);
          `,
            children: [
              D("light", "Light"),
              D("dark", "Dark"),
              D("system", "System")
            ]
          }
        )
      }
    )
  ] })
}, q = [
  {
    title: "Sheet",
    href: "/docs/components/sheet",
    description: "Extends the Dialog component to display content that complements the main content of the screen."
  },
  {
    title: "Navigation Menu",
    href: "/docs/components/navigation-menu",
    description: "A collection of links for navigating websites."
  },
  {
    title: "Tabs",
    href: "/docs/components/tabs",
    description: "A set of layered sections of content—known as tab panels—that are displayed one at a time."
  },
  {
    title: "Accordion",
    href: "/docs/components/accordion",
    description: "A vertically stacked set of interactive headings that each reveal a section of content."
  },
  {
    title: "Dialog",
    href: "/docs/components/dialog",
    description: "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert."
  },
  {
    title: "Collapsible",
    href: "/docs/components/collapsible",
    description: "An interactive component which expands/collapses a panel."
  },
  {
    title: "Popover",
    href: "/docs/components/popover",
    description: "Displays rich content in a portal, triggered by a button."
  },
  {
    title: "Tooltip",
    href: "/docs/components/tooltip",
    description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
  },
  {
    title: "Button",
    href: "/docs/components/button",
    description: "Displays a button or a component that looks like a button."
  }
], J = (s) => /* @__PURE__ */ e(t.NavigationMenuLink, { children: /* @__PURE__ */ l(
  r.Link,
  {
    href: `https://ui.shadcn.com${s.href}`,
    "ws:style": o`
        color: inherit;
        display: flex;
        flex-direction: column;
        user-select: none;
        gap: ${n[1]};
        border-radius: ${c.md};
        padding: ${n[3]};
        line-height: ${x.none};
        text-decoration-line: none;
        outline: none;
        &:hover,
        &:focus {
          background-color: ${i.accent};
          color: ${i.accentForeground};
        }
      `,
    children: [
      /* @__PURE__ */ e(
        r.Text,
        {
          "ws:style": o`
          font-size: ${p.sm};
          font-weight: ${k.medium};
          line-height: ${x.none};
        `,
          children: new a(s.title)
        }
      ),
      /* @__PURE__ */ e(
        r.Paragraph,
        {
          "ws:style": o`
          margin: 0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          font-size: ${p.sm};
          line-height: ${x.snug};
          color: ${i.mutedForeground};
        `,
          children: new a(s.description)
        }
      )
    ]
  }
) }, s.title), I = (s) => /* @__PURE__ */ e(
  r.Box,
  {
    "ws:label": "Flex Column",
    "ws:style": o`
      width: ${g[64]};
      display: flex;
      gap: ${n[4]};
      flex-direction: column;
    `,
    children: q.slice(s.offset, s.offset + s.count).map(J)
  }
), K = /* @__PURE__ */ l(
  r.Box,
  {
    "ws:label": "Content",
    "ws:style": o`
      display: flex;
      gap: ${n[4]};
      padding: ${n[2]};
    `,
    children: [
      /* @__PURE__ */ e(
        r.Box,
        {
          "ws:style": o`
        background-color: ${i.border};
        padding: ${n[4]};
        width: ${g[48]};
        border-radius: ${c.md};
      `,
          children: new a("")
        }
      ),
      I({ count: 3, offset: 0 })
    ]
  }
), Q = /* @__PURE__ */ l(
  r.Box,
  {
    "ws:label": "Content",
    "ws:style": o`
      display: flex;
      gap: ${n[4]};
    `,
    children: [
      I({ count: 3, offset: 3 }),
      I({ count: 3, offset: 6 })
    ]
  }
), z = (s, m) => /* @__PURE__ */ l(t.NavigationMenuItem, { children: [
  /* @__PURE__ */ e(t.NavigationMenuTrigger, { children: /* @__PURE__ */ l(
    r.Button,
    {
      "ws:style": [
        ...f("ghost", "sm"),
        ...o`
              --navigation-menu-trigger-icon-transform: 0deg;
              &[data-state="open"] {
                --navigation-menu-trigger-icon-transform: 180deg;
              }
            `
      ],
      children: [
        /* @__PURE__ */ e(r.Text, { children: new a(s) }),
        /* @__PURE__ */ e(
          r.Box,
          {
            "ws:label": "Icon Container",
            "ws:style": o`
              margin-left: ${n[1]};
              rotate: var(--navigation-menu-trigger-icon-transform);
              height: ${h[4]};
              width: ${g[4]};
              flex-shrink: 0;
              transition: ${v.all};
              transition-duration: 200ms;
            `,
            children: /* @__PURE__ */ e(r.HtmlEmbed, { "ws:label": "Chevron Icon", code: E })
          }
        )
      ]
    }
  ) }),
  /* @__PURE__ */ e(
    t.NavigationMenuContent,
    {
      "ws:style": o`
          left: 0;
          top: 0;
          position: absolute;
          width: max-content;
          padding: ${n[4]};
        `,
      children: m
    }
  )
] }), Z = (s) => /* @__PURE__ */ e(t.NavigationMenuItem, { children: /* @__PURE__ */ e(t.NavigationMenuLink, { children: /* @__PURE__ */ e(
  r.Link,
  {
    "ws:style": [
      ...f("ghost", "sm"),
      ...o`
              text-decoration-line: none;
              color: currentColor;
            `
    ],
    children: new a(s)
  }
) }) }), ue = {
  category: "radix",
  description: "A collection of links for navigating websites.",
  order: 2,
  template: /* @__PURE__ */ l(
    t.NavigationMenu,
    {
      "ws:style": o`
        position: relative;
        max-width: max-content;
      `,
      children: [
        /* @__PURE__ */ l(
          t.NavigationMenuList,
          {
            "ws:style": o`
          /* ul defaults in tailwind */
          padding: 0;
          margin: 0;
          /* shadcdn styles */
          display: flex;
          flex: 1 1 0;
          list-style-type: none;
          align-items: center;
          justify-content: center;
          gap: ${n[1]};
        `,
            children: [
              z("About", K),
              z("Components", Q),
              Z("Standalone")
            ]
          }
        ),
        /* @__PURE__ */ e(
          r.Box,
          {
            "ws:label": "Viewport Container",
            "ws:style": o`
          position: absolute;
          left: 0;
          top: 100%;
          display: flex;
          justify-content: center;
        `,
            children: /* @__PURE__ */ e(
              t.NavigationMenuViewport,
              {
                "ws:style": o`
            position: relative;
            margin-top: ${n[1.5]};
            overflow: hidden;
            border-radius: ${c.md};
            border: ${b.DEFAULT} solid ${i.border};
            background-color: ${i.popover};
            color: ${i.popoverForeground};
            box-shadow: ${d.lg};
            height: var(--radix-navigation-menu-viewport-height);
            width: var(--radix-navigation-menu-viewport-width);
          `
              }
            )
          }
        )
      ]
    }
  )
};
export {
  ce as Accordion,
  ae as Checkbox,
  se as Collapsible,
  re as Dialog,
  oe as Label,
  ue as NavigationMenu,
  he as Popover,
  ge as RadioGroup,
  pe as Select,
  ie as Sheet,
  le as Switch,
  ne as Tabs,
  de as Tooltip
};
