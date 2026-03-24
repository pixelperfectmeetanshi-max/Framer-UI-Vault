import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockSearchInputRef: { current: HTMLInputElement | null };
  let mockOnClearSearch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a mock input element
    const mockInput = document.createElement('input');
    mockInput.focus = vi.fn();
    mockInput.blur = vi.fn();
    mockInput.select = vi.fn();
    mockSearchInputRef = { current: mockInput };
    mockOnClearSearch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Cmd/Ctrl+F shortcut (Requirement 17.1)', () => {
    it('should focus search input on Cmd+F (Mac)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockSearchInputRef.current?.focus).toHaveBeenCalled();
      expect(mockSearchInputRef.current?.select).toHaveBeenCalled();
    });

    it('should focus search input on Ctrl+F (Windows/Linux)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockSearchInputRef.current?.focus).toHaveBeenCalled();
      expect(mockSearchInputRef.current?.select).toHaveBeenCalled();
    });

    it('should not focus search input on plain F key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(mockSearchInputRef.current?.focus).not.toHaveBeenCalled();
    });
  });

  describe('Escape shortcut (Requirement 17.2)', () => {
    it('should clear search when search input is focused and has content', () => {
      // Simulate the search input being focused
      Object.defineProperty(document, 'activeElement', {
        value: mockSearchInputRef.current,
        configurable: true,
      });

      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: 'test query',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockOnClearSearch).toHaveBeenCalled();

      // Clean up
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true,
      });
    });

    it('should blur input when search input is focused but empty', () => {
      // Simulate the search input being focused
      Object.defineProperty(document, 'activeElement', {
        value: mockSearchInputRef.current,
        configurable: true,
      });

      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockSearchInputRef.current?.blur).toHaveBeenCalled();
      // Should not call onClearSearch since search is already empty
      expect(mockOnClearSearch).not.toHaveBeenCalled();

      // Clean up
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true,
      });
    });

    it('should not clear search when search is empty and input is not focused', () => {
      // Ensure activeElement is not the search input
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true,
      });

      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(mockOnClearSearch).not.toHaveBeenCalled();
    });
  });

  describe('Escape shortcut - Grid selection clear (Requirement 6.5)', () => {
    it('should call onClearSelection and focus search when focus is elsewhere', () => {
      const mockOnClearSelection = vi.fn();
      
      // Ensure activeElement is not the search input (simulating focus on a card)
      Object.defineProperty(document, 'activeElement', {
        value: document.body,
        configurable: true,
      });

      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
          onClearSelection: mockOnClearSelection,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockOnClearSelection).toHaveBeenCalled();
      expect(mockSearchInputRef.current?.focus).toHaveBeenCalled();
    });
  });

  describe('enabled option', () => {
    it('should not respond to shortcuts when disabled', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: 'test',
          onClearSearch: mockOnClearSearch,
          enabled: false,
        })
      );

      // Try Cmd+F
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'f',
          metaKey: true,
          bubbles: true,
        })
      );

      expect(mockSearchInputRef.current?.focus).not.toHaveBeenCalled();

      // Try Escape
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        })
      );

      expect(mockOnClearSearch).not.toHaveBeenCalled();
    });
  });

  describe('No conflicts with Framer shortcuts (Requirement 17.5)', () => {
    it('should not interfere with Cmd+Z (undo)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockSearchInputRef.current?.focus).not.toHaveBeenCalled();
    });

    it('should not interfere with Cmd+C (copy)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'c',
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should not interfere with Cmd+V (paste)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'v',
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should not interfere with Cmd+S (save)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({
          searchInputRef: mockSearchInputRef,
          searchQuery: '',
          onClearSearch: mockOnClearSearch,
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });
});
