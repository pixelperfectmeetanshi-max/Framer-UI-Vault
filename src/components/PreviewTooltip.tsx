import React, { useEffect, useState, useRef, useCallback } from "react";
import { themes } from "../theme";
import type { PreviewTooltipProps } from "../types";

/**
 * PreviewTooltip component - Displays an enlarged preview of a component on hover
 * 
 * Requirements:
 * - 10.2: Show the component at a larger scale with better detail visibility
 * - 10.3: Include the component name and category
 * - 10.4: Hide preview when mouse moves away
 * - 10.5: Position preview to not obstruct the insert button
 */
export function PreviewTooltip({ item, anchorRect, theme, onClose }: PreviewTooltipProps) {
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const colors = themes[theme];

  // Tooltip dimensions
  const TOOLTIP_WIDTH = 280;
  const TOOLTIP_HEIGHT = 220;
  const OFFSET = 12; // Gap between card and tooltip

  /**
   * Calculate optimal position for the tooltip
   * Requirement 10.5: Position preview to not obstruct the insert button
   */
  const calculatePosition = useCallback(() => {
    if (!anchorRect) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default: position to the right of the card
    let left = anchorRect.right + OFFSET;
    let top = anchorRect.top;

    // If tooltip would overflow right edge, position to the left of the card
    if (left + TOOLTIP_WIDTH > viewportWidth) {
      left = anchorRect.left - TOOLTIP_WIDTH - OFFSET;
    }

    // If tooltip would still overflow (card is too wide), position below
    if (left < 0) {
      left = Math.max(OFFSET, anchorRect.left);
      top = anchorRect.bottom + OFFSET;
    }

    // Ensure tooltip doesn't overflow bottom
    if (top + TOOLTIP_HEIGHT > viewportHeight) {
      top = Math.max(OFFSET, viewportHeight - TOOLTIP_HEIGHT - OFFSET);
    }

    // Ensure tooltip doesn't overflow top
    if (top < OFFSET) {
      top = OFFSET;
    }

    setPosition({ top, left });
  }, [anchorRect]);

  useEffect(() => {
    calculatePosition();
    
    // Recalculate on window resize
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [calculatePosition]);

  // Handle mouse leave on the tooltip itself
  const handleMouseLeave = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      aria-label={`Preview of ${item.name} component from ${item.category} category`}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: TOOLTIP_WIDTH,
        zIndex: 1000,
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px", // 8px = 2 * 4px
        boxShadow: colors.shadowElevated,
        overflow: "hidden",
        animation: "scaleIn 150ms ease-out",
        pointerEvents: "auto",
        transition: "opacity 200ms ease, transform 200ms ease",
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enlarged SVG Preview - Requirement 10.2: Larger scale with better detail */}
      <div
        style={{
          width: "100%",
          height: 160, // 160px = 40 * 4px
          background: colors.bgHover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "16px", // 16px = 4 * 4px
        }}
      >
        {item.svg ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: "scale(1.2)", // Enlarged scale for better visibility
            }}
            dangerouslySetInnerHTML={{ __html: item.svg }}
          />
        ) : (
          <span style={{ fontSize: 12, color: colors.textSecondary }}>
            No Preview Available
          </span>
        )}
      </div>

      {/* Component Info - Requirement 10.3: Include name and category */}
      <div
        style={{
          padding: "12px 16px", // 12px = 3 * 4px, 16px = 4 * 4px
          borderTop: `1px solid ${colors.borderLight}`,
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: "4px", // 4px = 1 * 4px
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: colors.textSecondary,
            display: "flex",
            alignItems: "center",
            gap: "8px", // 8px = 2 * 4px
          }}
        >
          <CategoryIcon color={colors.textSecondary} />
          {item.category}
        </div>
      </div>
    </div>
  );
}

/**
 * Small category icon for the tooltip info section
 */
function CategoryIcon({ color }: { color: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default PreviewTooltip;
