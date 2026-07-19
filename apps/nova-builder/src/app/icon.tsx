import { ImageResponse } from "next/og";
import { LogoIcon } from "@/components/LogoIcon";

// Route segment config

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <LogoIcon width="100%" height="100%" />
    ),
    {
      ...size,
    }
  );
}
