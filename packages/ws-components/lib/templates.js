import { jsxs as o, jsx as e } from "react/jsx-runtime";
import { $ as l, ws as t, ActionValue as w, PlaceholderValue as s, css as a, Variable as h, expression as r } from "@webstudio-is/template";
import { imagePlaceholderDataUrl as i } from "@webstudio-is/image";
import { ContentEmbedIcon as m, SpinnerIcon as d, PlayIcon as c } from "@webstudio-is/icons/svg";
const b = `
<h1>Styling HTML with Content Embed</h1>
<p>Content Embed allows styling of HTML, which primarily comes from external data.</p>
<h2>How to Use Content Embed</h2>
<ul>
  <li>Every element is shown in the Navigator.</li>
  <li>Apply styles and Tokens to each element.</li>
  <li>Adjustments to elements apply universally within this embed, ensuring consistency across your content.</li>
</ul>
<hr>
<h2>This sample text contains all the elements that can be styled.</h2>
<p>Any elements that were not used above are used below.</p>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
<p><a href="#">Links</a> connect your content to relevant resources.</p>
<p><strong>Bold text</strong> makes your important points stand out.</p>
<p><em>Italic text</em> is great for emphasizing terms.</p>
<ol>
  <li>First Step</li>
  <li>Second Step</li>
</ol>
<img src="${i}">
<blockquote>Capture attention with a powerful quote.</blockquote>
<p>Using <code>console.log("Hello World");</code> will log to the console.</p>
<table>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
    <th>Header 3</th>
  </tr>
  <tr>
    <td>Cell 1.1</td>
    <td>Cell 1.2</td>
    <td>Cell 1.3</td>
  </tr>
  <tr>
    <td>Cell 2.1</td>
    <td>Cell 2.2</td>
    <td>Cell 2.3</td>
  </tr>
  <tr>
    <td>Cell 3.1</td>
    <td>Cell 3.2</td>
    <td>Cell 3.3</td>
  </tr>
</table>
`.trim(), x = {
  category: "data",
  icon: m,
  description: "Content Embed allows styling of HTML, which can be provided via the Code property statically or loaded dynamically from any Resource, for example, from a CMS.",
  order: 3,
  template: /* @__PURE__ */ o(l.HtmlEmbed, { "ws:label": "Content Embed", code: b, children: [
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Paragraph", selector: " p" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 1", selector: " h1" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 2", selector: " h2" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 3", selector: " h3" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 4", selector: " h4" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 5", selector: " h5" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 6", selector: " h6" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Bold", selector: " :where(strong, b)" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Italic", selector: " :where(em, i)" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Link", selector: " a" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Image", selector: " img" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Blockquote", selector: " blockquote" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Code Text", selector: " code" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "List", selector: " :where(ul, ol)" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "List Item", selector: " li" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Separator", selector: " hr" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table", selector: " table" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table Row", selector: " tr" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table Header Cell", selector: " th" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table Cell", selector: " td" })
  ] })
}, p = `
# Styling Markdown with Markdown Embed

Markdown Embed allows styling of Markdown, which primarily comes from external data.

## How to Use Markdown Embed

- Every element is shown in the Navigator.
- Apply styles and Tokens to each element.
- Adjustments to elements apply universally within this embed, ensuring consistency across your content.

---

## This sample text contains all the elements that can be styled.

Any elements that were not used above are used below.

### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

[Links](#) connect your content to relevant resources.

**Bold text** makes your important points stand out.

*Italic text* is great for emphasizing terms.

1. First Step
2. Second Step

![Image placeholder](${i})

> Capture attention with a powerful quote.

Using \`console.log("Hello World");\` will log to the console.

| Header 1   | Header 2   | Header 3   |
|------------|------------|------------|
| Cell 1.1   | Cell 1.2   | Cell 1.3   |
| Cell 2.1   | Cell 2.2   | Cell 2.3   |
| Cell 3.1   | Cell 3.2   | Cell 3.3   |
`.trim(), f = {
  category: "data",
  description: "Used to add markdown code to the page",
  order: 4,
  template: /* @__PURE__ */ o(l.MarkdownEmbed, { code: p, children: [
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Paragraph", selector: " p" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 1", selector: " h1" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 2", selector: " h2" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 3", selector: " h3" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 4", selector: " h4" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 5", selector: " h5" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Heading 6", selector: " h6" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Bold", selector: " :where(strong, b)" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Italic", selector: " :where(em, i)" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Link", selector: " a" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Image", selector: " img" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Blockquote", selector: " blockquote" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Code Text", selector: " code" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "List", selector: " :where(ul, ol)" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "List Item", selector: " li" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Separator", selector: " hr" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table", selector: " table" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table Row", selector: " tr" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table Header Cell", selector: " th" }),
    /* @__PURE__ */ e(t.descendant, { "ws:label": "Table Cell", selector: " td" })
  ] })
}, n = new h("formState", "initial"), k = {
  category: "data",
  order: 1,
  description: "Collect user data and send it to any webhook.",
  template: /* @__PURE__ */ o(
    l.Form,
    {
      state: r`${n}`,
      onStateChange: new w(["state"], r`${n} = state`),
      children: [
        /* @__PURE__ */ o(
          t.element,
          {
            "ws:tag": "div",
            "ws:label": "Form Content",
            "ws:show": r`${n} === 'initial' || ${n} === 'error'`,
            children: [
              /* @__PURE__ */ e(
                t.element,
                {
                  "ws:tag": "label",
                  "ws:style": a`
            display: block;
          `,
                  children: new s("Name")
                }
              ),
              /* @__PURE__ */ e(
                t.element,
                {
                  "ws:tag": "input",
                  "ws:style": a`
            display: block;
          `,
                  name: "name"
                }
              ),
              /* @__PURE__ */ e(
                t.element,
                {
                  "ws:tag": "label",
                  "ws:style": a`
            display: block;
          `,
                  children: new s("Email")
                }
              ),
              /* @__PURE__ */ e(
                t.element,
                {
                  "ws:tag": "input",
                  "ws:style": a`
            display: block;
          `,
                  name: "email"
                }
              ),
              /* @__PURE__ */ e(t.element, { "ws:tag": "button", children: new s("Submit") })
            ]
          }
        ),
        /* @__PURE__ */ e(
          t.element,
          {
            "ws:tag": "div",
            "ws:label": "Success Message",
            "ws:show": r`${n} === 'success'`,
            children: new s("Thank you for getting in touch!")
          }
        ),
        /* @__PURE__ */ e(
          t.element,
          {
            "ws:tag": "div",
            "ws:label": "Error Message",
            "ws:show": r`${n} === 'error'`,
            children: new s("Sorry, something went wrong.")
          }
        )
      ]
    }
  )
}, C = {
  category: "media",
  order: 1,
  description: "Add a video to your page that is hosted on Vimeo. Paste a Vimeo URL and configure the video in the Settings tab.",
  template: /* @__PURE__ */ o(
    l.Vimeo,
    {
      "ws:style": a`
        position: relative;
        aspect-ratio: 640/360;
        width: 100%;
      `,
      children: [
        /* @__PURE__ */ e(
          l.VimeoPreviewImage,
          {
            "ws:style": a`
          position: absolute;
          object-fit: cover;
          object-position: center;
          width: 100%;
          height: 100%;
          border-radius: 20px;
        `,
            alt: "Vimeo video preview image",
            sizes: "100vw",
            optimize: !0
          }
        ),
        /* @__PURE__ */ e(
          l.VimeoSpinner,
          {
            "ws:label": "Spinner",
            "ws:style": a`
          position: absolute;
          top: 50%;
          left: 50%;
          width: 70px;
          height: 70px;
          margin-top: -35px;
          margin-left: -35px;
        `,
            children: /* @__PURE__ */ e(l.HtmlEmbed, { "ws:label": "Spinner SVG", code: d })
          }
        ),
        /* @__PURE__ */ e(
          l.VimeoPlayButton,
          {
            "ws:style": a`
          position: absolute;
          width: 140px;
          height: 80px;
          top: 50%;
          left: 50%;
          margin-top: -40px;
          margin-left: -70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-style: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: rgb(18, 18, 18);
          color: rgb(255, 255, 255);
          &:hover {
            background-color: rgb(0, 173, 239);
          }
        `,
            "aria-label": "Play button",
            children: /* @__PURE__ */ e(
              t.element,
              {
                "ws:tag": "div",
                "ws:label": "Play Icon",
                "ws:style": a`
            width: 60px;
            height: 60px;
          `,
                "aria-hidden": !0,
                children: /* @__PURE__ */ e(l.HtmlEmbed, { "ws:label": "Play SVG", code: c })
              }
            )
          }
        )
      ]
    }
  )
}, S = {
  label: "YouTube",
  category: "media",
  order: 1,
  description: "Add a video to your page that is hosted on YouTube. Paste a YouTube URL and configure the video in the Settings tab.",
  template: /* @__PURE__ */ o(
    l.YouTube,
    {
      "ws:label": "YouTube",
      "ws:style": a`
        position: relative;
        aspect-ratio: 640/360;
        width: 100%;
      `,
      children: [
        /* @__PURE__ */ e(
          l.VimeoPreviewImage,
          {
            "ws:label": "Preview Image",
            "ws:style": a`
          position: absolute;
          object-fit: cover;
          object-position: center;
          width: 100%;
          height: 100%;
          border-radius: 20px;
        `,
            alt: "YouTube video preview image",
            sizes: "100vw",
            optimize: !0
          }
        ),
        /* @__PURE__ */ e(
          l.VimeoSpinner,
          {
            "ws:label": "Spinner",
            "ws:style": a`
          position: absolute;
          top: 50%;
          left: 50%;
          width: 70px;
          height: 70px;
          margin-top: -35px;
          margin-left: -35px;
        `,
            children: /* @__PURE__ */ e(l.HtmlEmbed, { "ws:label": "Spinner SVG", code: d })
          }
        ),
        /* @__PURE__ */ e(
          l.VimeoPlayButton,
          {
            "ws:label": "Play Button",
            "ws:style": a`
          position: absolute;
          width: 140px;
          height: 80px;
          top: 50%;
          left: 50%;
          margin-top: -40px;
          margin-left: -70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-style: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: rgb(18, 18, 18);
          color: rgb(255, 255, 255);
          &:hover {
            background-color: rgb(0, 173, 239);
          }
        `,
            "aria-label": "Play button",
            children: /* @__PURE__ */ e(
              t.element,
              {
                "ws:tag": "div",
                "ws:label": "Play Icon",
                "ws:style": a`
            width: 60px;
            height: 60px;
          `,
                "aria-hidden": !0,
                children: /* @__PURE__ */ e(l.HtmlEmbed, { "ws:label": "Play SVG", code: c })
              }
            )
          }
        )
      ]
    }
  )
}, v = {
  category: "general",
  description: "The Head Slot component lets you customize page-specific head elements (like canonical URLs), which merge with your site's global head settings, with Head Slot definitions taking priority over Page Settings. For site-wide head changes, use project settings instead.",
  order: 5,
  template: /* @__PURE__ */ o(l.HeadSlot, { children: [
    /* @__PURE__ */ e(l.HeadTitle, { "ws:label": "Title", children: "Title" }),
    /* @__PURE__ */ e(l.HeadLink, { "ws:label": "Link", rel: "help", href: "/help" }),
    /* @__PURE__ */ e(l.HeadMeta, { "ws:label": "Meta", name: "keywords", content: "SEO" })
  ] })
};
export {
  x as ContentEmbed,
  k as Form,
  v as HeadSlot,
  f as MarkdownEmbed,
  C as Vimeo,
  S as YouTube
};
