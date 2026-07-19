// Real shadcn/ui components for Nova Editor canvas.
// Wraps React components styled with Tailwind CSS to integrate seamlessly with the
// drag-and-drop workspace layout system.
// We carefully destructure builder-injected props to prevent passing them to raw HTML/SVG elements.

"use client";

import {
  forwardRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

// ─── UTILITIES ──────────────────────────────────────────────────────────────
const esc = (s: string) => s;

// ─── Button ─────────────────────────────────────────────────────────────────
export const ShadcnButton = forwardRef<HTMLButtonElement, {
  children?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isDisabled?: boolean;
  [key: string]: any;
}>(({ children, variant = "default", size = "default", isDisabled, ...rest }, ref) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "Button"}
    </button>
  );
});
ShadcnButton.displayName = "ShadcnButton";

// ─── Input ──────────────────────────────────────────────────────────────────
export const ShadcnInput = forwardRef<HTMLInputElement, {
  placeholder?: string;
  type?: string;
  isDisabled?: boolean;
  [key: string]: any;
}>(({ placeholder = "Search...", type = "text", isDisabled, ...rest }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      disabled={isDisabled}
      className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${(rest.className as string) || ""}`}
      {...rest}
    />
  );
});
ShadcnInput.displayName = "ShadcnInput";

// ─── Textarea ───────────────────────────────────────────────────────────────
export const ShadcnTextarea = forwardRef<HTMLTextAreaElement, {
  placeholder?: string;
  isDisabled?: boolean;
  [key: string]: any;
}>(({ placeholder = "Type message...", isDisabled, ...rest }, ref) => {
  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      disabled={isDisabled}
      className={`flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${(rest.className as string) || ""}`}
      {...rest}
    />
  );
});
ShadcnTextarea.displayName = "ShadcnTextarea";

// ─── Checkbox ───────────────────────────────────────────────────────────────
export const ShadcnCheckbox = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  isChecked?: boolean;
  isDisabled?: boolean;
  [key: string]: any;
}>(({ children, isChecked = true, isDisabled, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 select-none ${isDisabled ? "opacity-50 pointer-events-none" : ""} ${(rest.className as string) || ""}`}
      {...rest}
    >
      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold transition-all ${isChecked ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"}`}>
        {isChecked && "✓"}
      </div>
      <span className="text-sm font-medium text-foreground">{children ?? "Accept terms"}</span>
    </div>
  );
});
ShadcnCheckbox.displayName = "ShadcnCheckbox";

// ─── Switch ─────────────────────────────────────────────────────────────────
export const ShadcnSwitch = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  isChecked?: boolean;
  isDisabled?: boolean;
  [key: string]: any;
}>(({ children, isChecked = true, isDisabled, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 select-none ${isDisabled ? "opacity-50 pointer-events-none" : ""} ${(rest.className as string) || ""}`}
      {...rest}
    >
      <div className={`w-8 h-4 rounded-full relative p-0.5 transition-colors cursor-pointer ${isChecked ? "bg-primary" : "bg-muted"}`}>
        <div className={`w-3 h-3 rounded-full bg-background transition-transform shadow-sm ${isChecked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
      {children && <span className="text-sm font-medium text-foreground">{children}</span>}
    </div>
  );
});
ShadcnSwitch.displayName = "ShadcnSwitch";

// ─── RadioGroup ─────────────────────────────────────────────────────────────
export const ShadcnRadioGroup = forwardRef<HTMLDivElement, {
  label?: string;
  defaultValue?: string;
  [key: string]: any;
}>(({ label = "Select option", defaultValue = "a", ...rest }, ref) => {
  const [val, setVal] = useState(defaultValue);
  return (
    <div ref={ref} className={`flex flex-col gap-2 text-xs text-foreground ${(rest.className as string) || ""}`} {...rest}>
      {label && <span className="font-semibold text-muted-foreground">{label}</span>}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setVal("a")}>
          <div className="w-3.5 h-3.5 rounded-full border border-primary flex items-center justify-center">
            {val === "a" && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </div>
          <span>Option A</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setVal("b")}>
          <div className="w-3.5 h-3.5 rounded-full border border-primary flex items-center justify-center">
            {val === "b" && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </div>
          <span>Option B</span>
        </div>
      </div>
    </div>
  );
});
ShadcnRadioGroup.displayName = "ShadcnRadioGroup";

// ─── Select ─────────────────────────────────────────────────────────────────
export const ShadcnSelect = forwardRef<HTMLDivElement, {
  placeholder?: string;
  defaultValue?: string;
  [key: string]: any;
}>(({ placeholder = "Select option", defaultValue = "Active", ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`w-full max-w-[200px] border border-input bg-background px-3 py-1.5 rounded-md flex justify-between items-center text-sm text-foreground shadow-sm cursor-pointer hover:bg-accent/40 ${(rest.className as string) || ""}`}
      {...rest}
    >
      <span>{defaultValue || placeholder}</span>
      <span className="text-[10px] text-muted-foreground">▼</span>
    </div>
  );
});
ShadcnSelect.displayName = "ShadcnSelect";

// ─── Combobox ───────────────────────────────────────────────────────────────
export const ShadcnCombobox = forwardRef<HTMLDivElement, {
  placeholder?: string;
  [key: string]: any;
}>(({ placeholder = "Select item...", ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`w-full max-w-[200px] border border-input bg-background px-3 py-1.5 rounded-md flex justify-between items-center text-sm text-foreground shadow-sm cursor-pointer hover:bg-accent/40 ${(rest.className as string) || ""}`}
      {...rest}
    >
      <span className="text-muted-foreground">{placeholder}</span>
      <span className="text-[10px] text-muted-foreground">↕</span>
    </div>
  );
});
ShadcnCombobox.displayName = "ShadcnCombobox";

// ─── Calendar ───────────────────────────────────────────────────────────────
export const ShadcnCalendar = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`border border-border p-3 bg-background rounded-md text-xs w-[180px] text-foreground shadow-sm ${(rest.className as string) || ""}`} {...rest}>
      <div className="flex justify-between items-center mb-1 font-semibold border-b border-border pb-1">
        <span>◀</span>
        <span>July 2026</span>
        <span>▶</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-muted-foreground font-medium mb-1">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1;
          const isSelected = day === 19;
          return (
            <span
              key={day}
              className={`p-1 rounded-md cursor-pointer ${
                isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
});
ShadcnCalendar.displayName = "ShadcnCalendar";

// ─── DatePicker ─────────────────────────────────────────────────────────────
export const ShadcnDatePicker = forwardRef<HTMLDivElement, {
  placeholder?: string;
  [key: string]: any;
}>(({ placeholder = "Pick a date", ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`w-full max-w-[200px] border border-input bg-background px-3 py-1.5 rounded-md flex items-center gap-2 text-sm text-foreground shadow-sm cursor-pointer hover:bg-accent/40 ${(rest.className as string) || ""}`}
      {...rest}
    >
      <span>📅</span>
      <span className="text-muted-foreground">{placeholder}</span>
    </div>
  );
});
ShadcnDatePicker.displayName = "ShadcnDatePicker";

// ─── InputOTP ───────────────────────────────────────────────────────────────
export const ShadcnInputOTP = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex gap-1.5 ${(rest.className as string) || ""}`} {...rest}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`w-8 h-10 border border-input rounded-md bg-background flex items-center justify-center text-sm font-semibold text-foreground ${
            i === 2 ? "ring-2 ring-primary border-primary" : ""
          }`}
        >
          {i < 2 ? "1" : i === 2 ? "│" : ""}
        </div>
      ))}
    </div>
  );
});
ShadcnInputOTP.displayName = "ShadcnInputOTP";

