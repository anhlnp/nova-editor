"use client";
// Builder-native language toggle. The marketing LanguageSwitcher uses Tailwind
// light-theme classes that clash with the dark builder chrome, so the builder
// gets its own compact EN/VI pill on UI_VARS tokens. Selecting a language
// persists it (localStorage + cookie via the i18n provider), so it survives F5.
import { useI18n, type Locale } from "@/lib/i18n";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

export function LangToggle() {
  const { locale, setLocale, setAutoDetectByIp } = useI18n();

  const pick = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    setAutoDetectByIp(false); // manual choice is authoritative (D10)
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.border}`,
        borderRadius: 5,
        overflow: "hidden",
        flexShrink: 0,
      }}
      title="Language"
    >
      {(["en", "vi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => pick(l)}
          style={{
            background: locale === l ? "rgba(124,58,237,0.18)" : "none",
            border: "none",
            color: locale === l ? C.accentLight : C.textMuted,
            fontSize: FONT.xs,
            fontFamily: C.font,
            fontWeight: locale === l ? 700 : 500,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          {l === "vi" ? "🇻🇳 VI" : "🇺🇸 EN"}
        </button>
      ))}
    </div>
  );
}
