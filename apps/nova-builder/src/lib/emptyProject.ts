// Returns a serialized NovaProjectJson (schemaVersion "5.0") representing an empty project.
// Used when creating a new project — seeded with one page, one Body instance, one Base breakpoint.

import { uid } from "./uid";

export function emptyProjectSchema(name: string, now: string): Record<string, unknown> {
  const pageId = uid("page_");
  const folderId = uid("fold_");
  const rootInstanceId = uid("inst_");
  const breakpointId = uid("bp_");

  return {
    schemaVersion: "5.0",
    meta: { name, createdAt: now, updatedAt: now },
    data: {
      pages: {
        homePageId: pageId,
        rootFolderId: folderId,
        pages: [
          [pageId, { id: pageId, name: "Home", path: "/", title: "Home", rootInstanceId }],
        ],
        folders: [
          [folderId, { id: folderId, name: "Root", slug: "", children: [pageId] }],
        ],
      },
      instances: [
        [rootInstanceId, { type: "instance", id: rootInstanceId, component: "Body", label: "Body", children: [] }],
      ],
      props: [],
      styles: [],
      styleSources: [],
      styleSourceSelections: [],
      breakpoints: [
        [breakpointId, { id: breakpointId, label: "Base" }],
      ],
      assets: [],
      dataSources: [],
      resources: [],
    },
  };
}
