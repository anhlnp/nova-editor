"use client";
// Single write path for all WebstudioData mutations (Tier P M1, ADR-NB-019 p1).
//
// Every document mutation MUST go through updateData() — an immerhin
// transaction over the ten registered data atoms. The transaction is
// simultaneously:
//   1. the sync currency — ImmerhinSyncObject broadcasts it to the canvas
//      follower (fixes WSA-2: direct atom .set() never reached the iframe);
//   2. the undo unit — undo/redo revert whole transactions across ALL ten
//      atoms (fixes WSA-4: the old 5-atom snapshot restored inconsistent
//      halves);
//   3. (M2) the future save payload.
//
// Mirrors reference/webstudio apps/builder/app/shared/instance-utils/data.ts
// (updateWebstudioData) + builder/shared/commands.ts (undo/redo).

import { atom } from "nanostores";
import { original } from "immer";
import type {
  Assets,
  Breakpoints,
  DataSources,
  Instances,
  Pages,
  Props,
  Resource,
  Styles,
  StyleSources,
  StyleSourceSelections,
} from "@webstudio-is/sdk";
import { serverSyncStore } from "./sync-stores";
import {
  $pages,
  $instances,
  $props,
  $breakpoints,
  $styleSourceSelections,
  $styleSources,
  $styles,
  $dataSources,
  $resources,
  $assets,
} from "./data-stores";

export type MutableData = {
  pages: Pages;
  instances: Instances;
  props: Props;
  breakpoints: Breakpoints;
  styleSourceSelections: StyleSourceSelections;
  styleSources: StyleSources;
  styles: Styles;
  dataSources: DataSources;
  resources: Map<Resource["id"], Resource>;
  assets: Assets;
};

// Reactive undo/redo availability for UI (footer buttons, commands).
export const $canUndo = atom(false);
export const $canRedo = atom(false);

const syncHistoryFlags = () => {
  $canUndo.set(serverSyncStore.transactionManager.currentStack.length > 0);
  $canRedo.set(serverSyncStore.transactionManager.undoneStack.length > 0);
};

/**
 * Mutate the document inside one undoable, canvas-synced transaction.
 * The recipe receives immer DRAFTS — mutate them in place (set/delete);
 * do not reassign fields. No-op recipes produce no transaction.
 */
export const updateData = (mutate: (data: MutableData) => void) => {
  serverSyncStore.createTransaction(
    [
      $pages,
      $instances,
      $props,
      $breakpoints,
      $styleSourceSelections,
      $styleSources,
      $styles,
      $dataSources,
      $resources,
      $assets,
    ],
    (
      pages,
      instances,
      props,
      breakpoints,
      styleSourceSelections,
      styleSources,
      styles,
      dataSources,
      resources,
      assets
    ) => {
      if (pages === undefined) return;
      mutate({
        pages,
        instances,
        props,
        breakpoints,
        styleSourceSelections,
        styleSources,
        styles,
        dataSources,
        resources,
        assets,
      });
    }
  );
  syncHistoryFlags();
};

/**
 * Replace a draft Map's content with `next`, producing minimal patches:
 * compares against the ORIGINAL (pre-draft) values so entries that pure
 * helpers (treeMove, edit-operations) carried over by reference are not
 * re-recorded. Lets existing pure Map→Map functions be reused unchanged.
 */
export const replaceMap = <K, V>(draft: Map<K, V>, next: Map<K, V>) => {
  const base = (original(draft) ?? draft) as Map<K, V>;
  for (const key of [...draft.keys()]) {
    if (next.has(key) === false) draft.delete(key);
  }
  for (const [key, value] of next) {
    if (base.get(key) !== value) draft.set(key, value);
  }
};

export const undo = () => {
  serverSyncStore.undo();
  syncHistoryFlags();
};

export const redo = () => {
  serverSyncStore.redo();
  syncHistoryFlags();
};