// ─── Label ──────────────────────────────────────────────────────────────────
export const ShadcnLabel = forwardRef<HTMLSpanElement, {
  children?: ReactNode;
  [key: string]: any;
}>(({ children, ...rest }, ref) => {
  return (
    <span
      ref={ref}
      className={`text-xs font-semibold text-foreground tracking-wide select-none ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "Username"}
    </span>
  );
});
ShadcnLabel.displayName = "ShadcnLabel";

// ─── Slider ─────────────────────────────────────────────────────────────────
export const ShadcnSlider = forwardRef<HTMLDivElement, {
  defaultValue?: number;
  [key: string]: any;
}>(({ defaultValue = 50, ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[200px] h-6 flex items-center relative select-none cursor-pointer ${(rest.className as string) || ""}`} {...rest}>
      <div className="w-full h-1 bg-secondary rounded-full">
        <div className="h-full bg-primary rounded-full relative" style={{ width: `${defaultValue}%` }}>
          <div className="w-3.5 h-3.5 rounded-full bg-background border border-primary absolute right-0 -top-1 shadow-md hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
});
ShadcnSlider.displayName = "ShadcnSlider";

// ─── Toggle ─────────────────────────────────────────────────────────────────
export const ShadcnToggle = forwardRef<HTMLButtonElement, {
  children?: ReactNode;
  isPressed?: boolean;
  [key: string]: any;
}>(({ children, isPressed = false, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      className={`p-2 border rounded-md text-xs font-semibold shadow-sm transition-colors ${
        isPressed ? "bg-accent text-accent-foreground border-border" : "bg-transparent text-foreground border-transparent hover:bg-accent/40"
      } ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "⭐ Star"}
    </button>
  );
});
ShadcnToggle.displayName = "ShadcnToggle";

// ─── ToggleGroup ────────────────────────────────────────────────────────────
export const ShadcnToggleGroup = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex border border-border rounded-md overflow-hidden bg-background divide-x divide-border shadow-sm ${(rest.className as string) || ""}`} {...rest}>
      <button className="px-3 py-1.5 text-xs font-bold bg-accent text-accent-foreground">B</button>
      <button className="px-3 py-1.5 text-xs italic text-foreground hover:bg-accent/30">I</button>
      <button className="px-3 py-1.5 text-xs underline text-foreground hover:bg-accent/30">U</button>
    </div>
  );
});
ShadcnToggleGroup.displayName = "ShadcnToggleGroup";

// ─── Tabs ───────────────────────────────────────────────────────────────────
export const ShadcnTabs = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex p-1 bg-secondary rounded-lg border border-border text-xs shadow-sm max-w-fit ${(rest.className as string) || ""}`} {...rest}>
      <div className="px-4 py-1.5 bg-background text-foreground font-semibold rounded-md shadow-sm cursor-pointer">Account</div>
      <div className="px-4 py-1.5 text-muted-foreground hover:text-foreground rounded-md cursor-pointer">Password</div>
    </div>
  );
});
ShadcnTabs.displayName = "ShadcnTabs";

// ─── Breadcrumb ─────────────────────────────────────────────────────────────
export const ShadcnBreadcrumb = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex items-center gap-1.5 text-xs text-muted-foreground font-medium ${(rest.className as string) || ""}`} {...rest}>
      <span className="hover:text-foreground cursor-pointer">Home</span>
      <span>/</span>
      <span className="hover:text-foreground cursor-pointer">Settings</span>
      <span>/</span>
      <span className="text-foreground font-semibold">History</span>
    </div>
  );
});
ShadcnBreadcrumb.displayName = "ShadcnBreadcrumb";

// ─── Pagination ─────────────────────────────────────────────────────────────
export const ShadcnPagination = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex items-center gap-1 text-xs font-semibold ${(rest.className as string) || ""}`} {...rest}>
      <button className="px-2.5 py-1 border border-border bg-background rounded-md text-muted-foreground hover:bg-accent">◀</button>
      <button className="w-7 h-7 bg-primary text-primary-foreground rounded-md flex items-center justify-center shadow-sm">1</button>
      <button className="w-7 h-7 border border-border bg-background text-foreground rounded-md flex items-center justify-center hover:bg-accent">2</button>
      <button className="w-7 h-7 border border-border bg-background text-foreground rounded-md flex items-center justify-center hover:bg-accent">3</button>
      <button className="px-2.5 py-1 border border-border bg-background rounded-md text-muted-foreground hover:bg-accent">▶</button>
    </div>
  );
});
ShadcnPagination.displayName = "ShadcnPagination";

// ─── NavigationMenu ─────────────────────────────────────────────────────────
export const ShadcnNavigationMenu = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex gap-6 text-sm font-semibold text-muted-foreground ${(rest.className as string) || ""}`} {...rest}>
      <span className="text-foreground border-b-2 border-primary pb-1">Features</span>
      <span className="hover:text-foreground cursor-pointer">Pricing</span>
      <span className="hover:text-foreground cursor-pointer">Docs</span>
    </div>
  );
});
ShadcnNavigationMenu.displayName = "ShadcnNavigationMenu";

// ─── Menubar ────────────────────────────────────────────────────────────────
export const ShadcnMenubar = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full border border-border bg-background px-4 py-1.5 rounded-md flex gap-4 text-xs font-semibold text-foreground shadow-sm ${(rest.className as string) || ""}`} {...rest}>
      <span className="bg-accent px-2 py-0.5 rounded cursor-pointer">File</span>
      <span className="hover:bg-accent px-2 py-0.5 rounded text-muted-foreground cursor-pointer">Edit</span>
      <span className="hover:bg-accent px-2 py-0.5 rounded text-muted-foreground cursor-pointer">View</span>
    </div>
  );
});
ShadcnMenubar.displayName = "ShadcnMenubar";

// ─── ContextMenu ────────────────────────────────────────────────────────────
export const ShadcnContextMenu = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[200px] h-[60px] border border-dashed border-border bg-background rounded-md flex items-center justify-center text-xs text-muted-foreground font-semibold ${(rest.className as string) || ""}`} {...rest}>
      Right click here
    </div>
  );
});
ShadcnContextMenu.displayName = "ShadcnContextMenu";

