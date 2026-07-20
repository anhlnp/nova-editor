"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

// ─── Lightbox state ──────────────────────────────────────────────────────────

export interface LightboxState {
  src: string;
  alt: string;
}

export const $lightboxImage = atom<LightboxState | null>(null);

// ─── ImageLightbox component ─────────────────────────────────────────────────

export const ImageLightbox = () => {
  const lightbox = useStore($lightboxImage);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Open animation
  useEffect(() => {
    if (lightbox) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setIsClosing(false);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [lightbox]);

  const close = useCallback(() => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      $lightboxImage.set(null);
      setIsClosing(false);
    }, 280);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.25, 5));
      if (e.key === "-") setScale((s) => Math.max(s - 0.25, 0.25));
      if (e.key === "0") {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightbox, close]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => Math.max(0.25, Math.min(5, s + delta)));
  }, []);

  // Pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    },
    [scale, translate]
  );

  // Pan move
  useEffect(() => {
    if (!isPanning) return;
    const move = (e: MouseEvent) => {
      setTranslate({
        x: translateStart.current.x + (e.clientX - panStart.current.x),
        y: translateStart.current.y + (e.clientY - panStart.current.y),
      });
    };
    const up = () => setIsPanning(false);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
  }, [isPanning]);

  if (!lightbox && !isClosing) return null;

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.25));
  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        if (e.target === containerRef.current) close();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isVisible ? "rgba(0, 0, 0, 0.88)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isVisible ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: isVisible ? "blur(12px)" : "blur(0px)",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease",
        cursor: isPanning ? "grabbing" : scale > 1 ? "grab" : "default",
        userSelect: "none",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: isVisible ? "auto" : "none",
          zIndex: 2,
        }}
      >
        {/* Alt text / filename */}
        <span
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 13,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            maxWidth: "50%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lightbox?.alt || "Image Preview"}
        </span>

        {/* Close button */}
        <button
          onClick={close}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "rgba(255,255,255,0.18)";
            (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
          }}
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Image container */}
      <div
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <img
          src={lightbox?.src || ""}
          alt={lightbox?.alt || ""}
          draggable={false}
          style={{
            display: "block",
            maxWidth: "90vw",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: 8,
            boxShadow: "0 8px 60px rgba(0,0,0,0.6), 0 2px 16px rgba(0,0,0,0.3)",
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: isPanning ? "none" : "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: `translateX(-50%) translateY(${isVisible ? "0" : "20px"})`,
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "6px 8px",
          background: "rgba(30, 30, 40, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: isVisible ? "auto" : "none",
          zIndex: 2,
        }}
      >
        <ToolbarButton onClick={zoomOut} title="Zoom Out (-)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </ToolbarButton>

        <button
          onClick={resetZoom}
          title="Reset Zoom (0)"
          style={{
            height: 30,
            minWidth: 52,
            border: "none",
            borderRadius: 8,
            background: "transparent",
            color: "rgba(255,255,255,0.85)",
            fontSize: 11,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "transparent";
          }}
        >
          {Math.round(scale * 100)}%
        </button>

        <ToolbarButton onClick={zoomIn} title="Zoom In (+)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="7" y1="4.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </ToolbarButton>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

        <ToolbarButton onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }} title="Fit to Screen">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="4.5" y="4.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" />
          </svg>
        </ToolbarButton>
      </div>
    </div>
  );
};

// ─── Toolbar button ──────────────────────────────────────────────────────────

const ToolbarButton = ({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 32,
      height: 30,
      border: "none",
      borderRadius: 8,
      background: "transparent",
      color: "rgba(255,255,255,0.75)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.15s, color 0.15s",
    }}
    onMouseEnter={(e) => {
      const btn = e.currentTarget;
      btn.style.background = "rgba(255,255,255,0.1)";
      btn.style.color = "rgba(255,255,255,0.95)";
    }}
    onMouseLeave={(e) => {
      const btn = e.currentTarget;
      btn.style.background = "transparent";
      btn.style.color = "rgba(255,255,255,0.75)";
    }}
  >
    {children}
  </button>
);
