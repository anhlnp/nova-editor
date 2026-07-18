import React from "react";
import {
    Button,
    ButtonGroup,
    Input,
    Checkbox,
    Switch,
    Avatar,
    Chip,
    Badge,
    Card,
    CardBody,
    Snippet,
    Code,
    User,
    Image,
    Tabs,
    Tab,
    Breadcrumbs,
    BreadcrumbItem,
    Link,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Tooltip,
    Select,
    SelectItem,
    Spinner,
    Progress,
    Radio,
    RadioGroup,
    CircularProgress,
    Slider,
    Textarea,
    TimeInput,
    DatePicker,
    Pagination,
    Divider,
    Kbd,
    ScrollShadow,
    Autocomplete,
    AutocompleteItem,
    Skeleton
} from "@heroui/react";

export interface RegistryEntry {
    id: string; // matches canvas name, e.g. "heroui:HeroUIButton"
    name: string; // display name
    category: "General" | "Data Display" | "Navigation" | "Forms" | "Feedback" | "Overlay" | "Layout" | "Utilities" | "Dynamic";
    keywords: string[];
    description: string;
    preview: React.ReactNode;
    createInstance: (id: string) => {
        type: "instance";
        id: string;
        component: string;
        label: string;
        children: Array<{ type: "id" | "text" | "expression"; value: string }>;
    };
}

const componentRegistry: RegistryEntry[] = [];

export function registerComponent(entry: RegistryEntry) {
    const index = componentRegistry.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
        componentRegistry[index] = entry;
    } else {
        componentRegistry.push(entry);
    }
}

export function getRegistry(): RegistryEntry[] {
    return [...componentRegistry];
}

// Helper to create simple default instances
const defaultBuilder = (id: string, component: string, label: string) => ({
    type: "instance" as const,
    id,
    component,
    label,
    children: [],
});

// ── General ────────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUIButton",
    name: "Button",
    category: "General",
    keywords: ["button", "click", "trigger", "action", "primary", "btn"],
    description: "Trigger actions with one click.",
    preview: <Button size="sm" color="primary">Click me</Button>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIButton", "Button"),
});

registerComponent({
    id: "heroui:HeroUIButtonGroup",
    name: "ButtonGroup",
    category: "General",
    keywords: ["button", "group", "row", "buttons", "btngroup"],
    description: "Group multiple buttons together.",
    preview: (
        <ButtonGroup size="sm" color="primary">
            <Button>One</Button>
            <Button>Two</Button>
        </ButtonGroup>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIButtonGroup", "ButtonGroup"),
});

// ── Forms ──────────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUIInput",
    name: "Input",
    category: "Forms",
    keywords: ["input", "text", "field", "search", "write", "collect"],
    description: "Collect textual user input.",
    preview: <Input size="sm" type="text" label="Search" placeholder="Search..." className="max-w-[180px]" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIInput", "Input"),
});

registerComponent({
    id: "heroui:HeroUITextarea",
    name: "Textarea",
    category: "Forms",
    keywords: ["textarea", "input", "multiline", "long text", "comment", "field"],
    description: "Collect multi-line textual input.",
    preview: <Textarea size="sm" label="Description" placeholder="Enter your text" className="max-w-[180px]" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUITextarea", "Textarea"),
});

