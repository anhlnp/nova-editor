"use client";
import { useEffect, useState } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "nova-coachmarks-seen";

type Props = { visible: boolean };

export function CoachMarks({ visible }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const MARKS = [
    {
      id: "generate",
      title: t.coachmarks.generate.title,
      body: t.coachmarks.generate.body,
      anchor: "top-right",
    },
    {
      id: "canvas",
      title: t.coachmarks.canvas.title,
      body: t.coachmarks.canvas.body,
      anchor: "center",
    },
    {
      id: "publish",
      title: t.coachmarks.publish.title,
      body: t.coachmarks.publish.body,
      anchor: "top-right",
    },
  ];

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) setDismissed(true);
  }, []);

  function next() {
    if (step < MARKS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  if (!visible || dismissed) return null;

  const mark = MARKS[step];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.35)" }}
      />

      {/* Tooltip */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mark.title}
        style={{
          position: "fixed",
          top: mark.anchor === "center" ? "50%" : 64,
          left: mark.anchor === "center" ? "50%" : undefined,
          right: mark.anchor === "top-right" ? 24 : undefined,
          transform: mark.anchor === "center" ? "translate(-50%, -50%)" : undefined,
          zIndex: 9999,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 18,
          width: 280,
          boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
          fontFamily: C.font,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{mark.title}</div>
        <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, margin: "0 0 16px" }}>{mark.body}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>
            {step + 1} / {MARKS.length}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={dismiss}
              style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: C.font }}
            >
              {t.coachmarks.skip}
            </button>
            <button
              onClick={next}
              style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: C.font }}
            >
              {step < MARKS.length - 1 ? t.coachmarks.next : t.coachmarks.done}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
