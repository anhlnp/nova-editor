"use client";
// M5 — Slot.
// A Slot is a transparent container: it renders its children with no wrapper of
// its own (display: contents) and passes parent content-model constraints through
// to its children. Unlike RepeatList it does not iterate; it exists so a subtree
// can be treated as a named, reusable region (the builder can later reference the
// same slot content by id). Mirrors Webstudio's Slot pass-through semantics.
import type { WsComponentMeta } from "@webstudio-is/sdk";

type SlotProps = {
  children?: React.ReactNode;
  // forwarded builder chrome attributes (id/component/selector) land here
  [key: string]: unknown;
};

export function Slot({ children, ...rest }: SlotProps) {
  return (
    <div {...rest} style={{ display: "contents" }}>
      {children}
    </div>
  );
}

export const slotMeta = {
  type: "container",
  label: "Slot",
  category: "Dynamic",
  description: "A transparent, reusable container region. Renders its children with no wrapper.",
  props: {},
} satisfies { type: string; label: string; [key: string]: unknown } as WsComponentMeta & {
  category?: string;
};
