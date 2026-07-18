"use client";
// P45 / M5 — Dynamic lists / loops with collection item scope.
// RepeatList renders its children once per item in a bound array variable.
//   design/canvas mode: renders once so the template is editable.
//   preview mode: repeats once per array item AND injects the item value into
//     ItemScopeContext under `itemVariableId`, so child expressions bound to that
//     variable resolve to the current element (Collection item scope).
import { useStore } from "@nanostores/react";
import type { WsComponentMeta } from "@webstudio-is/sdk";
import { $dataSources } from "@/lib/data-stores";
import { $isPreviewMode } from "@/lib/nano-states";
import { ItemScopeContext, type ItemScope } from "./itemScope";

type RepeatListProps = {
  dataSourceId?: string;
  itemVariableId?: string;
  children?: React.ReactNode;
};

export function RepeatList({ dataSourceId, itemVariableId, children }: RepeatListProps) {
  const dataSources = useStore($dataSources);
  const isPreview = useStore($isPreviewMode);

  const items = (() => {
    if (!isPreview || !dataSourceId) return null;
    const ds = dataSources.get(dataSourceId);
    if (!ds || ds.type !== "variable") return null;
    const v = ds.value;
    if (v.type !== "json" || !Array.isArray(v.value)) return null;
    return v.value as unknown[];
  })();

  // Design mode (or unbound / non-array): render the template once, no scope.
  if (items === null || items.length === 0) return <>{children}</>;

  return (
    <>
      {items.map((item, i) => {
        const scope: ItemScope = new Map();
        if (itemVariableId) scope.set(itemVariableId, item);
        return (
          <ItemScopeContext.Provider key={i} value={scope}>
            <div data-nova-repeat-index={i} style={{ display: "contents" }}>
              {children}
            </div>
          </ItemScopeContext.Provider>
        );
      })}
    </>
  );
}

export const repeatListMeta = {
  type: "container",
  label: "Repeat List",
  category: "Dynamic",
  description: "Repeats its children once per array item in a bound variable.",
  props: {
    dataSourceId: {
      type: "string",
      label: "Data Source ID",
      defaultValue: "",
    },
    itemVariableId: {
      type: "string",
      label: "Item Variable ID",
      defaultValue: "",
    },
  },
} satisfies { type: string; label: string; [key: string]: unknown } as WsComponentMeta & {
  category?: string;
};
