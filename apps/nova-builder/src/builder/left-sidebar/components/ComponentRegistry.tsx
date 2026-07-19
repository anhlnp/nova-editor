import React from "react";

// Standard categories following shadcn documentation groups
export type ComponentCategory =
  | "Inputs"
  | "Navigation"
  | "Overlay"
  | "Layout"
  | "Display"
  | "Typography"
  | "Feedback"
  | "Advanced";

export interface ComponentDefinition {
  id: string; // matches canvas name, e.g. "shadcn:Button"
  displayName: string;
  category: ComponentCategory;
  description: string;
  keywords: string[];
  preview(): React.ReactNode;
  createInstance(id: string): {
    instance: {
      type: "instance";
      id: string;
      component: string;
      label: string;
      children: Array<{ type: "id" | "text" | "expression"; value: string }>;
    };
    childInstances?: Array<{
      type: "instance";
      id: string;
      component: string;
      label: string;
      children: Array<{ type: "id" | "text" | "expression"; value: string }>;
    }>;
    props?: Record<string, {
      id: string;
      instanceId: string;
      name: string;
      type: "string" | "number" | "boolean" | "enum";
      value: any;
    }>;
  };
  defaultProps?: Record<string, any>;
  tags?: string[];
}

const componentRegistry: ComponentDefinition[] = [];

export function registerComponent(entry: ComponentDefinition) {
  const index = componentRegistry.findIndex((e) => e.id === entry.id);
  if (index !== -1) {
    componentRegistry[index] = entry;
  } else {
    componentRegistry.push(entry);
  }
}

export function getRegistry(): ComponentDefinition[] {
  return [...componentRegistry];
}

// Helper to create simple default instances
const defaultBuilder = (id: string, component: string, label: string, children: string[] = []) => ({
  instance: {
    type: "instance" as const,
    id,
    component,
    label,
    children: children.map((c) => ({ type: "text" as const, value: c })),
  },
});

// Helper for unique sub-ids
const makeSubId = (id: string, suffix: string) => `${id}-${suffix}`;

// ── INPUTS ──────────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:Button",
  displayName: "Button",
  category: "Inputs",
  keywords: ["button", "save", "click", "trigger", "action", "primary"],
  description: "Primary action button.",
  preview: () => (
    <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow hover:bg-primary/95 transition-all">
      Save
    </button>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Button", "Button", ["Save"]),
});

