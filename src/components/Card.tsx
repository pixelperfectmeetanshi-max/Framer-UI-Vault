import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { themes } from "../theme";
import type { CardProps, ComponentItem } from "../types";
import { SkeletonPlaceholder } from "./SkeletonPlaceholder";
import { HighlightedText } from "./HighlightedText";
import { PreviewTooltip } from "./PreviewTooltip";
import { useThemeColor } from "../contexts/ThemeColorContext";

/**
 * Favorite/bookmark icon component
 * Requirements: 15.1 - Display a favorite/bookmark icon on Component_Card
 */
function FavoriteIcon({ isFavorite, color }: { isFavorite: boolean; color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={isFavorite ? color : "none"}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * Focus ring styles for accessibility
 * Requirements: 6.2 - Display visible focus indicator on focused Component_Cards
 */
const getFocusRingStyle = (isFocused: boolean, focusRingColor: string) => ({
  outline: isFocused ? `2px solid ${focusRingColor}` : 'none',
  outlineOffset: isFocused ? '2px' : '0',
});

/**
 * Loading spinner component for insert operation feedback
 * Requirements: 3.1 - Display loading spinner when insert operation in progress
 */
function LoadingSpinner({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: "spin 1s linear infinite",
        marginRight: "6px",
      }}
    >
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        opacity="0.3"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="23.55"
      />
    </svg>
  );
}

/**
 * Card component with lazy loading support for SVG assets
 * Requirements: 5.1 - Load SVG assets only when category is selected or visible
 * Requirements: 5.2 - Display placeholder skeleton while loading
 * Requirements: 6.1 - Support Tab key navigation (tabIndex prop)
 * Requirements: 6.2 - Display visible focus indicator
 * Requirements: 6.3 - Enter key initiates insert operation
 * Requirements: 7.2 - Include component name and category in aria-label
 * Requirements: 15.1 - Display a favorite/bookmark icon
 * Requirements: 15.2, 15.5 - Toggle favorite on click
 */
