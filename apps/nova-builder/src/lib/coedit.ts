"use client";
// M12 — Realtime co-editing (final Tier P phase; extends ADR-NB-009, ADR-NB-019).
//
// Document edits already flow through ONE immerhin transaction path (M1,
// lib/transactions.updateData). Each transaction carries immer patches per atom
// namespace. This module broadcasts those patches over the SAME Supabase Realtime
// channel that presence uses (ADR-NB-009) and applies patches from peers to the
// local atoms — giving live co-editing with NO Yjs and NO relay microservice.
//
// Flow:
//   local edit → serverSyncStore.subscribe fires (source !== "remote")
//              → send { transactionId, changes } over channel
//   peer patch → channel "doc" event
//              → serverSyncStore.addTransaction(id, changes, "remote")
//                (applies patches to atoms + marks id so the save queue skips it)
//
// The "remote" source both prevents an echo (the subscribe filter) and lets the
// save queue drop the id (only the originating editor persists — markRemoteTransaction).

import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { Change } from "immerhin";
import { serverSyncStore } from "./sync-stores";
import { markRemoteTransaction } from "./saveQueue";

type DocMessage = {
  transactionId: string;
  changes: Change[];
  senderId: string;
};

export type CoeditHandle = { destroy: () => void };

// Start co-editing on an already-subscribed Realtime channel. Returns a handle
// that tears down both the local subscription and the channel listener.
export const startCoedit = (
  channel: RealtimeChannel,
  selfId: string
): CoeditHandle => {
  // ── Outbound: broadcast local transactions ────────────────────────────────
  const unsubscribeLocal = serverSyncStore.subscribe((transactionId, changes, source) => {
    // Skip transactions we applied from a peer (avoid echo) and empty ones.
    if (source === "remote") return;
    if (changes.length === 0) return;
    channel.send({
      type: "broadcast",
      event: "doc",
      payload: { transactionId, changes, senderId: selfId } satisfies DocMessage,
    });
  });

  // ── Inbound: apply peer transactions ──────────────────────────────────────
  channel.on("broadcast", { event: "doc" }, ({ payload }) => {
    const msg = payload as DocMessage;
    if (!msg || msg.senderId === selfId) return;
    // Mark BEFORE applying: addTransaction synchronously enqueues to the sync
    // queue, and the save flush must see the id already registered.
    markRemoteTransaction(msg.transactionId);
    try {
      serverSyncStore.addTransaction(msg.transactionId, msg.changes, "remote");
    } catch {
      // Malformed/incompatible patch — ignore rather than corrupt local state.
    }
  });

  return {
    destroy() {
      unsubscribeLocal();
    },
  };
};

// Convenience: create a dedicated co-edit channel on an existing Supabase client.
// (Presence uses its own channel; co-edit runs on a sibling channel so the two
// broadcast streams don't interleave.)
export const joinCoeditChannel = (
  supabase: SupabaseClient,
  projectId: string,
  selfId: string
): CoeditHandle => {
  const channel = supabase.channel(`project-doc:${projectId}`, {
    config: { broadcast: { self: false } },
  });
  const handle = startCoedit(channel, selfId);
  channel.subscribe();
  return {
    destroy() {
      handle.destroy();
      supabase.removeChannel(channel);
    },
  };
};
