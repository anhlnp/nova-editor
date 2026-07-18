import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
};

export function FormField({ label, id, error, ...inputProps }: FormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        style={{
          height: 44, padding: "0 14px", borderRadius: 8, fontSize: 16,
          border: `1.5px solid ${error ? "#ef4444" : "#d1d5db"}`,
          background: "#ffffff", color: "#0f172a", outline: "none",
          fontFamily: "system-ui, -apple-system, sans-serif",
          width: "100%", boxSizing: "border-box",
        }}
      />
      {error && <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>}
    </div>
  );
}
