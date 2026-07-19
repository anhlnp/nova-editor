"use client";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { getThemeCssVars, type UiThemeMode } from "@/lib/uiTheme";

// Nanostore atom — only source of truth for active builder theme.
// Default: "light".  Switch at runtime: $builderTheme.set("elder")
export const $builderTheme = atom<UiThemeMode>("light");

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

// Wraps the entire builder chrome.  Applies data-theme + inline CSS vars to
// the root div so every descendant can consume var(--ui-*) without prop drilling.
export function ThemeProvider({ children, style, className }: Props) {
  const mode = useStore($builderTheme);
  return (
    <div
      data-theme={mode}
      className={className}
      style={{
        // Inline vars ensure the correct palette is applied even before the
        // CSS file cascade resolves (avoids FOUC on theme switch).
        ...Object.fromEntries(
          getThemeCssVars(mode)
            .split(";")
            .map(s => s.trim())
            .filter(Boolean)
            .map(decl => {
              const idx = decl.indexOf(":");
              return [decl.slice(0, idx).trim(), decl.slice(idx + 1).trim()];
            })
        ),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