registerComponent({
    id: "heroui:HeroUISelect",
    name: "Select",
    category: "Forms",
    keywords: ["select", "dropdown", "picker", "choose", "menu", "option"],
    description: "Select options from a drop-down list.",
    preview: (
        <Select label="Status" size="sm" className="max-w-[180px] min-w-[120px]">
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="paused">Paused</SelectItem>
        </Select>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISelect", "Select"),
});

registerComponent({
    id: "heroui:HeroUICheckbox",
    name: "Checkbox",
    category: "Forms",
    keywords: ["checkbox", "check", "toggle", "accept", "terms", "tick"],
    description: "Select one or more options.",
    preview: <Checkbox defaultSelected size="sm">Accept terms</Checkbox>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUICheckbox", "Checkbox"),
});

registerComponent({
    id: "heroui:HeroUISwitch",
    name: "Switch",
    category: "Forms",
    keywords: ["switch", "toggle", "checkbox", "on", "off", "active"],
    description: "Toggle a single setting on/off.",
    preview: <Switch defaultSelected size="sm" aria-label="Toggle setting" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISwitch", "Switch"),
});

registerComponent({
    id: "heroui:HeroUIRadioGroup",
    name: "RadioGroup",
    category: "Forms",
    keywords: ["radio", "group", "select", "options", "choose", "gender"],
    description: "Select one option from a set.",
    preview: (
        <RadioGroup label="Gender" size="sm" defaultValue="m">
            <Radio value="m" size="sm">Male</Radio>
            <Radio value="f" size="sm">Female</Radio>
        </RadioGroup>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIRadioGroup", "RadioGroup"),
});

registerComponent({
    id: "heroui:HeroUISlider",
    name: "Slider",
    category: "Forms",
    keywords: ["slider", "range", "volume", "track", "value"],
    description: "Select value along a track.",
    preview: <Slider size="sm" defaultValue={40} className="max-w-[180px]" aria-label="Volume" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISlider", "Slider"),
});

registerComponent({
    id: "heroui:HeroUITimeInput",
    name: "TimeInput",
    category: "Forms",
    keywords: ["time", "clock", "input", "picker", "schedule"],
    description: "Collect time selection.",
    preview: <TimeInput size="sm" label="Event Time" className="max-w-[180px]" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUITimeInput", "TimeInput"),
});

registerComponent({
    id: "heroui:HeroUIDatePicker",
    name: "DatePicker",
    category: "Forms",
    keywords: ["date", "calendar", "picker", "time", "schedule"],
    description: "Select dates from calendar.",
    preview: <DatePicker size="sm" label="Select Date" className="max-w-[180px]" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIDatePicker", "DatePicker"),
});

// ── Data Display ───────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUICard",
    name: "Card",
    category: "Data Display",
    keywords: ["card", "container", "box", "wrapper", "paper"],
    description: "Group related content and actions.",
    preview: (
        <Card className="w-[180px] bg-background/60 dark:bg-zinc-900/60 border border-default-200">
            <CardBody className="p-3">
                <p className="text-xs font-semibold">HeroUI Card</p>
                <p className="text-[10px] text-default-500">Visual container.</p>
            </CardBody>
        </Card>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUICard", "Card"),
});

registerComponent({
    id: "heroui:HeroUIAvatar",
    name: "Avatar",
    category: "Data Display",
    keywords: ["avatar", "user", "profile", "image", "circle", "face"],
    description: "Display user profile.",
    preview: <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" size="md" name="John Doe" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIAvatar", "Avatar"),
});

registerComponent({
    id: "heroui:HeroUIChip",
    name: "Chip",
    category: "Data Display",
    keywords: ["chip", "badge", "pill", "status", "tag", "label"],
    description: "Small status indicator or label.",
    preview: <Chip size="sm" color="secondary" variant="flat">Premium</Chip>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIChip", "Chip"),
});

registerComponent({
    id: "heroui:HeroUIBadge",
    name: "Badge",
    category: "Data Display",
    keywords: ["badge", "notification", "count", "dot", "indicator"],
    description: "Small status dot or count indicator.",
    preview: (
        <Badge content="5" color="danger" size="sm">
            <Button size="sm" variant="flat">Inbox</Button>
        </Badge>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIBadge", "Badge"),
});

registerComponent({
    id: "heroui:HeroUIUser",
    name: "User",
    category: "Data Display",
    keywords: ["user", "profile", "card", "author", "creator"],
    description: "Display user profile info.",
    preview: <User name="John Doe" description="Designer" avatarProps={{ src: "https://i.pravatar.cc/150?u=a042581f4e29026704e" }} />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIUser", "User"),
});

registerComponent({
    id: "heroui:HeroUIImage",
    name: "Image",
    category: "Data Display",
    keywords: ["image", "picture", "photo", "media", "banner"],
    description: "Display optimized images.",
    preview: <Image src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200" alt="Preview" width={110} height={70} className="object-cover rounded-md" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIImage", "Image"),
});

