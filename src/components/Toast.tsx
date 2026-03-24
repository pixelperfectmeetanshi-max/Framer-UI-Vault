/**
 * Toast - Individual toast notification component
 * Requirements: 18.1, 18.2, 18.3, 18.6
 *
 * Displays a toast notification with message, type styling, and close button.
 * Supports success, error, and info visual styles.
 * Auto-dismisses after 3 seconds with manual dismiss option.
 */

import React, { useEffect, useCallback } from "react";
import { themes } from "../theme";
import type { ToastItem, Theme } from "../types";

/**
 * Props for the Toast component
 */
interface ToastProps {
  toast: ToastItem;
  theme: Theme;
  onDismiss: (id: string) => void;
}

/**
 * Auto-dismiss duration in milliseconds
 * Requirement 18.2: Auto-dismiss after 3 seconds
 */
const AUTO_DISMISS_DURATION = 3000;

/**
 * Toast component - Displays a single toast notification
 *
 * @example
 * ```tsx
 * <Toast
 *   toast={{ id: '1', message: 'Success!', type: 'success', createdAt: Date.now() }}
 *   theme="light"
 *   onDismiss={(id) => dismissToast(id)}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = ({ toast, theme, onDismiss }) => {
  const colors = themes[theme];

  /**
   * Handle manual dismiss
   * Requirement 18.3: Include close button for manual dismissal
   */
  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  /**
   * Auto-dismiss timer
   * Requirement 18.2: Auto-dismiss after 3 seconds
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, AUTO_DISMISS_DURATION);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  /**
   * Get background and text colors based on toast type
   * Requirement 18.6: Support different visual styles for success, error, and info states
   * Requirement 11.5: Support both light and dark themes matching Framer's appearance
   */
  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          background: colors.successBg,
          color: colors.successText,
          borderColor: colors.successBorder,
        };
      case "error":
        return {
          background: colors.errorBg,
          color: colors.errorText,
          borderColor: colors.errorBorder,
        };
      case "info":
        return {
          background: colors.infoBg,
          color: colors.infoText,
          borderColor: colors.infoBorder,
        };
      default:
        return {
          background: colors.infoBg,
          color: colors.infoText,
          borderColor: colors.infoBorder,
        };
    }
  };

  /**
   * Get icon based on toast type
   * Requirement 18.1: Display Toast_Notifications for success, error, and info messages
   */
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
        return "ℹ";
      default:
        return "ℹ";
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        ...styles.toast,
        background: typeStyles.background,
        color: typeStyles.color,
        borderLeft: `4px solid ${typeStyles.borderColor}`,
      }}
    >
      <span style={styles.icon} aria-hidden="true">
        {getIcon()}
      </span>
      <span style={styles.message}>{toast.message}</span>
      <button
        onClick={handleDismiss}
        style={{
          ...styles.closeButton,
          color: typeStyles.color,
        }}
        aria-label="Dismiss notification"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

/**
 * Toast styles using 4px-based spacing grid
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 * Requirement 11.3: Include subtle transition animations on interactive elements
 */
const styles: Record<string, React.CSSProperties> = {
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // 8px = 2 * 4px
    padding: "12px 16px", // 12px = 3 * 4px, 16px = 4 * 4px
    borderRadius: "8px", // 8px = 2 * 4px
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    minWidth: "280px", // 280px = 70 * 4px
    maxWidth: "400px", // 400px = 100 * 4px
    animation: "slideIn 200ms ease-out",
    transition: "all 200ms ease, opacity 200ms ease, transform 200ms ease",
  },
  icon: {
    fontSize: "14px",
    fontWeight: 600,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  closeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 600,
    padding: "0 4px", // 4px = 1 * 4px
    opacity: 0.7,
    transition: "opacity 200ms ease",
    flexShrink: 0,
    lineHeight: 1,
  },
};

export default Toast;
