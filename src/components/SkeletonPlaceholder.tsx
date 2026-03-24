import React from "react";
import type { Theme } from "../types";
import { themes } from "../theme";

/**
 * Skeleton placeholder component displayed while SVG assets are loading
 * Requirements: 5.2 - Display placeholder skeleton while loading
 * Requirements: 11.2 - Use consistent 4px-based spacing throughout the interface
 */
export interface SkeletonPlaceholderProps {
  theme?: Theme;
  width?: string | number;
  height?: string | number;
}

export function SkeletonPlaceholder({
  theme = "light",
  width = "100%",
  height = "100%",
}: SkeletonPlaceholderProps) {
  const colors = themes[theme];

  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${colors.bgHover} 25%, ${colors.border} 50%, ${colors.bgHover} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        borderRadius: "4px", // 4px = 1 * 4px
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="status"
      aria-label="Loading content"
    />
  );
}

export default SkeletonPlaceholder;
