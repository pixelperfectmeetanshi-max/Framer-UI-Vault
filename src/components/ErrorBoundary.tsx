import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ErrorBoundary component for catching JavaScript errors in child components
 * Requirements: 2.1, 2.5
 * 
 * Supports configurable fallback UI for different levels:
 * - 'app': Full application error with recovery UI
 * - 'card': Compact error message within card bounds
 */

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level: 'app' | 'card';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default fallback UI for app-level errors
 * Displays a recovery UI with retry button
 */
const AppLevelFallback: React.FC<{ error: Error | null; onRetry: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '24px',
      textAlign: 'center',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        marginBottom: '16px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h2
      style={{
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: 600,
      }}
    >
      Something went wrong
    </h2>
    <p
      style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: '#a1a1aa',
        maxWidth: '300px',
      }}
    >
      {error?.message || 'An unexpected error occurred. Please try again.'}
    </p>
    <button
      onClick={onRetry}
      style={{
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#3b82f6';
      }}
    >
      Try Again
    </button>
  </div>
);

/**
 * Default fallback UI for card-level errors
 * Displays a compact error message within card bounds
 */
const CardLevelFallback: React.FC<{ error: Error | null }> = ({ error }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '120px',
      padding: '12px',
      textAlign: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    }}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ef4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginBottom: '8px' }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span
      style={{
        fontSize: '12px',
        color: '#ef4444',
        fontWeight: 500,
      }}
    >
      Failed to load
    </span>
    {error?.message && (
      <span
        style={{
          fontSize: '11px',
          color: '#a1a1aa',
          marginTop: '4px',
          maxWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={error.message}
      >
        {error.message}
      </span>
    )}
  </div>
);

/**
 * ErrorBoundary class component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI.
   * Requirement 2.5: Error boundary catches errors during rendering
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details to console
   * Requirement 2.5: IF an error occurs during rendering, THEN THE Error_Boundary SHALL log the error details to the console
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo.componentStack);

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error state to allow retry
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, level } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Use level-specific default fallback
      if (level === 'app') {
        return <AppLevelFallback error={error} onRetry={this.handleRetry} />;
      }

      return <CardLevelFallback error={error} />;
    }

    return children;
  }
}

export default ErrorBoundary;
