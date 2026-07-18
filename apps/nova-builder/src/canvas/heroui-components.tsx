// Real HeroUI components for Nova Editor canvas.
// These wrap actual `@heroui/react` components to integrate seamlessly with the
// Webstudio-is drag-and-drop workspace layout system.
// We carefully destructure builder-injected props (`instance`, `instanceSelector`, `components`)
// to prevent passing them to HeroUI components, which would crash the React tree.

"use client";

import {
  forwardRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  Button as HeroButton,
  Input as HeroInput,
  Card as HeroCard,
  Switch as HeroSwitch,
  Chip as HeroChip,
  Divider as HeroDivider,
  Spinner as HeroSpinner,
  Code as HeroCode,
  Progress as HeroProgress,
  User as HeroUser,
} from "@heroui/react";

// ─── HeroUIButton ───────────────────────────────────────────────────────────

export const HeroUIButton = forwardRef<HTMLButtonElement, {
  children?: ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isDisabled?: boolean;
  isLoading?: boolean;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, color = "primary", size = "md", variant = "solid", radius = "md", isDisabled, isLoading, instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroButton
      ref={ref}
      color={color}
      size={size}
      variant={variant === "ghost" ? "ghost" : variant} // Map ghost variant
      radius={radius}
      isDisabled={isDisabled}
      isLoading={isLoading}
      {...(rest as any)}
    >
      {children ?? "Button"}
    </HeroButton>
  );
});
HeroUIButton.displayName = "HeroUIButton";

// ─── HeroUIInput ────────────────────────────────────────────────────────────

export const HeroUIInput = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  label?: string;
  placeholder?: string;
  type?: string;
  variant?: "flat" | "bordered" | "faded" | "underlined";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  isDisabled?: boolean;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, label = "Label", placeholder = "Enter value...", type = "text", variant = "bordered", color = "default", size = "md", isDisabled, instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroInput
      ref={ref as any}
      type={type}
      label={label}
      placeholder={placeholder}
      variant={variant}
      color={color}
      size={size}
      isDisabled={isDisabled}
      {...(rest as any)}
    >
      {children}
    </HeroInput>
  );
});
HeroUIInput.displayName = "HeroUIInput";

// ─── HeroUICard ─────────────────────────────────────────────────────────────

export const HeroUICard = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  shadow?: "none" | "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg";
  isHoverable?: boolean;
  isPressable?: boolean;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, shadow = "md", radius = "lg", isHoverable, isPressable, instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroCard
      ref={ref as any}
      shadow={shadow}
      radius={radius}
      isHoverable={isHoverable}
      isPressable={isPressable}
      className="p-4"
      {...(rest as any)}
    >
      {children ?? "Card content"}
    </HeroCard>
  );
});
HeroUICard.displayName = "HeroUICard";

// ─── HeroUISwitch ───────────────────────────────────────────────────────────

export const HeroUISwitch = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  isSelected?: boolean;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, isSelected = false, color = "primary", size = "md", instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroSwitch
      ref={ref as any}
      isSelected={isSelected}
      color={color}
      size={size}
      {...(rest as any)}
    >
      {children}
    </HeroSwitch>
  );
});
HeroUISwitch.displayName = "HeroUISwitch";

// ─── HeroUIChip ─────────────────────────────────────────────────────────────

export const HeroUIChip = forwardRef<HTMLSpanElement, {
  children?: ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "dot";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, color = "default", size = "md", variant = "solid", instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroChip
      ref={ref as any}
      color={color}
      size={size}
      variant={variant}
      {...(rest as any)}
    >
      {children ?? "Chip"}
    </HeroChip>
  );
});
HeroUIChip.displayName = "HeroUIChip";

// ─── HeroUIDivider ──────────────────────────────────────────────────────────

export const HeroUIDivider = forwardRef<HTMLHRElement, {
  orientation?: "horizontal" | "vertical";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ orientation = "horizontal", instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroDivider
      ref={ref as any}
      orientation={orientation}
      {...(rest as any)}
    />
  );
});
HeroUIDivider.displayName = "HeroUIDivider";