registerComponent({
  id: "shadcn:Input",
  displayName: "Input",
  category: "Inputs",
  keywords: ["input", "text", "field", "search", "write", "collect"],
  description: "Text input field.",
  preview: () => (
    <div className="w-[180px] flex items-center border border-border bg-background rounded-md px-3 py-1.5 shadow-sm">
      <span className="text-[10px] text-muted-foreground mr-1.5 select-none">🔍</span>
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/70"
        readOnly
      />
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Input", "Input"),
});

registerComponent({
  id: "shadcn:Textarea",
  displayName: "Textarea",
  category: "Inputs",
  keywords: ["textarea", "input", "multiline", "long text", "comment", "field"],
  description: "Multi-line text input field.",
  preview: () => (
    <div className="w-[180px] border border-border bg-background rounded-md px-3 py-1.5 shadow-sm">
      <textarea
        placeholder="Type your message..."
        className="w-full h-10 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/70 resize-none"
        readOnly
      />
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Textarea", "Textarea"),
});

registerComponent({
  id: "shadcn:Checkbox",
  displayName: "Checkbox",
  category: "Inputs",
  keywords: ["checkbox", "check", "toggle", "accept", "terms", "tick"],
  description: "Accept conditions or select items.",
  preview: () => (
    <div className="flex items-center gap-2">
      <div className="w-3.5 h-3.5 rounded border border-primary bg-primary text-primary-foreground flex items-center justify-center text-[8px] font-bold">
        ✓
      </div>
      <span className="text-xs text-foreground font-medium">Accept terms</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Checkbox", "Checkbox", ["Accept terms"]),
});

registerComponent({
  id: "shadcn:Switch",
  displayName: "Switch",
  category: "Inputs",
  keywords: ["switch", "toggle", "on", "off", "active"],
  description: "Toggle switch slider.",
  preview: () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-4 rounded-full bg-primary relative p-0.5 transition-colors cursor-pointer">
        <div className="w-3 h-3 rounded-full bg-background absolute right-0.5 top-0.5 shadow-sm" />
      </div>
      <span className="text-xs text-foreground font-medium">Toggle</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Switch", "Switch", ["Toggle switch"]),
});

registerComponent({
  id: "shadcn:RadioGroup",
  displayName: "Radio Group",
  category: "Inputs",
  keywords: ["radio", "group", "select", "options", "choose"],
  description: "Single option selector list.",
  preview: () => (
    <div className="flex flex-col gap-1.5 text-xs text-foreground">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border border-primary flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <span>Option A</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border border-border" />
        <span>Option B</span>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:RadioGroup", "RadioGroup"),
});

registerComponent({
  id: "shadcn:Select",
  displayName: "Select",
  category: "Inputs",
  keywords: ["select", "dropdown", "picker", "choose", "menu", "option"],
  description: "Trigger dropdown select option.",
  preview: () => (
    <div className="w-[185px] border border-border bg-background px-3 py-1.5 rounded-md flex justify-between items-center text-xs text-foreground shadow-sm">
      <span>Select theme</span>
      <span className="text-[8px] text-muted-foreground">▼</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Select", "Select"),
});

registerComponent({
  id: "shadcn:Combobox",
  displayName: "Combobox",
  category: "Inputs",
  keywords: ["combobox", "autocomplete", "search", "select", "dropdown"],
  description: "Searchable dropdown autocomplete box.",
  preview: () => (
    <div className="w-[185px] border border-border bg-background px-3 py-1.5 rounded-md flex justify-between items-center text-xs text-foreground shadow-sm">
      <span className="text-muted-foreground/80">Select language...</span>
      <span className="text-[9px] text-muted-foreground">↕</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Combobox", "Combobox"),
});

registerComponent({
  id: "shadcn:Calendar",
  displayName: "Calendar",
  category: "Inputs",
  keywords: ["calendar", "date", "month", "picker", "schedule"],
  description: "Month date selector view.",
  preview: () => (
    <div className="border border-border p-2 bg-background rounded-md text-[8px] w-[140px] text-foreground shadow-sm">
      <div className="flex justify-between items-center mb-1 font-semibold border-b border-border pb-1">
        <span>◀</span>
        <span>October 2026</span>
        <span>▶</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-muted-foreground font-medium mb-1">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1;
          const isSelected = day === 15;
          return (
            <span
              key={day}
              className={`p-0.5 rounded-sm ${
                isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Calendar", "Calendar"),
});

registerComponent({
  id: "shadcn:DatePicker",
  displayName: "Date Picker",
  category: "Inputs",
  keywords: ["date", "picker", "calendar", "time", "input"],
  description: "Trigger calendar selection input.",
  preview: () => (
    <div className="w-[185px] border border-border bg-background px-3 py-1.5 rounded-md flex justify-between items-center text-xs text-foreground shadow-sm">
      <div className="flex items-center gap-1.5">
        <span>📅</span>
        <span className="text-muted-foreground/80">Pick a date</span>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:DatePicker", "DatePicker"),
});

registerComponent({
  id: "shadcn:InputOTP",
  displayName: "Input OTP",
  category: "Inputs",
  keywords: ["otp", "pin", "code", "digits", "verification", "input"],
  description: "One-Time Password grid inputs.",
  preview: () => (
    <div className="flex gap-1">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`w-6 h-8 border rounded-md bg-background flex items-center justify-center text-xs font-bold text-foreground ${
            i === 2 ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          {i < 2 ? "9" : i === 2 ? "│" : ""}
        </div>
      ))}
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:InputOTP", "InputOTP"),
});

registerComponent({
  id: "shadcn:Label",
  displayName: "Label",
  category: "Inputs",
  keywords: ["label", "text", "form", "title", "caption"],
  description: "Styled label element.",
  preview: () => <span className="text-xs font-semibold text-foreground tracking-wide">Username</span>,
  createInstance: (id) => defaultBuilder(id, "shadcn:Label", "Label", ["Username"]),
});

registerComponent({
  id: "shadcn:Slider",
  displayName: "Slider",
  category: "Inputs",
  keywords: ["slider", "range", "volume", "track", "control"],
  description: "Adjust value on track axis.",
  preview: () => (
    <div className="w-[180px] h-4 flex items-center relative select-none">
      <div className="w-full h-1 bg-secondary rounded-full">
        <div className="w-[70%] h-full bg-primary rounded-full relative">
          <div className="w-3 h-3 rounded-full bg-background border border-primary absolute right-0 -top-1 shadow-sm" />
        </div>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Slider", "Slider"),
});

registerComponent({
  id: "shadcn:Toggle",
  displayName: "Toggle",
  category: "Inputs",
  keywords: ["toggle", "button", "press", "active", "switch"],
  description: "Two-state action toggle button.",
  preview: () => (
    <button className="p-2 border border-border bg-accent text-accent-foreground rounded-md text-xs font-semibold shadow-sm">
      ⭐ Star
    </button>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Toggle", "Toggle", ["⭐ Star"]),
});

registerComponent({
  id: "shadcn:ToggleGroup",
  displayName: "Toggle Group",
  category: "Inputs",
  keywords: ["toggle", "group", "row", "buttons", "actions"],
  description: "Row of action toggle buttons.",
  preview: () => (
    <div className="flex border border-border rounded-md overflow-hidden bg-background divide-x divide-border shadow-sm">
      <button className="px-3 py-1.5 text-xs font-bold bg-accent text-accent-foreground">B</button>
      <button className="px-3 py-1.5 text-xs italic text-foreground hover:bg-accent/40">I</button>
      <button className="px-3 py-1.5 text-xs underline text-foreground hover:bg-accent/40">U</button>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:ToggleGroup", "ToggleGroup"),
});

// ── NAVIGATION ──────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:Tabs",
  displayName: "Tabs",
  category: "Navigation",
  keywords: ["tabs", "navigation", "pills", "switch", "panels"],
  description: "Split content tabs menu switcher.",
  preview: () => (
    <div className="flex p-0.5 bg-secondary rounded-lg border border-border text-[10px] shadow-sm">
      <div className="px-3 py-1 bg-background text-foreground font-semibold rounded-md shadow-sm">Account</div>
      <div className="px-3 py-1 text-muted-foreground">Password</div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Tabs", "Tabs"),
});

registerComponent({
  id: "shadcn:Breadcrumb",
  displayName: "Breadcrumb",
  category: "Navigation",
  keywords: ["breadcrumb", "crumbs", "navigation", "path", "trail"],
  description: "Page hierarchy nav indicator.",
  preview: () => (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
      <span className="hover:text-foreground">Home</span>
      <span>/</span>
      <span className="hover:text-foreground">Settings</span>
      <span>/</span>
      <span className="text-foreground font-semibold">History</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Breadcrumb", "Breadcrumb"),
});

registerComponent({
  id: "shadcn:Pagination",
  displayName: "Pagination",
  category: "Navigation",
  keywords: ["pagination", "pager", "pages", "numbers", "nav"],
  description: "Sequential list pagination navigator.",
  preview: () => (
    <div className="flex items-center gap-1 text-[9px] font-semibold">
      <button className="px-2 py-1 border border-border bg-background rounded-md text-muted-foreground hover:bg-accent">
        ◀
      </button>
      <button className="w-5 h-5 bg-primary text-primary-foreground rounded-md flex items-center justify-center shadow-sm">
        1
      </button>
      <button className="w-5 h-5 border border-border bg-background text-foreground rounded-md flex items-center justify-center hover:bg-accent">
        2
      </button>
      <button className="px-2 py-1 border border-border bg-background rounded-md text-muted-foreground hover:bg-accent">
        ▶
      </button>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Pagination", "Pagination"),
});

registerComponent({
  id: "shadcn:NavigationMenu",
  displayName: "Navigation Menu",
  category: "Navigation",
  keywords: ["navigation", "navbar", "menu", "header", "links"],
  description: "Horizontal drop-down menu items.",
  preview: () => (
    <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
      <span className="text-foreground border-b-2 border-primary pb-0.5">Features</span>
      <span className="hover:text-foreground">Pricing</span>
      <span className="hover:text-foreground">Docs</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:NavigationMenu", "NavigationMenu"),
});

registerComponent({
  id: "shadcn:Menubar",
  displayName: "Menubar",
  category: "Navigation",
  keywords: ["menubar", "menu", "file", "actions", "list"],
  description: "Horizontal desktop application menubar.",
  preview: () => (
    <div className="w-[185px] flex gap-3 border border-border bg-background px-3 py-1 rounded-md text-[10px] font-semibold text-foreground shadow-sm">
      <span className="bg-accent px-1.5 py-0.5 rounded">File</span>
      <span className="hover:bg-accent px-1.5 py-0.5 rounded text-muted-foreground">Edit</span>
      <span className="hover:bg-accent px-1.5 py-0.5 rounded text-muted-foreground">View</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Menubar", "Menubar"),
});

registerComponent({
  id: "shadcn:ContextMenu",
  displayName: "Context Menu",
  category: "Navigation",
  keywords: ["context", "menu", "right click", "popup", "action"],
  description: "Action overlay triggered on right click.",
  preview: () => (
    <div className="w-[160px] h-[50px] border border-dashed border-border bg-background rounded-md flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
      Right click here
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:ContextMenu", "ContextMenu"),
});

registerComponent({
  id: "shadcn:DropdownMenu",
  displayName: "Dropdown Menu",
  category: "Navigation",
  keywords: ["dropdown", "menu", "trigger", "options", "select"],
  description: "Action dropdown options menu list.",
  preview: () => (
    <div className="flex flex-col gap-1 w-[130px] border border-border bg-popover text-popover-foreground rounded-md p-1 shadow-md text-[10px] font-semibold">
      <div className="px-2 py-1 hover:bg-accent rounded">Profile Settings</div>
      <div className="px-2 py-1 hover:bg-accent rounded">Billing Info</div>
      <div className="border-t border-border/60 my-0.5" />
      <div className="px-2 py-1 hover:bg-destructive hover:text-destructive-foreground rounded">Logout</div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:DropdownMenu", "DropdownMenu"),
});

registerComponent({
  id: "shadcn:Sidebar",
  displayName: "Sidebar",
  category: "Navigation",
  keywords: ["sidebar", "navigation", "layout", "menu", "dashboard"],
  description: "Collapsible vertical navigation sidebar.",
  preview: () => (
    <div className="w-[185px] border border-border bg-card rounded-md flex flex-col p-2 text-[9px] font-semibold text-muted-foreground shadow-sm h-[90px]">
      <div className="flex items-center gap-1.5 text-foreground mb-3 pb-1 border-b border-border/40">
        <span>⚡</span>
        <span className="font-bold">Nova Builder</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-accent text-accent-foreground px-2 py-1 rounded">
          <span>📁</span>
          <span>Projects</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-accent/40 rounded">
          <span>⚙️</span>
          <span>Settings</span>
        </div>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Sidebar", "Sidebar"),
});

registerComponent({
  id: "shadcn:Command",
  displayName: "Command",
  category: "Navigation",
  keywords: ["command", "search", "palette", "k", "trigger"],
  description: "Search filter action command box.",
  preview: () => (
    <div className="w-[185px] border border-border bg-popover rounded-md flex flex-col p-1.5 text-[9px] shadow-md h-[95px]">
      <input
        type="text"
        placeholder="Type a command..."
        className="w-full border-b border-border bg-transparent outline-none pb-1.5 mb-1.5 text-[10px] text-foreground placeholder:text-muted-foreground"
        readOnly
      />
      <div className="flex flex-col gap-1 font-semibold text-foreground">
        <div className="px-2 py-1 bg-accent rounded flex justify-between items-center">
          <span>Search Files</span>
          <span className="text-[7px] text-muted-foreground">⌘P</span>
        </div>
        <div className="px-2 py-1 hover:bg-accent/40 rounded flex justify-between items-center">
          <span>Open Settings</span>
          <span className="text-[7px] text-muted-foreground">⌘,</span>
        </div>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Command", "Command"),
});

// ── OVERLAY ─────────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:Dialog",
  displayName: "Dialog",
  category: "Overlay",
  keywords: ["dialog", "modal", "popup", "box", "overlay"],
  description: "Context dialog action popup card.",
  preview: () => (
    <div className="w-[185px] border border-border bg-popover text-popover-foreground rounded-lg p-3 shadow-lg text-left">
      <span className="text-[11px] font-bold block mb-1">Edit Profile</span>
      <span className="text-[9px] text-muted-foreground block mb-2 leading-tight">
        {"Make changes here. Click save when you're done."}
      </span>
      <div className="flex justify-end gap-1.5 mt-2">
        <button className="px-2.5 py-1.5 border border-border rounded text-[9px] font-semibold hover:bg-accent">
          Cancel
        </button>
        <button className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded text-[9px] font-semibold">
          Save
        </button>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Dialog", "Dialog"),
});

registerComponent({
  id: "shadcn:AlertDialog",
  displayName: "Alert Dialog",
  category: "Overlay",
  keywords: ["alert", "dialog", "modal", "danger", "warning", "confirm"],
  description: "Danger action warning confirm modal.",
  preview: () => (
    <div className="w-[185px] border border-destructive/30 bg-popover text-popover-foreground rounded-lg p-3 shadow-lg text-left">
      <span className="text-[11px] font-bold block mb-1">Are you sure?</span>
      <span className="text-[9px] text-muted-foreground block mb-2 leading-tight">
        This action cannot be undone. Files will be deleted.
      </span>
      <div className="flex justify-end gap-1.5 mt-2">
        <button className="px-2.5 py-1.5 border border-border rounded text-[9px] font-semibold hover:bg-accent">
          Cancel
        </button>
        <button className="px-2.5 py-1.5 bg-destructive text-destructive-foreground rounded text-[9px] font-semibold">
          Delete
        </button>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:AlertDialog", "AlertDialog"),
});

registerComponent({
  id: "shadcn:Popover",
  displayName: "Popover",
  category: "Overlay",
  keywords: ["popover", "card", "floating", "click", "hint"],
  description: "Trigger floating content panel.",
  preview: () => (
    <div className="w-[145px] border border-border bg-popover text-popover-foreground rounded-md p-2 shadow-md text-left text-[9px] leading-relaxed">
      <span className="font-bold block mb-0.5 text-[10px]">Dimensions</span>
      <span className="text-muted-foreground">Adjust width & height sizes.</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Popover", "Popover"),
});

registerComponent({
  id: "shadcn:Tooltip",
  displayName: "Tooltip",
  category: "Overlay",
  keywords: ["tooltip", "hover", "info", "caption", "hint"],
  description: "Hover information hint box.",
  preview: () => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="bg-foreground text-background px-2.5 py-1 rounded text-[9px] font-bold shadow">
        Add to library
      </div>
      <button className="px-3 py-1 border border-border text-[9px] font-semibold rounded hover:bg-accent">
        Hover me
      </button>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Tooltip", "Tooltip"),
});

registerComponent({
  id: "shadcn:HoverCard",
  displayName: "Hover Card",
  category: "Overlay",
  keywords: ["hover", "card", "profile", "link", "info"],
  description: "Hover information overlay card.",
  preview: () => (
    <div className="w-[185px] border border-border bg-popover text-popover-foreground rounded-lg p-2.5 shadow-md flex gap-2.5 text-left text-[9px] leading-snug">
      <div className="w-7 h-7 rounded-full bg-secondary shrink-0 font-bold flex items-center justify-center text-[10px]">
        N
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-foreground">@nextjs</span>
        <span className="text-muted-foreground">React framework built for the web.</span>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:HoverCard", "HoverCard"),
});

registerComponent({
  id: "shadcn:Drawer",
  displayName: "Drawer",
  category: "Overlay",
  keywords: ["drawer", "slide", "sheet", "panel", "bottom"],
  description: "Slide-up bottom overlay panel.",
  preview: () => (
    <div className="w-[185px] h-[70px] border border-border bg-popover rounded-t-xl shadow-lg flex flex-col justify-end p-2 border-b-0 mt-3 relative overflow-hidden">
      <div className="w-8 h-1 bg-border rounded-full mx-auto mb-2" />
      <span className="text-[10px] font-bold text-foreground block text-center">Settings Drawer</span>
      <span className="text-[8px] text-muted-foreground block text-center mb-1">Set project variables</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Drawer", "Drawer"),
});

registerComponent({
  id: "shadcn:Sheet",
  displayName: "Sheet",
  category: "Overlay",
  keywords: ["sheet", "slide", "drawer", "panel", "side"],
  description: "Slide-in side overlay panel.",
  preview: () => (
    <div className="w-[185px] h-[75px] border border-border bg-popover rounded-md shadow-lg flex justify-end relative overflow-hidden">
      <div className="w-[60px] h-full border-l border-border bg-background p-1.5 flex flex-col justify-between text-[8px] font-semibold">
        <span>Details</span>
        <span className="text-muted-foreground">Properties list...</span>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Sheet", "Sheet"),
});

registerComponent({
  id: "shadcn:Sonner",
  displayName: "Sonner",
  category: "Overlay",
  keywords: ["sonner", "toast", "alert", "notification"],
  description: "Event notification toast alert.",
  preview: () => (
    <div className="w-[185px] border border-border bg-card text-card-foreground rounded-lg p-2.5 shadow-md flex justify-between items-center text-[9px] font-semibold">
      <div>
        <span className="block font-bold">Event created</span>
        <span className="text-muted-foreground block">Monday, July 19 at 6:00 PM</span>
      </div>
      <button className="px-2 py-1 bg-accent border border-border rounded text-[8px] font-bold">Undo</button>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Sonner", "Sonner"),
});

registerComponent({
  id: "shadcn:Toast",
  displayName: "Toast",
  category: "Overlay",
  keywords: ["toast", "notification", "alert", "popup"],
  description: "Trigger alert notification box.",
  preview: () => (
    <div className="w-[185px] border border-border bg-popover text-popover-foreground rounded-lg p-2.5 shadow-md text-left">
      <span className="text-[10px] font-bold block mb-0.5">Scheduled successfully</span>
      <span className="text-[8px] text-muted-foreground leading-tight block">
        We have added the timeline events to logs.
      </span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Toast", "Toast"),
});

// ── LAYOUT ──────────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:Card",
  displayName: "Card",
  category: "Layout",
  keywords: ["card", "container", "paper", "box", "wrap"],
  description: "Bordered container grouping items.",
  preview: () => (
    <div className="w-[185px] border border-border bg-card text-card-foreground rounded-xl p-3 text-left shadow-sm">
      <span className="text-[11px] font-bold block">Card Title</span>
      <span className="text-[9px] text-muted-foreground block mb-2 leading-relaxed">
        Description of layout.
      </span>
      <div className="h-6 rounded bg-accent/40 w-full" />
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Card", "Card"),
});

registerComponent({
  id: "shadcn:Separator",
  displayName: "Separator",
  category: "Layout",
  keywords: ["separator", "divider", "line", "rule", "border"],
  description: "Clean divider separator line.",
  preview: () => (
    <div className="w-[180px] py-2 flex flex-col gap-1.5 text-center text-[9px] text-muted-foreground font-semibold">
      <span>Section Header</span>
      <div className="h-[1px] bg-border w-full" />
      <span>Content Body</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Separator", "Separator"),
});

registerComponent({
  id: "shadcn:Resizable",
  displayName: "Resizable",
  category: "Layout",
  keywords: ["resizable", "split", "panels", "divider", "resize"],
  description: "Adjustable size split panels.",
  preview: () => (
    <div className="w-[185px] h-[55px] border border-border rounded-md flex overflow-hidden text-[9px] font-semibold text-center select-none shadow-sm">
      <div className="w-[45%] bg-accent/40 flex items-center justify-center text-muted-foreground">Panel A</div>
      <div className="w-1.5 bg-border hover:bg-primary flex items-center justify-center text-[8px] text-muted-foreground cursor-col-resize">
        ⋮
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Panel B</div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Resizable", "Resizable"),
});

registerComponent({
  id: "shadcn:ScrollArea",
  displayName: "Scroll Area",
  category: "Layout",
  keywords: ["scroll", "area", "overflow", "list", "bar"],
  description: "Content wrapper with custom scrollbar.",
  preview: () => (
    <div className="w-[180px] h-[50px] border border-border bg-background rounded-md p-1.5 overflow-hidden relative shadow-sm">
      <div className="text-[8px] font-semibold text-muted-foreground leading-normal pr-3">
        Scroll me to see custom slider tracks. This is some scrollable text inside a custom scroll area component.
      </div>
      <div className="w-1 h-[80%] bg-secondary rounded-full absolute right-0.5 top-1 flex justify-center">
        <div className="w-full h-[50%] bg-muted-foreground/60 rounded-full" />
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:ScrollArea", "ScrollArea"),
});

registerComponent({
  id: "shadcn:AspectRatio",
  displayName: "Aspect Ratio",
  category: "Layout",
  keywords: ["aspect", "ratio", "image", "media", "scale"],
  description: "Aspect-ratio constrained frame container.",
  preview: () => (
    <div className="w-[140px] aspect-video border border-dashed border-border bg-secondary/60 rounded flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
      16:9 Aspect Ratio
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:AspectRatio", "AspectRatio"),
});

registerComponent({
  id: "shadcn:Collapsible",
  displayName: "Collapsible",
  category: "Layout",
  keywords: ["collapsible", "expand", "hide", "panel", "chevron"],
  description: "Trigger collapsible details list.",
  preview: () => (
    <div className="w-[185px] border border-border bg-background rounded-md p-1.5 text-[9px] font-semibold shadow-sm text-left">
      <div className="flex justify-between items-center">
        <span>Settings panel</span>
        <span>▼</span>
      </div>
      <div className="mt-1.5 border-t border-border/40 pt-1 text-muted-foreground">Expanded options list...</div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Collapsible", "Collapsible"),
});

registerComponent({
  id: "shadcn:Accordion",
  displayName: "Accordion",
  category: "Layout",
  keywords: ["accordion", "details", "expand", "faq", "list"],
  description: "Expandable summary panel list.",
  preview: () => (
    <div className="w-[185px] flex flex-col border border-border bg-background rounded-md p-1.5 text-[9px] font-semibold divide-y divide-border/40 shadow-sm text-left">
      <div className="py-1 flex justify-between items-center text-primary">
        <span>Is it responsive?</span>
        <span>▲</span>
      </div>
      <div className="py-1 pb-2 text-muted-foreground leading-normal">
        Yes, all components support responsive layout columns.
      </div>
      <div className="py-1.5 flex justify-between items-center text-foreground">
        <span>Can I edit colors?</span>
        <span>▼</span>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Accordion", "Accordion"),
});

registerComponent({
  id: "shadcn:Carousel",
  displayName: "Carousel",
  category: "Layout",
  keywords: ["carousel", "slider", "slides", "images", "banner"],
  description: "Interactive layout slide carousel.",
  preview: () => (
    <div className="w-[185px] h-[65px] border border-border bg-secondary rounded-lg flex items-center justify-between p-2 shadow-sm">
      <button className="w-5 h-5 bg-background border border-border rounded-full text-[8px] flex items-center justify-center font-bold">
        ◀
      </button>
      <span className="text-[10px] font-bold text-muted-foreground">Slide 1 of 3</span>
      <button className="w-5 h-5 bg-background border border-border rounded-full text-[8px] flex items-center justify-center font-bold">
        ▶
      </button>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Carousel", "Carousel"),
});

registerComponent({
  id: "shadcn:Row",
  displayName: "Row (Grid)",
  category: "Layout",
  keywords: ["row", "grid", "flex", "cols", "layout"],
  description: "12-column layout Grid container.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-1.5 grid grid-cols-3 gap-1 text-[9px] text-muted-foreground text-center bg-accent/20">
      <div className="bg-background border border-border p-1 rounded">Col</div>
      <div className="bg-background border border-border p-1 rounded">Col</div>
      <div className="bg-background border border-border p-1 rounded">Col</div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Row", "Row"),
});

registerComponent({
  id: "shadcn:Col",
  displayName: "Column",
  category: "Layout",
  keywords: ["column", "col", "grid", "layout", "span"],
  description: "Grid column item container.",
  preview: () => (
    <div className="w-12 border border-dashed border-primary rounded p-1 bg-primary/5 text-center text-[9px] text-primary font-semibold">
      Column
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Col", "Column"),
});

registerComponent({
  id: "shadcn:Row2Cols",
  displayName: "2 Columns Row",
  category: "Layout",
  keywords: ["preset", "columns", "layout", "grid", "2cols"],
  description: "Preset grid row with 2 columns.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-1.5 grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground text-center bg-accent/20">
      <div className="bg-background border border-border py-1.5 rounded font-medium">Column 1</div>
      <div className="bg-background border border-border py-1.5 rounded font-medium">Column 2</div>
    </div>
  ),
  createInstance: (id) => {
    const col1Id = makeSubId(id, "c1");
    const col2Id = makeSubId(id, "c2");
    return {
      instance: {
        type: "instance" as const,
        id,
        component: "shadcn:Row",
        label: "2 Columns Row",
        children: [
          { type: "id", value: col1Id },
          { type: "id", value: col2Id },
        ],
      },
      childInstances: [
        { type: "instance" as const, id: col1Id, component: "shadcn:Col", label: "Column 1", children: [] },
        { type: "instance" as const, id: col2Id, component: "shadcn:Col", label: "Column 2", children: [] },
      ],
      props: {
        [`${col1Id}:span`]: { id: `${col1Id}:span`, instanceId: col1Id, name: "span", type: "number" as const, value: 6 },
        [`${col2Id}:span`]: { id: `${col2Id}:span`, instanceId: col2Id, name: "span", type: "number" as const, value: 6 },
      },
    };
  },
});

registerComponent({
  id: "shadcn:Row3Cols",
  displayName: "3 Columns Row",
  category: "Layout",
  keywords: ["preset", "columns", "layout", "grid", "3cols"],
  description: "Preset grid row with 3 columns.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-1.5 grid grid-cols-3 gap-1 text-[8px] text-muted-foreground text-center bg-accent/20">
      <div className="bg-background border border-border py-1 rounded">Col 1</div>
      <div className="bg-background border border-border py-1 rounded">Col 2</div>
      <div className="bg-background border border-border py-1 rounded">Col 3</div>
    </div>
  ),
  createInstance: (id) => {
    const col1Id = makeSubId(id, "c1");
    const col2Id = makeSubId(id, "c2");
    const col3Id = makeSubId(id, "c3");
    return {
      instance: {
        type: "instance" as const,
        id,
        component: "shadcn:Row",
        label: "3 Columns Row",
        children: [
          { type: "id", value: col1Id },
          { type: "id", value: col2Id },
          { type: "id", value: col3Id },
        ],
      },
      childInstances: [
        { type: "instance" as const, id: col1Id, component: "shadcn:Col", label: "Column 1", children: [] },
        { type: "instance" as const, id: col2Id, component: "shadcn:Col", label: "Column 2", children: [] },
        { type: "instance" as const, id: col3Id, component: "shadcn:Col", label: "Column 3", children: [] },
      ],
      props: {
        [`${col1Id}:span`]: { id: `${col1Id}:span`, instanceId: col1Id, name: "span", type: "number" as const, value: 4 },
        [`${col2Id}:span`]: { id: `${col2Id}:span`, instanceId: col2Id, name: "span", type: "number" as const, value: 4 },
        [`${col3Id}:span`]: { id: `${col3Id}:span`, instanceId: col3Id, name: "span", type: "number" as const, value: 4 },
      },
    };
  },
});

registerComponent({
  id: "shadcn:Row4Cols",
  displayName: "4 Columns Row",
  category: "Layout",
  keywords: ["preset", "columns", "layout", "grid", "4cols"],
  description: "Preset grid row with 4 columns.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-1 grid grid-cols-4 gap-1 text-[7px] text-muted-foreground text-center bg-accent/20">
      <div className="bg-background border border-border py-1 rounded">C1</div>
      <div className="bg-background border border-border py-1 rounded">C2</div>
      <div className="bg-background border border-border py-1 rounded">C3</div>
      <div className="bg-background border border-border py-1 rounded">C4</div>
    </div>
  ),
  createInstance: (id) => {
    const col1Id = makeSubId(id, "c1");
    const col2Id = makeSubId(id, "c2");
    const col3Id = makeSubId(id, "c3");
    const col4Id = makeSubId(id, "c4");
    return {
      instance: {
        type: "instance" as const,
        id,
        component: "shadcn:Row",
        label: "4 Columns Row",
        children: [
          { type: "id", value: col1Id },
          { type: "id", value: col2Id },
          { type: "id", value: col3Id },
          { type: "id", value: col4Id },
        ],
      },
      childInstances: [
        { type: "instance" as const, id: col1Id, component: "shadcn:Col", label: "Column 1", children: [] },
        { type: "instance" as const, id: col2Id, component: "shadcn:Col", label: "Column 2", children: [] },
        { type: "instance" as const, id: col3Id, component: "shadcn:Col", label: "Column 3", children: [] },
        { type: "instance" as const, id: col4Id, component: "shadcn:Col", label: "Column 4", children: [] },
      ],
      props: {
        [`${col1Id}:span`]: { id: `${col1Id}:span`, instanceId: col1Id, name: "span", type: "number" as const, value: 3 },
        [`${col2Id}:span`]: { id: `${col2Id}:span`, instanceId: col2Id, name: "span", type: "number" as const, value: 3 },
        [`${col3Id}:span`]: { id: `${col3Id}:span`, instanceId: col3Id, name: "span", type: "number" as const, value: 3 },
        [`${col4Id}:span`]: { id: `${col4Id}:span`, instanceId: col4Id, name: "span", type: "number" as const, value: 3 },
      },
    };
  },
});

registerComponent({
  id: "shadcn:Container",
  displayName: "Container",
  category: "Layout",
  keywords: ["box", "flex", "container", "wrapper", "div"],
  description: "Flex layout box / container.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-2 flex flex-col gap-1 text-[8px] text-muted-foreground bg-accent/10 text-left h-[45px]">
      <span className="font-semibold text-foreground">Container</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Container", "Container"),
});

registerComponent({
  id: "shadcn:Section",
  displayName: "Section",
  category: "Layout",
  keywords: ["section", "semantic", "layout", "block", "wrap"],
  description: "Semantic page layout section block.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-2 text-[8px] text-muted-foreground bg-accent/5 text-center h-[40px] flex items-center justify-center font-bold">
      Semantic Section
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Section", "Section"),
});

registerComponent({
  id: "shadcn:FlexRow",
  displayName: "Flex Row",
  category: "Layout",
  keywords: ["flex", "row", "layout", "horizontal", "wrap"],
  description: "Horizontal flex alignment row.",
  preview: () => (
    <div className="w-[185px] border border-dashed border-border rounded p-1.5 flex gap-2 text-[8px] text-muted-foreground bg-accent/15 items-center justify-start h-[35px]">
      <span className="bg-background border border-border px-1.5 py-0.5 rounded">item</span>
      <span className="bg-background border border-border px-1.5 py-0.5 rounded">item</span>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:FlexRow", "FlexRow"),
});

registerComponent({
  id: "shadcn:Spacer",
  displayName: "Spacer",
  category: "Layout",
  keywords: ["spacer", "gap", "empty", "space", "padding"],
  description: "Empty space block element.",
  preview: () => (
    <div className="w-[185px] h-6 border border-dashed border-border rounded bg-accent/5 flex items-center justify-center text-[8px] text-muted-foreground/60 select-none">
      Spacer (24px)
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Spacer", "Spacer"),
});

// ── DISPLAY ─────────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:Avatar",
  displayName: "Avatar",
  category: "Display",
  keywords: ["avatar", "user", "profile", "image", "circle", "face"],
  description: "Profile circle photo with initials.",
  preview: () => (
    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-sm">
      JD
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Avatar", "Avatar"),
});

registerComponent({
  id: "shadcn:Badge",
  displayName: "Badge",
  category: "Display",
  keywords: ["badge", "pill", "tag", "status", "indicator"],
  description: "Visual status indicator tag.",
  preview: () => (
    <span className="px-2.5 py-0.5 bg-primary text-primary-foreground font-semibold text-[9px] rounded-full shadow-sm">
      Active
    </span>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Badge", "Badge", ["Active"]),
});

registerComponent({
  id: "shadcn:Table",
  displayName: "Table",
  category: "Display",
  keywords: ["table", "rows", "grid", "data", "tabular"],
  description: "Display tabular grid list data.",
  preview: () => (
    <div className="w-[185px] border border-border rounded-lg overflow-hidden text-[8px] bg-background shadow-sm text-left">
      <div className="grid grid-cols-3 bg-secondary/80 px-2 py-1 font-bold text-foreground border-b border-border">
        <span>Invoice</span>
        <span>Status</span>
        <span className="text-right">Amount</span>
      </div>
      <div className="grid grid-cols-3 px-2 py-1 text-muted-foreground border-b border-border/40">
        <span className="font-semibold text-foreground">INV-001</span>
        <span>Paid</span>
        <span className="text-right">$250.00</span>
      </div>
      <div className="grid grid-cols-3 px-2 py-1 text-muted-foreground">
        <span className="font-semibold text-foreground">INV-002</span>
        <span>Pending</span>
        <span className="text-right">$120.00</span>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Table", "Table"),
});

registerComponent({
  id: "shadcn:Skeleton",
  displayName: "Skeleton",
  category: "Display",
  keywords: ["skeleton", "placeholder", "loading", "shimmer", "waiting"],
  description: "Pulsing content placeholder skeleton templates.",
  preview: () => (
    <div className="w-[180px] flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-secondary shrink-0 animate-pulse" />
      <div className="w-full flex flex-col gap-1.5">
        <div className="h-2.5 w-[65%] bg-secondary rounded animate-pulse" />
        <div className="h-2 w-[85%] bg-secondary/80 rounded animate-pulse" />
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Skeleton", "Skeleton"),
});

registerComponent({
  id: "shadcn:Progress",
  displayName: "Progress",
  category: "Display",
  keywords: ["progress", "bar", "percent", "loading", "percentage"],
  description: "Visual completion progress bar.",
  preview: () => (
    <div className="w-[180px] flex flex-col gap-1 text-[9px] text-muted-foreground font-semibold text-left">
      <div className="flex justify-between items-center">
        <span>Loading...</span>
        <span>60%</span>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary w-[60%] rounded-full" />
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Progress", "Progress"),
});

// ── TYPOGRAPHY ──────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:Code",
  displayName: "Code",
  category: "Typography",
  keywords: ["code", "inline", "monospace", "pre", "tag"],
  description: "Monospace formatted inline code block.",
  preview: () => (
    <code className="px-1.5 py-0.5 bg-secondary text-foreground font-mono text-[10px] rounded border border-border">
      {"const key = \"val\";"}
    </code>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Code", "Code", ["const key = \"val\";"]),
});

registerComponent({
  id: "shadcn:Kbd",
  displayName: "Kbd",
  category: "Typography",
  keywords: ["kbd", "keyboard", "shortcut", "keys"],
  description: "Display keyboard shortcut keys.",
  preview: () => (
    <kbd className="px-1.5 py-0.5 border border-border bg-secondary text-foreground font-semibold rounded text-[9px] shadow-sm select-none">
      ⌘ K
    </kbd>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Kbd", "Kbd", ["⌘ K"]),
});

registerComponent({
  id: "shadcn:Text",
  displayName: "Text",
  category: "Typography",
  keywords: ["text", "paragraph", "span", "p", "typography"],
  description: "Generic text paragraph block.",
  preview: () => (
    <p className="text-xs text-foreground leading-normal max-w-[180px] text-left">
      Experience the visual builder layout editor.
    </p>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Text", "Text", ["This is a text paragraph element."]),
});

registerComponent({
  id: "shadcn:Heading",
  displayName: "Heading",
  category: "Typography",
  keywords: ["heading", "title", "header", "h1", "h2", "h3"],
  description: "Heading text block elements.",
  preview: () => (
    <h3 className="text-sm font-bold text-foreground leading-tight tracking-tight text-left">
      Dashboard Analytics
    </h3>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Heading", "Heading", ["Dashboard Title"]),
});

registerComponent({
  id: "shadcn:Link",
  displayName: "Link",
  category: "Typography",
  keywords: ["link", "href", "url", "anchor", "hyperlink"],
  description: "Anchor hyperlink navigation.",
  preview: () => (
    <a href="#" className="text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-85">
      Learn more ↗
    </a>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Link", "Link", ["Learn more"]),
});

// ── ADVANCED ────────────────────────────────────────────────────────────────

registerComponent({
  id: "shadcn:DataTable",
  displayName: "Data Table",
  category: "Advanced",
  keywords: ["datatable", "table", "data", "pagination", "search", "filter"],
  description: "Tabular data with search filter and pagination.",
  preview: () => (
    <div className="w-[185px] border border-border bg-background rounded-lg p-2 flex flex-col gap-1.5 shadow-sm text-left">
      <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
        <div className="border border-border rounded px-1.5 py-0.5 text-[7px] text-muted-foreground">Filter emails...</div>
        <div className="text-[7px] text-muted-foreground">Columns ▼</div>
      </div>
      <div className="text-[7px] font-semibold divide-y divide-border/30">
        <div className="grid grid-cols-2 py-1 text-foreground">
          <span>jane.doe@example.com</span>
          <span className="text-right">Success</span>
        </div>
        <div className="grid grid-cols-2 py-1 text-foreground">
          <span>bob.smith@example.com</span>
          <span className="text-right">Pending</span>
        </div>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-border/40 text-[6px] text-muted-foreground">
        <span>Page 1 of 5</span>
        <div className="flex gap-1">
          <button className="border border-border px-1 py-0.5 rounded">Prev</button>
          <button className="border border-border px-1 py-0.5 rounded">Next</button>
        </div>
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:DataTable", "DataTable"),
});

registerComponent({
  id: "shadcn:Chart",
  displayName: "Chart",
  category: "Advanced",
  keywords: ["chart", "analytics", "bar", "line", "stats", "graph"],
  description: "Analytics statistics bar / line graph.",
  preview: () => (
    <div className="w-[185px] h-[75px] border border-border bg-card rounded-xl p-2.5 shadow-sm flex flex-col justify-between text-left">
      <div className="flex justify-between items-center text-[7px] font-bold text-foreground">
        <span>Visitors</span>
        <span className="text-[6px] text-muted-foreground">Last 7 days</span>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-9 pt-1.5">
        <div className="w-full bg-primary/20 rounded-t h-4 hover:bg-primary transition-all" />
        <div className="w-full bg-primary/25 rounded-t h-7 hover:bg-primary transition-all" />
        <div className="w-full bg-primary rounded-t h-8 hover:bg-primary transition-all" />
        <div className="w-full bg-primary/40 rounded-t h-6 hover:bg-primary transition-all" />
        <div className="w-full bg-primary/30 rounded-t h-5 hover:bg-primary transition-all" />
        <div className="w-full bg-primary/50 rounded-t h-7 hover:bg-primary transition-all" />
        <div className="w-full bg-primary/75 rounded-t h-9 hover:bg-primary transition-all" />
      </div>
    </div>
  ),
  createInstance: (id) => defaultBuilder(id, "shadcn:Chart", "Chart"),
});
