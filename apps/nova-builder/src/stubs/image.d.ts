// Stub for @webstudio-is/image
// The real source has TypeScript 5.8 never[] inference issues in image-optimize.ts.
import type React from "react";

export declare const wsImageLoader: (params: {
  src: string;
  width: number;
  quality?: number;
}) => string;

export declare const Image: React.ComponentType<any>;
export type ImageLoader = (params: { src: string; width: number; quality?: number }) => string;
