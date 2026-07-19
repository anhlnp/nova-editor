import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--ui-border)",
        input: "var(--ui-input-border)",
        ring: "var(--ui-accent)",
        background: "var(--ui-bg)",
        foreground: "var(--ui-text)",
        primary: {
          DEFAULT: "var(--ui-accent)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--ui-surface)",
          foreground: "var(--ui-text)",
        },
        destructive: {
          DEFAULT: "var(--ui-danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--ui-muted)",
          foreground: "var(--ui-text-muted)",
        },
        accent: {
          DEFAULT: "var(--ui-hover-bg)",
          foreground: "var(--ui-text)",
        },
        popover: {
          DEFAULT: "var(--ui-card)",
          foreground: "var(--ui-text)",
        },
        card: {
          DEFAULT: "var(--ui-card)",
          foreground: "var(--ui-text)",
        },
        nova: {
          300: "#a78bfa",
          400: "#8b5cf6",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "calc(var(--radius-lg) - 2px)",
        sm: "calc(var(--radius-lg) - 4px)",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
