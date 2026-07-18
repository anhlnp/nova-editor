"use client";
// /canvas — public iframe page; no auth redirect.
// Loaded as the iframe src from /builder/[projectId].
// Data arrives via __webstudioSharedSyncEmitter__ injected by the builder.
//
// Constraint: this page MUST remain public. Middleware explicitly whitelists /canvas.
// The canvas has no HTTP session; its data comes from the sync emitter only.

import dynamic from "next/dynamic";
import { HeroUIProvider } from "@heroui/react";
import "../globals.css";

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

import { useState, useEffect } from "react";

function DiagnosticsOverlay() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setErrors((prev) => [...prev, `[Error] ${e.message} at ${e.filename}:${e.lineno}`]);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const msg = reason ? (reason.message || String(reason)) : "";
      if (!msg || msg.includes("[object Event]")) return; // ignore benign extension events
      setErrors((prev) => [...prev, `[Promise Rejection] ${msg}`]);
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Override console.error safely
    const origError = console.error;
    console.error = (...args: any[]) => {
      origError(...args);
      const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
      // Filter out harmless hydration warnings
      if (msg.includes("hydration") || msg.includes("Hydration")) return;
      setErrors((prev) => [...prev, `[Console.error] ${msg}`.slice(0, 300)]);
    };

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      console.error = origError;
    };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      right: 16,
      width: 360,
      maxHeight: 300,
      overflowY: "auto",
      background: "rgba(220, 38, 38, 0.95)",
      color: "#fff",
      padding: 12,
      borderRadius: 8,
      zIndex: 999999,
      fontSize: 12,
      fontFamily: "monospace",
      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
      border: "1px solid #ef4444"
    }}>
      <div style={{ fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 4, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
        <span>Canvas Diagnostic Errors ({errors.length})</span>
        <button onClick={() => setErrors([])} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>Clear</button>
      </div>
      {errors.map((err, i) => (
        <div key={i} style={{ marginBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
          {err}
        </div>
      ))}
    </div>
  );
}

export default function CanvasPage() {
  return (
    <HeroUIProvider>
      <style dangerouslySetInnerHTML={{ __html: canvasStyles }} />
      <div className="dark text-foreground bg-background min-h-screen relative">
        <CanvasClient />
        <DiagnosticsOverlay />
      </div>
    </HeroUIProvider>
  );
}