// ─── HeroUISpinner ──────────────────────────────────────────────────────────

export const HeroUISpinner = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, color = "primary", size = "md", label, instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroSpinner
      ref={ref as any}
      color={color}
      size={size}
      label={label}
      {...(rest as any)}
    >
      {children}
    </HeroSpinner>
  );
});
HeroUISpinner.displayName = "HeroUISpinner";

// ─── HeroUICode ─────────────────────────────────────────────────────────────

export const HeroUICode = forwardRef<HTMLPreElement, {
  children?: ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, color = "default", size = "md", instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroCode
      ref={ref as any}
      color={color}
      size={size}
      {...(rest as any)}
    >
      {children ?? "code"}
    </HeroCode>
  );
});
HeroUICode.displayName = "HeroUICode";

// ─── HeroUIProgress ─────────────────────────────────────────────────────────

export const HeroUIProgress = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  value?: number;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValueLabel?: boolean;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, value = 50, color = "primary", size = "md", label, showValueLabel, instance, instanceSelector, components, ...rest }, ref) => {
  return (
    <HeroProgress
      ref={ref as any}
      value={value}
      color={color}
      size={size}
      label={label}
      showValueLabel={showValueLabel}
      {...(rest as any)}
    >
      {children}
    </HeroProgress>
  );
});
HeroUIProgress.displayName = "HeroUIProgress";

// ─── HeroUIUser ─────────────────────────────────────────────────────────────

export const HeroUIUser = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  name?: string;
  description?: string;
  avatarSrc?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, name = "User Name", description = "Role or description", avatarSrc, instance, instanceSelector, components, ...rest }, ref) => {
  const avatarProps = avatarSrc ? { src: avatarSrc } : undefined;
  return (
    <HeroUser
      ref={ref as any}
      name={name}
      description={description}
      avatarProps={avatarProps}
      {...(rest as any)}
    >
      {children}
    </HeroUser>
  );
});
HeroUIUser.displayName = "HeroUIUser";

// ─── HeroUIContainer (flex container / generic box) ─────────────────────────

export const HeroUIContainer = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  direction?: "row" | "column";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: string;
  padding?: string;
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, direction = "column", justify = "start", align = "stretch", gap = "0px", padding = "16px", wrap = "nowrap", instance, instanceSelector, components, ...rest }, ref) => {
  const justifyMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around", evenly: "space-evenly" };
  const alignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" };
  const style: CSSProperties = {
    display: "flex",
    flexDirection: direction as CSSProperties["flexDirection"],
    justifyContent: justifyMap[justify as string] ?? "flex-start",
    alignItems: alignMap[align as string] ?? "stretch",
    gap: gap as string,
    padding: padding as string,
    flexWrap: wrap as CSSProperties["flexWrap"],
    boxSizing: "border-box",
    minHeight: "40px",
    width: "100%",
  };
  return <div ref={ref} style={style} {...rest as any}>{children}</div>;
});
HeroUIContainer.displayName = "HeroUIContainer";

// ─── HeroUISection (semantic section wrapper) ───────────────────────────────

export const HeroUISection = forwardRef<HTMLElement, {
  children?: ReactNode;
  padding?: string;
  maxWidth?: string;
  background?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, padding = "48px 24px", maxWidth = "1200px", background = "transparent", instance, instanceSelector, components, ...rest }, ref) => {
  const style: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: maxWidth as string,
    margin: "0 auto",
    padding: padding as string,
    background: background as string,
    boxSizing: "border-box",
    minHeight: "80px",
  };
  return <section ref={ref as any} style={style} {...rest as any}>{children}</section>;
});
HeroUISection.displayName = "HeroUISection";

// ─── HeroUIFlexRow (horizontal flex layout) ─────────────────────────────────

