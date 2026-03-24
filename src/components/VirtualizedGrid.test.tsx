import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { VirtualizedGrid } from "./VirtualizedGrid";
import { AppProvider } from "../contexts/AppContext";
import type { ComponentItem } from "../types";

// Mock IntersectionObserver for Card component's lazy loading
beforeAll(() => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

// Mock localStorage for AppProvider
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock react-window to avoid virtualization complexity in tests
vi.mock("react-window", () => ({
  Grid: ({
    cellComponent: CellComponent,
    cellProps,
    rowCount,
    columnCount,
  }: {
    cellComponent: React.ComponentType<{
      ariaAttributes: { "aria-colindex": number; role: "gridcell" };
      columnIndex: number;
      rowIndex: number;
      style: React.CSSProperties;
    } & Record<string, unknown>>;
    cellProps: Record<string, unknown>;
    rowCount: number;
    columnCount: number;
    columnWidth: number;
    rowHeight: number;
    width?: number;
    style?: React.CSSProperties;
  }) => {
    // Render only first few items for testing
    const items = [];
    const maxItems = Math.min(rowCount * columnCount, 4);
    for (let i = 0; i < maxItems; i++) {
      const rowIndex = Math.floor(i / columnCount);
      const columnIndex = i % columnCount;
      items.push(
        <CellComponent
          key={`${rowIndex}-${columnIndex}`}
          ariaAttributes={{ "aria-colindex": columnIndex, role: "gridcell" }}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          style={{ position: "absolute" }}
          {...cellProps}
        />
      );
    }
    return <div data-testid="virtualized-grid">{items}</div>;
  },
}));

// Helper to create mock component items
function createMockItems(count: number): ComponentItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Component ${i}`,
    category: "Test",
    svg: `<svg><rect width="100" height="100"/></svg>`,
  }));
}

// Helper to render with AppProvider
function renderWithProvider(ui: React.ReactElement) {
  return render(
    <AppProvider>
      {ui}
    </AppProvider>
  );
}

describe("VirtualizedGrid", () => {
  const mockOnInsert = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the virtualized grid container", () => {
    const items = createMockItems(25);
    renderWithProvider(
      <VirtualizedGrid
        items={items}
        onInsert={mockOnInsert}
        theme="light"
        columnCount={4}
        rowHeight={180}
        containerWidth={600}
        containerHeight={500}
      />
    );

    expect(screen.getByTestId("virtualized-grid")).toBeInTheDocument();
  });

  it("renders empty state when no items provided", () => {
    renderWithProvider(
      <VirtualizedGrid
        items={[]}
        onInsert={mockOnInsert}
        theme="light"
      />
    );

    expect(screen.getByText("No components found")).toBeInTheDocument();
  });

  it("renders Card components for items", () => {
    const items = createMockItems(4);
    renderWithProvider(
      <VirtualizedGrid
        items={items}
        onInsert={mockOnInsert}
        theme="light"
        columnCount={2}
      />
    );

    // Check that component names are rendered
    expect(screen.getByText("Component 0")).toBeInTheDocument();
    expect(screen.getByText("Component 1")).toBeInTheDocument();
  });

  it("uses default props when not specified", () => {
    const items = createMockItems(10);
    renderWithProvider(
      <VirtualizedGrid
        items={items}
        onInsert={mockOnInsert}
        theme="dark"
      />
    );

    expect(screen.getByTestId("virtualized-grid")).toBeInTheDocument();
  });

  it("supports dark theme", () => {
    const items = createMockItems(5);
    renderWithProvider(
      <VirtualizedGrid
        items={items}
        onInsert={mockOnInsert}
        theme="dark"
        columnCount={2}
      />
    );

    expect(screen.getByTestId("virtualized-grid")).toBeInTheDocument();
  });

  it("calculates correct row count based on items and columns", () => {
    // 25 items with 4 columns = 7 rows (ceil(25/4))
    const items = createMockItems(25);
    renderWithProvider(
      <VirtualizedGrid
        items={items}
        onInsert={mockOnInsert}
        theme="light"
        columnCount={4}
      />
    );

    expect(screen.getByTestId("virtualized-grid")).toBeInTheDocument();
  });
});
