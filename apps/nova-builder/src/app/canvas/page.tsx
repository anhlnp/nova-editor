"use client";
// /canvas — public iframe page; no auth redirect.
// Loaded as the iframe src from /builder/[projectId].
// Data arrives via __webstudioSharedSyncEmitter__ injected by the builder.
//
// Constraint: this page MUST remain public. Middleware explicitly whitelists /canvas.
// The canvas has no HTTP session; its data comes from the sync emitter only.

import dynamic from "next/dynamic";

// Force client-side rendering: Canvas uses window APIs and the sync emitter.
const CanvasClient = dynamic(
  () => import("@/canvas/canvas").then((m) => ({ default: m.Canvas })),
  { ssr: false }
);

const canvasStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
  [data-ws-selected] {
    outline: 2px solid #7c3aed !important;
    outline-offset: 1px;
  }
  [data-ws-hovered]:not([data-ws-selected]) {
    outline: 1px dashed rgba(124,58,237,0.5) !important;
    outline-offset: 1px;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes slideInLeft { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideInRight { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideInTop { from { transform: translateY(-40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideInBottom { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); animation-timing-function: ease-in; } 50% { transform: translateY(-12px); animation-timing-function: ease-out; } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
`;

export default function CanvasPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: canvasStyles }} />
      <CanvasClient />
    </>
  );
}
