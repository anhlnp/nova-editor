"use client";
// M7 — System clipboard bridge with plugin formats.
// Copy writes the Nova instance fragment as JSON (primary, lossless) to the
// system clipboard. Paste reads the clipboard and detects the best format:
//   1. Nova fragment JSON (sentinel) → lossless round-trip
//   2. text/html → parseHtmlToFragment (browser/Figma/Webflow paste)
// Falls back to the in-memory $clipboard atom when the system clipboard is empty
// or denied (older behaviour preserved).

import type { Instance } from "@webstudio-is/sdk";
import type { ClipboardData } from "./edit-operations";
import { parseHtmlToFragment } from "./htmlPaste";

const SENTINEL = "__nova_fragment__";

type SerializedFragment = {
  [SENTINEL]: 1;
  rootId: string;
  instances: Array<[string, Instance]>;
};

export function serializeFragment(data: ClipboardData): string {
  const payload: SerializedFragment = {
    [SENTINEL]: 1,
    rootId: data.rootId,
    instances: [...data.instances.entries()],
  };
  return JSON.stringify(payload);
}

export function deserializeFragment(text: string): ClipboardData | null {
  try {
    const parsed = JSON.parse(text) as Partial<SerializedFragment>;
    if (parsed[SENTINEL] !== 1 || !parsed.rootId || !Array.isArray(parsed.instances)) {
      return null;
    }
    return { rootId: parsed.rootId, instances: new Map(parsed.instances) };
  } catch {
    return null;
  }
}

// Write the fragment to the system clipboard (best-effort). Returns true on success.
export async function copyToClipboard(data: ClipboardData): Promise<boolean> {
  const json = serializeFragment(data);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json);
      return true;
    }
  } catch {
    // permission denied / insecure context — caller falls back to $clipboard atom
  }
  return false;
}

// Read the best available fragment from the system clipboard, or null.
export async function readClipboard(): Promise<ClipboardData | null> {
  let text = "";
  try {
    if (navigator.clipboard?.readText) {
      text = await navigator.clipboard.readText();
    }
  } catch {
    return null;
  }
  if (!text) return null;

  // 1. Nova fragment JSON.
  const fragment = deserializeFragment(text);
  if (fragment) return fragment;

  // 2. HTML markup (paste from a page / design tool export).
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return parseHtmlToFragment(text);
  }

  return null;
}
