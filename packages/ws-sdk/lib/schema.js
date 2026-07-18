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

// src/schema/breakpoints.ts
import { z as z2 } from "zod";
var breakpointId = z2.string();
var breakpoint = z2.object({
  id: breakpointId,
  label: z2.string(),
  minWidth: z2.number().optional(),
  maxWidth: z2.number().optional(),
  condition: z2.string().optional()
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
var breakpoints = z2.map(breakpointId, breakpoint);
var initialBreakpoints = [
  { id: "placeholder", label: "Base" },
  { id: "placeholder", label: "Tablet", maxWidth: 991 },
  { id: "placeholder", label: "Mobile landscape", maxWidth: 767 },
  { id: "placeholder", label: "Mobile portrait", maxWidth: 479 }
];

// src/schema/data-sources.ts
import { z as z3 } from "zod";
var dataSourceId = z3.string();
var dataSourceVariableValue = z3.union([
  z3.object({
    type: z3.literal("number"),
    // initial value of variable store
    value: z3.number()
  }),
  z3.object({
    type: z3.literal("string"),
    value: z3.string()
  }),
  z3.object({
    type: z3.literal("boolean"),
    value: z3.boolean()
  }),
  z3.object({
    type: z3.literal("string[]"),
    value: z3.array(z3.string())
  }),
  z3.object({
    type: z3.literal("json"),
    value: z3.unknown()
  })
]);
var dataSource = z3.union([
  z3.object({
    type: z3.literal("variable"),
    id: dataSourceId,
    // The instance should always be specified for variables,
    // however, there was a bug in the embed template
    // which produced variables without an instance
    // and these variables will fail validation
    // if we make it required
    scopeInstanceId: z3.string().optional(),
    name: z3.string(),
    value: dataSourceVariableValue
  }),
  z3.object({
    type: z3.literal("parameter"),
    id: dataSourceId,
    scopeInstanceId: z3.string().optional(),
    name: z3.string()
  }),
  z3.object({
    type: z3.literal("resource"),
    id: dataSourceId,
    scopeInstanceId: z3.string().optional(),
    name: z3.string(),
    resourceId: z3.string()
  })
]);
var dataSources = z3.map(dataSourceId, dataSource);

// src/schema/deployment.ts
import { z as z4 } from "zod";
var templates = z4.enum([
  "docker",
  "vercel",
  "netlify",
  "ssg",
  "ssg-netlify",
  "ssg-vercel"
]);
var deployment = z4.union([
  z4.object({
    destination: z4.literal("static"),
    name: z4.string(),
    assetsDomain: z4.string(),
    // Must be validated very strictly
    templates: z4.array(templates)
  }),
  z4.object({
    destination: z4.literal("saas").optional(),
    domains: z4.array(z4.string()),
    assetsDomain: z4.string().optional(),
    /**
     * @deprecated This field is deprecated, use `domains` instead.
     */
    projectDomain: z4.string().optional(),
    excludeWstdDomainFromSearch: z4.boolean().optional()
  })
]);

// src/schema/instances.ts
import { z as z5 } from "zod";
var textChild = z5.object({
  type: z5.literal("text"),
  value: z5.string(),
  placeholder: z5.boolean().optional()
});
var instanceId = z5.string();
var idChild = z5.object({
  type: z5.literal("id"),
  value: instanceId
});
var expressionChild = z5.object({
  type: z5.literal("expression"),
  value: z5.string()
});
var instanceChild = z5.union([idChild, textChild, expressionChild]);
var instance = z5.object({
  type: z5.literal("instance"),
  id: instanceId,
  component: z5.string(),
  tag: z5.string().optional(),
  label: z5.string().optional(),
  children: z5.array(instanceChild)
});
var instances = z5.map(instanceId, instance);

// src/schema/pages.ts
import { z as z6 } from "zod";
import { validateBasicAuth } from "@webstudio-is/wsauth";
var MIN_TITLE_LENGTH = 2;
var pageId = z6.string();
var folderId = z6.string();
var folderName = z6.string().refine((value) => value.trim() !== "", "Can't be empty");
var slug = z6.string().refine(
  (path) => /^[-a-z0-9]*$/.test(path),
  "Only a-z, 0-9 and - are allowed"
);
var folder = z6.object({
  id: folderId,
  name: folderName,
  slug,
  children: z6.array(z6.union([folderId, pageId]))
});
var pageName = z6.string().refine((value) => value.trim() !== "", "Can't be empty");
var pageTitle = z6.string().refine(
  (val) => val.length >= MIN_TITLE_LENGTH,
  `Minimum ${MIN_TITLE_LENGTH} characters required`
);
var documentTypes = ["html", "xml", "text"];
var basicAuthFields = {
  login: z6.string(),
  password: z6.string()
};
var validateBasicAuthFields = ({
  login,
  password
}, context) => {
  for (const issue of validateBasicAuth({ login, password }).issues ?? []) {
    context.addIssue({
      code: z6.ZodIssueCode.custom,
      path: issue.path,
      message: issue.message
    });
  }
};
var pageBasicAuth = z6.object({
  method: z6.literal("basic"),
  ...basicAuthFields
}).superRefine(validateBasicAuthFields);
var legacyPageBasicAuth = z6.object({
  type: z6.literal("basic"),
  ...basicAuthFields
}).superRefine(validateBasicAuthFields).transform(({ login, password }) => ({
  method: "basic",
  login,
  password
}));
var pageAuth = z6.union([pageBasicAuth, legacyPageBasicAuth]);
var commonPageFields = {
  id: pageId,
  name: pageName,
  title: pageTitle,
  history: z6.optional(z6.array(z6.string())),
  rootInstanceId: z6.string(),
  systemDataSourceId: z6.string().optional(),
  meta: z6.object({
    description: z6.string().optional(),
    title: z6.string().optional(),
    excludePageFromSearch: z6.string().optional(),
    language: z6.string().optional(),
    socialImageAssetId: z6.string().optional(),
    socialImageUrl: z6.string().optional(),
    status: z6.string().optional(),
    redirect: z6.string().optional(),
    documentType: z6.optional(z6.enum(documentTypes)),
    content: z6.string().optional(),
    auth: pageAuth.optional(),
    custom: z6.array(
      z6.object({
        property: z6.string(),
        content: z6.string()
      })
    ).optional()
  }),
  marketplace: z6.optional(
    z6.object({
      include: z6.optional(z6.boolean()),
      category: z6.optional(z6.string()),
      thumbnailAssetId: z6.optional(z6.string())
    })
  )
};
var homePagePath = z6.string().refine((path) => path === "", "Home page path must be empty");
var defaultPagePath = z6.string().refine((path) => path !== "", "Can't be empty").refine((path) => path !== "/", "Can't be just a /").refine((path) => path.endsWith("/") === false, "Can't end with a /").refine((path) => path.includes("//") === false, "Can't contain repeating /").refine(
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
var redirectSourcePath = z6.string().refine((path) => path !== "", "Can't be empty").refine((path) => path !== "/", "Can't be just a /").refine(
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
var page = z6.object({
  ...commonPageFields,
  path: z6.union([homePagePath, pagePath])
});
var pageTemplate = z6.object({
  id: pageId,
  name: pageName,
  title: pageTitle,
  rootInstanceId: z6.string(),
  systemDataSourceId: z6.string().optional(),
  meta: commonPageFields.meta
});
var projectMeta = z6.object({
  // All fields are optional to ensure consistency and allow for the addition of new fields without requiring migration
  siteName: z6.string().optional(),
  contactEmail: z6.string().optional(),
  faviconAssetId: z6.string().optional(),
  code: z6.string().optional(),
  auth: z6.string().optional()
});
var projectNewRedirectPath = z6.string().min(1, "Path is required").refine((data) => {
  try {
    new URL(data, "http://url.com");
    return true;
  } catch {
    return false;
  }
}, "Must be a valid URL");
var pageRedirect = z6.object({
  old: redirectSourcePath,
  new: projectNewRedirectPath,
  status: z6.enum(["301", "302"]).optional()
});
var compilerSettings = z6.object({
  // All fields are optional to ensure consistency and allow for the addition of new fields without requiring migration
  atomicStyles: z6.boolean().optional()
});
var pages = z6.object({
  meta: projectMeta.optional(),
  compiler: compilerSettings.optional(),
  redirects: z6.array(pageRedirect).optional(),
  homePageId: pageId,
  rootFolderId: folderId,
  pages: z6.map(pageId, page),
  pageTemplates: z6.map(pageId, pageTemplate).optional(),
  folders: z6.map(folderId, folder).refine((folders) => folders.size > 0, "Folders can't be empty")
}).superRefine((pages2, context) => {
  const homePage = pages2.pages.get(pages2.homePageId);
  const rootFolder = pages2.folders.get(pages2.rootFolderId);
  if (homePage === void 0) {
    context.addIssue({
      code: z6.ZodIssueCode.custom,
      path: ["homePageId"],
      message: "Home page must reference an existing page"
    });
  }
  if (rootFolder === void 0) {
    context.addIssue({
      code: z6.ZodIssueCode.custom,
      path: ["rootFolderId"],
      message: "Root folder must reference an existing folder"
    });
  }
  if (homePage !== void 0 && homePage.path !== "") {
    context.addIssue({
      code: z6.ZodIssueCode.custom,
      path: ["pages", pages2.homePageId, "path"],
      message: "Home page path must be empty"
    });
  }
  for (const [pageId2, page2] of pages2.pages) {
    if (page2.id !== pageId2) {
      context.addIssue({
        code: z6.ZodIssueCode.custom,
        path: ["pages", pageId2, "id"],
        message: "Page id must match its record key"
      });
    }
    if (pageId2 !== pages2.homePageId && page2.path === "") {
      context.addIssue({
        code: z6.ZodIssueCode.custom,
        path: ["pages", pageId2, "path"],
        message: "Page path can't be empty"
      });
    }
  }
  for (const [templateId, template] of pages2.pageTemplates ?? []) {
    if (template.id !== templateId) {
      context.addIssue({
        code: z6.ZodIssueCode.custom,
        path: ["pageTemplates", templateId, "id"],
        message: "Page template id must match its record key"
      });
    }
    if (pages2.pages.has(templateId)) {
      context.addIssue({
        code: z6.ZodIssueCode.custom,
        path: ["pageTemplates", templateId, "id"],
        message: "Page template id must not match an existing page id"
      });
    }
  }
  for (const [folderId2, folder2] of pages2.folders) {
    if (folder2.id !== folderId2) {
      context.addIssue({
        code: z6.ZodIssueCode.custom,
        path: ["folders", folderId2, "id"],
        message: "Folder id must match its record key"
      });
    }
    for (const [index, childId] of folder2.children.entries()) {
      if (pages2.pages.has(childId) === false && pages2.folders.has(childId) === false) {
        context.addIssue({
          code: z6.ZodIssueCode.custom,
          path: ["folders", folderId2, "children", index],
          message: "Folder child must reference an existing page or folder"
        });
      }
      if (childId === pages2.rootFolderId) {
        context.addIssue({
          code: z6.ZodIssueCode.custom,
          path: ["folders", folderId2, "children", index],
          message: "Root folder can't be nested"
        });
      }
    }
  }
  if (rootFolder !== void 0 && rootFolder.children[0] !== pages2.homePageId) {
    context.addIssue({
      code: z6.ZodIssueCode.custom,
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
          code: z6.ZodIssueCode.custom,
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
        code: z6.ZodIssueCode.custom,
        path: ["folders", folderId2, "children"],
        message: "Folders can't contain cycles"
      });
    }
  }
});

// src/schema/props.ts
import { z as z8 } from "zod";

// src/schema/animation-schema.ts
import { styleValue } from "@webstudio-is/css-engine";
import { z as z7 } from "zod";
var literalUnion = (arr) => z7.union(
  arr.map((val) => z7.literal(val))
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
var rangeUnitValue = z7.union([
  z7.object({
    type: z7.literal("unit"),
    value: z7.number(),
    unit: rangeUnit
  }),
  z7.object({
    type: z7.literal("unparsed"),
    value: z7.string()
  }),
  z7.object({
    type: z7.literal("var"),
    value: z7.string()
  })
]);
var TIME_UNITS = ["ms", "s"];
var timeUnit = literalUnion(TIME_UNITS);
var durationUnitValue = z7.union([
  z7.object({
    type: z7.literal("unit"),
    value: z7.number(),
    unit: timeUnit
  }),
  z7.object({
    type: z7.literal("var"),
    value: z7.string()
  })
]);
var iterationsUnitValue = z7.union([z7.number(), z7.literal("infinite")]);
var insetUnitValue = z7.union([
  rangeUnitValue,
  z7.object({
    type: z7.literal("keyword"),
    value: z7.literal("auto")
  })
]);
var keyframeStyles = z7.record(styleValue);
var animationKeyframe = z7.object({
  offset: z7.number().optional(),
  styles: keyframeStyles
});
var keyframeEffectOptions = z7.object({
  easing: z7.string().optional(),
  fill: z7.union([
    z7.literal("none"),
    z7.literal("forwards"),
    z7.literal("backwards"),
    z7.literal("both")
  ]).optional(),
  // FillMode
  duration: durationUnitValue.optional(),
  delay: durationUnitValue.optional(),
  iterations: iterationsUnitValue.optional()
});
var scrollNamedRange = z7.union([z7.literal("start"), z7.literal("end")]);
var scrollRangeValue = z7.tuple([scrollNamedRange, rangeUnitValue]);
var scrollRangeOptions = z7.object({
  rangeStart: scrollRangeValue.optional(),
  rangeEnd: scrollRangeValue.optional()
});
var animationAxis = z7.union([
  z7.literal("block"),
  z7.literal("inline"),
  z7.literal("x"),
  z7.literal("y")
]);
var viewNamedRange = z7.union([
  z7.literal("contain"),
  z7.literal("cover"),
  z7.literal("entry"),
  z7.literal("exit"),
  z7.literal("entry-crossing"),
  z7.literal("exit-crossing")
]);
var viewRangeValue = z7.tuple([viewNamedRange, rangeUnitValue]);
var viewRangeOptions = z7.object({
  rangeStart: viewRangeValue.optional(),
  rangeEnd: viewRangeValue.optional()
});
var baseAnimation = z7.object({
  name: z7.string().optional(),
  description: z7.string().optional(),
  enabled: z7.array(z7.tuple([z7.string().describe("breakpointId"), z7.boolean()])).optional(),
  keyframes: z7.array(animationKeyframe)
});
var scrollAnimation = baseAnimation.merge(
  z7.object({
    timing: keyframeEffectOptions.merge(scrollRangeOptions)
  })
);
var scrollAction = z7.object({
  type: z7.literal("scroll"),
  source: z7.union([z7.literal("closest"), z7.literal("nearest"), z7.literal("root")]).optional(),
  axis: animationAxis.optional(),
  animations: z7.array(scrollAnimation),
  isPinned: z7.boolean().optional(),
  debug: z7.boolean().optional()
});
var viewAnimation = baseAnimation.merge(
  z7.object({
    timing: keyframeEffectOptions.merge(viewRangeOptions)
  })
);
var viewAction = z7.object({
  type: z7.literal("view"),
  subject: z7.string().optional(),
  axis: animationAxis.optional(),
  animations: z7.array(viewAnimation),
  insetStart: insetUnitValue.optional(),
  insetEnd: insetUnitValue.optional(),
  isPinned: z7.boolean().optional(),
  debug: z7.boolean().optional()
});
var animationAction = z7.discriminatedUnion("type", [
  scrollAction,
  viewAction
]);

// src/schema/props.ts
var propId = z8.string();
var baseProp = {
  id: propId,
  instanceId: z8.string(),
  name: z8.string(),
  required: z8.optional(z8.boolean())
};
var prop = z8.union([
  z8.object({
    ...baseProp,
    type: z8.literal("number"),
    value: z8.number()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("string"),
    value: z8.string()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("boolean"),
    value: z8.boolean()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("json"),
    value: z8.unknown()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("asset"),
    value: z8.string()
    // asset id
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("page"),
    value: z8.union([
      z8.string(),
      // page id
      z8.object({
        pageId: z8.string(),
        instanceId: z8.string()
      })
    ])
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("string[]"),
    value: z8.array(z8.string())
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("parameter"),
    // data source id
    value: z8.string()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("resource"),
    // resource id
    value: z8.string()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("expression"),
    // expression code
    value: z8.string()
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("action"),
    value: z8.array(
      z8.object({
        type: z8.literal("execute"),
        args: z8.array(z8.string()),
        code: z8.string()
      })
    )
  }),
  z8.object({
    ...baseProp,
    type: z8.literal("animationAction"),
    value: animationAction
  })
]);
var props = z8.map(propId, prop);

// src/schema/resources.ts
import { z as z9 } from "zod";
var resourceId = z9.string();
var method = z9.union([
  z9.literal("get"),
  z9.literal("post"),
  z9.literal("put"),
  z9.literal("delete")
]);
var resource = z9.object({
  id: resourceId,
  name: z9.string(),
  control: z9.optional(z9.union([z9.literal("system"), z9.literal("graphql")])),
  method,
  // expression
  url: z9.string(),
  searchParams: z9.array(
    z9.object({
      name: z9.string(),
      // expression
      value: z9.string()
    })
  ).optional(),
  headers: z9.array(
    z9.object({
      name: z9.string(),
      // expression
      value: z9.string()
    })
  ),
  // expression
  body: z9.optional(z9.string())
});
var resourceRequest = z9.object({
  name: z9.string(),
  method,
  url: z9.string(),
  searchParams: z9.array(
    z9.object({
      name: z9.string(),
      // can be string or object which should be serialized
      value: z9.unknown()
    })
  ),
  headers: z9.array(
    z9.object({
      name: z9.string(),
      // can be string or object which should be serialized
      value: z9.unknown()
    })
  ),
  body: z9.optional(z9.unknown())
});
var resources = z9.map(resourceId, resource);

// src/schema/style-source-selections.ts
import { z as z10 } from "zod";
var instanceId2 = z10.string();
var styleSourceId = z10.string();
var styleSourceSelection = z10.object({
  instanceId: instanceId2,
  values: z10.array(styleSourceId)
});
var styleSourceSelections = z10.map(instanceId2, styleSourceSelection);

// src/schema/style-sources.ts
import { z as z11 } from "zod";
var styleSourceId2 = z11.string();
var styleSourceToken = z11.object({
  type: z11.literal("token"),
  id: styleSourceId2,
  name: z11.string(),
  locked: z11.boolean().optional()
});
var styleSourceLocal = z11.object({
  type: z11.literal("local"),
  id: styleSourceId2
});
var styleSource = z11.union([styleSourceToken, styleSourceLocal]);
var styleSources = z11.map(styleSourceId2, styleSource);

// src/schema/styles.ts
import { z as z12 } from "zod";
import { styleValue as styleValue2 } from "@webstudio-is/css-engine";
var styleDeclRaw = z12.object({
  styleSourceId: z12.string(),
  breakpointId: z12.string(),
  state: z12.optional(z12.string()),
  // @todo can't figure out how to make property to be enum
  property: z12.string(),
  value: styleValue2,
  listed: z12.boolean().optional().describe("Whether the style is from the Advanced panel")
});
var styleDecl = styleDeclRaw;
var getStyleDeclKey = (styleDecl2) => {
  return `${styleDecl2.styleSourceId}:${styleDecl2.breakpointId}:${styleDecl2.property}:${styleDecl2.state ?? ""}`;
};
var styles = z12.map(z12.string(), styleDecl);
export {
  asset,
  assetType,
  assets,
  breakpoint,
  breakpoints,
  compilerSettings,
  dataSource,
  dataSourceVariableValue,
  dataSources,
  deployment,
  documentTypes,
  expressionChild,
  fileAsset,
  folder,
  folderId,
  folderName,
  fontAsset,
  getStyleDeclKey,
  homePagePath,
  idChild,
  imageAsset,
  imageMeta,
  initialBreakpoints,
  instance,
  instanceChild,
  instances,
  page,
  pageAuth,
  pageId,
  pageName,
  pagePath,
  pageRedirect,
  pageTemplate,
  pageTitle,
  pages,
  projectMeta,
  projectNewRedirectPath,
  prop,
  props,
  redirectSourcePath,
  resource,
  resourceRequest,
  resources,
  styleDecl,
  styleSource,
  styleSourceSelection,
  styleSourceSelections,
  styleSources,
  styles,
  templates,
  textChild
};
