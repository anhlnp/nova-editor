// src/lib/db-folders.ts
// Supabase-backed folder CRUD for the Asset Manager.
// Table: asset_folders (id TEXT PK, name TEXT, project_id TEXT, parent_id TEXT?,
//                       created_at TIMESTAMPTZ)
//
// If Supabase is not configured, falls back to in-process memory store
// so folders work during local dev without DB setup.
//
// SQL migration (run once in Supabase SQL Editor if you want persistence):
// See apps/nova-builder/scripts/supabase-asset-folders.sql

import { nanoid } from "nanoid";

export type AssetFolder = {
  id: string;
  name: string;
  projectId: string;
  parentId: string | null;
  createdAt: string;
};

// ── In-memory fallback (used when Supabase not configured) ───────────────────
// Resets on server restart — fine for dev; configure Supabase for persistence.
const memStore = new Map<string, AssetFolder>();

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return !!(url && key);
}

function getSupabase() {
  // Dynamic import avoids crashing when @supabase/supabase-js is not installed
  const { createClient } = require("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  return createClient(url!, key!);
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function createFolder(
  projectId: string,
  name: string,
  parentId: string | null = null
): Promise<AssetFolder> {
  const folder: AssetFolder = {
    id: nanoid(),
    name,
    projectId,
    parentId,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    // In-memory fallback
    memStore.set(folder.id, folder);
    return folder;
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("asset_folders")
    .insert({
      id: folder.id,
      name: folder.name,
      project_id: folder.projectId,
      parent_id: folder.parentId,
      created_at: folder.createdAt,
    })
    .select()
    .single();

  if (error) {
    // Table might not exist yet — fall back to memory and log a helpful hint
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn(
        "[db-folders] asset_folders table not found. Using in-memory fallback.\n" +
        "Run apps/nova-builder/scripts/supabase-asset-folders.sql in the Supabase SQL editor to persist folders."
      );
      memStore.set(folder.id, folder);
      return folder;
    }
    throw new Error(`createFolder: ${error.message}`);
  }

  return rowToFolder(data);
}

export async function listFolders(projectId: string): Promise<AssetFolder[]> {
  if (!isSupabaseConfigured()) {
    return [...memStore.values()].filter((f) => f.projectId === projectId);
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("asset_folders")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      // Table not yet created — return in-memory store
      return [...memStore.values()].filter((f) => f.projectId === projectId);
    }
    throw new Error(`listFolders: ${error.message}`);
  }

  // Merge in-memory folders too (handles table-not-created scenario mid-session)
  const dbFolders = (data ?? []).map(rowToFolder);
  const memFolders = [...memStore.values()].filter(
    (f) => f.projectId === projectId && !dbFolders.find((d) => d.id === f.id)
  );
  return [...dbFolders, ...memFolders];
}

export async function deleteFolder(folderId: string): Promise<void> {
  memStore.delete(folderId);

  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  const { error } = await sb.from("asset_folders").delete().eq("id", folderId);
  if (error && !error.message?.includes("does not exist")) {
    throw new Error(`deleteFolder: ${error.message}`);
  }
}

export async function getFolder(folderId: string): Promise<AssetFolder | null> {
  if (memStore.has(folderId)) return memStore.get(folderId)!;
  if (!isSupabaseConfigured()) return null;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("asset_folders")
    .select("*")
    .eq("id", folderId)
    .single();

  if (error) return null;
  return rowToFolder(data);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rowToFolder(row: Record<string, unknown>): AssetFolder {
  return {
    id: row.id as string,
    name: row.name as string,
    projectId: row.project_id as string,
    parentId: (row.parent_id as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export type FolderTreeNode = AssetFolder & { children: FolderTreeNode[] };

export function buildFolderTree(folders: AssetFolder[]): FolderTreeNode[] {
  const map = new Map<string, FolderTreeNode>();
  const roots: FolderTreeNode[] = [];

  for (const f of folders) {
    map.set(f.id, { ...f, children: [] });
  }
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
