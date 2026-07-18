"use client";
// P56 — renders the collaborator avatar stack (topbar) and live remote cursors.
// M12 — also broadcasts the local selection and renders remote selection outlines.
import { useEffect, useReducer, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $collaborators, joinProjectPresence, getRealtimeClient, type Collaborator } from "@/lib/presence";
import { joinCoeditChannel } from "@/lib/coedit";
import { $projectMeta } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";


function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

// Avatar stack — mount inside the Topbar right section.
export function CollaboratorAvatars() {
  const collaborators = useStore($collaborators);
  if (collaborators.length === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", marginRight: 4 }}>
      {collaborators.slice(0, 4).map((c, i) => (
        <div
          key={c.id}
          title={c.name}
          style={{
            width: 24, height: 24, borderRadius: "50%", background: c.color,
            border: "2px solid #0a0a14", marginLeft: i === 0 ? 0 : -8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: "#0a0a14", fontFamily: C.font, zIndex: 4 - i,
          }}
        >
          {initials(c.name)}
        </div>
      ))}
      {collaborators.length > 4 && (
        <div style={{ marginLeft: -8, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: C.font, paddingLeft: 10 }}>
          +{collaborators.length - 4}
        </div>
      )}
    </div>
  );
}

// Remote cursor overlay — mount over the canvas area. `containerRef` bounds the
// coordinate space so remote (0..1) fractions map to local pixels.
export function RemoteCursors({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const collaborators = useStore($collaborators);
  const [w, h] = useSize(containerRef);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 50 }}>
      {collaborators.map((c) => (
        <div key={c.id} style={{ position: "absolute", left: c.x * w, top: c.y * h, transition: "left 0.08s linear, top 0.08s linear" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ display: "block" }}>
            <path d="M2 2 L2 14 L5.5 10.5 L8 16 L10.5 15 L8 9.5 L13 9.5 Z" fill={c.color} stroke="#0a0a14" strokeWidth="1" />
          </svg>
          <div style={{ marginLeft: 12, marginTop: -4, background: c.color, color: "#0a0a14", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, fontFamily: C.font, whiteSpace: "nowrap" }}>
            {c.name}
          </div>
        </div>
      ))}
    </div>
  );
}

// M12 — remote selection outlines. For each collaborator with a selected instance,
// query that element inside the canvas iframe and draw a colored, labeled outline
// in the builder overlay (same iframe→builder coordinate mapping as cursors).
export function RemoteSelections({
  iframeRef,
  containerRef,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const collaborators = useStore($collaborators);
  const [, forceTick] = useReducer((n: number) => n + 1, 0);

  // Re-measure on an interval so outlines follow scroll/layout without heavy wiring.
  useEffect(() => {
    const t = setInterval(forceTick, 250);
    return () => clearInterval(t);
  }, []);

  const iframe = iframeRef.current;
  const container = containerRef.current;
  if (!iframe?.contentDocument || !container) return null;
  const containerRect = container.getBoundingClientRect();
  const iframeRect = iframe.getBoundingClientRect();

  const boxes = collaborators
    .filter((c) => c.selectedInstanceId)
    .map((c) => {
      const el = iframe.contentDocument!.querySelector(
        `[data-ws-id="${c.selectedInstanceId}"]`
      ) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      // iframe-local rect → builder-overlay coordinates
      const left = iframeRect.left - containerRect.left + r.left;
      const top = iframeRect.top - containerRect.top + r.top;
      return { c, left, top, width: r.width, height: r.height };
    })
    .filter(Boolean) as Array<{ c: Collaborator; left: number; top: number; width: number; height: number }>;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 49 }}>
      {boxes.map(({ c, left, top, width, height }) => (
        <div key={c.id} style={{ position: "absolute", left, top, width, height, border: `2px solid ${c.color}`, borderRadius: 2, boxSizing: "border-box" }}>
          <div style={{ position: "absolute", top: -16, left: -2, background: c.color, color: "#0a0a14", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, fontFamily: C.font, whiteSpace: "nowrap" }}>
            {c.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function useSize(ref: React.RefObject<HTMLElement | null>): [number, number] {
  const sizeRef = useRef<[number, number]>([1, 1]);
  useEffect(() => {
    if (!ref.current) return;
    const update = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r) sizeRef.current = [r.width, r.height];
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return sizeRef.current;
}

// Presence lifecycle — mount once in the builder; tracks the local cursor over
// the given canvas container and broadcasts (0..1) fractional coordinates.
export function usePresence(containerRef: React.RefObject<HTMLElement | null>, user: { id: string; name: string }) {
  const meta = useStore($projectMeta);
  const userId = user.id;
  const userName = user.name;
  useEffect(() => {
    if (!meta?.id) return;
    const handle = joinProjectPresence(meta.id, { id: userId, name: userName });
    // M12 — start realtime co-editing on a sibling channel (shares the client).
    const supabase = getRealtimeClient();
    const coedit = supabase ? joinCoeditChannel(supabase, meta.id, userId) : null;
    const el = containerRef.current;
    const onMove = (e: MouseEvent) => {
      const r = el?.getBoundingClientRect();
      if (!r || r.width === 0) return;
      handle.updateCursor((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    el?.addEventListener("mousemove", onMove);
    // M12 — broadcast this editor's selection so peers can draw remote outlines.
    const unsubscribeSelection = $selectedInstanceId.subscribe((id) => handle.updateSelection(id));
    return () => {
      el?.removeEventListener("mousemove", onMove);
      unsubscribeSelection();
      coedit?.destroy();
      handle.destroy();
    };
  }, [meta?.id, containerRef, userId, userName]);
}
