"use client";
// P56 — Real-time multiplayer presence.
//
// Consistent with ADR-NB-002 (Nova backend stays; no separate WS relay), live
// collaboration is built on Supabase Realtime channels rather than Webstudio's
// standalone multiplayer relay microservice. Each project gets a channel keyed
// by its id; peers broadcast identity + cursor position and track each other
// via Realtime "presence". If the anon key is not configured, everything
// degrades to a silent single-player no-op.

import { atom } from "nanostores";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Collaborator = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  lastSeen: number;
  // M12 — the instance id this peer currently has selected (for remote outlines).
  selectedInstanceId?: string;
};

// Other users currently in the project (excludes self).
export const $collaborators = atom<Collaborator[]>([]);

const COLORS = ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f87171", "#22d3ee"];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

type Handle = {
  updateCursor: (x: number, y: number) => void;
  updateSelection: (instanceId: string | undefined) => void;
  destroy: () => void;
};

let client: SupabaseClient | null = null;
// Shared Realtime client — presence + co-editing (M12) reuse the same instance.
// Returns null when the anon key is unconfigured (silent single-player).
export function getRealtimeClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  if (!client) client = createClient(url, anon, { realtime: { params: { eventsPerSecond: 20 } } });
  return client;
}
const getClient = getRealtimeClient;

export function joinProjectPresence(projectId: string, self: { id: string; name: string }): Handle {
  const supabase = getClient();
  if (!supabase) {
    return { updateCursor: () => {}, updateSelection: () => {}, destroy: () => {} };
  }

  const color = pickColor(self.id);
  const channel = supabase.channel(`project:${projectId}`, {
    config: { presence: { key: self.id } },
  });

  const syncState = () => {
    const state = channel.presenceState<Collaborator>();
    const others: Collaborator[] = [];
    for (const [key, metas] of Object.entries(state)) {
      if (key === self.id) continue;
      const meta = metas[metas.length - 1];
      if (meta) others.push({ ...meta, id: key });
    }
    $collaborators.set(others);
  };

  channel
    .on("presence", { event: "sync" }, syncState)
    .on("presence", { event: "join" }, syncState)
    .on("presence", { event: "leave" }, syncState)
    .on("broadcast", { event: "cursor" }, ({ payload }) => {
      const p = payload as Collaborator;
      if (p.id === self.id) return;
      const list = $collaborators.get();
      const idx = list.findIndex((c) => c.id === p.id);
      const next = idx >= 0
        ? list.map((c) => (c.id === p.id ? { ...c, x: p.x, y: p.y, lastSeen: Date.now() } : c))
        : [...list, { ...p, lastSeen: Date.now() }];
      $collaborators.set(next);
    })
    .on("broadcast", { event: "selection" }, ({ payload }) => {
      const p = payload as { id: string; selectedInstanceId?: string };
      if (p.id === self.id) return;
      const list = $collaborators.get();
      const idx = list.findIndex((c) => c.id === p.id);
      if (idx < 0) return; // selection follows an already-known cursor peer
      $collaborators.set(
        list.map((c) => (c.id === p.id ? { ...c, selectedInstanceId: p.selectedInstanceId, lastSeen: Date.now() } : c))
      );
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ id: self.id, name: self.name, color, x: 0, y: 0, lastSeen: Date.now() });
      }
    });

  let raf = 0;
  let pending: { x: number; y: number } | null = null;
  const flush = () => {
    raf = 0;
    if (!pending) return;
    channel.send({
      type: "broadcast", event: "cursor",
      payload: { id: self.id, name: self.name, color, x: pending.x, y: pending.y, lastSeen: Date.now() },
    });
    pending = null;
  };

  return {
    updateCursor(x, y) {
      pending = { x, y };
      if (!raf) raf = requestAnimationFrame(flush);
    },
    updateSelection(instanceId) {
      channel.send({
        type: "broadcast", event: "selection",
        payload: { id: self.id, selectedInstanceId: instanceId },
      });
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      supabase.removeChannel(channel);
      $collaborators.set([]);
    },
  };
}