export const HeroUIFlexRow = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  gap?: string;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: "nowrap" | "wrap";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, gap = "12px", justify = "start", align = "center", wrap = "wrap", instance, instanceSelector, components, ...rest }, ref) => {
  const justifyMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" };
  const alignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
  const style: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: gap as string,
    justifyContent: justifyMap[justify as string] ?? "flex-start",
    alignItems: alignMap[align as string] ?? "center",
    flexWrap: wrap as CSSProperties["flexWrap"],
    width: "100%",
    boxSizing: "border-box",
    minHeight: "32px",
  };
  return <div ref={ref} style={style} {...rest as any}>{children}</div>;
});
HeroUIFlexRow.displayName = "HeroUIFlexRow";

// ─── HeroUISpacer (flexible space) ──────────────────────────────────────────

export const HeroUISpacer = forwardRef<HTMLDivElement, {
  height?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ height = "24px", instance, instanceSelector, components, ...rest }, ref) => {
  const style: CSSProperties = {
    height: height as string,
    width: "100%",
    flexShrink: 0,
  };
  return <div ref={ref} style={style} {...rest as any} />;
});
HeroUISpacer.displayName = "HeroUISpacer";

// ─── HeroUIImage (image element) ────────────────────────────────────────────

export const HeroUIImage = forwardRef<HTMLImageElement, {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  borderRadius?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ src = "https://via.placeholder.com/400x250?text=Image", alt = "Image", width = "100%", height = "auto", objectFit = "cover", borderRadius = "8px", instance, instanceSelector, components, ...rest }, ref) => {
  const style: CSSProperties = {
    width: width as string,
    height: height as string,
    objectFit: objectFit as CSSProperties["objectFit"],
    borderRadius: borderRadius as string,
    display: "block",
    maxWidth: "100%",
  };
  return <img ref={ref} src={src} alt={alt} style={style} {...rest as any} />;
});
HeroUIImage.displayName = "HeroUIImage";

// ─── HeroUIText (generic text block) ────────────────────────────────────────

export const HeroUIText = forwardRef<HTMLParagraphElement, {
  children?: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, fontSize = "16px", fontWeight = "400", color = "inherit", textAlign = "left", instance, instanceSelector, components, ...rest }, ref) => {
  const style: CSSProperties = {
    fontSize: fontSize as string,
    fontWeight: fontWeight as string,
    color: color as string,
    textAlign: textAlign as CSSProperties["textAlign"],
    lineHeight: 1.6,
    margin: 0,
  };
  return <p ref={ref} style={style} {...rest as any}>{children ?? "Text block"}</p>;
});
HeroUIText.displayName = "HeroUIText";

// ─── HeroUIHeading (heading element) ────────────────────────────────────────

export const HeroUIHeading = forwardRef<HTMLHeadingElement, {
  children?: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: "left" | "center" | "right";
  color?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, level = 2, textAlign = "left", color = "inherit", instance, instanceSelector, components, ...rest }, ref) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes: Record<number, string> = { 1: "2.5rem", 2: "2rem", 3: "1.5rem", 4: "1.25rem", 5: "1rem", 6: "0.875rem" };
  const style: CSSProperties = {
    fontSize: sizes[level as number] ?? "2rem",
    fontWeight: "bold",
    textAlign: textAlign as CSSProperties["textAlign"],
    color: color as string,
    margin: 0,
    lineHeight: 1.3,
  };
  const HeadingTag = Tag as any;
  return <HeadingTag ref={ref} style={style} {...rest as any}>{children ?? `Heading ${level}`}</HeadingTag>;
});
HeroUIHeading.displayName = "HeroUIHeading";

// ─── HeroUILink (anchor element) ────────────────────────────────────────────

export const HeroUILink = forwardRef<HTMLAnchorElement, {
  children?: ReactNode;
  href?: string;
  target?: "_blank" | "_self";
  color?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, href = "#", target = "_self", color = "#006FEE", instance, instanceSelector, components, ...rest }, ref) => {
  const style: CSSProperties = {
    color: color as string,
    textDecoration: "underline",
    cursor: "pointer",
  };
  return <a ref={ref} href={href} target={target} style={style} {...rest as any}>{children ?? "Link text"}</a>;
});
HeroUILink.displayName = "HeroUILink";

// ─── HeroUIRow (12-column grid container) ───────────────────────────────────