registerComponent({
    id: "heroui:HeroUISnippet",
    name: "Snippet",
    category: "Data Display",
    keywords: ["snippet", "code", "terminal", "copy", "command"],
    description: "Display command line snippets.",
    preview: <Snippet size="sm" symbol="#" className="max-w-[180px]">npm i @heroui/react</Snippet>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISnippet", "Snippet"),
});

registerComponent({
    id: "heroui:HeroUICode",
    name: "Code",
    category: "Data Display",
    keywords: ["code", "inline", "syntax", "pre", "text"],
    description: "Display inline blocks of code.",
    preview: <Code size="sm">const x = 5;</Code>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUICode", "Code"),
});

registerComponent({
    id: "heroui:HeroUITable",
    name: "Table",
    category: "Data Display",
    keywords: ["table", "grid", "data", "rows", "columns", "tabular"],
    description: "Organize and display tabular data.",
    preview: (
        <div className="w-[180px] border border-default-200 rounded-lg p-1.5 text-[9px] bg-background/50">
            <div className="grid grid-cols-2 border-b border-default-200 pb-1 font-bold text-default-600">
                <span>Name</span>
                <span>Role</span>
            </div>
            <div className="grid grid-cols-2 pt-1 text-default-500">
                <span>Alice</span>
                <span>Admin</span>
            </div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUITable", "Table"),
});

// ── Navigation ─────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUITabs",
    name: "Tabs",
    category: "Navigation",
    keywords: ["tabs", "navigation", "menu", "switch", "pills"],
    description: "Organize content into tabs.",
    preview: (
        <Tabs size="sm" aria-label="Tabs option">
            <Tab title="Active" key="act" />
            <Tab title="Archive" key="arc" />
        </Tabs>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUITabs", "Tabs"),
});

registerComponent({
    id: "heroui:HeroUIBreadcrumbs",
    name: "Breadcrumbs",
    category: "Navigation",
    keywords: ["breadcrumbs", "navigation", "crumbs", "path", "trail"],
    description: "Show breadcrumb navigation path.",
    preview: (
        <Breadcrumbs size="sm">
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbItem>Docs</BreadcrumbItem>
        </Breadcrumbs>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIBreadcrumbs", "Breadcrumbs"),
});

registerComponent({
    id: "heroui:HeroUINavbar",
    name: "Navbar",
    category: "Navigation",
    keywords: ["navbar", "navigation", "header", "menu", "brand"],
    description: "Global site header and navigation.",
    preview: (
        <div className="w-[180px] bg-default-100/80 p-2 rounded-lg flex justify-between items-center text-[10px] border border-default-200">
            <span className="font-bold text-primary">Logo</span>
            <div className="flex gap-2 text-default-500">
                <span>Home</span>
                <span>Docs</span>
            </div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUINavbar", "Navbar"),
});

registerComponent({
    id: "heroui:HeroUILink",
    name: "Link",
    category: "Navigation",
    keywords: ["link", "href", "url", "anchor", "hyperlink"],
    description: "Hyperlink navigation.",
    preview: <Link href="#" size="sm" showAnchorIcon>Visit website</Link>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUILink", "Link"),
});

registerComponent({
    id: "heroui:HeroUIPagination",
    name: "Pagination",
    category: "Navigation",
    keywords: ["pagination", "pages", "pager", "numbers", "nav"],
    description: "Select pages navigation.",
    preview: <Pagination total={3} initialPage={1} size="sm" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIPagination", "Pagination"),
});

// ── Feedback ───────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUISpinner",
    name: "Spinner",
    category: "Feedback",
    keywords: ["spinner", "loader", "loading", "waiting", "circle"],
    description: "Indicate loading state.",
    preview: <Spinner size="sm" label="Loading..." />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISpinner", "Spinner"),
});

registerComponent({
    id: "heroui:HeroUIProgress",
    name: "Progress",
    category: "Feedback",
    keywords: ["progress", "bar", "percent", "loading", "status"],
    description: "Show completion progress.",
    preview: <Progress size="sm" value={70} className="max-w-[180px]" aria-label="Loading progress" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIProgress", "Progress"),
});

