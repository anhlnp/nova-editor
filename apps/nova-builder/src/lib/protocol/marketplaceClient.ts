"use client";
// M11 — Marketplace API client. Thin wrappers over the /api/marketplace routes so
// the panel talks to helpers, not fetch directly (DIP).

import type { NovaBundle } from "./bundle";

export type MarketplaceItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  install_count: number;
  created_at?: string;
};

export async function browseMarketplace(q?: string): Promise<MarketplaceItem[]> {
  const url = q ? `/api/marketplace?q=${encodeURIComponent(q)}` : "/api/marketplace";
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: MarketplaceItem[] };
  return json.items ?? [];
}

export async function fetchMarketplaceBundle(itemId: string): Promise<NovaBundle | null> {
  const res = await fetch(`/api/marketplace/${itemId}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { item?: { bundle?: NovaBundle } };
  return json.item?.bundle ?? null;
}

export async function publishBundle(input: {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  bundle: NovaBundle;
}): Promise<boolean> {
  const res = await fetch("/api/marketplace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.ok;
}