export const HeroUIRow = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  gap?: string;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, gap = "16px", instance, instanceSelector, components, ...rest }, ref) => {
  const style: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: gap as any,
    width: "100%",
    boxSizing: "border-box",
  };

  return <div ref={ref} style={style} {...rest as any}>{children}</div>;
});
HeroUIRow.displayName = "HeroUIRow";

// ─── HeroUICol (grid column item) ───────────────────────────────────────────

export const HeroUICol = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  span?: number;
  instance?: unknown;
  instanceSelector?: unknown;
  components?: unknown;
  [key: string]: unknown;
}>(({ children, span = 6, instance, instanceSelector, components, ...rest }, ref) => {
  const s = Math.max(1, Math.min(12, Number(span) || 6));
  const style: CSSProperties = {
    gridColumn: `span ${s} / span ${s}`,
    minWidth: 0,
  };

  return <div ref={ref} style={style} {...rest as any}>{children}</div>;
});
HeroUICol.displayName = "HeroUICol";

// ─── Component Metas ────────────────────────────────────────────────────────

const colorOptions = [
  { label: "Default", name: "default" },
  { label: "Primary", name: "primary" },
  { label: "Secondary", name: "secondary" },
  { label: "Success", name: "success" },
  { label: "Warning", name: "warning" },
  { label: "Danger", name: "danger" },
];

const sizeOptions = [
  { label: "Small", name: "sm" },
  { label: "Medium", name: "md" },
  { label: "Large", name: "lg" },
];

const radiusOptions = [
  { label: "None", name: "none" },
  { label: "Small", name: "sm" },
  { label: "Medium", name: "md" },
  { label: "Large", name: "lg" },
  { label: "Full", name: "full" },
];

const variantOptions = [
  { label: "Solid", name: "solid" },
  { label: "Bordered", name: "bordered" },
  { label: "Light", name: "light" },
  { label: "Flat", name: "flat" },
  { label: "Faded", name: "faded" },
  { label: "Shadow", name: "shadow" },
  { label: "Ghost", name: "ghost" },
];

// Minimal compatible meta shape
type MetaLike = {
  type: string;
  label: string;
  category?: string;
  description?: string;
  icon?: string;
  presetStyle?: Record<string, never>;
  props?: Record<string, unknown>;
};

