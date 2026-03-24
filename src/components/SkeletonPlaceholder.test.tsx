import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SkeletonPlaceholder } from "./SkeletonPlaceholder";
import Card from "./Card";
import type { ComponentItem } from "../types";

describe("SkeletonPlaceholder", () => {
  it("renders with default props", () => {
    render(<SkeletonPlaceholder />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-label", "Loading content");
  });

  it("renders with light theme", () => {
    render(<SkeletonPlaceholder theme="light" />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders with dark theme", () => {
    render(<SkeletonPlaceholder theme="dark" />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
  });

  it("applies custom width and height", () => {
    render(<SkeletonPlaceholder width={200} height={100} />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveStyle({ width: "200px", height: "100px" });
  });

  it("applies string width and height", () => {
    render(<SkeletonPlaceholder width="50%" height="80px" />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveStyle({ width: "50%", height: "80px" });
  });
});

describe("Card lazy loading", () => {
  const mockItem: ComponentItem = {
    id: "test-1",
    name: "Test Component",
    category: "Test",
    svg: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>',
  };

  const mockOnInsert = vi.fn();

  // Mock IntersectionObserver
  let intersectionCallback: IntersectionObserverCallback;
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockOnInsert.mockClear();

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
        root: null,
        rootMargin: "",
        thresholds: [],
        takeRecords: () => [],
      };
    }) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows skeleton placeholder initially before intersection", () => {
    render(<Card item={mockItem} onInsert={mockOnInsert} theme="light" />);
    
    // Should show skeleton initially (not visible yet)
    const skeleton = screen.getByRole("status");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-label", "Loading content");
  });

  it("sets up IntersectionObserver on mount", () => {
    render(<Card item={mockItem} onInsert={mockOnInsert} theme="light" />);
    
    expect(global.IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  it("loads SVG content when card becomes visible", async () => {
    render(<Card item={mockItem} onInsert={mockOnInsert} theme="light" />);
    
    // Initially shows skeleton
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Simulate intersection (card becomes visible) wrapped in act
    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    // Advance timers to trigger the loading delay wrapped in act
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // After visibility and loading, skeleton should be gone and SVG should be rendered
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("disconnects observer after becoming visible", async () => {
    render(<Card item={mockItem} onInsert={mockOnInsert} theme="light" />);
    
    // Simulate intersection wrapped in act
    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("shows 'No Preview' when item has no SVG and is visible", async () => {
    const itemWithoutSvg: ComponentItem = {
      id: "test-2",
      name: "No SVG Component",
      category: "Test",
      svg: "",
    };

    render(<Card item={itemWithoutSvg} onInsert={mockOnInsert} theme="light" />);
    
    // Simulate intersection wrapped in act
    await act(async () => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    // Advance timers wrapped in act
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText("No Preview")).toBeInTheDocument();
  });

  it("renders component name correctly", () => {
    render(<Card item={mockItem} onInsert={mockOnInsert} theme="light" />);
    expect(screen.getByText("Test Component")).toBeInTheDocument();
  });

  it("renders 'Untitled' when item has no name", () => {
    const itemWithoutName = { ...mockItem, name: "" };
    render(<Card item={itemWithoutName} onInsert={mockOnInsert} theme="light" />);
    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });
});
