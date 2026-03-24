/**
 * ToastContext - Context provider for managing toast notifications
 * Requirements: 18.1, 18.6
 * 
 * Provides toast state management with showToast and dismissToast functions.
 * Supports success, error, and info toast types.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ToastItem, ToastType } from '../types';

/**
 * Context value interface for toast management
 */
interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type: ToastType) => void;
  dismissToast: (id: string) => void;
}

// Create context with undefined default (will be provided by ToastProvider)
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Generate a unique ID for toast notifications
 */
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Props for the ToastProvider component
 */
interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * ToastProvider - Provides toast notification state and actions to the component tree
 * 
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /**
   * Show a new toast notification
   * Requirement 18.1: Support success, error, and info toast types
   * Requirement 18.6: Support different visual styles for success, error, and info states
   */
  const showToast = useCallback((message: string, type: ToastType) => {
    const newToast: ToastItem = {
      id: generateToastId(),
      message,
      type,
      createdAt: Date.now(),
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  /**
   * Dismiss a toast notification by ID
   * Used for both manual dismissal and auto-dismiss
   */
  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toasts,
      showToast,
      dismissToast,
    }),
    [toasts, showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Custom hook to access toast context
 * Throws an error if used outside of ToastProvider
 * 
 * @example
 * ```tsx
 * const { showToast, dismissToast, toasts } = useToast();
 * showToast('Component inserted successfully!', 'success');
 * ```
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

// Export context for testing purposes
export { ToastContext };
