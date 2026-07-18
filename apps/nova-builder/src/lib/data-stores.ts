// All nanostores atoms that hold the active project's WebstudioData.
// These are the single source of truth for canvas rendering.
// Both builder (leader) and canvas (follower) subscribe to the same atoms;
// the SyncClient keeps them in sync across the iframe boundary.
//
// Ported from: reference/webstudio/apps/builder/app/shared/sync/data-stores.ts
// Removed: $project (requires @webstudio-is/project), $marketplaceProduct, $publisherHost
// (Nova carries its own meta separately in $projectMeta)

import { atom } from "nanostores";
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

export const $pages = atom<undefined | Pages>(undefined);
export const $assets = atom<Assets>(new Map());
export const $instances = atom<Instances>(new Map());
export const $props = atom<Props>(new Map());
export const $dataSources = atom<DataSources>(new Map());
export const $resources = atom(new Map<Resource["id"], Resource>());
export const $breakpoints = atom<Breakpoints>(new Map());
export const $styleSources = atom<StyleSources>(new Map());
export const $styleSourceSelections = atom<StyleSourceSelections>(new Map());
export const $styles = atom<Styles>(new Map());

// Nova-specific: project meta (name, dates) carried outside WebstudioData.
export const $projectMeta = atom<
  { id: string; name: string; updatedAt: string } | undefined
>(undefined);

export const seedDataStores = (data: {
  pages: Pages;
  assets: Assets;
  instances: Instances;
  props: Props;
  dataSources: DataSources;
  resources: Map<string, Resource>;
  breakpoints: Breakpoints;
  styleSources: StyleSources;
  styleSourceSelections: StyleSourceSelections;
  styles: Styles;
}) => {
  $pages.set(data.pages);
  $assets.set(data.assets);
  $instances.set(data.instances);
  $props.set(data.props);
  $dataSources.set(data.dataSources);
  $resources.set(data.resources);
  $breakpoints.set(data.breakpoints);
  $styleSources.set(data.styleSources);
  $styleSourceSelections.set(data.styleSourceSelections);
  $styles.set(data.styles);
};

export const resetDataStores = () => {
  $pages.set(undefined);
  $assets.set(new Map());
  $instances.set(new Map());
  $props.set(new Map());
  $dataSources.set(new Map());
  $resources.set(new Map());
  $breakpoints.set(new Map());
  $styleSources.set(new Map());
  $styleSourceSelections.set(new Map());
  $styles.set(new Map());
  $projectMeta.set(undefined);
};
