"use client";
// M11 — Protocol bundle file I/O (browser).
// Download a bundle as a .nova.json file; read a bundle from a File / string.

import { isNovaBundle, type NovaBundle } from "./bundle";

export function downloadBundle(bundle: NovaBundle): void {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (bundle.meta.name || "bundle").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  a.href = url;
  a.download = `${safeName}.nova.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readBundleFile(file: File): Promise<NovaBundle | null> {
  try {
    const text = await file.text();
    return parseBundle(text);
  } catch {
    return null;
  }
}

export function parseBundle(text: string): NovaBundle | null {
  try {
    const parsed = JSON.parse(text);
    return isNovaBundle(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