// ─── DropdownMenu ───────────────────────────────────────────────────────────
export const ShadcnDropdownMenu = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex flex-col gap-1 w-[160px] border border-border bg-popover text-popover-foreground rounded-md p-1 shadow-md text-xs font-semibold ${(rest.className as string) || ""}`} {...rest}>
      <div className="px-2 py-1.5 hover:bg-accent rounded cursor-pointer">Profile Settings</div>
      <div className="px-2 py-1.5 hover:bg-accent rounded cursor-pointer">Billing Info</div>
      <div className="border-t border-border/60 my-0.5" />
      <div className="px-2 py-1.5 hover:bg-destructive hover:text-destructive-foreground rounded cursor-pointer">Logout</div>
    </div>
  );
});
ShadcnDropdownMenu.displayName = "ShadcnDropdownMenu";

// ─── Sidebar ────────────────────────────────────────────────────────────────
export const ShadcnSidebar = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-[220px] border-r border-border bg-card text-card-foreground flex flex-col p-3 text-xs font-semibold text-muted-foreground shadow-sm h-[140px] ${(rest.className as string) || ""}`} {...rest}>
      <div className="flex items-center gap-1.5 text-foreground mb-4 pb-1 border-b border-border/40">
        <span>⚡</span>
        <span className="font-bold">Nova Builder</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 bg-accent text-accent-foreground px-3 py-1.5 rounded cursor-pointer">
          <span>📁</span>
          <span>Projects</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-accent/40 rounded cursor-pointer">
          <span>⚙️</span>
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
});
ShadcnSidebar.displayName = "ShadcnSidebar";

// ─── Command ────────────────────────────────────────────────────────────────
export const ShadcnCommand = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-border bg-popover rounded-md flex flex-col p-2 text-xs shadow-md h-[120px] ${(rest.className as string) || ""}`} {...rest}>
      <input
        type="text"
        placeholder="Type a command..."
        className="w-full border-b border-border bg-transparent outline-none pb-2 mb-2 text-xs text-foreground placeholder:text-muted-foreground"
        readOnly
      />
      <div className="flex flex-col gap-1 font-semibold text-foreground">
        <div className="px-2 py-1.5 bg-accent rounded flex justify-between items-center cursor-pointer">
          <span>Search Files</span>
          <span className="text-[9px] text-muted-foreground">⌘P</span>
        </div>
        <div className="px-2 py-1.5 hover:bg-accent/40 rounded flex justify-between items-center cursor-pointer">
          <span>Open Settings</span>
          <span className="text-[9px] text-muted-foreground">⌘,</span>
        </div>
      </div>
    </div>
  );
});
ShadcnCommand.displayName = "ShadcnCommand";

// ─── Dialog ─────────────────────────────────────────────────────────────────
export const ShadcnDialog = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-border bg-popover text-popover-foreground rounded-lg p-4 shadow-lg text-left ${(rest.className as string) || ""}`} {...rest}>
      <span className="text-xs font-bold block mb-1">Edit Profile</span>
      <span className="text-[10px] text-muted-foreground block mb-3 leading-relaxed">
        {"Make changes here. Click save when you're done."}
      </span>
      <div className="flex justify-end gap-2 mt-2">
        <button className="px-3 py-1.5 border border-border rounded text-[10px] font-semibold hover:bg-accent">Cancel</button>
        <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-[10px] font-semibold">Save</button>
      </div>
    </div>
  );
});
ShadcnDialog.displayName = "ShadcnDialog";

// ─── AlertDialog ────────────────────────────────────────────────────────────
export const ShadcnAlertDialog = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-destructive/20 bg-popover text-popover-foreground rounded-lg p-4 shadow-lg text-left ${(rest.className as string) || ""}`} {...rest}>
      <span className="text-xs font-bold block mb-1">Are you sure?</span>
      <span className="text-[10px] text-muted-foreground block mb-3 leading-relaxed">
        This action cannot be undone. Files will be deleted.
      </span>
      <div className="flex justify-end gap-2 mt-2">
        <button className="px-3 py-1.5 border border-border rounded text-[10px] font-semibold hover:bg-accent">Cancel</button>
        <button className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded text-[10px] font-semibold">Delete</button>
      </div>
    </div>
  );
});
ShadcnAlertDialog.displayName = "ShadcnAlertDialog";

// ─── Popover ────────────────────────────────────────────────────────────────
export const ShadcnPopover = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[160px] border border-border bg-popover text-popover-foreground rounded-md p-2.5 shadow-md text-left text-[10px] leading-relaxed ${(rest.className as string) || ""}`} {...rest}>
      <span className="font-bold block mb-0.5 text-xs">Dimensions</span>
      <span className="text-muted-foreground">Adjust width & height sizes.</span>
    </div>
  );
});
ShadcnPopover.displayName = "ShadcnPopover";

// ─── Tooltip ────────────────────────────────────────────────────────────────
export const ShadcnTooltip = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 ${(rest.className as string) || ""}`} {...rest}>
      <div className="bg-foreground text-background px-3 py-1.5 rounded text-[10px] font-bold shadow">
        Add to library
      </div>
    </div>
  );
});
ShadcnTooltip.displayName = "ShadcnTooltip";

// ─── HoverCard ──────────────────────────────────────────────────────────────
export const ShadcnHoverCard = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[220px] border border-border bg-popover text-popover-foreground rounded-lg p-3 shadow-md flex gap-3 text-left text-xs leading-relaxed ${(rest.className as string) || ""}`} {...rest}>
      <div className="w-8 h-8 rounded-full bg-secondary shrink-0 font-bold flex items-center justify-center text-xs">N</div>
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-foreground">@nextjs</span>
        <span className="text-muted-foreground">React framework built for the web.</span>
      </div>
    </div>
  );
});
ShadcnHoverCard.displayName = "ShadcnHoverCard";

// ─── Drawer ─────────────────────────────────────────────────────────────────
export const ShadcnDrawer = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-border bg-popover rounded-t-xl shadow-lg flex flex-col justify-end p-3 border-b-0 h-[80px] relative overflow-hidden ${(rest.className as string) || ""}`} {...rest}>
      <div className="w-8 h-1 bg-border rounded-full mx-auto mb-2" />
      <span className="text-xs font-bold text-foreground block text-center">Settings Drawer</span>
      <span className="text-[9px] text-muted-foreground block text-center mb-1">Set project variables</span>
    </div>
  );
});
ShadcnDrawer.displayName = "ShadcnDrawer";

// ─── Sheet ──────────────────────────────────────────────────────────────────
export const ShadcnSheet = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-border bg-popover rounded-md shadow-lg flex justify-end h-[90px] relative overflow-hidden ${(rest.className as string) || ""}`} {...rest}>
      <div className="w-[80px] h-full border-l border-border bg-background p-2 flex flex-col justify-between text-[10px] font-semibold">
        <span>Details</span>
        <span className="text-muted-foreground">Properties list...</span>
      </div>
    </div>
  );
});
ShadcnSheet.displayName = "ShadcnSheet";

