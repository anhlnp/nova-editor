"use client";
import { UI_VARS as C } from "@/lib/uiTheme";


type ComponentItemProps = {
  name: string;
  label: string;
  onMouseDown: (e: React.MouseEvent, componentName: string) => void;
  onClick: (componentName: string) => void;
};

export function ComponentItem({ name, label, onMouseDown, onClick }: ComponentItemProps) {
  return (
    <button
      title={name}
      onMouseDown={(e) => onMouseDown(e, name)}
      onClick={() => onClick(name)}
      style={{
        background: C.pill,
        border: `1px solid ${C.pillBorder}`,
        borderRadius: 5,
        color: C.pillText,
        fontSize: 13,
        fontFamily: C.font,
        padding: "3px 8px",
        cursor: "grab",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.pillHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.pill)}
    >
      {label}
    </button>
  );
}
