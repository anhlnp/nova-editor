"use client";
// Patch-based autosave queue (Tier P M2, ADR-NB-019 p2).
//
// DIP fix (v23.2.1): the concrete HTTP endpoint is extracted into a PersistFn
// injectable. Callers pass a custom persist adapter; by default makeFetchPersist
// is used. This allows swapping the save backend (WebSocket batching, local-first,
// Cloudflare DO) without modifying this library.
//
// Simplified from reference/webstudio apps/builder/app/shared/sync/project-queue.ts.

import { atom } from "nanostores";
import type { SyncItem } from "immerhin";
import { serverSyncStore } from "./sync-stores";

export type SaveStatus =
  | "idle"        // nothing to save
  | "saving"      // request in flight
  | "saved"       // last flush confirmed
  | "recovering"  // transient error, retrying
  | "error"       // retries exhausted (still retrying in background)
  | "conflict";   // 409 — another tab/session saved first; reload required

/** Abstract persist contract — swap the backend without touching saveQueue. */
export type PersistFn = (
  transactions: SyncItem[],
  baseVersion: number
) => Promise<{ version: number }>;

export const $saveStatus = atom<SaveStatus>("idle");
/** Last server-confirmed document version (optimistic concurrency token). */
export const $docVersion = atom<number>(0);

const FLUSH_INTERVAL = 1000;
const MAX_RECOVERY_RETRIES = 5;

// M12 — transactions received from a co-editing peer are applied locally (so the
// canvas updates) but must NOT be re-persisted by this peer: the ORIGINATING
// editor's own save queue writes them to the DB. immerhin enqueues every
// transaction to the sync queue regardless of source, so the co-edit layer
// registers the ids it applied here and the flush drops them before persisting.
const remoteTransactionIds = new Set<string>();
export const markRemoteTransaction = (transactionId: string) => {
  remoteTransactionIds.add(transactionId);
  // Bounded — ids are consumed on the next flush; cap as a safety valve.
  if (remoteTransactionIds.size > 5000) remoteTransactionIds.clear();
};

/** Default adapter: POST patches to the REST endpoint. */
const makeFetchPersist = (projectId: string): PersistFn =>
  async (transactions, baseVersion) => {
    const res = await fetch(`/api/projects/${projectId}/patch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseVersion, transactions }),
    });
    if (res.status === 409) throw Object.assign(new Error("conflict"), { status: 409 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<{ version: number }>;
  };

export const startSaveQueue = (
  projectId: string,
  signal: AbortSignal,
  persist: PersistFn = makeFetchPersist(projectId)
) => {
  $saveStatus.set("idle");
  // Drain anything enqueued before the queue started.
  serverSyncStore.popAll();

  let pending: SyncItem[] = [];
  let retries = 0;
  let inFlight = false;

  const flush = async () => {
    if (inFlight) return;
    if ($saveStatus.get() === "conflict") return;
    // Drop transactions that arrived from co-editing peers — the originator saves them.
    const drained = serverSyncStore.popAll().filter((item) => {
      if (remoteTransactionIds.has(item.transactionId)) {
        remoteTransactionIds.delete(item.transactionId);
        return false;
      }
      return true;
    });
    pending.push(...drained);
    if (pending.length === 0) {
      if ($saveStatus.get() === "saving") $saveStatus.set("saved");
      return;
    }
    inFlight = true;
    $saveStatus.set("saving");
    try {
      const json = await persist(pending, $docVersion.get());
      $docVersion.set(json.version);
      pending = [];
      retries = 0;
      $saveStatus.set("saved");
    } catch (err) {
      if ((err as { status?: number }).status === 409) {
        $saveStatus.set("conflict");
        return;
      }
      retries += 1;
      $saveStatus.set(retries >= MAX_RECOVERY_RETRIES ? "error" : "recovering");
    } finally {
      inFlight = false;
    }
  };

  const interval = setInterval(() => void flush(), FLUSH_INTERVAL);
  signal.addEventListener("abort", () => clearInterval(interval));
  return { flush };
};

/** Discard queued patches (used after a successful FULL save). */
export const discardQueuedPatches = () => {
  serverSyncStore.popAll();
};
