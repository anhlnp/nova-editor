var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/schema/assets.ts
import { z } from "zod";
import { fontFormat, fontMeta } from "@webstudio-is/fonts";
var assetId = z.string();
var baseAsset = {
  id: assetId,
  projectId: z.string(),
  size: z.number(),
  name: z.string(),
  filename: z.string().optional(),
  description: z.union([z.string().optional(), z.null()]),
  createdAt: z.string()
};
var assetType = z.enum(["font", "image", "file"]);
var fontAsset = z.object({
  ...baseAsset,
  format: fontFormat,
  meta: fontMeta,
  type: z.literal(assetType.enum.font)
});
var imageMeta = z.object({
  width: z.number(),
  height: z.number()
});
var imageAsset = z.object({
  ...baseAsset,
  format: z.string(),
  meta: imageMeta,
  type: z.literal(assetType.enum.image)
});
var fileAsset = z.object({
  ...baseAsset,
  format: z.string(),
  meta: z.object({}),
  type: z.literal(assetType.enum.file)
});
var asset = z.union([fontAsset, imageAsset, fileAsset]);
var assets = z.map(assetId, asset);

// src/schema/pages.ts
import { z as z2 } from "zod";
import { validateBasicAuth } from "@webstudio-is/wsauth";
var MIN_TITLE_LENGTH = 2;
var pageId = z2.string();
var folderId = z2.string();
var folderName = z2.string().refine((value) => value.trim() !== "", "Can't be empty");
var slug = z2.string().refine(
  (path) => /^[-a-z0-9]*$/.test(path),
  "Only a-z, 0-9 and - are allowed"
);
var folder = z2.object({
  id: folderId,
  name: folderName,
  slug,
  children: z2.array(z2.union([folderId, pageId]))
});
var pageName = z2.string().refine((value) => value.trim() !== "", "Can't be empty");
var pageTitle = z2.string().refine(
  (val) => val.length >= MIN_TITLE_LENGTH,
  `Minimum ${MIN_TITLE_LENGTH} characters required`
);
var documentTypes = ["html", "xml", "text"];
var basicAuthFields = {
  login: z2.string(),
  password: z2.string()
};
var validateBasicAuthFields = ({
  login,
  password
}, context) => {
  for (const issue of validateBasicAuth({ login, password }).issues ?? []) {
    context.addIssue({
      code: z2.ZodIssueCode.custom,
      path: issue.path,
      message: issue.message
    });
  }
};
var pageBasicAuth = z2.object({
  method: z2.literal("basic"),
  ...basicAuthFields
}).superRefine(validateBasicAuthFields);
var legacyPageBasicAuth = z2.object({
  type: z2.literal("basic"),
  ...basicAuthFields
}).superRefine(validateBasicAuthFields).transform(({ login, password }) => ({
  method: "basic",
  login,
  password
}));
var pageAuth = z2.union([pageBasicAuth, legacyPageBasicAuth]);
var commonPageFields = {
  id: pageId,
  name: pageName,
  title: pageTitle,
  history: z2.optional(z2.array(z2.string())),
  rootInstanceId: z2.string(),
  systemDataSourceId: z2.string().optional(),
  meta: z2.object({
    description: z2.string().optional(),
    title: z2.string().optional(),
    excludePageFromSearch: z2.string().optional(),
    language: z2.string().optional(),
    socialImageAssetId: z2.string().optional(),
    socialImageUrl: z2.string().optional(),
    status: z2.string().optional(),
    redirect: z2.string().optional(),
    documentType: z2.optional(z2.enum(documentTypes)),
    content: z2.string().optional(),
    auth: pageAuth.optional(),
    custom: z2.array(
      z2.object({
        property: z2.string(),
        content: z2.string()
      })
    ).optional()
  }),
  marketplace: z2.optional(
    z2.object({
      include: z2.optional(z2.boolean()),
      category: z2.optional(z2.string()),
      thumbnailAssetId: z2.optional(z2.string())
    })
  )
};
var homePagePath = z2.string().refine((path) => path === "", "Home page path must be empty");
var defaultPagePath = z2.string().refine((path) => path !== "", "Can't be empty").refine((path) => path !== "/", "Can't be just a /").refine((path) => path.endsWith("/") === false, "Can't end with a /").refine((path) => path.includes("//") === false, "Can't contain repeating /").refine(
  (path) => /^[-_a-z0-9*:?\\/.]*$/.test(path),
  "Only a-z, 0-9, -, _, /, :, ?, . and * are allowed"
).refine(
  // We use /s for our system stuff like /s/css or /s/uploads
  (path) => path !== "/s" && path.startsWith("/s/") === false,
  "/s prefix is reserved for the system"
).refine(
  // Remix serves build artefacts like JS bundles from /build
  // And we cannot customize it due to bug in Remix: https://github.com/remix-run/remix/issues/2933
  (path) => path !== "/build" && path.startsWith("/build/") === false,
  "/build prefix is reserved for the system"
).refine((path) => path.length <= 255, "Path can't exceed 255 characters");
var redirectSourcePath = z2.string().refine((path) => path !== "", "Can't be empty").refine((path) => path !== "/", "Can't be just a /").refine(
  (path) => path.startsWith("/") && path.startsWith("//") === false,
  "Must start with a /"
).refine((path) => {
  if (/[\\\u0000-\u001f\u007f]/.test(path)) {
    return false;
  }
  try {
    new URL(path, "https://example.com");
    return true;
  } catch {
    return false;
  }
}, "Must be a valid URL path").refine(
  (path) => path !== "/s" && path.startsWith("/s/") === false,
  "/s prefix is reserved for the system"
).refine(
  (path) => path !== "/build" && path.startsWith("/build/") === false,
  "/build prefix is reserved for the system"
);
var pagePath = defaultPagePath.refine(
  (path) => path === "" || path.startsWith("/"),
  "Must start with a / or a full URL e.g. https://website.org"
);
var page = z2.object({
  ...commonPageFields,
  path: z2.union([homePagePath, pagePath])
});
var pageTemplate = z2.object({
  id: pageId,
  name: pageName,
  title: pageTitle,
  rootInstanceId: z2.string(),
  systemDataSourceId: z2.string().optional(),
  meta: commonPageFields.meta
});
var projectMeta = z2.object({
  // All fields are optional to ensure consistency and allow for the addition of new fields without requiring migration
  siteName: z2.string().optional(),
  contactEmail: z2.string().optional(),
  faviconAssetId: z2.string().optional(),
  code: z2.string().optional(),
  auth: z2.string().optional()
});
var projectNewRedirectPath = z2.string().min(1, "Path is required").refine((data) => {
  try {
    new URL(data, "http://url.com");
    return true;
  } catch {
    return false;
  }
}, "Must be a valid URL");
var pageRedirect = z2.object({
  old: redirectSourcePath,
  new: projectNewRedirectPath,
  status: z2.enum(["301", "302"]).optional()
});
var compilerSettings = z2.object({
  // All fields are optional to ensure consistency and allow for the addition of new fields without requiring migration
  atomicStyles: z2.boolean().optional()
});
var pages = z2.object({
  meta: projectMeta.optional(),
  compiler: compilerSettings.optional(),
  redirects: z2.array(pageRedirect).optional(),
  homePageId: pageId,
  rootFolderId: folderId,
  pages: z2.map(pageId, page),
  pageTemplates: z2.map(pageId, pageTemplate).optional(),
  folders: z2.map(folderId, folder).refine((folders) => folders.size > 0, "Folders can't be empty")
}).superRefine((pages2, context) => {
  const homePage = pages2.pages.get(pages2.homePageId);
  const rootFolder = pages2.folders.get(pages2.rootFolderId);
  if (homePage === void 0) {
    context.addIssue({
      code: z2.ZodIssueCode.custom,
      path: ["homePageId"],
      message: "Home page must reference an existing page"
    });
  }
  if (rootFolder === void 0) {
    context.addIssue({
      code: z2.ZodIssueCode.custom,
      path: ["rootFolderId"],
      message: "Root folder must reference an existing folder"
    });
  }
  if (homePage !== void 0 && homePage.path !== "") {
    context.addIssue({
      code: z2.ZodIssueCode.custom,
      path: ["pages", pages2.homePageId, "path"],
      message: "Home page path must be empty"
    });
  }
  for (const [pageId2, page2] of pages2.pages) {
    if (page2.id !== pageId2) {
      context.addIssue({
        code: z2.ZodIssueCode.custom,
        path: ["pages", pageId2, "id"],
        message: "Page id must match its record key"
      });
    }
    if (pageId2 !== pages2.homePageId && page2.path === "") {
      context.addIssue({
        code: z2.ZodIssueCode.custom,
        path: ["pages", pageId2, "path"],
        message: "Page path can't be empty"
      });
    }
  }
  for (const [templateId, template] of pages2.pageTemplates ?? []) {
    if (template.id !== templateId) {
      context.addIssue({
        code: z2.ZodIssueCode.custom,
        path: ["pageTemplates", templateId, "id"],
        message: "Page template id must match its record key"
      });
    }
    if (pages2.pages.has(templateId)) {
      context.addIssue({
        code: z2.ZodIssueCode.custom,
        path: ["pageTemplates", templateId, "id"],
        message: "Page template id must not match an existing page id"
      });
    }
  }
  for (const [folderId2, folder2] of pages2.folders) {
    if (folder2.id !== folderId2) {
      context.addIssue({
        code: z2.ZodIssueCode.custom,
        path: ["folders", folderId2, "id"],
        message: "Folder id must match its record key"
      });
    }
    for (const [index, childId] of folder2.children.entries()) {
      if (pages2.pages.has(childId) === false && pages2.folders.has(childId) === false) {
        context.addIssue({
          code: z2.ZodIssueCode.custom,
          path: ["folders", folderId2, "children", index],
          message: "Folder child must reference an existing page or folder"
        });
      }
      if (childId === pages2.rootFolderId) {
        context.addIssue({
          code: z2.ZodIssueCode.custom,
          path: ["folders", folderId2, "children", index],
          message: "Root folder can't be nested"
        });
      }
    }
  }
  if (rootFolder !== void 0 && rootFolder.children[0] !== pages2.homePageId) {
    context.addIssue({
      code: z2.ZodIssueCode.custom,
      path: ["folders", pages2.rootFolderId, "children"],
      message: "Root folder must start with the home page"
    });
  }
  const childParents = /* @__PURE__ */ new Map();
  for (const [folderId2, folder2] of pages2.folders) {
    for (const [index, childId] of folder2.children.entries()) {
      const parentId = childParents.get(childId);
      if (parentId !== void 0) {
        context.addIssue({
          code: z2.ZodIssueCode.custom,
          path: ["folders", folderId2, "children", index],
          message: `Child is already registered in folder "${parentId}"`
        });
        continue;
      }
      childParents.set(childId, folderId2);
    }
  }
  const hasFolderCycle = (folderId2, path = /* @__PURE__ */ new Set()) => {
    if (path.has(folderId2)) {
      return true;
    }
    const folder2 = pages2.folders.get(folderId2);
    if (folder2 === void 0) {
      return false;
    }
    path.add(folderId2);
    for (const childId of folder2.children) {
      if (pages2.folders.has(childId) && hasFolderCycle(childId, path)) {
        return true;
      }
    }
    path.delete(folderId2);
    return false;
  };
  for (const folderId2 of pages2.folders.keys()) {
    if (hasFolderCycle(folderId2)) {
      context.addIssue({
        code: z2.ZodIssueCode.custom,
        path: ["folders", folderId2, "children"],
        message: "Folders can't contain cycles"
      });
    }
  }
});

