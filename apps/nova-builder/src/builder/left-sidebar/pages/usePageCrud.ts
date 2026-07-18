"use client";
// Page/folder CRUD. All mutations run inside updateData transactions (M1) —
// undoable across the full atom set (pages were previously OUTSIDE the undo
// snapshot: WSA-4) and synced to the canvas follower.
import type { Page } from "@webstudio-is/sdk";
import { updateData } from "@/lib/transactions";
import { uid } from "@/lib/uid";

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export type PageSeo = {
  title?: string;
  description?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string;
};

export type PageRedirect = {
  from: string;
  to: string;
  permanent: boolean;
};

export type PageBasicAuth = {
  user: string;
  passwordHash: string;
};

export function usePageCrud() {
  function createPage(name: string, path: string): void {
    const pageId = uid("page_");
    const rootInstId = uid("inst_");
    updateData(({ pages, instances }) => {
      instances.set(rootInstId, {
        type: "instance" as const,
        id: rootInstId,
        component: "Box",
        children: [],
      } as Parameters<typeof instances.set>[1]);

      pages.pages.set(pageId, {
        id: pageId,
        name,
        title: name,
        path: path.startsWith("/") ? path : `/${path}`,
        rootInstanceId: rootInstId,
        meta: {},
      } as Page);

      if (pages.rootFolderId) {
        const rootFolder = pages.folders.get(pages.rootFolderId);
        if (rootFolder) {
          rootFolder.children = [...(rootFolder.children ?? []), pageId];
        }
      }
    });
  }

  function renamePage(pageId: string, name: string, path: string): void {
    updateData(({ pages }) => {
      const page = pages.pages.get(pageId);
      if (!page) return;
      pages.pages.set(pageId, {
        ...page,
        name,
        path: path.startsWith("/") ? path : `/${path}`,
      } as Page);
    });
  }

  function updatePageSeo(pageId: string, seo: PageSeo): void {
    updateData(({ pages }) => {
      const page = pages.pages.get(pageId);
      if (!page) return;
      pages.pages.set(pageId, {
        ...page,
        ...(seo.title !== undefined ? { title: seo.title } : {}),
        meta: {
          ...(page.meta ?? {}),
          ...(seo.description !== undefined ? { description: seo.description } : {}),
          ...(seo.canonicalUrl !== undefined ? { canonicalUrl: seo.canonicalUrl } : {}),
          ...(seo.ogImage !== undefined ? { ogImage: seo.ogImage } : {}),
          ...(seo.robots !== undefined ? { robots: seo.robots } : {}),
          excludePageFromSearch: seo.noindex ? "true" : undefined,
        },
      } as Page);
    });
  }

  function updatePageRedirects(pageId: string, redirects: PageRedirect[]): void {
    updateData(({ pages }) => {
      const page = pages.pages.get(pageId);
      if (!page) return;
      pages.pages.set(pageId, {
        ...page,
        meta: {
          ...(page.meta ?? {}),
          redirects: JSON.stringify(redirects),
        },
      } as Page);
    });
  }

  function updatePageBasicAuth(pageId: string, auth: PageBasicAuth | null): void {
    updateData(({ pages }) => {
      const page = pages.pages.get(pageId);
      if (!page) return;
      const meta = { ...(page.meta ?? {}) };
      if (auth) {
        meta.passwordProtected = JSON.stringify(auth);
      } else {
        delete meta.passwordProtected;
      }
      pages.pages.set(pageId, { ...page, meta } as Page);
    });
  }

  function deletePage(pageId: string): void {
    updateData(({ pages }) => {
      if (pages.pages.size <= 1) return;
      pages.pages.delete(pageId);
      if (pages.homePageId === pageId) {
        pages.homePageId = [...pages.pages.keys()][0];
      }
      for (const [, folder] of pages.folders) {
        if ((folder.children ?? []).includes(pageId)) {
          folder.children = folder.children.filter((c: string) => c !== pageId);
          break;
        }
      }
    });
  }

  function createFolder(name: string): void {
    const fid = uid("fold_");
    updateData(({ pages }) => {
      pages.folders.set(fid, { id: fid, name, slug: toSlug(name), children: [] as string[] });
      if (pages.rootFolderId) {
        const rootFolder = pages.folders.get(pages.rootFolderId);
        if (rootFolder) {
          rootFolder.children = [...(rootFolder.children ?? []), fid];
        }
      }
    });
  }

  function renameFolder(folderId: string, name: string): void {
    updateData(({ pages }) => {
      if (folderId === pages.rootFolderId) return;
      const folder = pages.folders.get(folderId);
      if (!folder) return;
      folder.name = name;
      folder.slug = toSlug(name);
    });
  }

  function deleteFolder(folderId: string): void {
    updateData(({ pages }) => {
      if (folderId === pages.rootFolderId) return;
      const folder = pages.folders.get(folderId);
      if (!folder) return;
      const pageChildrenToReparent = (folder.children ?? []).filter((c: string) =>
        pages.pages.has(c)
      );
      pages.folders.delete(folderId);
      for (const [, f] of pages.folders) {
        if ((f.children ?? []).includes(folderId)) {
          f.children = [...f.children.filter((c: string) => c !== folderId), ...pageChildrenToReparent];
          break;
        }
      }
    });
  }

  return { createPage, renamePage, updatePageSeo, updatePageRedirects, updatePageBasicAuth, deletePage, createFolder, renameFolder, deleteFolder };
}