registerComponent({
    id: "heroui:HeroUICircularProgress",
    name: "CircularProgress",
    category: "Feedback",
    keywords: ["circularprogress", "progress", "circle", "percent", "loading"],
    description: "Circular progress indicator.",
    preview: <CircularProgress size="sm" value={70} showValueLabel={true} aria-label="Circular progress" />,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUICircularProgress", "CircularProgress"),
});

registerComponent({
    id: "heroui:HeroUISkeleton",
    name: "Skeleton",
    category: "Feedback",
    keywords: ["skeleton", "placeholder", "loading", "shimmer", "waiting"],
    description: "Placeholders for loading content.",
    preview: (
        <div className="w-full flex items-center gap-2">
            <Skeleton className="flex rounded-full w-8 h-8 shrink-0" />
            <div className="w-full flex flex-col gap-1.5">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
            </div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISkeleton", "Skeleton"),
});

// ── Overlay ────────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUIModal",
    name: "Modal",
    category: "Overlay",
    keywords: ["modal", "dialog", "popup", "box", "overlay"],
    description: "Overlay dialog for focused interaction.",
    preview: (
        <div className="border border-default-200 rounded-lg p-2 bg-background/90 shadow-sm text-center w-[170px]">
            <p className="text-[11px] font-semibold text-default-800">Modal Dialog</p>
            <div className="flex justify-center gap-1.5 mt-2">
                <Button size="sm" color="danger" variant="flat">Close</Button>
                <Button size="sm" color="primary">Action</Button>
            </div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIModal", "Modal"),
});