// src/schema/instances.ts
import { z as z3 } from "zod";
var textChild = z3.object({
  type: z3.literal("text"),
  value: z3.string(),
  placeholder: z3.boolean().optional()
});
var instanceId = z3.string();
var idChild = z3.object({
  type: z3.literal("id"),
  value: instanceId
});
var expressionChild = z3.object({
  type: z3.literal("expression"),
  value: z3.string()
});
var instanceChild = z3.union([idChild, textChild, expressionChild]);
var instance = z3.object({
  type: z3.literal("instance"),
  id: instanceId,
  component: z3.string(),
  tag: z3.string().optional(),
  label: z3.string().optional(),
  children: z3.array(instanceChild)
});
var instances = z3.map(instanceId, instance);

// src/schema/data-sources.ts
import { z as z4 } from "zod";
var dataSourceId = z4.string();
var dataSourceVariableValue = z4.union([
  z4.object({
    type: z4.literal("number"),
    // initial value of variable store
    value: z4.number()
  }),
  z4.object({
    type: z4.literal("string"),
    value: z4.string()
  }),
  z4.object({
    type: z4.literal("boolean"),
    value: z4.boolean()
  }),
  z4.object({
    type: z4.literal("string[]"),
    value: z4.array(z4.string())
  }),
  z4.object({
    type: z4.literal("json"),
    value: z4.unknown()
  })
]);
var dataSource = z4.union([
  z4.object({
    type: z4.literal("variable"),
    id: dataSourceId,
    // The instance should always be specified for variables,
    // however, there was a bug in the embed template
    // which produced variables without an instance
    // and these variables will fail validation
    // if we make it required
    scopeInstanceId: z4.string().optional(),
    name: z4.string(),
    value: dataSourceVariableValue
  }),
  z4.object({
    type: z4.literal("parameter"),
    id: dataSourceId,
    scopeInstanceId: z4.string().optional(),
    name: z4.string()
  }),
  z4.object({
    type: z4.literal("resource"),
    id: dataSourceId,
    scopeInstanceId: z4.string().optional(),
    name: z4.string(),
    resourceId: z4.string()
  })
]);
var dataSources = z4.map(dataSourceId, dataSource);

// src/schema/resources.ts
import { z as z5 } from "zod";
var resourceId = z5.string();
var method = z5.union([
  z5.literal("get"),
  z5.literal("post"),
  z5.literal("put"),
  z5.literal("delete")
]);
var resource = z5.object({
  id: resourceId,
  name: z5.string(),
  control: z5.optional(z5.union([z5.literal("system"), z5.literal("graphql")])),
  method,
  // expression
  url: z5.string(),
  searchParams: z5.array(
    z5.object({
      name: z5.string(),
      // expression
      value: z5.string()
    })
  ).optional(),
  headers: z5.array(
    z5.object({
      name: z5.string(),
      // expression
      value: z5.string()
    })
  ),
  // expression
  body: z5.optional(z5.string())
});
var resourceRequest = z5.object({
  name: z5.string(),
  method,
  url: z5.string(),
  searchParams: z5.array(
    z5.object({
      name: z5.string(),
      // can be string or object which should be serialized
      value: z5.unknown()
    })
  ),
  headers: z5.array(
    z5.object({
      name: z5.string(),
      // can be string or object which should be serialized
      value: z5.unknown()
    })
  ),
  body: z5.optional(z5.unknown())
});
var resources = z5.map(resourceId, resource);

// src/schema/props.ts
import { z as z7 } from "zod";

// src/schema/animation-schema.ts
import { styleValue } from "@webstudio-is/css-engine";
import { z as z6 } from "zod";
var literalUnion = (arr) => z6.union(
  arr.map((val) => z6.literal(val))
);
var RANGE_UNITS = [
  "%",
  "px",
  "cm",
  "mm",
  "q",
  "in",
  "pt",
  "pc",
  "em",
  "rem",
  "ex",
  "rex",
  "cap",
  "rcap",
  "ch",
  "rch",
  "lh",
  "rlh",
  "vw",
  "svw",
  "lvw",
  "dvw",
  "vh",
  "svh",
  "lvh",
  "dvh",
  "vi",
  "svi",
  "lvi",
  "dvi",
  "vb",
  "svb",
  "lvb",
  "dvb",
  "vmin",
  "svmin",
  "lvmin",
  "dvmin",
  "vmax",
  "svmax",
  "lvmax",
  "dvmax"
];
var rangeUnit = literalUnion(RANGE_UNITS);
var rangeUnitValue = z6.union([
  z6.object({
    type: z6.literal("unit"),
    value: z6.number(),
    unit: rangeUnit
  }),
  z6.object({
    type: z6.literal("unparsed"),
    value: z6.string()
  }),
  z6.object({
    type: z6.literal("var"),
    value: z6.string()
  })
]);
var TIME_UNITS = ["ms", "s"];
var timeUnit = literalUnion(TIME_UNITS);
var durationUnitValue = z6.union([
  z6.object({
    type: z6.literal("unit"),
    value: z6.number(),
    unit: timeUnit
  }),
  z6.object({
    type: z6.literal("var"),
    value: z6.string()
  })
]);
var iterationsUnitValue = z6.union([z6.number(), z6.literal("infinite")]);
var insetUnitValue = z6.union([
  rangeUnitValue,
  z6.object({
    type: z6.literal("keyword"),
    value: z6.literal("auto")
  })
]);
var keyframeStyles = z6.record(styleValue);
var animationKeyframe = z6.object({
  offset: z6.number().optional(),
  styles: keyframeStyles
});
var keyframeEffectOptions = z6.object({
  easing: z6.string().optional(),
  fill: z6.union([
    z6.literal("none"),
    z6.literal("forwards"),
    z6.literal("backwards"),
    z6.literal("both")
  ]).optional(),
  // FillMode
  duration: durationUnitValue.optional(),
  delay: durationUnitValue.optional(),
  iterations: iterationsUnitValue.optional()
});
var scrollNamedRange = z6.union([z6.literal("start"), z6.literal("end")]);
var scrollRangeValue = z6.tuple([scrollNamedRange, rangeUnitValue]);
var scrollRangeOptions = z6.object({
  rangeStart: scrollRangeValue.optional(),
  rangeEnd: scrollRangeValue.optional()
});
var animationAxis = z6.union([
  z6.literal("block"),
  z6.literal("inline"),
  z6.literal("x"),
  z6.literal("y")
]);
var viewNamedRange = z6.union([
  z6.literal("contain"),
  z6.literal("cover"),
  z6.literal("entry"),
  z6.literal("exit"),
  z6.literal("entry-crossing"),
  z6.literal("exit-crossing")
]);
var viewRangeValue = z6.tuple([viewNamedRange, rangeUnitValue]);
var viewRangeOptions = z6.object({
  rangeStart: viewRangeValue.optional(),
  rangeEnd: viewRangeValue.optional()
});
var baseAnimation = z6.object({
  name: z6.string().optional(),
  description: z6.string().optional(),
  enabled: z6.array(z6.tuple([z6.string().describe("breakpointId"), z6.boolean()])).optional(),
  keyframes: z6.array(animationKeyframe)
});
var scrollAnimation = baseAnimation.merge(
  z6.object({
    timing: keyframeEffectOptions.merge(scrollRangeOptions)
  })
);
var scrollAction = z6.object({
  type: z6.literal("scroll"),
  source: z6.union([z6.literal("closest"), z6.literal("nearest"), z6.literal("root")]).optional(),
  axis: animationAxis.optional(),
  animations: z6.array(scrollAnimation),
  isPinned: z6.boolean().optional(),
  debug: z6.boolean().optional()
});
var viewAnimation = baseAnimation.merge(
  z6.object({
    timing: keyframeEffectOptions.merge(viewRangeOptions)
  })
);
var viewAction = z6.object({
  type: z6.literal("view"),
  subject: z6.string().optional(),
  axis: animationAxis.optional(),
  animations: z6.array(viewAnimation),
  insetStart: insetUnitValue.optional(),
  insetEnd: insetUnitValue.optional(),
  isPinned: z6.boolean().optional(),
  debug: z6.boolean().optional()
});
var animationAction = z6.discriminatedUnion("type", [
  scrollAction,
  viewAction
]);

// src/schema/props.ts
var propId = z7.string();
var baseProp = {
  id: propId,
  instanceId: z7.string(),
  name: z7.string(),
  required: z7.optional(z7.boolean())
};
var prop = z7.union([
  z7.object({
    ...baseProp,
    type: z7.literal("number"),
    value: z7.number()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("string"),
    value: z7.string()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("boolean"),
    value: z7.boolean()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("json"),
    value: z7.unknown()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("asset"),
    value: z7.string()
    // asset id
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("page"),
    value: z7.union([
      z7.string(),
      // page id
      z7.object({
        pageId: z7.string(),
        instanceId: z7.string()
      })
    ])
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("string[]"),
    value: z7.array(z7.string())
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("parameter"),
    // data source id
    value: z7.string()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("resource"),
    // resource id
    value: z7.string()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("expression"),
    // expression code
    value: z7.string()
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("action"),
    value: z7.array(
      z7.object({
        type: z7.literal("execute"),
        args: z7.array(z7.string()),
        code: z7.string()
      })
    )
  }),
  z7.object({
    ...baseProp,
    type: z7.literal("animationAction"),
    value: animationAction
  })
]);
var props = z7.map(propId, prop);

// src/schema/breakpoints.ts
import { z as z8 } from "zod";
var breakpointId = z8.string();
var breakpoint = z8.object({
  id: breakpointId,
  label: z8.string(),
  minWidth: z8.number().optional(),
  maxWidth: z8.number().optional(),
  condition: z8.string().optional()
}).transform((data) => {
  if (data.condition !== void 0 && data.condition.trim() === "") {
    return { ...data, condition: void 0 };
  }
  return data;
}).refine(({ minWidth, maxWidth, condition }) => {
  if (condition !== void 0) {
    return minWidth === void 0 && maxWidth === void 0;
  }
  if (minWidth !== void 0 && maxWidth !== void 0) {
    return minWidth < maxWidth;
  }
  return true;
}, "Width-based (minWidth/maxWidth) and condition are mutually exclusive, and minWidth must be less than maxWidth");
var breakpoints = z8.map(breakpointId, breakpoint);
var initialBreakpoints = [
  { id: "placeholder", label: "Base" },
  { id: "placeholder", label: "Tablet", maxWidth: 991 },
  { id: "placeholder", label: "Mobile landscape", maxWidth: 767 },
  { id: "placeholder", label: "Mobile portrait", maxWidth: 479 }
];

// src/schema/style-sources.ts
import { z as z9 } from "zod";
var styleSourceId = z9.string();
var styleSourceToken = z9.object({
  type: z9.literal("token"),
  id: styleSourceId,
  name: z9.string(),
  locked: z9.boolean().optional()
});
var styleSourceLocal = z9.object({
  type: z9.literal("local"),
  id: styleSourceId
});
var styleSource = z9.union([styleSourceToken, styleSourceLocal]);
var styleSources = z9.map(styleSourceId, styleSource);

// src/schema/style-source-selections.ts
import { z as z10 } from "zod";
var instanceId2 = z10.string();
var styleSourceId2 = z10.string();
var styleSourceSelection = z10.object({
  instanceId: instanceId2,
  values: z10.array(styleSourceId2)
});
var styleSourceSelections = z10.map(instanceId2, styleSourceSelection);

// src/schema/styles.ts
import { z as z11 } from "zod";
import { styleValue as styleValue2 } from "@webstudio-is/css-engine";
var styleDeclRaw = z11.object({
  styleSourceId: z11.string(),
  breakpointId: z11.string(),
  state: z11.optional(z11.string()),
  // @todo can't figure out how to make property to be enum
  property: z11.string(),
  value: styleValue2,
  listed: z11.boolean().optional().describe("Whether the style is from the Advanced panel")
});
var styleDecl = styleDeclRaw;
var getStyleDeclKey = (styleDecl2) => {
  return `${styleDecl2.styleSourceId}:${styleDecl2.breakpointId}:${styleDecl2.property}:${styleDecl2.state ?? ""}`;
};
var styles = z11.map(z11.string(), styleDecl);