export default function Card({
  item,
  onInsert,
  theme,
  isFavorite = false,
  onToggleFavorite,
  isLoading = false,
  tabIndex = 0,
  onKeyDown,
  searchQuery = '',
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSvgLoaded, setIsSvgLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preview hover delay constant (500ms as per Requirement 10.1)
  const PREVIEW_HOVER_DELAY = 500;

  // ✅ SAFE THEME (prevents crash)
  const colors = themes?.[theme || "light"];
  
  // Get theme color transformation function
  const { getTransformedSvg } = useThemeColor();
  
  // Transform SVG with current theme/color settings
  const transformedSvg = useMemo(() => {
    if (!item?.svg) return '';
    return getTransformedSvg(item.svg);
  }, [item?.svg, getTransformedSvg]);

  // ✅ Build accessible aria-label with component name and category (Requirement 7.2)
  const ariaLabel = useMemo(() => {
    const name = item?.name || "Untitled";
    const category = item?.category || "Uncategorized";
    const favoriteStatus = isFavorite ? "Favorited." : "";
    return `${name} component in ${category} category. ${favoriteStatus} Press Enter to insert.`;
  }, [item?.name, item?.category, isFavorite]);

  /**
   * Handle favorite toggle click
   * Requirements: 15.2 - Add component to favorites on click
   * Requirements: 15.5 - Remove component from favorites on click
   */
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering card click
      if (onToggleFavorite && item?.id) {
        onToggleFavorite(item.id);
      }
    },
    [onToggleFavorite, item?.id]
  );

  /**
   * Handle favorite toggle via keyboard
   * Requirements: 15.2, 15.5 - Toggle favorite with keyboard
   */
  const handleFavoriteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite && item?.id) {
          onToggleFavorite(item.id);
        }
      }
    },
    [onToggleFavorite, item?.id]
  );

  /**
   * Handle keyboard events on the card
   * Requirements: 6.3 - Enter key initiates insert operation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Call parent's onKeyDown handler if provided (for grid navigation)
      if (onKeyDown) {
        onKeyDown(e, item);
      }

      // Enter key initiates insert operation (Requirement 6.3)
      if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        onInsert?.(item);
      }
    },
    [item, isLoading, onInsert, onKeyDown]
  );

  /**
   * Handle mouse enter on the card
   * Requirement 10.1: Show preview after 500ms hover on Component_Card
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    
    // Start the hover timer for preview tooltip
    hoverTimerRef.current = setTimeout(() => {
      if (cardRef.current) {
        setCardRect(cardRef.current.getBoundingClientRect());
        setShowPreview(true);
      }
    }, PREVIEW_HOVER_DELAY);
  }, [PREVIEW_HOVER_DELAY]);

  /**
   * Handle mouse leave on the card
   * Requirement 10.4: Hide preview when mouse moves away
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    // Clear the hover timer if it hasn't fired yet
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    // Hide the preview tooltip
    setShowPreview(false);
  }, []);

  /**
   * Handle preview tooltip close
   * Requirement 10.4: Hide preview when mouse moves away
   */
  const handlePreviewClose = useCallback(() => {
    setShowPreview(false);
  }, []);

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Intersection Observer for lazy loading - load SVG only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, we can disconnect the observer
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: "50px", // Start loading slightly before visible
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Simulate SVG loading delay when becoming visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to simulate loading and show skeleton
      const timer = setTimeout(() => {
        setIsSvgLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible]);

  // Determine if we should show the skeleton
  const showSkeleton = !isVisible || !isSvgLoaded;

  return (
    <div
      ref={cardRef}
      tabIndex={tabIndex}
      role="button"
      aria-label={ariaLabel}
      style={{
        ...styles.card,
        background: colors.cardBg,
        borderColor: isHovered || isFocused ? colors.primary : colors.border,
        boxShadow: isHovered || isFocused ? colors.shadowHover : colors.shadow,
        // Requirement 11.4: Smooth scale and shadow transition on hover
        transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        ...getFocusRingStyle(isFocused, colors.focusRing),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          ...styles.preview,
          background: colors.bgHover,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Favorite button - Requirement 15.1: Display favorite/bookmark icon */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            onKeyDown={handleFavoriteKeyDown}
            onMouseEnter={() => setIsFavoriteHovered(true)}
            onMouseLeave={() => setIsFavoriteHovered(false)}
            aria-label={isFavorite ? `Remove ${item?.name || "component"} from favorites` : `Add ${item?.name || "component"} to favorites`}
            aria-pressed={isFavorite}
            style={{
              ...styles.favoriteButton,
              opacity: isHovered || isFocused || isFavorite ? 1 : 0,
              background: isFavoriteHovered ? colors.bgActive : 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <FavoriteIcon 
              isFavorite={isFavorite} 
              color={isFavorite ? colors.primary : colors.textSecondary} 
            />
          </button>
        )}
        {showSkeleton ? (
          <SkeletonPlaceholder theme={theme || "light"} />
        ) : transformedSvg ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            dangerouslySetInnerHTML={{ __html: transformedSvg }}
          />
        ) : (
          <span style={{ fontSize: 10, color: "#888" }}>No Preview</span>
        )}
      </div>

      <div style={{ ...styles.name, color: colors.textPrimary }}>
        {searchQuery ? (
          <HighlightedText
            text={item?.name || "Untitled"}
            highlight={searchQuery}
            theme={theme || "light"}
          />
        ) : (
          item?.name || "Untitled"
        )}
      </div>

      <button
        style={{
          ...styles.btn,
          background: colors.bgActive,
          color: colors.textActive,
          border: `1px solid ${colors.border}`,
          opacity: isLoading ? 0.7 : isHovered ? 1 : 0.95,
          cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => !isLoading && onInsert?.(item)}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? `Inserting ${item?.name || "component"}` : `Insert ${item?.name || "component"}`}
      >
        {isLoading && <LoadingSpinner color={colors.textActive} />}
        {isLoading ? "Inserting..." : "Insert"}
      </button>

      {/* Preview Tooltip - Rendered via portal to avoid overflow issues */}
      {/* Requirements: 10.1, 10.2, 10.3, 10.4, 10.5 */}
      {showPreview && cardRect && createPortal(
        <PreviewTooltip
          item={item}
          anchorRect={cardRect}
          theme={theme || "light"}
          onClose={handlePreviewClose}
        />,
        document.body
      )}
    </div>
  );
}

/**
 * Component styles using 4px-based spacing grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
const styles = {
  card: {
    border: "1px solid",
    borderRadius: "8px", // 8px = 2 * 4px
    padding: "12px", // 12px = 3 * 4px
    transition: "all 200ms ease, transform 200ms ease, box-shadow 200ms ease",
    cursor: "pointer",
  },
  preview: {
    height: "72px", // 72px = 18 * 4px (close to 70px but on grid)
    borderRadius: "4px", // 4px = 1 * 4px
    marginBottom: "8px", // 8px = 2 * 4px
  },
  name: {
    fontSize: "12px",
    marginBottom: "8px", // 8px = 2 * 4px
    fontWeight: "500" as const,
  },
  btn: {
    padding: "8px 12px", // 8px = 2 * 4px, 12px = 3 * 4px
    borderRadius: "4px", // 4px = 1 * 4px
    border: "none",
    cursor: "pointer",
    transition: "all 200ms ease, background-color 200ms ease, transform 150ms ease",
    fontSize: "12px",
    fontWeight: "500" as const,
    width: "100%",
  },
  favoriteButton: {
    position: "absolute" as const,
    top: "8px", // 8px = 2 * 4px
    right: "8px", // 8px = 2 * 4px
    width: "28px", // 28px = 7 * 4px
    height: "28px", // 28px = 7 * 4px
    borderRadius: "4px", // 4px = 1 * 4px
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 200ms ease, opacity 200ms ease, background-color 200ms ease",
    zIndex: 1,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
  },
};