// ─── Sonner ─────────────────────────────────────────────────────────────────
export const ShadcnSonner = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-border bg-card text-card-foreground rounded-lg p-3 shadow-md flex justify-between items-center text-xs font-semibold ${(rest.className as string) || ""}`} {...rest}>
      <div>
        <span className="block font-bold">Event created</span>
        <span className="text-muted-foreground block text-[10px]">Monday, July 19 at 6:00 PM</span>
      </div>
      <button className="px-2.5 py-1 bg-accent border border-border rounded text-[9px] font-bold">Undo</button>
    </div>
  );
});
ShadcnSonner.displayName = "ShadcnSonner";

// ─── Toast ──────────────────────────────────────────────────────────────────
export const ShadcnToast = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[240px] border border-border bg-popover text-popover-foreground rounded-lg p-3 shadow-md text-left ${(rest.className as string) || ""}`} {...rest}>
      <span className="text-xs font-bold block mb-0.5">Scheduled successfully</span>
      <span className="text-[10px] text-muted-foreground leading-normal block">
        We have added the timeline events to logs.
      </span>
    </div>
  );
});
ShadcnToast.displayName = "ShadcnToast";

// ─── Card ───────────────────────────────────────────────────────────────────
export const ShadcnCard = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  [key: string]: any;
}>(({ children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`border border-border bg-card text-card-foreground rounded-xl p-4 shadow-sm ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? <div className="text-xs">Card Content</div>}
    </div>
  );
});
ShadcnCard.displayName = "ShadcnCard";

// ─── Separator ──────────────────────────────────────────────────────────────
export const ShadcnSeparator = forwardRef<HTMLHRElement, {
  orientation?: "horizontal" | "vertical";
  [key: string]: any;
}>(({ orientation = "horizontal", ...rest }, ref) => {
  return (
    <hr
      ref={ref}
      className={`${orientation === "horizontal" ? "w-full h-[1px] my-2" : "h-full w-[1px] mx-2"} bg-border border-none ${(rest.className as string) || ""}`}
      {...rest}
    />
  );
});
ShadcnSeparator.displayName = "ShadcnSeparator";

// ─── Resizable ──────────────────────────────────────────────────────────────
export const ShadcnResizable = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full border border-border rounded-md flex overflow-hidden text-xs font-semibold text-center select-none shadow-sm h-[50px] ${(rest.className as string) || ""}`} {...rest}>
      <div className="w-[50%] bg-accent/30 flex items-center justify-center text-muted-foreground">Panel A</div>
      <div className="w-1.5 bg-border flex items-center justify-center text-[10px] text-muted-foreground cursor-col-resize">⋮</div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Panel B</div>
    </div>
  );
});
ShadcnResizable.displayName = "ShadcnResizable";

// ─── ScrollArea ─────────────────────────────────────────────────────────────
export const ShadcnScrollArea = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  [key: string]: any;
}>(({ children, ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full border border-border bg-background rounded-md p-2 overflow-hidden relative shadow-sm h-[60px] ${(rest.className as string) || ""}`} {...rest}>
      <div className="h-full overflow-y-auto pr-3 scrollbar-thin text-xs text-muted-foreground">
        {children ?? "Scrollable content list..."}
      </div>
    </div>
  );
});
ShadcnScrollArea.displayName = "ShadcnScrollArea";

// ─── AspectRatio ────────────────────────────────────────────────────────────
export const ShadcnAspectRatio = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full aspect-video border border-dashed border-border bg-secondary/50 rounded flex items-center justify-center text-xs text-muted-foreground font-semibold ${(rest.className as string) || ""}`} {...rest}>
      16:9 Aspect Ratio
    </div>
  );
});
ShadcnAspectRatio.displayName = "ShadcnAspectRatio";

// ─── Collapsible ────────────────────────────────────────────────────────────
export const ShadcnCollapsible = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  label?: string;
  [key: string]: any;
}>(({ children, label = "Settings panel", ...rest }, ref) => {
  const [open, setOpen] = useState(true);
  return (
    <div ref={ref} className={`w-full border border-border bg-background rounded-md p-2 text-xs font-semibold shadow-sm ${(rest.className as string) || ""}`} {...rest}>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <span>{open ? "▼" : "▶"}</span>
      </div>
      {open && <div className="mt-2 border-t border-border/40 pt-1.5 text-muted-foreground">{children ?? "Content panel"}</div>}
    </div>
  );
});
ShadcnCollapsible.displayName = "ShadcnCollapsible";

// ─── Accordion ──────────────────────────────────────────────────────────────
export const ShadcnAccordion = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full flex flex-col border border-border bg-background rounded-md p-2.5 text-xs font-semibold divide-y divide-border/40 shadow-sm text-left ${(rest.className as string) || ""}`} {...rest}>
      <div className="py-1 flex justify-between items-center text-primary cursor-pointer">
        <span>Is it responsive?</span>
        <span>▲</span>
      </div>
      <div className="py-1 pb-2 text-muted-foreground leading-normal">
        Yes, all components support responsive layout columns.
      </div>
      <div className="py-2 flex justify-between items-center text-foreground cursor-pointer">
        <span>Can I edit colors?</span>
        <span>▼</span>
      </div>
    </div>
  );
});
ShadcnAccordion.displayName = "ShadcnAccordion";

// ─── Carousel ───────────────────────────────────────────────────────────────
export const ShadcnCarousel = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full border border-border bg-secondary rounded-lg flex items-center justify-between p-3 shadow-sm h-[70px] ${(rest.className as string) || ""}`} {...rest}>
      <button className="w-6 h-6 bg-background border border-border rounded-full text-xs flex items-center justify-center font-bold">◀</button>
      <span className="text-xs font-bold text-muted-foreground">Slide 1 of 3</span>
      <button className="w-6 h-6 bg-background border border-border rounded-full text-xs flex items-center justify-center font-bold">▶</button>
    </div>
  );
});
ShadcnCarousel.displayName = "ShadcnCarousel";

// ─── Row ────────────────────────────────────────────────────────────────────
export const ShadcnRow = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  gap?: string;
  [key: string]: any;
}>(({ children, gap = "16px", ...rest }, ref) => {
  return (
    <div
      ref={ref}
      style={{ gap }}
      className={`grid grid-cols-12 w-full box-border min-h-[40px] ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children}
    </div>
  );
});
ShadcnRow.displayName = "ShadcnRow";

// ─── Col ────────────────────────────────────────────────────────────────────
export const ShadcnCol = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  span?: number;
  [key: string]: any;
}>(({ children, span = 6, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`col-span-${span} min-w-0 ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children}
    </div>
  );
});
ShadcnCol.displayName = "ShadcnCol";