// src/schema/deployment.ts
import { z as z12 } from "zod";
var templates = z12.enum([
  "docker",
  "vercel",
  "netlify",
  "ssg",
  "ssg-netlify",
  "ssg-vercel"
]);
var deployment = z12.union([
  z12.object({
    destination: z12.literal("static"),
    name: z12.string(),
    assetsDomain: z12.string(),
    // Must be validated very strictly
    templates: z12.array(templates)
  }),
  z12.object({
    destination: z12.literal("saas").optional(),
    domains: z12.array(z12.string()),
    assetsDomain: z12.string().optional(),
    /**
     * @deprecated This field is deprecated, use `domains` instead.
     */
    projectDomain: z12.string().optional(),
    excludeWstdDomainFromSearch: z12.boolean().optional()
  })
]);

// src/schema/webstudio.ts
import { z as z13 } from "zod";
var webstudioFragment = z13.object({
  children: z13.array(instanceChild),
  instances: z13.array(instance),
  assets: z13.array(asset),
  dataSources: z13.array(dataSource),
  resources: z13.array(resource),
  props: z13.array(prop),
  breakpoints: z13.array(breakpoint),
  styleSourceSelections: z13.array(styleSourceSelection),
  styleSources: z13.array(styleSource),
  styles: z13.array(styleDecl)
});

