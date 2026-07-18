"use client";
// Root error boundary — reports React render crashes to Sentry (when DSN set).
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0f172a", color: "#e5e7eb", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h2 style={{ fontSize: 18 }}>Đã xảy ra lỗi</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{error.digest ? `Mã lỗi: ${error.digest}` : error.message}</p>
          <button onClick={reset} style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "rgba(124,58,237,0.85)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