// ─── Container ──────────────────────────────────────────────────────────────
export const ShadcnContainer = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  direction?: "row" | "column";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: string;
  padding?: string;
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  [key: string]: any;
}>(({ children, direction = "column", justify = "start", align = "stretch", gap = "0px", padding = "16px", wrap = "nowrap", ...rest }, ref) => {
  const flexDir = direction === "row" ? "flex-row" : "flex-col";
  const flexJust = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify] || "justify-start";
  const flexAlign = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  }[align] || "items-stretch";
  const flexWrap = wrap === "wrap" ? "flex-wrap" : wrap === "wrap-reverse" ? "flex-wrap-reverse" : "flex-nowrap";

  return (
    <div
      ref={ref}
      style={{ gap, padding }}
      className={`flex ${flexDir} ${flexJust} ${flexAlign} ${flexWrap} w-full box-border min-h-[40px] ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children}
    </div>
  );
});
ShadcnContainer.displayName = "ShadcnContainer";

// ─── Section ────────────────────────────────────────────────────────────────
export const ShadcnSection = forwardRef<HTMLElement, {
  children?: ReactNode;
  padding?: string;
  maxWidth?: string;
  background?: string;
  [key: string]: any;
}>(({ children, padding = "48px 24px", maxWidth = "1200px", background = "transparent", ...rest }, ref) => {
  return (
    <section
      ref={ref}
      style={{ padding, background }}
      className={`w-full flex flex-col box-border min-h-[80px] ${(rest.className as string) || ""}`}
      {...rest}
    >
      <div style={{ maxWidth }} className="w-full mx-auto flex flex-col">
        {children}
      </div>
    </section>
  );
});
ShadcnSection.displayName = "ShadcnSection";

// ─── FlexRow ────────────────────────────────────────────────────────────────
export const ShadcnFlexRow = forwardRef<HTMLDivElement, {
  children?: ReactNode;
  gap?: string;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: "nowrap" | "wrap";
  [key: string]: any;
}>(({ children, gap = "12px", justify = "start", align = "center", wrap = "wrap", ...rest }, ref) => {
  const flexJust = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  }[justify] || "justify-start";
  const flexAlign = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align] || "items-stretch";
  const flexWrap = wrap === "wrap" ? "flex-wrap" : "flex-nowrap";

  return (
    <div
      ref={ref}
      style={{ gap }}
      className={`flex flex-row ${flexJust} ${flexAlign} ${flexWrap} w-full box-border min-h-[32px] ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children}
    </div>
  );
});
ShadcnFlexRow.displayName = "ShadcnFlexRow";

// ─── Spacer ─────────────────────────────────────────────────────────────────
export const ShadcnSpacer = forwardRef<HTMLDivElement, {
  height?: string;
  [key: string]: any;
}>(({ height = "24px", ...rest }, ref) => {
  return (
    <div
      ref={ref}
      style={{ height }}
      className={`w-full shrink-0 ${(rest.className as string) || ""}`}
      {...rest}
    />
  );
});
ShadcnSpacer.displayName = "ShadcnSpacer";

// ─── Avatar ─────────────────────────────────────────────────────────────────
export const ShadcnAvatar = forwardRef<HTMLDivElement, {
  src?: string;
  name?: string;
  [key: string]: any;
}>(({ src, name = "John Doe", ...rest }, ref) => {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div ref={ref} className={`w-9 h-9 rounded-full bg-secondary text-foreground font-semibold flex items-center justify-center text-xs overflow-hidden shrink-0 shadow-sm border border-border ${(rest.className as string) || ""}`} {...rest}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
});
ShadcnAvatar.displayName = "ShadcnAvatar";

// ─── Badge ──────────────────────────────────────────────────────────────────
export const ShadcnBadge = forwardRef<HTMLSpanElement, {
  children?: ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  [key: string]: any;
}>(({ children, variant = "default", ...rest }, ref) => {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input",
  };
  return (
    <span ref={ref} className={`${base} ${variants[variant]} ${(rest.className as string) || ""}`} {...rest}>
      {children ?? "Badge"}
    </span>
  );
});
ShadcnBadge.displayName = "ShadcnBadge";

// ─── Table ──────────────────────────────────────────────────────────────────
export const ShadcnTable = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full border border-border rounded-lg overflow-x-auto bg-background shadow-sm text-left text-xs ${(rest.className as string) || ""}`} {...rest}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary border-b border-border text-foreground font-semibold">
            <th className="p-3 text-left">Invoice</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-muted-foreground">
          <tr>
            <td className="p-3 font-semibold text-foreground">INV-001</td>
            <td className="p-3">Paid</td>
            <td className="p-3 text-right">$250.00</td>
          </tr>
          <tr>
            <td className="p-3 font-semibold text-foreground">INV-002</td>
            <td className="p-3">Pending</td>
            <td className="p-3 text-right">$120.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});
ShadcnTable.displayName = "ShadcnTable";

// ─── Skeleton ───────────────────────────────────────────────────────────────
export const ShadcnSkeleton = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full flex items-center gap-3 ${(rest.className as string) || ""}`} {...rest}>
      <div className="w-9 h-9 rounded-full bg-secondary shrink-0 animate-pulse" />
      <div className="w-full flex flex-col gap-2">
        <div className="h-3 w-[60%] bg-secondary rounded animate-pulse" />
        <div className="h-2 w-[80%] bg-secondary/80 rounded animate-pulse" />
      </div>
    </div>
  );
});
ShadcnSkeleton.displayName = "ShadcnSkeleton";

// ─── Progress ───────────────────────────────────────────────────────────────
export const ShadcnProgress = forwardRef<HTMLDivElement, {
  value?: number;
  [key: string]: any;
}>(({ value = 60, ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full flex flex-col gap-1.5 text-xs text-muted-foreground font-semibold text-left ${(rest.className as string) || ""}`} {...rest}>
      <div className="flex justify-between">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
});
ShadcnProgress.displayName = "ShadcnProgress";

// ─── Code ───────────────────────────────────────────────────────────────────
export const ShadcnCode = forwardRef<HTMLElement, {
  children?: ReactNode;
  [key: string]: any;
}>(({ children, ...rest }, ref) => {
  return (
    <code
      ref={ref}
      className={`px-2 py-1 bg-secondary text-foreground font-mono text-xs rounded border border-border ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "const x = 5;"}
    </code>
  );
});
ShadcnCode.displayName = "ShadcnCode";

// ─── Kbd ────────────────────────────────────────────────────────────────────
export const ShadcnKbd = forwardRef<HTMLSpanElement, {
  children?: ReactNode;
  [key: string]: any;
}>(({ children, ...rest }, ref) => {
  return (
    <kbd
      ref={ref}
      className={`px-1.5 py-0.5 border border-border bg-secondary text-foreground font-semibold rounded text-[10px] shadow-sm select-none ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "Ctrl + P"}
    </kbd>
  );
});
ShadcnKbd.displayName = "ShadcnKbd";

// ─── Text ───────────────────────────────────────────────────────────────────
export const ShadcnText = forwardRef<HTMLParagraphElement, {
  children?: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  [key: string]: any;
}>(({ children, fontSize = "16px", fontWeight = "400", color = "inherit", textAlign = "left", ...rest }, ref) => {
  return (
    <p
      ref={ref}
      style={{ fontSize, fontWeight, color, textAlign }}
      className={`leading-relaxed m-0 ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "Generic text / paragraph element."}
    </p>
  );
});
ShadcnText.displayName = "ShadcnText";