// src/schema/prop-meta.ts
import { z as z14 } from "zod";
var common = {
  label: z14.string().optional(),
  description: z14.string().optional(),
  required: z14.boolean(),
  contentMode: z14.boolean().optional()
};
var tag = z14.object({
  ...common,
  control: z14.literal("tag"),
  type: z14.literal("string"),
  defaultValue: z14.undefined().optional(),
  options: z14.array(z14.string())
});
var number = z14.object({
  ...common,
  control: z14.literal("number"),
  type: z14.literal("number"),
  defaultValue: z14.number().optional()
});
var range = z14.object({
  ...common,
  control: z14.literal("range"),
  type: z14.literal("number"),
  defaultValue: z14.number().optional()
});
var text = z14.object({
  ...common,
  control: z14.literal("text"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional(),
  /**
   * The number of rows in <textarea>. If set to 0 an <input> will be used instead.
   * In line with Storybook team's plan: https://github.com/storybookjs/storybook/issues/21100
   */
  rows: z14.number().optional()
});
var resource2 = z14.object({
  ...common,
  control: z14.literal("resource"),
  type: z14.literal("resource"),
  defaultValue: z14.string().optional()
});
var code = z14.object({
  ...common,
  control: z14.literal("code"),
  type: z14.literal("string"),
  language: z14.union([z14.literal("html"), z14.literal("markdown")]),
  defaultValue: z14.string().optional()
});
var codeText = z14.object({
  ...common,
  control: z14.literal("codetext"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional()
});
var color = z14.object({
  ...common,
  control: z14.literal("color"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional()
});
var boolean = z14.object({
  ...common,
  control: z14.literal("boolean"),
  type: z14.literal("boolean"),
  defaultValue: z14.boolean().optional()
});
var radio = z14.object({
  ...common,
  control: z14.literal("radio"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional(),
  options: z14.array(z14.string())
});
var inlineRadio = z14.object({
  ...common,
  control: z14.literal("inline-radio"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional(),
  options: z14.array(z14.string())
});
var select = z14.object({
  ...common,
  control: z14.literal("select"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional(),
  options: z14.array(z14.string())
});
var timeZone = z14.object({
  ...common,
  control: z14.literal("timeZone"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional(),
  options: z14.array(z14.string())
});
var check = z14.object({
  ...common,
  control: z14.literal("check"),
  type: z14.literal("string[]"),
  defaultValue: z14.array(z14.string()).optional(),
  options: z14.array(z14.string())
});
var inlineCheck = z14.object({
  ...common,
  control: z14.literal("inline-check"),
  type: z14.literal("string[]"),
  defaultValue: z14.array(z14.string()).optional(),
  options: z14.array(z14.string())
});
var multiSelect = z14.object({
  ...common,
  control: z14.literal("multi-select"),
  type: z14.literal("string[]"),
  defaultValue: z14.array(z14.string()).optional(),
  options: z14.array(z14.string())
});
var file = z14.object({
  ...common,
  control: z14.literal("file"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional(),
  /** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept */
  accept: z14.string().optional()
});
var url = z14.object({
  ...common,
  control: z14.literal("url"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional()
});
var json = z14.object({
  ...common,
  control: z14.literal("json"),
  type: z14.literal("json"),
  defaultValue: z14.unknown().optional()
});
var date = z14.object({
  ...common,
  control: z14.literal("date"),
  // @todo not sure what type should be here
  // (we don't support Date yet, added for completeness)
  type: z14.literal("string"),
  defaultValue: z14.string().optional()
});
var action = z14.object({
  ...common,
  control: z14.literal("action"),
  type: z14.literal("action"),
  defaultValue: z14.undefined().optional()
});
var textContent = z14.object({
  ...common,
  control: z14.literal("textContent"),
  type: z14.literal("string"),
  defaultValue: z14.string().optional()
});
var animationAction2 = z14.object({
  ...common,
  control: z14.literal("animationAction"),
  type: z14.literal("animationAction"),
  defaultValue: z14.undefined().optional()
});
var propMeta = z14.union([
  tag,
  number,
  range,
  text,
  resource2,
  code,
  codeText,
  color,
  boolean,
  radio,
  inlineRadio,
  select,
  timeZone,
  multiSelect,
  check,
  inlineCheck,
  file,
  url,
  json,
  date,
  action,
  textContent,
  animationAction2
]);

// src/schema/component-meta.ts
import { z as z15 } from "zod";
import { styleValue as styleValue3 } from "@webstudio-is/css-engine";
var presetStyleDecl = z15.object({
  // State selector, e.g. :hover
  state: z15.optional(z15.string()),
  property: z15.string(),
  value: styleValue3
});
var componentCategories = [
  "general",
  "typography",
  "media",
  "animations",
  "data",
  "forms",
  "localization",
  "radix",
  "xml",
  "text",
  "other",
  "hidden",
  "internal"
];
var componentState = z15.object({
  selector: z15.string(),
  label: z15.string()
});
var componentContent = z15.string();
var contentModel = z15.object({
  /*
   * instance - accepted by any parent with "instance" in children categories
   * none - accepted by parents with this component name in children categories
   */
  category: z15.union([z15.literal("instance"), z15.literal("none")]),
  /**
   * enforce direct children of category or components
   */
  children: z15.array(componentContent),
  /**
   * enforce descendants of category or components
   */
  descendants: z15.array(componentContent).optional()
});
var wsComponentMeta = z15.object({
  category: z15.enum(componentCategories).optional(),
  contentModel: contentModel.optional(),
  // when this field is specified component receives
  // prop with index of same components withiin specified ancestor
  // important to automatically enumerate collections without
  // naming every item manually
  indexWithinAncestor: z15.optional(z15.string()),
  label: z15.optional(z15.string()),
  description: z15.string().optional(),
  icon: z15.string().optional(),
  presetStyle: z15.optional(z15.record(z15.string(), z15.array(presetStyleDecl))),
  states: z15.optional(z15.array(componentState)),
  order: z15.number().optional(),
  // properties and html attributes that will be always visible in properties panel
  initialProps: z15.array(z15.string()).optional(),
  props: z15.record(propMeta).optional()
});

// src/assets.ts
import warnOnce from "warn-once";
var ALLOWED_FILE_TYPES = {
  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Code
  txt: "text/plain",
  md: "text/markdown",
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  html: "text/html",
  xml: "application/xml",
  // Archives
  zip: "application/zip",
  rar: "application/vnd.rar",
  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  // Video
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  webm: "video/webm",
  // Images
  // Note: Cloudflare Image Resizing supports: jpg, jpeg, png, gif, webp, svg, avif
  // Other formats (bmp, ico, tif, tiff) are served as-is without optimization
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/vnd.microsoft.icon",
  // Used for favicons
  bmp: "image/bmp",
  // Served without optimization
  tif: "image/tiff",
  // Served without optimization
  tiff: "image/tiff",
  // Served without optimization
  // Fonts
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf"
};
var ALLOWED_FILE_EXTENSIONS = new Set(
  Object.keys(ALLOWED_FILE_TYPES)
);
var MIME_CATEGORIES = [
  "image",
  "video",
  "audio",
  "font",
  "text",
  "application"
];
var FILE_EXTENSIONS_BY_CATEGORY = (() => {
  const categories = Object.fromEntries(
    MIME_CATEGORIES.map((category) => [category, []])
  );
  Object.entries(ALLOWED_FILE_TYPES).forEach(([ext, mimeType]) => {
    const [category] = mimeType.split("/");
    if (category in categories) {
      categories[category].push(ext);
    }
  });
  return categories;
})();
var extensionToMime = new Map(
  Object.entries(ALLOWED_FILE_TYPES).map(([ext, mime]) => [`.${ext}`, mime])
);
var mimeTypes = new Set(extensionToMime.values());
var mimePatterns = /* @__PURE__ */ new Set([
  ...mimeTypes.values(),
  ...MIME_CATEGORIES.map((category) => `${category}/*`)
]);
var getCategory = (pattern) => {
  const categoryAsString = pattern.split("/")[0];
  const category = MIME_CATEGORIES.find(
    (category2) => category2 === categoryAsString
  );
  if (category === void 0) {
    throw new Error(`Invalid mime pattern: ${pattern}`);
  }
  return category;
};
var IMAGE_EXTENSIONS = FILE_EXTENSIONS_BY_CATEGORY.image;
var IMAGE_MIME_TYPES = IMAGE_EXTENSIONS.map(
  (ext) => ALLOWED_FILE_TYPES[ext]
);
var RESIZABLE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml"
];
var VIDEO_EXTENSIONS = FILE_EXTENSIONS_BY_CATEGORY.video;
var VIDEO_MIME_TYPES = VIDEO_EXTENSIONS.map(
  (ext) => ALLOWED_FILE_TYPES[ext]
);
var FONT_EXTENSIONS = FILE_EXTENSIONS_BY_CATEGORY.font;
var getMimeTypeByExtension = (extension) => {
  return ALLOWED_FILE_TYPES[extension.toLowerCase()];
};
var getMimeTypeByFilename = (fileName) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) {
    return "application/octet-stream";
  }
  return getMimeTypeByExtension(extension) ?? "application/octet-stream";
};
var isAllowedExtension = (extension) => {
  return ALLOWED_FILE_EXTENSIONS.has(
    extension.toLowerCase()
  );
};
var isAllowedMimeCategory = (category) => {
  return MIME_CATEGORIES.includes(category);
};
var acceptToMimePatterns = (accept) => {
  const result = /* @__PURE__ */ new Set();
  if (accept === "") {
    return "*";
  }
  for (const type of accept.split(",")) {
    const trimmed = type.trim();
    if (trimmed === "*" || trimmed === "*/*") {
      return "*";
    }
    if (mimePatterns.has(trimmed)) {
      result.add(trimmed);
      continue;
    }
    const mime = extensionToMime.get(trimmed);
    if (mime === void 0) {
      warnOnce(
        true,
        `Couldn't not parse accept attribute value: ${trimmed}. Falling back to "*".`
      );
      return "*";
    }
    result.add(mime);
  }
  return result;
};
var acceptToMimeCategories = (accept) => {
  const patterns = acceptToMimePatterns(accept);
  if (patterns === "*") {
    return "*";
  }
  const categories = /* @__PURE__ */ new Set();
  for (const pattern of patterns) {
    categories.add(getCategory(pattern));
  }
  return categories;
};
var getAssetMime = ({
  type,
  format
}) => {
  const lowerFormat = format.toLowerCase();
  const mime = `${type}/${lowerFormat}`;
  if (mimeTypes.has(mime)) {
    return mime;
  }
  const mime2 = extensionToMime.get(`.${lowerFormat}`);
  if (mime2 === void 0) {
    warnOnce(
      true,
      `Couldn't determine mime type of asset: ${type}, ${format}.`
    );
  }
  return mime2;
};
var doesAssetMatchMimePatterns = (asset2, patterns) => {
  if (patterns === "*") {
    return true;
  }
  const mime = getAssetMime(asset2);
  if (mime !== void 0) {
    if (patterns.has(mime) || patterns.has(`${getCategory(mime)}/*`)) {
      return true;
    }
  }
  if (asset2.type === "file" && asset2.name) {
    const extension = asset2.name.split(".").pop()?.toLowerCase();
    if (extension) {
      const mimeFromExtension = extensionToMime.get(`.${extension}`);
      if (mimeFromExtension) {
        return patterns.has(mimeFromExtension) || patterns.has(`${getCategory(mimeFromExtension)}/*`);
      }
    }
  }
  return false;
};
var validateFileName = (fileName) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) {
    throw new Error("File must have an extension");
  }
  if (!isAllowedExtension(extension)) {
    throw new Error(
      `File type "${extension}" is not allowed. Allowed types: ${Array.from(
        ALLOWED_FILE_EXTENSIONS
      ).join(", ")}`
    );
  }
  const mimeType = getMimeTypeByExtension(extension);
  if (!mimeType) {
    throw new Error(
      `Could not determine MIME type for extension: ${extension}`
    );
  }
  return { extension, mimeType };
};
var detectAssetType = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) {
    return "file";
  }
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return "image";
  }
  if (FONT_EXTENSIONS.includes(ext)) {
    return "font";
  }
  if (VIDEO_EXTENSIONS.includes(ext)) {
    return "video";
  }
  return "file";
};
var decodePathFragment = (fragment) => {
  const decoded = decodeURIComponent(fragment);
  if (decoded.includes("..") || decoded.startsWith("/")) {
    throw new Error("Invalid file path");
  }
  return decoded;
};
var getAssetUrl = (asset2, origin) => {
  let path;
  const assetType2 = detectAssetType(asset2.name);
  if (assetType2 === "image") {
    path = `/cgi/image/${asset2.name}?format=raw`;
  } else {
    path = `/cgi/asset/${asset2.name}?format=raw`;
  }
  return new URL(path, origin);
};
var extractImageMetadata = (asset2) => {
  if (asset2.type !== "image") {
    return;
  }
  if (asset2.meta.width && asset2.meta.height) {
    return {
      width: asset2.meta.width,
      height: asset2.meta.height
    };
  }
};
var extractFontMetadata = (asset2) => {
  if (asset2.type !== "font") {
    return;
  }
  const metadata = {
    family: asset2.meta.family
  };
  if ("style" in asset2.meta) {
    metadata.style = asset2.meta.style;
    metadata.weight = asset2.meta.weight;
  }
  return metadata;
};
var extractFileMetadata = (_asset) => {
  return;
};
var metadataExtractors = {
  image: extractImageMetadata,
  font: extractFontMetadata,
  file: extractFileMetadata
};
var toRuntimeAsset = (asset2, origin) => {
  const extractor = metadataExtractors[asset2.type];
  const metadata = extractor(asset2);
  const url2 = getAssetUrl(asset2, origin);
  const relativeUrl = url2.pathname + url2.search;
  return {
    url: relativeUrl,
    ...metadata
  };
};

// src/core-metas.ts
import {
  ContentBlockIcon,
  ListViewIcon,
  PaintBrushIcon,
  SettingsIcon,
  AddTemplateInstanceIcon
} from "@webstudio-is/icons/svg";

// src/__generated__/normalize.css.ts
var normalize_css_exports = {};
__export(normalize_css_exports, {
  a: () => a,
  address: () => address,
  article: () => article,
  aside: () => aside,
  b: () => b,
  body: () => body,
  button: () => button,
  checkbox: () => checkbox,
  code: () => code2,
  div: () => div,
  figure: () => figure,
  footer: () => footer,
  form: () => form,
  h1: () => h1,
  h2: () => h2,
  h3: () => h3,
  h4: () => h4,
  h5: () => h5,
  h6: () => h6,
  header: () => header,
  hr: () => hr,
  html: () => html,
  i: () => i,
  img: () => img,
  input: () => input,
  kbd: () => kbd,
  label: () => label,
  legend: () => legend,
  li: () => li,
  main: () => main,
  nav: () => nav,
  ol: () => ol,
  optgroup: () => optgroup,
  p: () => p,
  pre: () => pre,
  progress: () => progress,
  radio: () => radio2,
  samp: () => samp,
  section: () => section,
  select: () => select2,
  small: () => small,
  span: () => span,
  strong: () => strong,
  sub: () => sub,
  summary: () => summary,
  sup: () => sup,
  table: () => table,
  textarea: () => textarea,
  time: () => time,
  ul: () => ul
});
var div = [
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var address = div;
var article = div;
var aside = div;
var figure = div;
var footer = div;
var header = div;
var main = div;
var nav = div;
var section = div;
var form = div;
var label = div;
var time = div;
var h1 = div;
var h2 = div;
var h3 = div;
var h4 = div;
var h5 = div;
var h6 = div;
var i = div;
var img = div;
var a = div;
var li = div;
var ul = div;
var ol = div;
var p = div;
var span = div;
var html = [
  { property: "display", value: { type: "keyword", value: "grid" } },
  { property: "min-height", value: { type: "unit", unit: "%", value: 100 } },
  { property: "grid-template-rows", value: { type: "keyword", value: "auto" } },
  {
    property: "grid-template-columns",
    value: { type: "unit", unit: "fr", value: 1 }
  },
  {
    property: "font-family",
    value: { type: "fontFamily", value: ["Arial", "Roboto", "sans-serif"] }
  },
  { property: "font-size", value: { type: "unit", unit: "px", value: 16 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 1.2 }
  },
  {
    property: "white-space-collapse",
    value: { type: "keyword", value: "preserve" }
  }
];
var body = [
  { property: "margin-top", value: { type: "unit", unit: "number", value: 0 } },
  {
    property: "margin-right",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-bottom",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-left",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } },
  {
    property: "-webkit-font-smoothing",
    value: { type: "keyword", value: "antialiased" }
  },
  {
    property: "-moz-osx-font-smoothing",
    value: { type: "keyword", value: "grayscale" }
  }
];
var hr = [
  { property: "height", value: { type: "unit", unit: "number", value: 0 } },
  { property: "color", value: { type: "keyword", value: "inherit" } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var b = [
  {
    property: "font-weight",
    value: { type: "unit", unit: "number", value: 700 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var strong = b;
var code2 = [
  {
    property: "font-family",
    value: {
      type: "fontFamily",
      value: [
        "ui-monospace",
        "SFMono-Regular",
        "Consolas",
        "Liberation Mono",
        "Menlo",
        "monospace"
      ]
    }
  },
  { property: "font-size", value: { type: "unit", unit: "em", value: 1 } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var kbd = code2;
var samp = code2;
var pre = code2;
var small = [
  { property: "font-size", value: { type: "unit", unit: "%", value: 80 } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var sub = [
  { property: "font-size", value: { type: "unit", unit: "%", value: 75 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "position", value: { type: "keyword", value: "relative" } },
  { property: "vertical-align", value: { type: "keyword", value: "baseline" } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } },
  { property: "bottom", value: { type: "unit", unit: "em", value: -0.25 } }
];
var sup = [
  { property: "font-size", value: { type: "unit", unit: "%", value: 75 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "position", value: { type: "keyword", value: "relative" } },
  { property: "vertical-align", value: { type: "keyword", value: "baseline" } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } },
  { property: "top", value: { type: "unit", unit: "em", value: -0.5 } }
];
var table = [
  {
    property: "text-indent",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "border-top-color",
    value: { type: "keyword", value: "inherit" }
  },
  {
    property: "border-right-color",
    value: { type: "keyword", value: "inherit" }
  },
  {
    property: "border-bottom-color",
    value: { type: "keyword", value: "inherit" }
  },
  {
    property: "border-left-color",
    value: { type: "keyword", value: "inherit" }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var input = [
  { property: "font-family", value: { type: "keyword", value: "inherit" } },
  { property: "font-size", value: { type: "unit", unit: "%", value: 100 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 1.15 }
  },
  { property: "margin-top", value: { type: "unit", unit: "number", value: 0 } },
  {
    property: "margin-right",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-bottom",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-left",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } },
  { property: "border-top-style", value: { type: "keyword", value: "solid" } },
  {
    property: "border-right-style",
    value: { type: "keyword", value: "solid" }
  },
  {
    property: "border-bottom-style",
    value: { type: "keyword", value: "solid" }
  },
  { property: "border-left-style", value: { type: "keyword", value: "solid" } }
];
var textarea = input;
var optgroup = [
  { property: "font-family", value: { type: "keyword", value: "inherit" } },
  { property: "font-size", value: { type: "unit", unit: "%", value: 100 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 1.15 }
  },
  { property: "margin-top", value: { type: "unit", unit: "number", value: 0 } },
  {
    property: "margin-right",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-bottom",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-left",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var radio2 = [
  { property: "font-family", value: { type: "keyword", value: "inherit" } },
  { property: "font-size", value: { type: "unit", unit: "%", value: 100 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 1.15 }
  },
  { property: "margin-top", value: { type: "unit", unit: "number", value: 0 } },
  {
    property: "margin-right",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-bottom",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-left",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } },
  { property: "border-top-style", value: { type: "keyword", value: "none" } },
  { property: "border-right-style", value: { type: "keyword", value: "none" } },
  {
    property: "border-bottom-style",
    value: { type: "keyword", value: "none" }
  },
  { property: "border-left-style", value: { type: "keyword", value: "none" } }
];
var checkbox = radio2;
var button = [
  { property: "font-family", value: { type: "keyword", value: "inherit" } },
  { property: "font-size", value: { type: "unit", unit: "%", value: 100 } },
  {
    property: "line-height",
    value: { type: "unit", unit: "number", value: 1.15 }
  },
  { property: "margin-top", value: { type: "unit", unit: "number", value: 0 } },
  {
    property: "margin-right",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-bottom",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "margin-left",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } },
  { property: "border-top-style", value: { type: "keyword", value: "solid" } },
  {
    property: "border-right-style",
    value: { type: "keyword", value: "solid" }
  },
  {
    property: "border-bottom-style",
    value: { type: "keyword", value: "solid" }
  },
  { property: "border-left-style", value: { type: "keyword", value: "solid" } },
  { property: "text-transform", value: { type: "keyword", value: "none" } }
];
var select2 = button;
var legend = [
  {
    property: "padding-top",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "padding-right",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "padding-bottom",
    value: { type: "unit", unit: "number", value: 0 }
  },
  {
    property: "padding-left",
    value: { type: "unit", unit: "number", value: 0 }
  },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var progress = [
  { property: "vertical-align", value: { type: "keyword", value: "baseline" } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];
var summary = [
  { property: "display", value: { type: "keyword", value: "list-item" } },
  { property: "box-sizing", value: { type: "keyword", value: "border-box" } }
];

// src/runtime.ts
var tagProperty = "data-ws-tag";

// src/__generated__/tags.ts
var tags = [
  "div",
  "span",
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
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
  "iframe",
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
  "menu",
  "meter",
  "nav",
  "object",
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
  "search",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "svg",
  "g",
  "defs",
  "desc",
  "symbol",
  "use",
  "image",
  "switch",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "marker",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "clipPath",
  "mask",
  "filter",
  "feDistantLight",
  "fePointLight",
  "feSpotLight",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feFuncR",
  "feFuncG",
  "feFuncB",
  "feFuncA",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "view",
  "animate",
  "set",
  "animateMotion",
  "mpath",
  "animateTransform",
  "metadata",
  "foreignObject"
];

// src/core-metas.ts
var rootComponent = "ws:root";
var rootMeta = {
  label: "Global root",
  icon: SettingsIcon,
  presetStyle: {
    html
  }
};
var elementComponent = "ws:element";
var elementMeta = {
  label: "Element",
  // convert [object Module] to [object Object] to enable structured cloning
  presetStyle: { ...normalize_css_exports },
  initialProps: [tagProperty, "id", "class"],
  props: {
    [tagProperty]: {
      type: "string",
      control: "tag",
      required: true,
      options: tags
    }
  }
};
var portalComponent = "Slot";
var collectionComponent = "ws:collection";
var collectionMeta = {
  label: "Collection",
  icon: ListViewIcon,
  contentModel: {
    category: "instance",
    children: ["instance"]
  },
  initialProps: ["data"],
  props: {
    data: {
      required: true,
      control: "json",
      type: "json"
    },
    item: {
      required: false,
      control: "text",
      type: "string"
    },
    itemKey: {
      required: false,
      control: "text",
      type: "string"
    }
  }
};
var descendantComponent = "ws:descendant";
var descendantMeta = {
  label: "Descendant",
  icon: PaintBrushIcon,
  contentModel: {
    category: "none",
    children: []
  },
  // @todo infer possible presets
  presetStyle: {},
  initialProps: ["selector"],
  props: {
    selector: {
      required: true,
      type: "string",
      control: "select",
      options: [
        " p",
        " h1",
        " h2",
        " h3",
        " h4",
        " h5",
        " h6",
        " :where(strong, b)",
        " :where(em, i)",
        " a",
        " img",
        " blockquote",
        " code",
        " :where(ul, ol)",
        " li",
        " hr"
      ]
    }
  }
};
var blockComponent = "ws:block";
var blockTemplateComponent = "ws:block-template";
var blockTemplateMeta = {
  icon: AddTemplateInstanceIcon,
  contentModel: {
    category: "none",
    children: ["instance"]
  }
};
var blockMeta = {
  label: "Content Block",
  icon: ContentBlockIcon,
  contentModel: {
    category: "instance",
    children: [blockTemplateComponent, "instance"]
  }
};
var coreMetas = {
  [rootComponent]: rootMeta,
  [elementComponent]: elementMeta,
  [collectionComponent]: collectionMeta,
  [descendantComponent]: descendantMeta,
  [blockComponent]: blockMeta,
  [blockTemplateComponent]: blockTemplateMeta
};
var isCoreComponent = (component) => component === rootComponent || component === elementComponent || component === collectionComponent || component === descendantComponent || component === blockComponent || component === blockTemplateComponent;
var isComponentDetachable = (component) => component !== rootComponent && component !== blockTemplateComponent && component !== descendantComponent;

// src/instances-utils.ts
var ROOT_INSTANCE_ID = ":root";
var traverseInstances = (instances2, instanceId3, callback) => {
  const instance2 = instances2.get(instanceId3);
  if (instance2 === void 0) {
    return;
  }
  const skipTraversingChildren = callback(instance2);
  if (skipTraversingChildren === false) {
    return;
  }
  for (const child of instance2.children) {
    if (child.type === "id") {
      traverseInstances(instances2, child.value, callback);
    }
  }
};
var findTreeInstanceIds = (instances2, rootInstanceId) => {
  const ids = /* @__PURE__ */ new Set([rootInstanceId]);
  traverseInstances(instances2, rootInstanceId, (instance2) => {
    ids.add(instance2.id);
  });
  return ids;
};
var findTreeInstanceIdsExcludingSlotDescendants = (instances2, rootInstanceId) => {
  const ids = /* @__PURE__ */ new Set([rootInstanceId]);
  traverseInstances(instances2, rootInstanceId, (instance2) => {
    ids.add(instance2.id);
    if (instance2.component === "Slot") {
      return false;
    }
  });
  return ids;
};
var parseComponentName = (componentName) => {
  const parts = componentName.split(":");
  let namespace;
  let name;
  if (parts.length === 1) {
    [name] = parts;
  } else {
    [namespace, name] = parts;
  }
  return [namespace, name];
};
var getHtmlTagsFromProps = (props2) => {
  const tags2 = /* @__PURE__ */ new Map();
  for (const prop2 of props2.values()) {
    if (prop2.type === "string" && prop2.name === "tag") {
      tags2.set(prop2.instanceId, prop2.value);
    }
  }
  return tags2;
};
var getHtmlTagFromInstance = ({
  instance: instance2,
  metas,
  props: props2,
  htmlTagsByInstanceId
}) => {
  if (instance2.component === "XmlNode") {
    return;
  }
  if (instance2.tag !== void 0) {
    return instance2.tag;
  }
  const propTag = htmlTagsByInstanceId === void 0 ? props2 === void 0 ? void 0 : getHtmlTagsFromProps(props2).get(instance2.id) : htmlTagsByInstanceId.get(instance2.id);
  if (propTag !== void 0) {
    return propTag;
  }
  const meta = metas.get(instance2.component);
  const metaTag = Object.keys(meta?.presetStyle ?? {}).at(0);
  return metaTag;
};
var getIndexesWithinAncestors = (metas, instances2, rootIds) => {
  const ancestors = /* @__PURE__ */ new Set();
  for (const meta of metas.values()) {
    if (meta.indexWithinAncestor !== void 0) {
      ancestors.add(meta.indexWithinAncestor);
    }
  }
  const indexes = /* @__PURE__ */ new Map();
  const traverseInstances2 = (instances3, instanceId3, latestIndexes2 = /* @__PURE__ */ new Map()) => {
    const instance2 = instances3.get(instanceId3);
    if (instance2 === void 0) {
      return;
    }
    const meta = metas.get(instance2.component);
    if (ancestors.has(instance2.component)) {
      latestIndexes2 = new Map(latestIndexes2);
      latestIndexes2.set(instance2.component, /* @__PURE__ */ new Map());
    }
    if (instance2.component === blockTemplateComponent) {
      latestIndexes2 = new Map(latestIndexes2);
      for (const key of latestIndexes2.keys()) {
        latestIndexes2.set(key, /* @__PURE__ */ new Map());
      }
    }
    if (meta?.indexWithinAncestor !== void 0) {
      const ancestorIndexes = latestIndexes2.get(meta.indexWithinAncestor);
      if (ancestorIndexes) {
        let index = ancestorIndexes.get(instance2.component) ?? -1;
        index += 1;
        ancestorIndexes.set(instance2.component, index);
        indexes.set(instance2.id, index);
      }
    }
    for (const child of instance2.children) {
      if (child.type === "id") {
        traverseInstances2(instances3, child.value, latestIndexes2);
      }
    }
  };
  const latestIndexes = /* @__PURE__ */ new Map();
  for (const instanceId3 of rootIds) {
    traverseInstances2(instances2, instanceId3, latestIndexes);
  }
  return indexes;
};

// src/expression.ts
import {
  parse,
  parseExpressionAt
} from "acorn";
import { simple } from "acorn-walk";
var SYSTEM_VARIABLE_ID = ":system";
var systemParameter = {
  id: SYSTEM_VARIABLE_ID,
  scopeInstanceId: ROOT_INSTANCE_ID,
  type: "parameter",
  name: "system"
};
var walkAssignmentTarget = (node, visitor) => {
  if (node.type === "Identifier") {
    visitor.Identifier?.(node, "binding");
    return;
  }
  if (node.type === "MemberExpression") {
    visitor.MemberExpression?.(node);
    const { object } = node;
    if (object.type === "Identifier") {
      visitor.Identifier?.(object, "memberObject");
    } else if (object.type === "MemberExpression") {
      walkAssignmentTarget(object, visitor);
    }
    return;
  }
  visitor.UnsupportedPattern?.(node);
};
var stringMethodReturnKindByName = /* @__PURE__ */ new Map([
  ["toLowerCase", "string"],
  ["replace", "string"],
  ["split", "array"],
  ["slice", "string"],
  ["at", "unknown"],
  ["endsWith", "boolean"],
  ["includes", "boolean"],
  ["startsWith", "boolean"],
  ["toString", "string"],
  ["toUpperCase", "string"],
  ["toLocaleLowerCase", "string"],
  ["toLocaleUpperCase", "string"]
]);
var arrayMethodReturnKindByName = /* @__PURE__ */ new Map([
  ["at", "unknown"],
  ["includes", "boolean"],
  ["join", "string"],
  ["slice", "array"],
  ["toString", "string"]
]);
var allowedStringMethods = new Set(
  stringMethodReturnKindByName.keys()
);
var allowedArrayMethods = new Set(arrayMethodReturnKindByName.keys());
var getVariableValue = (variableValues, name) => {
  if (variableValues === void 0) {
    return;
  }
  const maybeMap = variableValues;
  if (typeof maybeMap.has === "function" && typeof maybeMap.get === "function") {
    if (maybeMap.has(name)) {
      return { value: maybeMap.get(name) };
    }
    return;
  }
  const record = variableValues;
  if (Object.hasOwn(record, name)) {
    return { value: record[name] };
  }
};
var getValueKind = (value) => {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === void 0 || value === null) {
    return "nullish";
  }
  switch (typeof value) {
    case "bigint":
      return "bigint";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object":
      return "object";
    default:
      return "unknown";
  }
};
var getMethodReturnKind = (receiverKind, methodName) => {
  if (receiverKind === "array") {
    return arrayMethodReturnKindByName.get(methodName) ?? "unknown";
  }
  if (receiverKind === "string") {
    return stringMethodReturnKindByName.get(methodName) ?? "unknown";
  }
  if (receiverKind === "unknown") {
    const stringReturnKind = stringMethodReturnKindByName.get(methodName);
    const arrayReturnKind = arrayMethodReturnKindByName.get(methodName);
    if (stringReturnKind && arrayReturnKind === void 0) {
      return stringReturnKind;
    }
    if (arrayReturnKind && stringReturnKind === void 0) {
      return arrayReturnKind;
    }
    if (stringReturnKind === arrayReturnKind) {
      return stringReturnKind ?? "unknown";
    }
    return "unknown";
  }
  return methodName === "toString" ? "string" : "unknown";
};
var isMethodSupported = (receiverKind, methodName) => {
  if (receiverKind === "unknown") {
    return allowedStringMethods.has(methodName) || allowedArrayMethods.has(methodName);
  }
  if (receiverKind === "string") {
    return stringMethodReturnKindByName.has(methodName);
  }
  if (receiverKind === "array") {
    return arrayMethodReturnKindByName.has(methodName);
  }
  if (receiverKind === "nullish") {
    return false;
  }
  return methodName === "toString";
};
var getExpressionNodeValueKind = (node, variableValues) => {
  if (node.type === "Identifier") {
    if (node.name === "undefined") {
      return "nullish";
    }
    const variable = getVariableValue(variableValues, node.name);
    return variable ? getValueKind(variable.value) : "unknown";
  }
  if (node.type === "Literal") {
    return getValueKind(node.value);
  }
  if (node.type === "ArrayExpression") {
    return "array";
  }
  if (node.type === "ObjectExpression") {
    return "object";
  }
  if (node.type === "TemplateLiteral") {
    return "string";
  }
  if (node.type === "ChainExpression" || node.type === "ParenthesizedExpression") {
    return getExpressionNodeValueKind(node.expression, variableValues);
  }
  if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.callee.object.type !== "Super" && node.callee.property.type === "Identifier") {
    const receiverKind = getExpressionNodeValueKind(
      node.callee.object,
      variableValues
    );
    const methodName = node.callee.property.name;
    if (isMethodSupported(receiverKind, methodName)) {
      return getMethodReturnKind(receiverKind, methodName);
    }
  }
  return "unknown";
};
var getExpressionValueKind = ({
  expression,
  variableValues
}) => {
  try {
    const node = parseExpressionAt(expression, 0, { ecmaVersion: "latest" });
    return getExpressionNodeValueKind(node, variableValues);
  } catch {
    return "unknown";
  }
};
var lintExpression = ({
  expression,
  availableVariables = /* @__PURE__ */ new Set(),
  allowAssignment = false,
  variableValues
}) => {
  const diagnostics = [];
  const addMessage = (message, severity = "error") => {
    return (node) => {
      diagnostics.push({
        // tune error position after wrapping expression with parentheses
        from: node.start - 1,
        to: node.end - 1,
        severity,
        message
      });
    };
  };
  if (expression.trim().length === 0) {
    diagnostics.push({
      from: 0,
      to: 0,
      severity: "error",
      message: "Expression cannot be empty"
    });
    return diagnostics;
  }
  try {
    const root = parse(`(${expression})`, {
      ecmaVersion: "latest",
      // support parsing import to forbid explicitly
      sourceType: "module"
    });
    simple(root, {
      Identifier(node) {
        if (availableVariables.has(node.name) === false) {
          addMessage(
            `"${node.name}" is not defined in the scope`,
            "warning"
          )(node);
        }
      },
      Literal() {
      },
      ArrayExpression() {
      },
      ObjectExpression() {
      },
      UnaryExpression() {
      },
      BinaryExpression() {
      },
      LogicalExpression() {
      },
      MemberExpression() {
      },
      ConditionalExpression() {
      },
      TemplateLiteral() {
      },
      ChainExpression() {
      },
      ParenthesizedExpression() {
      },
      AssignmentExpression(node) {
        if (allowAssignment === false) {
          addMessage("Assignment is supported only inside actions")(node);
          return;
        }
        walkAssignmentTarget(node.left, {
          Identifier(node2, kind) {
            if (kind !== "binding") {
              return;
            }
            if (availableVariables.has(node2.name) === false) {
              addMessage(
                `"${node2.name}" is not defined in the scope`,
                "warning"
              )(node2);
            }
          },
          UnsupportedPattern: addMessage(
            "Destructuring assignment is not supported"
          )
        });
      },
      // parser forbids to yield inside module
      YieldExpression() {
      },
      ThisExpression: addMessage(`"this" keyword is not supported`),
      FunctionExpression: addMessage("Functions are not supported"),
      UpdateExpression: addMessage("Increment and decrement are not supported"),
      CallExpression(node) {
        let calleeName;
        if (node.callee.type === "MemberExpression") {
          if (node.callee.property.type === "Identifier") {
            const methodName = node.callee.property.name;
            const receiverKind = node.callee.object.type === "Super" ? "unknown" : getExpressionNodeValueKind(
              node.callee.object,
              variableValues
            );
            if (isMethodSupported(receiverKind, methodName)) {
              return;
            }
            calleeName = methodName;
          }
        } else if (node.callee.type === "Identifier") {
          calleeName = node.callee.name;
        }
        if (calleeName) {
          addMessage(`"${calleeName}" function is not supported`)(node);
        } else {
          addMessage("Functions are not supported")(node);
        }
      },
      NewExpression: addMessage("Classes are not supported"),
      SequenceExpression: addMessage(`Only single expression is supported`),
      ArrowFunctionExpression: addMessage("Functions are not supported"),
      TaggedTemplateExpression: addMessage("Tagged template is not supported"),
      ClassExpression: addMessage("Classes are not supported"),
      MetaProperty: addMessage("Imports are not supported"),
      AwaitExpression: addMessage(`"await" keyword is not supported`),
      ImportExpression: addMessage("Imports are not supported")
    });
  } catch (error) {
    const castedError = error;
    diagnostics.push({
      // tune error position after wrapping expression with parentheses
      from: castedError.pos - 1,
      to: castedError.pos - 1,
      severity: "error",
      // trim auto generated error location
      // to not conflict with tuned position
      message: castedError.message.replaceAll(/\s+\(\d+:\d+\)$/g, "")
    });
  }
  return diagnostics;
};
var isLiteralNode = (node) => {
  if (node.type === "Identifier" && node.name === "undefined") {
    return true;
  }
  if (node.type === "Literal") {
    return true;
  }
  if (node.type === "ArrayExpression") {
    return node.elements.every((node2) => {
      if (node2 === null || node2.type === "SpreadElement") {
        return false;
      }
      return isLiteralNode(node2);
    });
  }
  if (node.type === "ObjectExpression") {
    return node.properties.every((property) => {
      if (property.type === "SpreadElement") {
        return false;
      }
      const key = property.key;
      const isIdentifierKey = key.type === "Identifier" && property.computed === false;
      const isLiteralKey = key.type === "Literal";
      return (isLiteralKey || isIdentifierKey) && isLiteralNode(property.value);
    });
  }
  return false;
};
var isLiteralExpression = (expression) => {
  try {
    const node = parseExpressionAt(expression, 0, { ecmaVersion: "latest" });
    return isLiteralNode(node);
  } catch {
    return false;
  }
};
var getExpressionIdentifiers = (expression) => {
  const identifiers2 = /* @__PURE__ */ new Set();
  try {
    const root = parseExpressionAt(expression, 0, { ecmaVersion: "latest" });
    simple(root, {
      Identifier: (node) => identifiers2.add(node.name),
      AssignmentExpression(node) {
        walkAssignmentTarget(node.left, {
          Identifier: (node2) => identifiers2.add(node2.name)
        });
      }
    });
  } catch {
  }
  return identifiers2;
};
var transpileExpression = ({
  expression,
  executable = false,
  replaceVariable
}) => {
  let root;
  try {
    root = parseExpressionAt(expression, 0, { ecmaVersion: "latest" });
  } catch (error) {
    const message = error.message;
    throw Error(`${message} in ${JSON.stringify(expression)}`);
  }
  const assignmentTargetMemberRanges = [];
  if (executable) {
    simple(root, {
      AssignmentExpression(node) {
        walkAssignmentTarget(node.left, {
          MemberExpression(node2) {
            assignmentTargetMemberRanges.push([node2.start, node2.end]);
          }
        });
      }
    });
  }
  const replacements = [];
  const replacementIndexByRange = /* @__PURE__ */ new Map();
  const addReplacement = (start, end, fragment, { replaceExisting = false } = {}) => {
    const range2 = `${start}:${end}`;
    const existingIndex = replacementIndexByRange.get(range2);
    if (existingIndex !== void 0) {
      if (replaceExisting) {
        replacements[existingIndex] = [start, end, fragment];
      }
      return;
    }
    replacementIndexByRange.set(range2, replacements.length);
    replacements.push([start, end, fragment]);
  };
  const replaceIdentifier = (node, assignee) => {
    const newName = replaceVariable?.(node.name, assignee);
    if (newName) {
      addReplacement(node.start, node.end, newName, {
        replaceExisting: assignee
      });
    }
  };
  simple(root, {
    Identifier: (node) => replaceIdentifier(node, false),
    AssignmentExpression(node) {
      walkAssignmentTarget(node.left, {
        Identifier: (node2) => replaceIdentifier(node2, true)
      });
    },
    MemberExpression(node) {
      if (executable === false || node.optional) {
        return;
      }
      if (assignmentTargetMemberRanges.some(
        ([start, end]) => start === node.start && end === node.end
      )) {
        return;
      }
      if (node.computed === false) {
        const dotIndex = expression.indexOf(".", node.object.end);
        addReplacement(dotIndex, dotIndex, "?");
      }
      if (node.computed === true) {
        const dotIndex = expression.indexOf("[", node.object.end);
        addReplacement(dotIndex, dotIndex, "?.");
      }
    },
    CallExpression(node) {
      if (executable === false || node.optional) {
        return;
      }
      if (node.callee.type === "MemberExpression") {
        const openParenIndex = expression.indexOf("(", node.callee.end);
        if (openParenIndex !== -1) {
          addReplacement(openParenIndex, openParenIndex, "?.");
        }
      }
    }
  });
  replacements.sort(([leftStart], [rightStart]) => rightStart - leftStart);
  for (const [start, end, fragment] of replacements) {
    const before = expression.slice(0, start);
    const after = expression.slice(end);
    expression = before + fragment + after;
  }
  return expression;
};
var parseObjectExpression = (expression) => {
  const map = /* @__PURE__ */ new Map();
  let root;
  try {
    root = parseExpressionAt(expression, 0, { ecmaVersion: "latest" });
  } catch (error) {
    return map;
  }
  if (root.type !== "ObjectExpression") {
    return map;
  }
  for (const property of root.properties) {
    if (property.type === "SpreadElement") {
      continue;
    }
    if (property.computed) {
      continue;
    }
    let key;
    if (property.key.type === "Identifier") {
      key = property.key.name;
    } else if (property.key.type === "Literal" && typeof property.key.value === "string") {
      key = property.key.value;
    } else {
      continue;
    }
    const valueExpression = expression.slice(
      property.value.start,
      property.value.end
    );
    map.set(key, valueExpression);
  }
  return map;
};
var generateObjectExpression = (map) => {
  let generated = "{\n";
  for (const [key, valueExpression] of map) {
    const keyExpression = JSON.stringify(key);
    generated += `  ${keyExpression}: ${valueExpression},
`;
  }
  generated += `}`;
  return generated;
};
var dataSourceVariablePrefix = "$ws$dataSource$";
var encodeDataVariableId = (id) => {
  if (id === SYSTEM_VARIABLE_ID) {
    return "$ws$system";
  }
  const encoded = id.replaceAll("-", "__DASH__");
  return `${dataSourceVariablePrefix}${encoded}`;
};
var decodeDataVariableId = (name) => {
  if (name === "$ws$system") {
    return SYSTEM_VARIABLE_ID;
  }
  if (name.startsWith(dataSourceVariablePrefix)) {
    const encoded = name.slice(dataSourceVariablePrefix.length);
    return encoded.replaceAll("__DASH__", "-");
  }
  return;
};
var generateExpression = ({
  expression,
  dataSources: dataSources2,
  usedDataSources,
  scope
}) => {
  return transpileExpression({
    expression,
    executable: true,
    replaceVariable: (identifier) => {
      const depId = decodeDataVariableId(identifier);
      let dep = depId ? dataSources2.get(depId) : void 0;
      if (depId === SYSTEM_VARIABLE_ID) {
        dep = systemParameter;
      }
      if (dep) {
        usedDataSources?.set(dep.id, dep);
        return scope.getName(dep.id, dep.name);
      }
      return "undefined";
    }
  });
};
var executeExpression = (expression) => {
  try {
    const fn = new Function(`return (${expression})`);
    return fn();
  } catch {
  }
};

// src/url-pattern.ts
var tokenRegex = /:(?<name>\w+)(?<modifier>[?*]?)|(?<wildcard>(?<!:\w+)\*)/;
var isPathnamePattern = (pathname) => tokenRegex.test(pathname);
var tokenRegexGlobal = new RegExp(tokenRegex.source, "g");
var matchPathnameParams = (pathname) => {
  return pathname.matchAll(tokenRegexGlobal);
};
var isAbsoluteUrl = (href) => {
  try {
    new URL(href);
    return true;
  } catch {
    return false;
  }
};

// src/page-utils.ts
var ROOT_FOLDER_ID = "root";
var isPage = (page2) => page2 !== void 0 && "path" in page2;
var isPageTemplate = (page2) => page2 !== void 0 && !("path" in page2);
var isRootFolder = ({ id }) => id === ROOT_FOLDER_ID;
var getPageById = (pages2, pageId2) => {
  return pages2.pages.get(pageId2);
};
var getFolderById = (pages2, folderId2) => {
  return pages2.folders.get(folderId2);
};
var getAllPages = (pages2) => {
  return Array.from(pages2.pages.values());
};
var getAllFolders = (pages2) => {
  return Array.from(pages2.folders.values());
};
var getHomePage = (pages2) => {
  const homePage = getPageById(pages2, pages2.homePageId);
  if (homePage === void 0) {
    throw new Error(`Home page "${pages2.homePageId}" was not found.`);
  }
  return homePage;
};
function findPageByIdOrPath(idOrPath, pages2, options = {}) {
  if (idOrPath === "" || idOrPath === "/" || idOrPath === pages2.homePageId) {
    return getHomePage(pages2);
  }
  const found = getAllPages(pages2).find(
    (page2) => page2.id === idOrPath || getPagePath(page2.id, pages2) === idOrPath
  );
  if (found) {
    return found;
  }
  if (options.includeTemplates) {
    return pages2.pageTemplates?.get(idOrPath);
  }
}
var findParentFolderByChildId = (id, folders) => {
  const folderList = folders instanceof Map ? folders.values() : folders;
  for (const folder2 of folderList) {
    if (folder2.children.includes(id)) {
      return folder2;
    }
  }
};
var getPagePath = (id, pages2) => {
  const foldersMap = /* @__PURE__ */ new Map();
  const childParentMap = /* @__PURE__ */ new Map();
  for (const folder2 of getAllFolders(pages2)) {
    foldersMap.set(folder2.id, folder2);
    for (const childId of folder2.children) {
      childParentMap.set(childId, folder2.id);
    }
  }
  const paths = [];
  let currentId = id;
  const allPages = getAllPages(pages2);
  for (const page2 of allPages) {
    if (page2.id === id) {
      paths.push(page2.path);
      currentId = childParentMap.get(page2.id);
      break;
    }
  }
  while (currentId) {
    const folder2 = foldersMap.get(currentId);
    if (folder2 === void 0) {
      break;
    }
    paths.push(folder2.slug);
    currentId = childParentMap.get(currentId);
  }
  return paths.reverse().join("/").replace(/\/+/g, "/");
};
var getStaticSiteMapXml = (pages2, updatedAt) => {
  const allPages = getAllPages(pages2);
  return allPages.filter((page2) => (page2.meta.documentType ?? "html") === "html").filter(
    (page2) => executeExpression(page2.meta.excludePageFromSearch) !== true
  ).filter((page2) => false === isPathnamePattern(page2.path)).map((page2) => ({
    path: getPagePath(page2.id, pages2),
    lastModified: updatedAt.split("T")[0]
  }));
};

// src/scope.ts
import reservedIdentifiers from "reserved-identifiers";
var identifiers = reservedIdentifiers({ includeGlobalProperties: true });
var isReserved = (identifier) => identifiers.has(identifier);
var normalizeJsName = (name) => {
  name = name.replaceAll(/[^\w$]/g, "");
  if (name.length === 0) {
    return "_";
  }
  if (/[A-Za-z_$]/.test(name[0]) === false) {
    name = `_${name}`;
  }
  if (isReserved(name)) {
    return `${name}_`;
  }
  return name;
};
var createScope = (occupiedIdentifiers = [], normalizeName = normalizeJsName, separator = "_") => {
  const nameById = /* @__PURE__ */ new Map();
  const usedNames = /* @__PURE__ */ new Set();
  for (const identifier of occupiedIdentifiers) {
    usedNames.add(identifier);
  }
  const getName = (id, preferredName) => {
    const cachedName = nameById.get(id);
    if (cachedName !== void 0) {
      return cachedName;
    }
    preferredName = normalizeName(preferredName);
    let index = 0;
    let scopedName = preferredName;
    while (usedNames.has(scopedName)) {
      index += 1;
      scopedName = `${preferredName}${separator}${index}`;
    }
    nameById.set(id, scopedName);
    usedNames.add(scopedName);
    return scopedName;
  };
  return {
    getName
  };
};

// src/resources-generator.ts
var generateResources = ({
  scope,
  page: page2,
  dataSources: dataSources2,
  props: props2,
  resources: resources2
}) => {
  const usedDataSources = /* @__PURE__ */ new Map();
  let generatedRequests = "";
  for (const resource3 of resources2.values()) {
    let generatedRequest = "";
    const resourceName = scope.getName(resource3.id, resource3.name);
    generatedRequest += `  const ${resourceName}: ResourceRequest = {
`;
    generatedRequest += `    name: ${JSON.stringify(resource3.name)},
`;
    const url2 = generateExpression({
      expression: resource3.url,
      dataSources: dataSources2,
      usedDataSources,
      scope
    });
    generatedRequest += `    url: ${url2},
`;
    generatedRequest += `    searchParams: [
`;
    for (const searchParam of resource3.searchParams ?? []) {
      const value = generateExpression({
        expression: searchParam.value,
        dataSources: dataSources2,
        usedDataSources,
        scope
      });
      generatedRequest += `      { name: "${searchParam.name}", value: ${value} },
`;
    }
    generatedRequest += `    ],
`;
    generatedRequest += `    method: "${resource3.method}",
`;
    generatedRequest += `    headers: [
`;
    for (const header2 of resource3.headers) {
      const value = generateExpression({
        expression: header2.value,
        dataSources: dataSources2,
        usedDataSources,
        scope
      });
      generatedRequest += `      { name: "${header2.name}", value: ${value} },
`;
    }
    generatedRequest += `    ],
`;
    if (resource3.body !== void 0 && resource3.body.length > 0) {
      const body2 = generateExpression({
        expression: resource3.body,
        dataSources: dataSources2,
        usedDataSources,
        scope
      });
      generatedRequest += `    body: ${body2},
`;
    }
    generatedRequest += `  }
`;
    generatedRequests += generatedRequest;
  }
  let generatedVariables = "";
  for (const dataSource2 of usedDataSources.values()) {
    if (dataSource2.type === "variable") {
      const name = scope.getName(dataSource2.id, dataSource2.name);
      const value = JSON.stringify(dataSource2.value.value);
      generatedVariables += `  let ${name} = ${value}
`;
    }
    if (dataSource2.type === "parameter") {
      if (dataSource2.id === page2.systemDataSourceId || dataSource2.id === SYSTEM_VARIABLE_ID) {
        const name = scope.getName(dataSource2.id, dataSource2.name);
        generatedVariables += `  const ${name} = _props.system
`;
      }
    }
  }
  let generated = "";
  generated += `import type { System, ResourceRequest } from "@webstudio-is/sdk";
`;
  generated += `export const getResources = (_props: { system: System }) => {
`;
  generated += generatedVariables;
  generated += generatedRequests;
  generated += `  const _data = new Map<string, ResourceRequest>([
`;
  for (const dataSource2 of dataSources2.values()) {
    if (dataSource2.type === "resource") {
      const name = scope.getName(dataSource2.resourceId, dataSource2.name);
      generated += `    ["${name}", ${name}],
`;
    }
  }
  generated += `  ])
`;
  generated += `  const _action = new Map<string, ResourceRequest>([
`;
  for (const prop2 of props2.values()) {
    if (prop2.type === "resource") {
      const name = scope.getName(prop2.value, prop2.name);
      generated += `    ["${name}", ${name}],
`;
    }
  }
  generated += `  ])
`;
  generated += `  return { data: _data, action: _action }
`;
  generated += `}
`;
  return generated;
};
var getMethod = (value) => {
  switch (value?.toLowerCase()) {
    case "get":
      return "get";
    case "delete":
      return "delete";
    case "put":
      return "put";
    default:
      return "post";
  }
};
var replaceFormActionsWithResources = ({
  props: props2,
  instances: instances2,
  resources: resources2
}) => {
  const formProps = /* @__PURE__ */ new Map();
  for (const prop2 of props2.values()) {
    if (prop2.name === "method" && prop2.type === "string" && instances2.get(prop2.instanceId)?.component === "Form") {
      let data = formProps.get(prop2.instanceId);
      if (data === void 0) {
        data = {};
        formProps.set(prop2.instanceId, data);
      }
      data.method = prop2.value;
      props2.delete(prop2.id);
    }
    if (prop2.name === "action" && prop2.type === "string" && prop2.value && instances2.get(prop2.instanceId)?.component === "Form") {
      let data = formProps.get(prop2.instanceId);
      if (data === void 0) {
        data = {};
        formProps.set(prop2.instanceId, data);
      }
      data.action = prop2.value;
      props2.set(prop2.id, {
        id: prop2.id,
        instanceId: prop2.instanceId,
        name: prop2.name,
        type: "resource",
        value: prop2.instanceId
      });
    }
  }
  for (const [instanceId3, { action: action2, method: method2 }] of formProps) {
    if (action2) {
      resources2.set(instanceId3, {
        id: instanceId3,
        name: "action",
        method: getMethod(method2),
        url: JSON.stringify(action2),
        headers: [
          { name: "Content-Type", value: JSON.stringify("application/json") }
        ]
      });
    }
  }
};

// src/page-meta-generator.ts
var generatePageMeta = ({
  globalScope,
  page: page2,
  dataSources: dataSources2,
  assets: assets2
}) => {
  const localScope = createScope(["system", "resources"]);
  const usedDataSources = /* @__PURE__ */ new Map();
  const titleExpression = generateExpression({
    expression: page2.title,
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const descriptionExpression = generateExpression({
    expression: page2.meta.description ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const excludePageFromSearchExpression = generateExpression({
    expression: page2.meta.excludePageFromSearch ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const languageExpression = generateExpression({
    expression: page2.meta.language ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const socialImageAssetNameExpression = JSON.stringify(
    page2.meta.socialImageAssetId ? assets2.get(page2.meta.socialImageAssetId)?.name : void 0
  );
  const socialImageUrlExpression = generateExpression({
    expression: page2.meta.socialImageUrl ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const statusExpression = generateExpression({
    expression: page2.meta.status ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const redirectExpression = generateExpression({
    expression: page2.meta.redirect ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  const contentExpression = generateExpression({
    expression: page2.meta.content ?? "undefined",
    dataSources: dataSources2,
    usedDataSources,
    scope: localScope
  });
  let customExpression = "";
  customExpression += `[
`;
  for (const customMeta of page2.meta.custom ?? []) {
    if (customMeta.property.trim().length === 0) {
      continue;
    }
    const propertyExpression = JSON.stringify(customMeta.property);
    const contentExpression2 = generateExpression({
      expression: customMeta.content,
      dataSources: dataSources2,
      usedDataSources,
      scope: localScope
    });
    customExpression += `      {
`;
    customExpression += `        property: ${propertyExpression},
`;
    customExpression += `        content: ${contentExpression2},
`;
    customExpression += `      },
`;
  }
  customExpression += `    ]`;
  let generated = "";
  generated += `export const getPageMeta = ({
`;
  generated += `  system,
`;
  generated += `  resources,
`;
  generated += `}: {
`;
  generated += `  system: System;
`;
  generated += `  resources: Record<string, any>;
`;
  generated += `}): PageMeta => {
`;
  for (const dataSource2 of usedDataSources.values()) {
    if (dataSource2.type === "variable") {
      const valueName = localScope.getName(dataSource2.id, dataSource2.name);
      const initialValueString = JSON.stringify(dataSource2.value.value);
      generated += `  let ${valueName} = ${initialValueString}
`;
      continue;
    }
    if (dataSource2.type === "parameter") {
      if (dataSource2.id === page2.systemDataSourceId || dataSource2.id === SYSTEM_VARIABLE_ID) {
        const valueName = localScope.getName(dataSource2.id, dataSource2.name);
        generated += `  let ${valueName} = system
`;
      }
      continue;
    }
    if (dataSource2.type === "resource") {
      const valueName = localScope.getName(dataSource2.id, dataSource2.name);
      const resourceName = globalScope.getName(
        dataSource2.resourceId,
        dataSource2.name
      );
      generated += `  let ${valueName} = resources.${resourceName}
`;
      continue;
    }
  }
  generated += `  return {
`;
  generated += `    title: ${titleExpression},
`;
  generated += `    description: ${descriptionExpression},
`;
  generated += `    excludePageFromSearch: ${excludePageFromSearchExpression},
`;
  generated += `    language: ${languageExpression},
`;
  generated += `    socialImageAssetName: ${socialImageAssetNameExpression},
`;
  generated += `    socialImageUrl: ${socialImageUrlExpression},
`;
  generated += `    status: ${statusExpression},
`;
  generated += `    redirect: ${redirectExpression},
`;
  generated += `    content: ${contentExpression},
`;
  generated += `    custom: ${customExpression},
`;
  generated += `  };
`;
  generated += `};
`;
  return generated;
};

// src/link-utils.ts
var isInternalHref = (href, assetBaseUrl) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) === false && (assetBaseUrl !== "" && href.startsWith("/") && href.startsWith(assetBaseUrl)) === false;
var resolveLocalLinkUrl = (href, location, resolvedPath) => {
  if (href === "") {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: ""
    };
  }
  if (href.startsWith("#")) {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: href === "#" ? "" : href
    };
  }
  return resolvedPath;
};
var isLocalLinkActive = (current, target) => {
  return current.pathname === target.pathname && current.search === target.search && current.hash === target.hash;
};

// src/css.ts
import { kebabCase } from "change-case";
import {
  createRegularStyleSheet,
  generateAtomic
} from "@webstudio-is/css-engine";
import { getFontFaces } from "@webstudio-is/fonts";
var addFontRules = ({
  sheet,
  assets: assets2,
  assetBaseUrl
}) => {
  const fontAssets = [];
  for (const asset2 of assets2.values()) {
    if (asset2.type === "font") {
      fontAssets.push(asset2);
    }
  }
  const fontFaces = getFontFaces(fontAssets, { assetBaseUrl });
  for (const fontFace of fontFaces) {
    sheet.addFontFaceRule(fontFace);
  }
};
var createImageValueTransformer = (assets2, { assetBaseUrl }) => (styleValue4) => {
  if (styleValue4.type === "image" && styleValue4.value.type === "asset") {
    const asset2 = assets2.get(styleValue4.value.value);
    if (asset2 === void 0) {
      return { type: "keyword", value: "none" };
    }
    const url2 = `${assetBaseUrl}${asset2.name}`;
    return {
      type: "image",
      value: {
        type: "url",
        url: url2
      },
      hidden: styleValue4.hidden
    };
  }
};
var normalizeClassName = (name) => kebabCase(name);
var generateCss = ({
  assets: assets2,
  instances: instances2,
  props: props2,
  breakpoints: breakpoints2,
  styles: styles2,
  styleSourceSelections: styleSourceSelections2,
  componentMetas,
  assetBaseUrl,
  atomic
}) => {
  const fontSheet = createRegularStyleSheet({ name: "ssr" });
  const presetSheet = createRegularStyleSheet({ name: "ssr" });
  const userSheet = createRegularStyleSheet({ name: "ssr" });
  addFontRules({ sheet: fontSheet, assets: assets2, assetBaseUrl });
  presetSheet.addMediaRule("presets");
  const presetClasses = /* @__PURE__ */ new Map();
  const scope = createScope([], normalizeClassName, "-");
  const tagsByComponent = /* @__PURE__ */ new Map();
  tagsByComponent.set(rootComponent, /* @__PURE__ */ new Set(["html"]));
  const htmlTagsByInstanceId = getHtmlTagsFromProps(props2);
  for (const instance2 of instances2.values()) {
    let componentTags = tagsByComponent.get(instance2.component);
    if (componentTags === void 0) {
      componentTags = /* @__PURE__ */ new Set();
      tagsByComponent.set(instance2.component, componentTags);
    }
    const tag2 = getHtmlTagFromInstance({
      instance: instance2,
      metas: componentMetas,
      props: props2,
      htmlTagsByInstanceId
    });
    if (tag2) {
      componentTags.add(tag2);
    }
  }
  for (const [component, meta] of componentMetas) {
    const componentTags = tagsByComponent.get(component);
    const [_namespace, componentName] = parseComponentName(component);
    const className = `w-${scope.getName(component, meta.label ?? componentName)}`;
    const presetStyle = Object.entries(meta.presetStyle ?? {});
    if (presetStyle.length > 0) {
      presetClasses.set(component, className);
    }
    for (const [tag2, styles3] of presetStyle) {
      if (!componentTags?.has(tag2)) {
        continue;
      }
      const selector = component === rootComponent ? ":root" : `${tag2}.${className}`;
      const rule = presetSheet.addNestingRule(selector);
      for (const declaration of styles3) {
        rule.setDeclaration({
          breakpoint: "presets",
          selector: declaration.state ?? "",
          property: declaration.property,
          value: declaration.value
        });
      }
    }
  }
  for (const breakpoint2 of breakpoints2.values()) {
    userSheet.addMediaRule(breakpoint2.id, breakpoint2);
  }
  const imageValueTransformer = createImageValueTransformer(assets2, {
    assetBaseUrl
  });
  userSheet.setTransformer(imageValueTransformer);
  for (const styleDecl2 of styles2.values()) {
    const rule = userSheet.addMixinRule(styleDecl2.styleSourceId);
    rule.setDeclaration({
      breakpoint: styleDecl2.breakpointId,
      selector: styleDecl2.state ?? "",
      property: styleDecl2.property,
      value: styleDecl2.value
    });
  }
  const classes = /* @__PURE__ */ new Map();
  const parentIdByInstanceId = /* @__PURE__ */ new Map();
  for (const instance2 of instances2.values()) {
    const presetClass = presetClasses.get(instance2.component);
    if (presetClass) {
      classes.set(instance2.id, [presetClass]);
    }
    for (const child of instance2.children) {
      if (child.type === "id") {
        parentIdByInstanceId.set(child.value, instance2.id);
      }
    }
  }
  const descendantSelectorByInstanceId = /* @__PURE__ */ new Map();
  for (const prop2 of props2.values()) {
    if (prop2.name === "selector" && prop2.type === "string") {
      descendantSelectorByInstanceId.set(prop2.instanceId, prop2.value);
    }
  }
  const instanceByRule = /* @__PURE__ */ new Map();
  for (const selection of styleSourceSelections2.values()) {
    let { instanceId: instanceId3 } = selection;
    const { values } = selection;
    if (instanceId3 === ROOT_INSTANCE_ID) {
      const rule2 = userSheet.addNestingRule(`:root`);
      rule2.applyMixins(values);
      continue;
    }
    let descendantSuffix = "";
    const instance2 = instances2.get(instanceId3);
    if (instance2 === void 0) {
      continue;
    }
    if (instance2.component === descendantComponent) {
      const parentId = parentIdByInstanceId.get(instanceId3);
      const descendantSelector = descendantSelectorByInstanceId.get(instanceId3);
      if (parentId && descendantSelector) {
        descendantSuffix = descendantSelector;
        instanceId3 = parentId;
      }
    }
    const meta = componentMetas.get(instance2.component);
    const [_namespace, shortName] = parseComponentName(instance2.component);
    const baseName = instance2.label ?? meta?.label ?? shortName;
    const className = `w-${scope.getName(instanceId3, baseName)}`;
    if (atomic === false) {
      let classList = classes.get(instanceId3);
      if (classList === void 0) {
        classList = [];
        classes.set(instanceId3, classList);
      }
      classList.push(className);
    }
    const rule = userSheet.addNestingRule(`.${className}`, descendantSuffix);
    rule.applyMixins(values);
    instanceByRule.set(rule, instanceId3);
  }
  const fontCss = fontSheet.cssText;
  const presetCss = presetSheet.cssText.replaceAll(
    "@media all ",
    "@layer presets "
  );
  if (atomic) {
    const { cssText } = generateAtomic(userSheet, {
      getKey: (rule) => instanceByRule.get(rule),
      transformValue: imageValueTransformer,
      classes
    });
    return {
      cssText: `${fontCss}${presetCss}
${cssText}`,
      classes
    };
  }
  return {
    cssText: `${fontCss}${presetCss}
${userSheet.cssText}`,
    classes
  };
};
export {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  FILE_EXTENSIONS_BY_CATEGORY,
  FONT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  MIME_CATEGORIES,
  RANGE_UNITS,
  RESIZABLE_IMAGE_MIME_TYPES,
  ROOT_FOLDER_ID,
  ROOT_INSTANCE_ID,
  SYSTEM_VARIABLE_ID,
  VIDEO_EXTENSIONS,
  VIDEO_MIME_TYPES,
  acceptToMimeCategories,
  acceptToMimePatterns,
  addFontRules,
  allowedArrayMethods,
  allowedStringMethods,
  animationAction,
  animationKeyframe,
  asset,
  assetType,
  assets,
  blockComponent,
  blockTemplateComponent,
  blockTemplateMeta,
  breakpoint,
  breakpoints,
  collectionComponent,
  compilerSettings,
  componentCategories,
  componentState,
  contentModel,
  coreMetas,
  createImageValueTransformer,
  createScope,
  dataSource,
  dataSourceVariableValue,
  dataSources,
  decodeDataVariableId as decodeDataSourceVariable,
  decodeDataVariableId,
  decodePathFragment,
  deployment,
  descendantComponent,
  detectAssetType,
  documentTypes,
  doesAssetMatchMimePatterns,
  durationUnitValue,
  elementComponent,
  encodeDataVariableId as encodeDataSourceVariable,
  encodeDataVariableId,
  executeExpression,
  expressionChild,
  fileAsset,
  findPageByIdOrPath,
  findParentFolderByChildId,
  findTreeInstanceIds,
  findTreeInstanceIdsExcludingSlotDescendants,
  folder,
  folderId,
  folderName,
  fontAsset,
  generateCss,
  generateExpression,
  generateObjectExpression,
  generatePageMeta,
  generateResources,
  getAllFolders,
  getAllPages,
  getAssetMime,
  getAssetUrl,
  getExpressionIdentifiers,
  getExpressionValueKind,
  getFolderById,
  getHomePage,
  getHtmlTagFromInstance,
  getHtmlTagsFromProps,
  getIndexesWithinAncestors,
  getMimeTypeByExtension,
  getMimeTypeByFilename,
  getPageById,
  getPagePath,
  getStaticSiteMapXml,
  getStyleDeclKey,
  homePagePath,
  idChild,
  imageAsset,
  imageMeta,
  initialBreakpoints,
  insetUnitValue,
  instance,
  instanceChild,
  instances,
  isAbsoluteUrl,
  isAllowedExtension,
  isAllowedMimeCategory,
  isComponentDetachable,
  isCoreComponent,
  isInternalHref,
  isLiteralExpression,
  isLocalLinkActive,
  isPage,
  isPageTemplate,
  isPathnamePattern,
  isRootFolder,
  lintExpression,
  matchPathnameParams,
  page,
  pageAuth,
  pageId,
  pageName,
  pagePath,
  pageRedirect,
  pageTemplate,
  pageTitle,
  pages,
  parseComponentName,
  parseObjectExpression,
  portalComponent,
  presetStyleDecl,
  projectMeta,
  projectNewRedirectPath,
  prop,
  propMeta,
  props,
  rangeUnitValue,
  redirectSourcePath,
  replaceFormActionsWithResources,
  resolveLocalLinkUrl,
  resource,
  resourceRequest,
  resources,
  rootComponent,
  scrollAnimation,
  styleDecl,
  styleSource,
  styleSourceSelection,
  styleSourceSelections,
  styleSources,
  styles,
  systemParameter,
  tags,
  templates,
  textChild,
  toRuntimeAsset,
  transpileExpression,
  validateFileName,
  viewAnimation,
  webstudioFragment,
  wsComponentMeta
};
