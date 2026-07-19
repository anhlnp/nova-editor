import React from "react";

declare module "@webstudio-is/design-system" {
  export type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
  };

  export type Point = { x: number; y: number };

  export type ChildrenOrientation =
    | { type: "horizontal" | "vertical"; reverse: boolean }
    | { type: "mixed"; reverse?: boolean };

  export type Placement = {
    parentRect: Rect;
    type: "between-children" | "next-to-child" | "inside-parent";
    x: number;
    y: number;
    length: number;
    direction: "horizontal" | "vertical";
  };

  export const PlacementIndicator: (props: { placement: Placement; scale?: number }) => React.JSX.Element;

  export type PlacementIndicatorOptions = {
    placement: {
      closestChildIndex: number;
      indexAdjustment: number;
      childrenOrientation: ChildrenOrientation;
    };
    element: Element;
    getValidChildren?: (parent: Element) => Element[] | HTMLCollection;
    placementPadding?: number;
    childrenOrientation?: ChildrenOrientation;
  };

  export function computeIndicatorPlacement(options: PlacementIndicatorOptions): Placement | undefined;

  export function getChildrenRects(parent: Element, children: Element[] | HTMLCollection): Rect[];

  export function getLocalChildrenOrientation(
    parent: Element,
    getChildren: (parent: Element) => Element[] | HTMLCollection,
    childrenRects: Rect[],
    childIndex: number
  ): ChildrenOrientation;

  export function getArea(
    pointer: Point,
    edgeDistanceThreshold: number,
    rect: Rect
  ): "top" | "bottom" | "left" | "right" | "center";

  export function getIndexAdjustment(
    pointer: Point,
    closestChildRect: Rect | undefined,
    orientation: ChildrenOrientation
  ): number;
}