// ─── Heading ────────────────────────────────────────────────────────────────
export const ShadcnHeading = forwardRef<HTMLHeadingElement, {
  children?: ReactNode;
  level?: number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  [key: string]: any;
}>(({ children, level = 2, textAlign = "left", color = "inherit", ...rest }, ref) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const fontSizes = {
    1: "text-3xl font-extrabold tracking-tight",
    2: "text-2xl font-bold tracking-tight",
    3: "text-xl font-semibold tracking-tight",
    4: "text-lg font-semibold",
    5: "text-base font-medium",
    6: "text-sm font-medium",
  }[level] || "text-2xl font-bold";

  return (
    <Tag
      ref={ref as any}
      style={{ color, textAlign }}
      className={`${fontSizes} leading-tight m-0 ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "Heading"}
    </Tag>
  );
});
ShadcnHeading.displayName = "ShadcnHeading";

// ─── Link ───────────────────────────────────────────────────────────────────
export const ShadcnLink = forwardRef<HTMLAnchorElement, {
  children?: ReactNode;
  href?: string;
  target?: "_self" | "_blank";
  color?: string;
  [key: string]: any;
}>(({ children, href = "#", target = "_self", color = "var(--ui-accent)", ...rest }, ref) => {
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      style={{ color }}
      className={`underline underline-offset-4 hover:opacity-85 cursor-pointer ${(rest.className as string) || ""}`}
      {...rest}
    >
      {children ?? "Link text"}
    </a>
  );
});
ShadcnLink.displayName = "ShadcnLink";

// ─── DataTable ──────────────────────────────────────────────────────────────
export const ShadcnDataTable = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full border border-border bg-background rounded-lg p-3.5 flex flex-col gap-3 shadow-sm text-left text-xs ${(rest.className as string) || ""}`} {...rest}>
      <div className="flex justify-between items-center border-b border-border/40 pb-2">
        <div className="border border-input rounded px-3 py-1 text-muted-foreground bg-background">Filter emails...</div>
        <div className="text-muted-foreground border border-input rounded px-2.5 py-1 bg-background cursor-pointer">Columns ▼</div>
      </div>
      <div className="divide-y divide-border/30">
        <div className="grid grid-cols-2 py-2 text-foreground font-semibold">
          <span>jane.doe@example.com</span>
          <span className="text-right text-emerald-500 font-bold">Success</span>
        </div>
        <div className="grid grid-cols-2 py-2 text-foreground font-semibold">
          <span>bob.smith@example.com</span>
          <span className="text-right text-amber-500 font-bold">Pending</span>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-border/40 text-muted-foreground">
        <span>Page 1 of 5</span>
        <div className="flex gap-1.5">
          <button className="border border-border bg-background px-2.5 py-1 rounded hover:bg-accent">Prev</button>
          <button className="border border-border bg-background px-2.5 py-1 rounded hover:bg-accent">Next</button>
        </div>
      </div>
    </div>
  );
});
ShadcnDataTable.displayName = "ShadcnDataTable";