export const heroUIButtonMeta: MetaLike = {
  type: "container",
  label: "Button",
  category: "HeroUI",
  icon: "🔘",
  description: "HeroUI button component.",
  props: {
    color: { type: "enum", control: "select", label: "Color", defaultValue: "primary", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
    variant: { type: "enum", control: "select", label: "Variant", defaultValue: "solid", options: variantOptions },
    radius: { type: "enum", control: "select", label: "Radius", defaultValue: "md", options: radiusOptions },
    isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
    isLoading: { type: "boolean", label: "Loading", defaultValue: false },
  },
};

export const heroUIInputMeta: MetaLike = {
  type: "container",
  label: "Input",
  category: "HeroUI",
  icon: "📝",
  description: "HeroUI input component.",
  props: {
    label: { type: "string", label: "Label", defaultValue: "Label" },
    placeholder: { type: "string", label: "Placeholder", defaultValue: "Enter value..." },
    type: { type: "enum", control: "select", label: "Type", defaultValue: "text", options: [{ label: "Text", name: "text" }, { label: "Password", name: "password" }, { label: "Email", name: "email" }, { label: "Number", name: "number" }] },
    variant: { type: "enum", control: "select", label: "Variant", defaultValue: "bordered", options: [{ label: "Flat", name: "flat" }, { label: "Bordered", name: "bordered" }, { label: "Faded", name: "faded" }, { label: "Underlined", name: "underlined" }] },
    color: { type: "enum", control: "select", label: "Color", defaultValue: "default", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
    isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
  },
};

export const heroUICardMeta: MetaLike = {
  type: "container",
  label: "Card",
  category: "HeroUI",
  icon: "🃏",
  description: "HeroUI card container component.",
  props: {
    shadow: { type: "enum", control: "select", label: "Shadow", defaultValue: "md", options: [{ label: "None", name: "none" }, { label: "Small", name: "sm" }, { label: "Medium", name: "md" }, { label: "Large", name: "lg" }] },
    radius: { type: "enum", control: "select", label: "Radius", defaultValue: "lg", options: radiusOptions },
    isHoverable: { type: "boolean", label: "Hoverable", defaultValue: false },
    isPressable: { type: "boolean", label: "Pressable", defaultValue: false },
  },
};

export const heroUISwitchMeta: MetaLike = {
  type: "container",
  label: "Switch",
  category: "HeroUI",
  icon: "🔀",
  description: "HeroUI toggle switch.",
  props: {
    isSelected: { type: "boolean", label: "Selected", defaultValue: false },
    color: { type: "enum", control: "select", label: "Color", defaultValue: "primary", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
  },
};

export const heroUIChipMeta: MetaLike = {
  type: "container",
  label: "Chip",
  category: "HeroUI",
  icon: "🏷️",
  description: "HeroUI chip component.",
  props: {
    color: { type: "enum", control: "select", label: "Color", defaultValue: "default", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
    variant: { type: "enum", control: "select", label: "Variant", defaultValue: "solid", options: [{ label: "Solid", name: "solid" }, { label: "Bordered", name: "bordered" }, { label: "Light", name: "light" }, { label: "Flat", name: "flat" }, { label: "Faded", name: "faded" }, { label: "Shadow", name: "shadow" }, { label: "Dot", name: "dot" }] },
  },
};

export const heroUIDividerMeta: MetaLike = {
  type: "rich-text-child",
  label: "Divider",
  category: "HeroUI",
  icon: "➖",
  description: "HeroUI divider line.",
  props: {
    orientation: { type: "enum", control: "select", label: "Orientation", defaultValue: "horizontal", options: [{ label: "Horizontal", name: "horizontal" }, { label: "Vertical", name: "vertical" }] },
  },
};

export const heroUISpinnerMeta: MetaLike = {
  type: "container",
  label: "Spinner",
  category: "HeroUI",
  icon: "🔄",
  description: "HeroUI spinner component.",
  props: {
    color: { type: "enum", control: "select", label: "Color", defaultValue: "primary", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
    label: { type: "string", label: "Label", defaultValue: "" },
  },
};

export const heroUICodeMeta: MetaLike = {
  type: "container",
  label: "Code",
  category: "HeroUI",
  icon: "💻",
  description: "HeroUI inline code block.",
  props: {
    color: { type: "enum", control: "select", label: "Color", defaultValue: "default", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
  },
};

export const heroUIProgressMeta: MetaLike = {
  type: "container",
  label: "Progress",
  category: "HeroUI",
  icon: "📊",
  description: "HeroUI progress bar.",
  props: {
    value: { type: "number", label: "Value (%)", defaultValue: 50 },
    color: { type: "enum", control: "select", label: "Color", defaultValue: "primary", options: colorOptions },
    size: { type: "enum", control: "select", label: "Size", defaultValue: "md", options: sizeOptions },
    label: { type: "string", label: "Label", defaultValue: "" },
    showValueLabel: { type: "boolean", label: "Show Value Label", defaultValue: true },
  },
};

export const heroUIUserMeta: MetaLike = {
  type: "container",
  label: "User",
  category: "HeroUI",
  icon: "👤",
  description: "HeroUI user info / avatar component.",
  props: {
    name: { type: "string", label: "Name", defaultValue: "User Name" },
    description: { type: "string", label: "Description", defaultValue: "Role or description" },
    avatarSrc: { type: "string", label: "Avatar URL", defaultValue: "" },
  },
};

export const heroUIContainerMeta: MetaLike = {
  type: "container",
  label: "Container",
  category: "Layout",
  icon: "📦",
  description: "Flex container / generic box with direction, gap, padding.",
  props: {
    direction: { type: "enum", control: "select", label: "Direction", defaultValue: "column", options: [{ label: "Row", name: "row" }, { label: "Column", name: "column" }] },
    justify: { type: "enum", control: "select", label: "Justify", defaultValue: "start", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Between", name: "between" }, { label: "Around", name: "around" }, { label: "Evenly", name: "evenly" }] },
    align: { type: "enum", control: "select", label: "Align", defaultValue: "stretch", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Stretch", name: "stretch" }, { label: "Baseline", name: "baseline" }] },
    gap: { type: "string", label: "Gap", defaultValue: "0px" },
    padding: { type: "string", label: "Padding", defaultValue: "16px" },
    wrap: { type: "enum", control: "select", label: "Wrap", defaultValue: "nowrap", options: [{ label: "No Wrap", name: "nowrap" }, { label: "Wrap", name: "wrap" }, { label: "Wrap Reverse", name: "wrap-reverse" }] },
  },
};

export const heroUISectionMeta: MetaLike = {
  type: "container",
  label: "Section",
  category: "Layout",
  icon: "📐",
  description: "Semantic section with max-width and centering.",
  props: {
    padding: { type: "string", label: "Padding", defaultValue: "48px 24px" },
    maxWidth: { type: "string", label: "Max Width", defaultValue: "1200px" },
    background: { type: "string", label: "Background", defaultValue: "transparent" },
  },
};

export const heroUIFlexRowMeta: MetaLike = {
  type: "container",
  label: "Flex Row",
  category: "Layout",
  icon: "↔️",
  description: "Horizontal flex row layout.",
  props: {
    gap: { type: "string", label: "Gap", defaultValue: "12px" },
    justify: { type: "enum", control: "select", label: "Justify", defaultValue: "start", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Between", name: "between" }, { label: "Around", name: "around" }] },
    align: { type: "enum", control: "select", label: "Align", defaultValue: "center", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Stretch", name: "stretch" }] },
    wrap: { type: "enum", control: "select", label: "Wrap", defaultValue: "wrap", options: [{ label: "No Wrap", name: "nowrap" }, { label: "Wrap", name: "wrap" }] },
  },
};

export const heroUISpacerMeta: MetaLike = {
  type: "rich-text-child",
  label: "Spacer",
  category: "Layout",
  icon: "↕️",
  description: "Vertical spacer / gap element.",
  props: {
    height: { type: "string", label: "Height", defaultValue: "24px" },
  },
};

export const heroUIImageMeta: MetaLike = {
  type: "rich-text-child",
  label: "Image",
  category: "Media",
  icon: "🖼️",
  description: "Image element with src, alt, fit controls.",
  props: {
    src: { type: "string", label: "Image URL", defaultValue: "https://via.placeholder.com/400x250?text=Image" },
    alt: { type: "string", label: "Alt Text", defaultValue: "Image" },
    width: { type: "string", label: "Width", defaultValue: "100%" },
    height: { type: "string", label: "Height", defaultValue: "auto" },
    objectFit: { type: "enum", control: "select", label: "Object Fit", defaultValue: "cover", options: [{ label: "Cover", name: "cover" }, { label: "Contain", name: "contain" }, { label: "Fill", name: "fill" }, { label: "None", name: "none" }] },
    borderRadius: { type: "string", label: "Border Radius", defaultValue: "8px" },
  },
};

export const heroUITextMeta: MetaLike = {
  type: "rich-text-child",
  label: "Text",
  category: "Typography",
  icon: "📄",
  description: "Generic text / paragraph block.",
  props: {
    fontSize: { type: "string", label: "Font Size", defaultValue: "16px" },
    fontWeight: { type: "string", label: "Font Weight", defaultValue: "400" },
    color: { type: "string", label: "Color", defaultValue: "inherit" },
    textAlign: { type: "enum", control: "select", label: "Text Align", defaultValue: "left", options: [{ label: "Left", name: "left" }, { label: "Center", name: "center" }, { label: "Right", name: "right" }, { label: "Justify", name: "justify" }] },
  },
};

export const heroUIHeadingMeta: MetaLike = {
  type: "rich-text-child",
  label: "Heading",
  category: "Typography",
  icon: "🔤",
  description: "Heading element (h1-h6).",
  props: {
    level: { type: "number", label: "Level (1-6)", defaultValue: 2 },
    textAlign: { type: "enum", control: "select", label: "Text Align", defaultValue: "left", options: [{ label: "Left", name: "left" }, { label: "Center", name: "center" }, { label: "Right", name: "right" }] },
    color: { type: "string", label: "Color", defaultValue: "inherit" },
  },
};

export const heroUILinkMeta: MetaLike = {
  type: "rich-text-child",
  label: "Link",
  category: "Typography",
  icon: "🔗",
  description: "Anchor / hyperlink element.",
  props: {
    href: { type: "string", label: "URL", defaultValue: "#" },
    target: { type: "enum", control: "select", label: "Target", defaultValue: "_self", options: [{ label: "Same Tab", name: "_self" }, { label: "New Tab", name: "_blank" }] },
    color: { type: "string", label: "Color", defaultValue: "#006FEE" },
  },
};

export const heroUIRowMeta: MetaLike = {
  type: "container",
  label: "Row (12-col Grid)",
  category: "HeroUI Layout",
  icon: "⊞",
  description: "12-column Grid container.",
  props: {
    gap: { type: "string", label: "Gap", defaultValue: "16px" },
  },
};

export const heroUIColMeta: MetaLike = {
  type: "container",
  label: "Column",
  category: "HeroUI Layout",
  icon: "▯",
  description: "Grid column that spans 1-12 columns.",
  props: {
    span: { type: "number", label: "Column Span (1-12)", defaultValue: 6 },
  },
};

export const heroUI2ColsMeta: MetaLike = {
  type: "container",
  label: "2 Columns",
  category: "HeroUI Layout",
  icon: "2️⃣",
  description: "Grid row with 2 equal columns.",
  props: {},
};

export const heroUI3ColsMeta: MetaLike = {
  type: "container",
  label: "3 Columns",
  category: "HeroUI Layout",
  icon: "3️⃣",
  description: "Grid row with 3 equal columns.",
  props: {},
};

export const heroUI4ColsMeta: MetaLike = {
  type: "container",
  label: "4 Columns",
  category: "HeroUI Layout",
  icon: "4️⃣",
  description: "Grid row with 4 equal columns.",
  props: {},
};

// Convenience exports for registration
export const heroUIComponents: Record<string, unknown> = {
  HeroUIButton,
  HeroUIInput,
  HeroUICard,
  HeroUISwitch,
  HeroUIChip,
  HeroUIDivider,
  HeroUISpinner,
  HeroUICode,
  HeroUIProgress,
  HeroUIUser,
  HeroUIRow,
  HeroUICol,
  HeroUIContainer,
  HeroUISection,
  HeroUIFlexRow,
  HeroUISpacer,
  HeroUIImage,
  HeroUIText,
  HeroUIHeading,
  HeroUILink,
};

export const heroUIMetas: Record<string, unknown> = {
  HeroUIButton: heroUIButtonMeta,
  HeroUIInput: heroUIInputMeta,
  HeroUICard: heroUICardMeta,
  HeroUISwitch: heroUISwitchMeta,
  HeroUIChip: heroUIChipMeta,
  HeroUIDivider: heroUIDividerMeta,
  HeroUISpinner: heroUISpinnerMeta,
  HeroUICode: heroUICodeMeta,
  HeroUIProgress: heroUIProgressMeta,
  HeroUIUser: heroUIUserMeta,
  HeroUIRow: heroUIRowMeta,
  HeroUICol: heroUIColMeta,
  HeroUI2Cols: heroUI2ColsMeta,
  HeroUI3Cols: heroUI3ColsMeta,
  HeroUI4Cols: heroUI4ColsMeta,
  HeroUIContainer: heroUIContainerMeta,
  HeroUISection: heroUISectionMeta,
  HeroUIFlexRow: heroUIFlexRowMeta,
  HeroUISpacer: heroUISpacerMeta,
  HeroUIImage: heroUIImageMeta,
  HeroUIText: heroUITextMeta,
  HeroUIHeading: heroUIHeadingMeta,
  HeroUILink: heroUILinkMeta,
};
