// Stub for @webstudio-is/sync-client
// Matches the actual message shape used in sync-client.ts (with clientId).

export interface Transaction<T = unknown> {
  id: string;
  object: string;
  payload: T;
}

export interface RevertedTransaction {
  id: string;
  object: string;
}

export type SyncMessage =
  | { clientId: string; type: "connect" }
  | { clientId: string; type: "state"; state: unknown }
  | { clientId: string; type: "apply"; transaction: Transaction }
  | { clientId: string; type: "revert"; transaction: RevertedTransaction };

// SyncEmitter matches nanoevents pattern: single-message emit/on (no separate event name arg).
export interface SyncEmitter {
  emit(message: SyncMessage): void;
  on(handler: (message: SyncMessage) => void): () => void;
}