// ─── Chart ──────────────────────────────────────────────────────────────────
export const ShadcnChart = forwardRef<HTMLDivElement, {
  [key: string]: any;
}>(({ ...rest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-[280px] border border-border bg-card rounded-xl p-4 shadow-sm flex flex-col justify-between text-left h-[130px] ${(rest.className as string) || ""}`} {...rest}>
      <div className="flex justify-between items-center text-xs font-bold text-foreground">
        <span>Weekly Visitors</span>
        <span className="text-[10px] text-muted-foreground">Last 7 days</span>
      </div>
      <div className="flex items-end justify-between gap-2.5 h-[65px] pt-2 border-b border-border/20 pb-1">
        <div className="w-full bg-primary/20 rounded-t h-[40%] hover:bg-primary transition-all cursor-pointer" title="Monday: 120" />
        <div className="w-full bg-primary/30 rounded-t h-[60%] hover:bg-primary transition-all cursor-pointer" title="Tuesday: 180" />
        <div className="w-full bg-primary rounded-t h-[90%] hover:bg-primary transition-all cursor-pointer" title="Wednesday: 270" />
        <div className="w-full bg-primary/45 rounded-t h-[70%] hover:bg-primary transition-all cursor-pointer" title="Thursday: 210" />
        <div className="w-full bg-primary/35 rounded-t h-[50%] hover:bg-primary transition-all cursor-pointer" title="Friday: 150" />
        <div className="w-full bg-primary/55 rounded-t h-[75%] hover:bg-primary transition-all cursor-pointer" title="Saturday: 230" />
        <div className="w-full bg-primary/80 rounded-t h-[95%] hover:bg-primary transition-all cursor-pointer" title="Sunday: 290" />
      </div>
    </div>
  );
});
ShadcnChart.displayName = "ShadcnChart";


// ─── CANVAS REGISTRATION METADATA ───────────────────────────────────────────

const colorOptions = [
  { label: "Default", name: "default" },
  { label: "Primary", name: "primary" },
  { label: "Secondary", name: "secondary" },
  { label: "Destructive", name: "destructive" },
  { label: "Ghost", name: "ghost" },
  { label: "Link", name: "link" },
];

const sizeOptions = [
  { label: "Default", name: "default" },
  { label: "Small", name: "sm" },
  { label: "Large", name: "lg" },
  { label: "Icon", name: "icon" },
];

export const shadcnComponents: Record<string, unknown> = {
  ShadcnButton,
  ShadcnInput,
  ShadcnTextarea,
  ShadcnCheckbox,
  ShadcnSwitch,
  ShadcnRadioGroup,
  ShadcnSelect,
  ShadcnCombobox,
  ShadcnCalendar,
  ShadcnDatePicker,
  ShadcnInputOTP,
  ShadcnLabel,
  ShadcnSlider,
  ShadcnToggle,
  ShadcnToggleGroup,
  ShadcnTabs,
  ShadcnBreadcrumb,
  ShadcnPagination,
  ShadcnNavigationMenu,
  ShadcnMenubar,
  ShadcnContextMenu,
  ShadcnDropdownMenu,
  ShadcnSidebar,
  ShadcnCommand,
  ShadcnDialog,
  ShadcnAlertDialog,
  ShadcnPopover,
  ShadcnTooltip,
  ShadcnHoverCard,
  ShadcnDrawer,
  ShadcnSheet,
  ShadcnSonner,
  ShadcnToast,
  ShadcnCard,
  ShadcnSeparator,
  ShadcnResizable,
  ShadcnScrollArea,
  ShadcnAspectRatio,
  ShadcnCollapsible,
  ShadcnAccordion,
  ShadcnCarousel,
  ShadcnRow,
  ShadcnCol,
  ShadcnContainer,
  ShadcnSection,
  ShadcnFlexRow,
  ShadcnSpacer,
  ShadcnAvatar,
  ShadcnBadge,
  ShadcnTable,
  ShadcnSkeleton,
  ShadcnProgress,
  ShadcnCode,
  ShadcnKbd,
  ShadcnText,
  ShadcnHeading,
  ShadcnLink,
  ShadcnDataTable,
  ShadcnChart,
};

type MetaLike = import("@webstudio-is/sdk").WsComponentMeta & { category: string; icon: string };

export const shadcnMetas: Record<string, unknown> = {
  ShadcnButton: {
    type: "container",
    label: "Button",
    category: "shadcn",
    icon: "🔘",
    description: "shadcn/ui action button.",
    props: {
      variant: { type: "enum", control: "select", label: "Variant", defaultValue: "default", options: colorOptions },
      size: { type: "enum", control: "select", label: "Size", defaultValue: "default", options: sizeOptions },
      isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
    },
  },
  ShadcnInput: {
    type: "container",
    label: "Input",
    category: "shadcn",
    icon: "📝",
    props: {
      placeholder: { type: "string", label: "Placeholder", defaultValue: "Search..." },
      type: { type: "string", label: "Type", defaultValue: "text" },
      isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
    },
  },
  ShadcnTextarea: {
    type: "container",
    label: "Textarea",
    category: "shadcn",
    icon: "📑",
    props: {
      placeholder: { type: "string", label: "Placeholder", defaultValue: "Type message..." },
      isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
    },
  },
  ShadcnCheckbox: {
    type: "container",
    label: "Checkbox",
    category: "shadcn",
    icon: "☑️",
    props: {
      isChecked: { type: "boolean", label: "Checked", defaultValue: true },
      isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
    },
  },
  ShadcnSwitch: {
    type: "container",
    label: "Switch",
    category: "shadcn",
    icon: "🔀",
    props: {
      isChecked: { type: "boolean", label: "Checked", defaultValue: true },
      isDisabled: { type: "boolean", label: "Disabled", defaultValue: false },
    },
  },
  ShadcnRadioGroup: {
    type: "container",
    label: "RadioGroup",
    category: "shadcn",
    icon: "🔘",
    props: {
      label: { type: "string", label: "Label", defaultValue: "Select option" },
      defaultValue: { type: "string", label: "Default Value", defaultValue: "a" },
    },
  },
  ShadcnSelect: {
    type: "container",
    label: "Select",
    category: "shadcn",
    icon: "🔽",
    props: {
      placeholder: { type: "string", label: "Placeholder", defaultValue: "Select option" },
      defaultValue: { type: "string", label: "Value", defaultValue: "Active" },
    },
  },
  ShadcnCombobox: {
    type: "container",
    label: "Combobox",
    category: "shadcn",
    icon: "🔍",
    props: {
      placeholder: { type: "string", label: "Placeholder", defaultValue: "Select item..." },
    },
  },
  ShadcnCalendar: {
    type: "container",
    label: "Calendar",
    category: "shadcn",
    icon: "📅",
    props: {},
  },
  ShadcnDatePicker: {
    type: "container",
    label: "DatePicker",
    category: "shadcn",
    icon: "📆",
    props: {
      placeholder: { type: "string", label: "Placeholder", defaultValue: "Pick a date" },
    },
  },
  ShadcnInputOTP: {
    type: "container",
    label: "InputOTP",
    category: "shadcn",
    icon: "🔢",
    props: {},
  },
  ShadcnLabel: {
    type: "container",
    label: "Label",
    category: "shadcn",
    icon: "🏷️",
    props: {},
  },
  ShadcnSlider: {
    type: "container",
    label: "Slider",
    category: "shadcn",
    icon: "🎚️",
    props: {
      defaultValue: { type: "number", label: "Value (%)", defaultValue: 50 },
    },
  },
  ShadcnToggle: {
    type: "container",
    label: "Toggle",
    category: "shadcn",
    icon: "⭐",
    props: {
      isPressed: { type: "boolean", label: "Pressed", defaultValue: false },
    },
  },
  ShadcnToggleGroup: {
    type: "container",
    label: "ToggleGroup",
    category: "shadcn",
    icon: "🗂️",
    props: {},
  },
  ShadcnTabs: {
    type: "container",
    label: "Tabs",
    category: "shadcn",
    icon: "📑",
    props: {},
  },
  ShadcnBreadcrumb: {
    type: "container",
    label: "Breadcrumb",
    category: "shadcn",
    icon: "🥖",
    props: {},
  },
  ShadcnPagination: {
    type: "container",
    label: "Pagination",
    category: "shadcn",
    icon: "🔢",
    props: {},
  },
  ShadcnNavigationMenu: {
    type: "container",
    label: "NavigationMenu",
    category: "shadcn",
    icon: "🗺️",
    props: {},
  },
  ShadcnMenubar: {
    type: "container",
    label: "Menubar",
    category: "shadcn",
    icon: "💻",
    props: {},
  },
  ShadcnContextMenu: {
    type: "container",
    label: "ContextMenu",
    category: "shadcn",
    icon: "🖱️",
    props: {},
  },
  ShadcnDropdownMenu: {
    type: "container",
    label: "DropdownMenu",
    category: "shadcn",
    icon: "⬇️",
    props: {},
  },
  ShadcnSidebar: {
    type: "container",
    label: "Sidebar",
    category: "shadcn",
    icon: "🗄️",
    props: {},
  },
  ShadcnCommand: {
    type: "container",
    label: "Command",
    category: "shadcn",
    icon: "⌨️",
    props: {},
  },
  ShadcnDialog: {
    type: "container",
    label: "Dialog",
    category: "shadcn",
    icon: "💬",
    props: {},
  },
  ShadcnAlertDialog: {
    type: "container",
    label: "AlertDialog",
    category: "shadcn",
    icon: "⚠️",
    props: {},
  },
  ShadcnPopover: {
    type: "container",
    label: "Popover",
    category: "shadcn",
    icon: "🎈",
    props: {},
  },
  ShadcnTooltip: {
    type: "container",
    label: "Tooltip",
    category: "shadcn",
    icon: "ℹ️",
    props: {},
  },
  ShadcnHoverCard: {
    type: "container",
    label: "HoverCard",
    category: "shadcn",
    icon: "📇",
    props: {},
  },
  ShadcnDrawer: {
    type: "container",
    label: "Drawer",
    category: "shadcn",
    icon: "🗃️",
    props: {},
  },
  ShadcnSheet: {
    type: "container",
    label: "Sheet",
    category: "shadcn",
    icon: "📄",
    props: {},
  },
  ShadcnSonner: {
    type: "container",
    label: "Sonner",
    category: "shadcn",
    icon: "🔔",
    props: {},
  },
  ShadcnToast: {
    type: "container",
    label: "Toast",
    category: "shadcn",
    icon: "🍞",
    props: {},
  },
  ShadcnCard: {
    type: "container",
    label: "Card",
    category: "shadcn",
    icon: "🎴",
    props: {},
  },
  ShadcnSeparator: {
    type: "rich-text-child",
    label: "Separator",
    category: "shadcn",
    icon: "➖",
    props: {
      orientation: { type: "enum", control: "select", label: "Orientation", defaultValue: "horizontal", options: [{ label: "Horizontal", name: "horizontal" }, { label: "Vertical", name: "vertical" }] },
    },
  },
  ShadcnResizable: {
    type: "container",
    label: "Resizable",
    category: "shadcn",
    icon: "↕️",
    props: {},
  },
  ShadcnScrollArea: {
    type: "container",
    label: "ScrollArea",
    category: "shadcn",
    icon: "📜",
    props: {},
  },
  ShadcnAspectRatio: {
    type: "container",
    label: "AspectRatio",
    category: "shadcn",
    icon: "🖼️",
    props: {},
  },
  ShadcnCollapsible: {
    type: "container",
    label: "Collapsible",
    category: "shadcn",
    icon: "🗂️",
    props: {
      label: { type: "string", label: "Label", defaultValue: "Settings panel" },
    },
  },
  ShadcnAccordion: {
    type: "container",
    label: "Accordion",
    category: "shadcn",
    icon: "🪗",
    props: {},
  },
  ShadcnCarousel: {
    type: "container",
    label: "Carousel",
    category: "shadcn",
    icon: "🎠",
    props: {},
  },
  ShadcnRow: {
    type: "container",
    label: "Row (Grid)",
    category: "Layout",
    icon: "⊞",
    props: {
      gap: { type: "string", label: "Gap", defaultValue: "16px" },
    },
  },
  ShadcnCol: {
    type: "container",
    label: "Column",
    category: "Layout",
    icon: "▯",
    props: {
      span: { type: "number", label: "Column Span (1-12)", defaultValue: 6 },
    },
  },
  ShadcnContainer: {
    type: "container",
    label: "Container",
    category: "Layout",
    icon: "📦",
    props: {
      direction: { type: "enum", control: "select", label: "Direction", defaultValue: "column", options: [{ label: "Row", name: "row" }, { label: "Column", name: "column" }] },
      justify: { type: "enum", control: "select", label: "Justify", defaultValue: "start", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Between", name: "between" }, { label: "Around", name: "around" }, { label: "Evenly", name: "evenly" }] },
      align: { type: "enum", control: "select", label: "Align", defaultValue: "stretch", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Stretch", name: "stretch" }, { label: "Baseline", name: "baseline" }] },
      gap: { type: "string", label: "Gap", defaultValue: "0px" },
      padding: { type: "string", label: "Padding", defaultValue: "16px" },
      wrap: { type: "enum", control: "select", label: "Wrap", defaultValue: "nowrap", options: [{ label: "No Wrap", name: "nowrap" }, { label: "Wrap", name: "wrap" }, { label: "Wrap Reverse", name: "wrap-reverse" }] },
    },
  },
  ShadcnSection: {
    type: "container",
    label: "Section",
    category: "Layout",
    icon: "📐",
    props: {
      padding: { type: "string", label: "Padding", defaultValue: "48px 24px" },
      maxWidth: { type: "string", label: "Max Width", defaultValue: "1200px" },
      background: { type: "string", label: "Background", defaultValue: "transparent" },
    },
  },
  ShadcnFlexRow: {
    type: "container",
    label: "Flex Row",
    category: "Layout",
    icon: "↔️",
    props: {
      gap: { type: "string", label: "Gap", defaultValue: "12px" },
      justify: { type: "enum", control: "select", label: "Justify", defaultValue: "start", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Between", name: "between" }, { label: "Around", name: "around" }] },
      align: { type: "enum", control: "select", label: "Align", defaultValue: "center", options: [{ label: "Start", name: "start" }, { label: "Center", name: "center" }, { label: "End", name: "end" }, { label: "Stretch", name: "stretch" }] },
      wrap: { type: "enum", control: "select", label: "Wrap", defaultValue: "wrap", options: [{ label: "No Wrap", name: "nowrap" }, { label: "Wrap", name: "wrap" }] },
    },
  },
  ShadcnSpacer: {
    type: "rich-text-child",
    label: "Spacer",
    category: "Layout",
    icon: "↕️",
    props: {
      height: { type: "string", label: "Height", defaultValue: "24px" },
    },
  },
  ShadcnAvatar: {
    type: "container",
    label: "Avatar",
    category: "Display",
    icon: "👤",
    props: {
      src: { type: "string", label: "Avatar URL", defaultValue: "" },
      name: { type: "string", label: "User Name", defaultValue: "John Doe" },
    },
  },
  ShadcnBadge: {
    type: "container",
    label: "Badge",
    category: "Display",
    icon: "🏷️",
    props: {
      variant: { type: "enum", control: "select", label: "Variant", defaultValue: "default", options: [{ label: "Default", name: "default" }, { label: "Secondary", name: "secondary" }, { label: "Destructive", name: "destructive" }, { label: "Outline", name: "outline" }] },
    },
  },
  ShadcnTable: {
    type: "container",
    label: "Table",
    category: "Display",
    icon: "📊",
    props: {},
  },
  ShadcnSkeleton: {
    type: "container",
    label: "Skeleton",
    category: "Display",
    icon: "💀",
    props: {},
  },
  ShadcnProgress: {
    type: "container",
    label: "Progress",
    category: "Display",
    icon: "📈",
    props: {
      value: { type: "number", label: "Value (%)", defaultValue: 60 },
    },
  },
  ShadcnCode: {
    type: "container",
    label: "Code",
    category: "Typography",
    icon: "💻",
    props: {},
  },
  ShadcnKbd: {
    type: "container",
    label: "Kbd",
    category: "Typography",
    icon: "⌨️",
    props: {},
  },
  ShadcnText: {
    type: "rich-text-child",
    label: "Text",
    category: "Typography",
    icon: "📄",
    props: {
      fontSize: { type: "string", label: "Font Size", defaultValue: "16px" },
      fontWeight: { type: "string", label: "Font Weight", defaultValue: "400" },
      color: { type: "string", label: "Color", defaultValue: "inherit" },
      textAlign: { type: "enum", control: "select", label: "Text Align", defaultValue: "left", options: [{ label: "Left", name: "left" }, { label: "Center", name: "center" }, { label: "Right", name: "right" }, { label: "Justify", name: "justify" }] },
    },
  },
  ShadcnHeading: {
    type: "rich-text-child",
    label: "Heading",
    category: "Typography",
    icon: "🔤",
    props: {
      level: { type: "number", label: "Level (1-6)", defaultValue: 2 },
      textAlign: { type: "enum", control: "select", label: "Text Align", defaultValue: "left", options: [{ label: "Left", name: "left" }, { label: "Center", name: "center" }, { label: "Right", name: "right" }] },
      color: { type: "string", label: "Color", defaultValue: "inherit" },
    },
  },
  ShadcnLink: {
    type: "rich-text-child",
    label: "Link",
    category: "Typography",
    icon: "🔗",
    props: {
      href: { type: "string", label: "URL", defaultValue: "#" },
      target: { type: "enum", control: "select", label: "Target", defaultValue: "_self", options: [{ label: "Same Tab", name: "_self" }, { label: "New Tab", name: "_blank" }] },
      color: { type: "string", label: "Color", defaultValue: "var(--ui-accent)" },
    },
  },
  ShadcnDataTable: {
    type: "container",
    label: "DataTable",
    category: "Advanced",
    icon: "🗃️",
    props: {},
  },
  ShadcnChart: {
    type: "container",
    label: "Chart",
    category: "Advanced",
    icon: "📈",
    props: {},
  },
};
