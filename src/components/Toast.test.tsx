/**
 * Unit tests for Toast and ToastContainer components
 * Requirements: 18.2, 18.3, 18.5
 *
 * Tests:
 * - Auto-dismiss timing (18.2)
 * - Manual dismiss functionality (18.3)
 * - Toast stacking behavior (18.5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Toast } from './Toast';
import { ToastContainer } from './ToastContainer';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { AppProvider } from '../contexts/AppContext';
import type { ToastItem } from '../types';

// Helper to create a toast item
const createToast = (overrides: Partial<ToastItem> = {}): ToastItem => ({
  id: 'test-toast-1',
  message: 'Test message',
  type: 'success',
  createdAt: Date.now(),
  ...overrides,
});

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AppProvider>
);

describe('Toast Component', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  describe('Rendering', () => {
    it('renders toast message correctly', () => {
      const toast = createToast({ message: 'Component inserted!' });
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('Component inserted!')).toBeInTheDocument();
    });

    it('renders success toast with correct icon', () => {
      const toast = createToast({ type: 'success' });
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders error toast with correct icon', () => {
      const toast = createToast({ type: 'error' });
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('renders info toast with correct icon', () => {
      const toast = createToast({ type: 'info' });
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('ℹ')).toBeInTheDocument();
    });

    it('renders close button with accessible label', () => {
      const toast = createToast();
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();
    });

    it('has role="alert" for accessibility', () => {
      const toast = createToast();
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  /**
   * Requirement 18.2: Auto-dismiss after 3 seconds
   */
  describe('Auto-dismiss timing', () => {
    it('auto-dismisses after 3 seconds', () => {
      const toast = createToast();
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      // Should not be dismissed immediately
      expect(mockOnDismiss).not.toHaveBeenCalled();
      
      // Advance time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      // Should be dismissed after 3 seconds
      expect(mockOnDismiss).toHaveBeenCalledWith(toast.id);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss before 3 seconds', () => {
      const toast = createToast();
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      // Advance time by 2.9 seconds
      act(() => {
        vi.advanceTimersByTime(2900);
      });
      
      // Should not be dismissed yet
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('clears timer on unmount', () => {
      const toast = createToast();
      const { unmount } = render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      // Unmount before timer fires
      unmount();
      
      // Advance time past auto-dismiss duration
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should not have been called since component unmounted
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  /**
   * Requirement 18.3: Manual dismiss functionality
   */
  describe('Manual dismiss functionality', () => {
    it('dismisses when close button is clicked', () => {
      const toast = createToast();
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      const closeButton = screen.getByRole('button', { name: /dismiss notification/i });
      fireEvent.click(closeButton);
      
      expect(mockOnDismiss).toHaveBeenCalledWith(toast.id);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('can be dismissed manually before auto-dismiss', () => {
      const toast = createToast();
      render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Manually dismiss
      const closeButton = screen.getByRole('button', { name: /dismiss notification/i });
      fireEvent.click(closeButton);
      
      expect(mockOnDismiss).toHaveBeenCalledWith(toast.id);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme support', () => {
    it('renders correctly with light theme', () => {
      const toast = createToast({ type: 'success' });
      const { container } = render(<Toast toast={toast} theme="light" onDismiss={mockOnDismiss} />);
      
      // Toast should render without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders correctly with dark theme', () => {
      const toast = createToast({ type: 'success' });
      const { container } = render(<Toast toast={toast} theme="dark" onDismiss={mockOnDismiss} />);
      
      // Toast should render without errors
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});


describe('ToastContainer Component', () => {
  /**
   * Requirement 18.5: Stack multiple toasts vertically
   */
  describe('Toast stacking behavior', () => {
    // Helper component to trigger toasts
    const ToastTrigger: React.FC<{ toasts: Array<{ message: string; type: 'success' | 'error' | 'info' }> }> = ({ toasts }) => {
      const { showToast } = useToast();
      
      React.useEffect(() => {
        toasts.forEach(({ message, type }) => {
          showToast(message, type);
        });
      }, []);
      
      return null;
    };

    it('renders nothing when there are no toasts', () => {
      const { container } = render(
        <TestWrapper>
          <ToastContainer />
        </TestWrapper>
      );
      
      // Container should not render when empty
      expect(container.querySelector('[role="region"]')).not.toBeInTheDocument();
    });

    it('renders single toast correctly', () => {
      render(
        <TestWrapper>
          <ToastTrigger toasts={[{ message: 'Single toast', type: 'success' }]} />
          <ToastContainer />
        </TestWrapper>
      );
      
      expect(screen.getByText('Single toast')).toBeInTheDocument();
    });

    it('stacks multiple toasts vertically', () => {
      render(
        <TestWrapper>
          <ToastTrigger toasts={[
            { message: 'First toast', type: 'success' },
            { message: 'Second toast', type: 'error' },
            { message: 'Third toast', type: 'info' },
          ]} />
          <ToastContainer />
        </TestWrapper>
      );
      
      // All toasts should be visible
      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
      expect(screen.getByText('Third toast')).toBeInTheDocument();
      
      // All toasts should have role="alert"
      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(3);
    });

    it('removes toast when dismissed', () => {
      render(
        <TestWrapper>
          <ToastTrigger toasts={[
            { message: 'Toast to dismiss', type: 'success' },
            { message: 'Toast to keep', type: 'info' },
          ]} />
          <ToastContainer />
        </TestWrapper>
      );
      
      // Both toasts should be visible initially
      expect(screen.getByText('Toast to dismiss')).toBeInTheDocument();
      expect(screen.getByText('Toast to keep')).toBeInTheDocument();
      
      // Dismiss the first toast
      const closeButtons = screen.getAllByRole('button', { name: /dismiss notification/i });
      fireEvent.click(closeButtons[0]);
      
      // First toast should be removed, second should remain
      expect(screen.queryByText('Toast to dismiss')).not.toBeInTheDocument();
      expect(screen.getByText('Toast to keep')).toBeInTheDocument();
    });

    it('auto-dismisses toasts in stack after 3 seconds', () => {
      render(
        <TestWrapper>
          <ToastTrigger toasts={[
            { message: 'Auto-dismiss 1', type: 'success' },
            { message: 'Auto-dismiss 2', type: 'error' },
          ]} />
          <ToastContainer />
        </TestWrapper>
      );
      
      // Both toasts should be visible initially
      expect(screen.getByText('Auto-dismiss 1')).toBeInTheDocument();
      expect(screen.getByText('Auto-dismiss 2')).toBeInTheDocument();
      
      // Advance time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      // Both toasts should be dismissed
      expect(screen.queryByText('Auto-dismiss 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Auto-dismiss 2')).not.toBeInTheDocument();
    });

    it('has accessible region role', () => {
      render(
        <TestWrapper>
          <ToastTrigger toasts={[{ message: 'Accessible toast', type: 'success' }]} />
          <ToastContainer />
        </TestWrapper>
      );
      
      expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
    });
  });
});

describe('ToastContext Integration', () => {
  // Helper component to test context
  const ToastContextTester: React.FC = () => {
    const { toasts, showToast, dismissToast } = useToast();
    
    return (
      <div>
        <button onClick={() => showToast('Test message', 'success')}>Show Toast</button>
        <button onClick={() => toasts.length > 0 && dismissToast(toasts[0].id)}>Dismiss First</button>
        <div data-testid="toast-count">{toasts.length}</div>
      </div>
    );
  };

  it('showToast adds a new toast', () => {
    render(
      <TestWrapper>
        <ToastContextTester />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    
    fireEvent.click(screen.getByText('Show Toast'));
    
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('dismissToast removes a toast', () => {
    render(
      <TestWrapper>
        <ToastContextTester />
      </TestWrapper>
    );
    
    // Add a toast
    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    
    // Dismiss it
    fireEvent.click(screen.getByText('Dismiss First'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const InvalidComponent = () => {
      useToast();
      return null;
    };
    
    expect(() => render(<InvalidComponent />)).toThrow('useToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });
});
