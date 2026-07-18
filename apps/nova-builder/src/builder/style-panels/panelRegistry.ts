// Central registry of all StyleInspector panel components.
// StyleInspector imports exclusively from this module so new panels are added
// here (+ rendered below) without touching existing panel files.
export { BoxShadowPanel, TextShadowPanel } from "../ShadowEditor";
export { TransformPanel } from "../TransformEditor";
export { TransitionPanel } from "../TransitionEditor";
export { AnimationPanel } from "../AnimationEditor";
export { FilterPanel, BackdropFilterPanel } from "../FilterEditor";
export { GradientPanel } from "../GradientEditor";
export { GridContainerPanel, GridChildPanel } from "../GridEditor";