registerComponent({
    id: "heroui:HeroUIDrawer",
    name: "Drawer",
    category: "Overlay",
    keywords: ["drawer", "panel", "slide", "sheet", "sidebar"],
    description: "Slide-out panel overlay.",
    preview: (
        <div className="border border-default-200 rounded-lg p-2 bg-background/90 flex flex-col justify-between w-[170px] h-[55px]">
            <div className="border-b border-default-100 pb-1 text-[10px] font-semibold text-default-800">Drawer Panel</div>
            <span className="text-[9px] text-default-400">Slide-out content</span>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIDrawer", "Drawer"),
});

registerComponent({
    id: "heroui:HeroUIPopover",
    name: "Popover",
    category: "Overlay",
    keywords: ["popover", "card", "floating", "click", "overlay"],
    description: "Contextual floating content.",
    preview: (
        <Popover placement="bottom" showArrow={true} defaultOpen={false}>
            <PopoverTrigger>
                <Button size="sm">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="px-1 py-1 text-[10px]">
                    <div className="font-bold">Content</div>
                </div>
            </PopoverContent>
        </Popover>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIPopover", "Popover"),
});

registerComponent({
    id: "heroui:HeroUITooltip",
    name: "Tooltip",
    category: "Overlay",
    keywords: ["tooltip", "hover", "info", "hint", "popup"],
    description: "Display information when hovering.",
    preview: (
        <Tooltip content="Tooltip message" isOpen={true} placement="right">
            <Button size="sm">Hover me</Button>
        </Tooltip>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUITooltip", "Tooltip"),
});

// ── Layout ─────────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUIDivider",
    name: "Divider",
    category: "Layout",
    keywords: ["divider", "line", "separator", "rule", "border"],
    description: "Thin line separating content.",
    preview: (
        <div className="w-[180px] py-1 flex flex-col gap-1 text-center">
            <span className="text-[9px] text-default-400">Item A</span>
            <Divider />
            <span className="text-[9px] text-default-400">Item B</span>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIDivider", "Divider"),
});

registerComponent({
    id: "heroui:HeroUISpacer",
    name: "Spacer",
    category: "Layout",
    keywords: ["spacer", "gap", "margin", "padding", "space"],
    description: "Introduce empty space.",
    preview: (
        <div className="w-[180px] h-8 border border-dashed border-default-300 rounded flex items-center justify-center text-[9px] text-default-400">
            Spacer (32px)
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUISpacer", "Spacer"),
});

// Grid rows/columns presets
registerComponent({
    id: "heroui:HeroUIRow",
    name: "Row (Grid)",
    category: "Layout",
    keywords: ["row", "grid", "layout", "flex", "container"],
    description: "Horizontal container row.",
    preview: (
        <div className="w-[180px] border border-dashed border-default-300 rounded p-1.5 grid grid-cols-2 gap-1 text-[9px] text-default-400 text-center">
            <div className="bg-default-100/60 p-1 rounded">Col</div>
            <div className="bg-default-100/60 p-1 rounded">Col</div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIRow", "Row (Grid)"),
});

registerComponent({
    id: "heroui:HeroUI2Cols",
    name: "2 Columns",
    category: "Layout",
    keywords: ["columns", "layout", "preset", "2cols", "grid"],
    description: "Preset with 2 columns.",
    preview: (
        <div className="w-[180px] border border-dashed border-default-300 rounded p-1.5 grid grid-cols-2 gap-1 text-[9px] text-default-400 text-center">
            <div className="bg-default-100/60 p-1 rounded">Col 1</div>
            <div className="bg-default-100/60 p-1 rounded">Col 2</div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUI2Cols", "2 Columns"),
});

registerComponent({
    id: "heroui:HeroUI3Cols",
    name: "3 Columns",
    category: "Layout",
    keywords: ["columns", "layout", "preset", "3cols", "grid"],
    description: "Preset with 3 columns.",
    preview: (
        <div className="w-[180px] border border-dashed border-default-300 rounded p-1.5 grid grid-cols-3 gap-1 text-[9px] text-default-400 text-center">
            <div className="bg-default-100/60 p-1 rounded">Col 1</div>
            <div className="bg-default-100/60 p-1 rounded">Col 2</div>
            <div className="bg-default-100/60 p-1 rounded">Col 3</div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUI3Cols", "3 Columns"),
});

registerComponent({
    id: "heroui:HeroUI4Cols",
    name: "4 Columns",
    category: "Layout",
    keywords: ["columns", "layout", "preset", "4cols", "grid"],
    description: "Preset with 4 columns.",
    preview: (
        <div className="w-[180px] border border-dashed border-default-300 rounded p-1.5 grid grid-cols-4 gap-1 text-[9px] text-default-400 text-center">
            <div className="bg-default-100/60 p-1 rounded">C1</div>
            <div className="bg-default-100/60 p-1 rounded">C2</div>
            <div className="bg-default-100/60 p-1 rounded">C3</div>
            <div className="bg-default-100/60 p-1 rounded">C4</div>
        </div>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUI4Cols", "4 Columns"),
});

// ── Utilities ──────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUIKbd",
    name: "Kbd",
    category: "Utilities",
    keywords: ["kbd", "keyboard", "shortcut", "keys", "button"],
    description: "Display keyboard shortcuts.",
    preview: <Kbd keys={["command"]}>K</Kbd>,
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIKbd", "Kbd"),
});

registerComponent({
    id: "heroui:HeroUIScrollShadow",
    name: "ScrollShadow",
    category: "Utilities",
    keywords: ["scrollshadow", "scroll", "shadow", "fade", "overflow"],
    description: "Scrollable area with shadow.",
    preview: (
        <ScrollShadow size={10} className="w-[180px] h-[40px] text-[9px] overflow-y-auto bg-background/50 p-1 rounded border border-default-100">
            Scroll me to see shadow. This is some scrollable text inside a shadow scroll.
        </ScrollShadow>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIScrollShadow", "ScrollShadow"),
});

// ── Dynamic ────────────────────────────────────────────────────────────────
registerComponent({
    id: "heroui:HeroUIAutocomplete",
    name: "Autocomplete",
    category: "Dynamic",
    keywords: ["autocomplete", "search", "suggest", "input", "dropdown"],
    description: "Input with suggestions.",
    preview: (
        <Autocomplete label="Fruits" size="sm" className="max-w-[180px]" defaultSelectedKey="apple">
            <AutocompleteItem key="apple">Apple</AutocompleteItem>
            <AutocompleteItem key="banana">Banana</AutocompleteItem>
        </Autocomplete>
    ),
    createInstance: (id) => defaultBuilder(id, "heroui:HeroUIAutocomplete", "Autocomplete"),
});

// Export default registry list
export const registry = componentRegistry;
