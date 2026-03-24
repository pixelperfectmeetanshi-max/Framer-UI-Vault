/**
 * ToastContainer - Container component for rendering toast notifications
 * Requirements: 18.4, 18.5
 *
 * Renders all active toasts from the ToastContext.
 * Positioned fixed at the bottom-right of the viewport.
 * Stacks multiple toasts vertically.
 */

import React from "react";
import { Toast } from "./Toast";
import { useToast } from "../contexts/ToastContext";
import { useApp } from "../contexts/AppContext";

/**
 * ToastContainer component - Renders all active toast notifications
 *
 * Requirement 18.4: Position toasts consistently without obstructing UI
 * Requirement 18.5: Stack multiple toasts vertically
 *
 * @example
 * ```tsx
 * // Typically rendered at the root level of the app
 * <ToastContainer />
 * ```
 */
export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();
  const { theme } = useApp();

  // Don't render anything if there are no toasts
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      style={styles.container}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={styles.toastWrapper}>
          <Toast
            toast={toast}
            theme={theme}
            onDismiss={dismissToast}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Component styles
 * Requirement 18.4: Position consistently at bottom-right without obstructing UI
 * Requirement 18.5: Stack toasts vertically with gap
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 9999,
    pointerEvents: "none",
  },
  toastWrapper: {
    pointerEvents: "auto",
  },
};

export default ToastContainer;
