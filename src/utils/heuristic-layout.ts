import type { ParsedNode, NodeAttributes, StackProperties } from '../types/svg-parser';

// Re-export types for backward compatibility
export type { ParsedNode, NodeAttributes, StackProperties } from '../types/svg-parser';

/**
 * Checks if a rect or image element has valid required attributes
 * Requirement 4.2: Skip elements with missing required attributes
 * 
 * @param element - The SVG element to validate
 * @returns true if the element has valid width and height (> 0)
 */
function hasValidRectAttributes(element: Element): boolean {
    const width = element.getAttribute("width");
    const height = element.getAttribute("height");
    
    // Check if width and height exist and are valid positive numbers
    if (!width || !height) {
        return false;
    }
    
    const parsedWidth = parseFloat(width);
    const parsedHeight = parseFloat(height);
    
    return !isNaN(parsedWidth) && !isNaN(parsedHeight) && parsedWidth > 0 && parsedHeight > 0;
}
/**
 * Safely parses a numeric attribute, returning a default value if invalid
 * Requirement 4.5: Validate numeric attributes before parsing to prevent NaN values
 *
 * @param value - The string value to parse
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed number or the default value
 */
function safeParseFloat(value: string | null | undefined, defaultValue: number): number {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        console.warn(`[SVG Parser] Invalid numeric value: "${value}", using default: ${defaultValue}`);
        return defaultValue;
    }
    return parsed;
}



/**
 * Checks if a circle element has valid required attributes
 * Requirement 4.2: Skip elements with missing required attributes
 * 
 * @param element - The SVG element to validate
 * @returns true if the element has a valid radius (> 0)
 */
function hasValidCircleAttributes(element: Element): boolean {
    const r = element.getAttribute("r");
    
    // Check if radius exists and is a valid positive number
    if (!r) {
        return false;
    }
    
    const parsedR = parseFloat(r);
    
    return !isNaN(parsedR) && parsedR > 0;
}

/**
 * Logs a warning when an element is skipped due to missing attributes
 * Requirement 4.2: Log a warning and continue parsing
 * 
 * @param tagName - The tag name of the skipped element
 * @param reason - The reason for skipping
 */
function logSkippedElement(tagName: string, reason: string): void {
    console.warn(`[SVG Parser] Skipping <${tagName}> element: ${reason}`);
}

export function parseFlatNodes(svgNode: Element): ParsedNode[] {
    const parsedNodes: ParsedNode[] = [];
    
    // Deep query so we don't miss items inside <g> tags or other containers
    const children = Array.from(svgNode.querySelectorAll("rect, circle, text, image"));
    
    /**
     * Fallback color used when fill reference is invalid or cannot be resolved
     * Requirement 4.3: THE SVG_Parser SHALL use a fallback color for invalid fill references
     */
    const FALLBACK_FILL_COLOR = "#EAEAEA";

    /**
     * Helper to get cumulative transform offset from parent <g> elements
     * Parses transform="translate(x, y)" attributes up the DOM tree
     */
    const getParentTransformOffset = (element: Element): { offsetX: number; offsetY: number } => {
        let offsetX = 0;
        let offsetY = 0;
        let current = element.parentElement;
        
        while (current && current !== svgNode) {
            const transform = current.getAttribute("transform");
            if (transform) {
                // Parse translate(x, y) or translate(x)
                const translateMatch = transform.match(/translate\(\s*([+-]?\d*\.?\d+)\s*,?\s*([+-]?\d*\.?\d+)?\s*\)/);
                if (translateMatch && translateMatch[1]) {
                    offsetX += parseFloat(translateMatch[1]) || 0;
                    offsetY += parseFloat(translateMatch[2] ?? "0") || 0;
                }
            }
            current = current.parentElement;
        }
        
        return { offsetX, offsetY };
    };

    /**
     * Helper to extract a solid color from a url(#grad) or default transparent
     * Requirement 4.3: Use fallback color when fill reference is invalid
     * 
     * @param element - The SVG element to extract fill from
     * @returns The resolved fill color or fallback color
     */
    const resolveFill = (element: Element): string => {
        const fillStr = element.tagName === "image" 
            ? (element.getAttribute("href") || element.getAttribute("xlink:href")) 
            : (element.getAttribute("fill") || "transparent");
        
        if (!fillStr || fillStr === "none") return "transparent";
        
        if (fillStr.startsWith("url(")) {
            try {
                // Extract the ID from url(#id) format
                const match = fillStr.match(/url\(#([^)]+)\)/);
                if (!match || !match[1]) {
                    console.warn(`[SVG Parser] Invalid fill reference format: "${fillStr}", using fallback color`);
                    return FALLBACK_FILL_COLOR;
                }
                
                const id = match[1];
                
                // Validate ID is a valid CSS selector (no special characters that would break querySelector)
                // CSS ID selectors cannot start with a digit and must not contain certain special chars
                if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(id)) {
                    console.warn(`[SVG Parser] Invalid fill reference ID: "${id}", using fallback color`);
                    return FALLBACK_FILL_COLOR;
                }
                
                const referencedElement = svgNode.querySelector(`#${id}`);
                
                if (!referencedElement) {
                    console.warn(`[SVG Parser] Fill reference not found: "${id}", using fallback color`);
                    return FALLBACK_FILL_COLOR;
                }
                
                // Handle gradient references
                if (referencedElement.tagName.toLowerCase().includes("gradient")) {
                    const stops = referencedElement.querySelectorAll("stop");
                    if (stops.length > 0 && stops[0]) {
                        const stopColor = stops[0].getAttribute("stop-color");
                        if (stopColor) {
                            return stopColor;
                        }
                    }
                    // Gradient exists but has no valid stops
                    console.warn(`[SVG Parser] Gradient "${id}" has no valid stop colors, using fallback color`);
                    return FALLBACK_FILL_COLOR;
                }
                
                // Reference exists but is not a gradient (e.g., pattern, clipPath, etc.)
                console.warn(`[SVG Parser] Fill reference "${id}" is not a gradient, using fallback color`);
                return FALLBACK_FILL_COLOR;
            } catch (error) {
                // Handle any unexpected errors during fill resolution
                console.warn(`[SVG Parser] Error resolving fill reference "${fillStr}": ${error}, using fallback color`);
                return FALLBACK_FILL_COLOR;
            }
        }
        
        return fillStr;
    };

    let idCounter = 0;
    for (const child of children) {
        // Skip clip paths, defs, masks etc
        if (child.closest && (child.closest("defs") || child.closest("clipPath") || child.closest("pattern"))) {
            continue;
        }
        
        // Skip purely decorative abstract layout shapes
        if (child.classList && (child.classList.contains("mesh-bg") || child.classList.contains("float-obj"))) {
            continue;
        }

        if (child.tagName === "rect" || child.tagName === "image") {
            // Requirement 4.2: Skip elements with missing required attributes
            if (!hasValidRectAttributes(child)) {
                logSkippedElement(child.tagName, "missing or invalid width/height attributes");
                continue;
            }
            
            // Get parent transform offset for elements inside <g> groups
            const { offsetX, offsetY } = getParentTransformOffset(child);
            
            // Requirement 4.5: Validate numeric attributes before parsing to prevent NaN values
            const w = safeParseFloat(child.getAttribute("width"), 0);
            const h = safeParseFloat(child.getAttribute("height"), 0);
            const x = safeParseFloat(child.getAttribute("x"), 0) + offsetX;
            const y = safeParseFloat(child.getAttribute("y"), 0) + offsetY;
            const fillStr = resolveFill(child);
            parsedNodes.push({
                id: `node-${idCounter++}`,
                type: "rect",
                tagName: child.tagName,
                x, y, width: w, height: h, area: w * h,
                children: [],
                attributes: {
                    rx: child.getAttribute("rx") || (child.tagName === "image" ? "8" : "0"), // slight default rounded for images
                    fill: fillStr.startsWith("http") ? "transparent" : fillStr, // Images don't natively map to BG color easily across all APIs
                    imageUrl: fillStr.startsWith("http") ? fillStr : null,
                    strokeWidth: child.getAttribute("stroke-width") || "0",
                    stroke: child.getAttribute("stroke") || "none"
                }
            });
        } else if (child.tagName === "circle") {
            // Requirement 4.2: Skip elements with missing required attributes
            if (!hasValidCircleAttributes(child)) {
                logSkippedElement(child.tagName, "missing or invalid radius attribute");
                continue;
            }
            
            // Get parent transform offset for elements inside <g> groups
            const { offsetX, offsetY } = getParentTransformOffset(child);
            
            // Requirement 4.5: Validate numeric attributes before parsing to prevent NaN values
            const cx = safeParseFloat(child.getAttribute("cx"), 0) + offsetX;
            const cy = safeParseFloat(child.getAttribute("cy"), 0) + offsetY;
            const r = safeParseFloat(child.getAttribute("r"), 0);
            const w = r * 2;
            const h = r * 2;
            parsedNodes.push({
                id: `node-${idCounter++}`,
                type: "circle",
                tagName: "circle",
                x: cx - r, y: cy - r, width: w, height: h, area: w * h,
                children: [],
                attributes: {
                    fill: resolveFill(child),
                    strokeWidth: child.getAttribute("stroke-width") || "0",
                    stroke: child.getAttribute("stroke") || "none"
                }
            });
        } else if (child.tagName === "text") {
            // Get parent transform offset for elements inside <g> groups
            const { offsetX, offsetY } = getParentTransformOffset(child);
            
            // Requirement 4.5: Validate numeric attributes before parsing to prevent NaN values
            const x = safeParseFloat(child.getAttribute("x"), 0) + offsetX;
            const y = safeParseFloat(child.getAttribute("y"), 0) + offsetY;
            const fontSize = safeParseFloat(child.getAttribute("font-size"), 16);
            const textData = child.textContent || "Sample Text";
            
            // Heuristic width/height for text
            const w = textData.length * (fontSize * 0.6);
            const h = fontSize;
            const adjustedY = y - (fontSize * 0.85);

            parsedNodes.push({
                id: `node-${idCounter++}`,
                type: "text",
                tagName: "text",
                x: x, y: adjustedY, width: w, height: h, area: w * h,
                children: [],
                attributes: {
                    originalY: y,
                    fontSize: fontSize,
                    fontWeightStr: child.getAttribute("font-weight") || "400",
                    fontFamily: child.getAttribute("font-family") || "Inter, sans-serif",
                    textData: textData,
                    name: child.getAttribute("data-name") || "Text",
                    fill: child.getAttribute("fill") || "#111111",
                    strokeWidth: child.getAttribute("stroke-width") || "0",
                    stroke: child.getAttribute("stroke") || "none"
                }
            });
        }
    }
    return parsedNodes;
}
/**
 * Default dimensions for SVG elements without width/height attributes
 * Requirement 4.1: Use default dimensions of 1200x800 when attributes missing
 */
export const DEFAULT_SVG_WIDTH = 1200;
export const DEFAULT_SVG_HEIGHT = 800;

/**
 * Extracts dimensions from an SVG element, using defaults when attributes are missing
 * Requirement 4.1: THE SVG_Parser SHALL use default dimensions of 1200x800
 *
 * @param svgNode - The SVG element to extract dimensions from
 * @returns Object containing width and height values
 */
export function getSvgDimensions(svgNode: Element): { width: number; height: number } {
    const widthAttr = svgNode.getAttribute("width");
    const heightAttr = svgNode.getAttribute("height");
    const viewBoxAttr = svgNode.getAttribute("viewBox");

    // Parse width, using default if missing or invalid
    let width = DEFAULT_SVG_WIDTH;
    if (widthAttr) {
        const parsed = parseFloat(widthAttr);
        if (!isNaN(parsed) && parsed > 0) {
            width = parsed;
        }
    } else if (viewBoxAttr) {
        // Try to extract width from viewBox (format: "minX minY width height")
        const viewBoxParts = viewBoxAttr.split(/\s+/);
        if (viewBoxParts.length >= 4 && viewBoxParts[2]) {
            const parsed = parseFloat(viewBoxParts[2]);
            if (!isNaN(parsed) && parsed > 0) {
                width = parsed;
            }
        }
    }

    // Parse height, using default if missing or invalid
    let height = DEFAULT_SVG_HEIGHT;
    if (heightAttr) {
        const parsed = parseFloat(heightAttr);
        if (!isNaN(parsed) && parsed > 0) {
            height = parsed;
        }
    } else if (viewBoxAttr) {
        // Try to extract height from viewBox (format: "minX minY width height")
        const viewBoxParts = viewBoxAttr.split(/\s+/);
        if (viewBoxParts.length >= 4 && viewBoxParts[3]) {
            const parsed = parseFloat(viewBoxParts[3]);
            if (!isNaN(parsed) && parsed > 0) {
                height = parsed;
            }
        }
    }

    return { width, height };
}



function findSmallestContainingNode(candidates: ParsedNode[], node: ParsedNode, tolerance = 2): ParsedNode | null {
    let bestParent: ParsedNode | null = null;
    let smallestArea = Infinity;

    for (const candidate of candidates) {
        // Skip comparing a node to itself
        if (candidate.id === node.id) continue;

        let isContained = false;
        if (node.type === "text") {
            // Text width is purely a guess without a rendering engine. 
            // The bounds might easily overflow the candidate container on long sentences.
            // Instead of comparing full perimeter, check if the center point of the text is inside the candidate.
            const cx = node.x + (node.width / 2);
            const cy = node.y + (node.height / 2);
            isContained = 
                cx >= candidate.x && cx <= (candidate.x + candidate.width) &&
                cy >= candidate.y && cy <= (candidate.y + candidate.height);
        } else {
            isContained = 
                node.x >= (candidate.x - tolerance) &&
                node.y >= (candidate.y - tolerance) &&
                (node.x + node.width) <= (candidate.x + candidate.width + tolerance) &&
                (node.y + node.height) <= (candidate.y + candidate.height + tolerance);
        }

        if (isContained) {
            const deeperParent = findSmallestContainingNode(candidate.children, node, tolerance);
            if (deeperParent) {
                return deeperParent;
            } else if (candidate.area < smallestArea) {
                bestParent = candidate;
                smallestArea = candidate.area;
            }
        }
    }
    return bestParent;
}

export function buildHierarchy(flatNodes: ParsedNode[]): ParsedNode[] {
    // Sort largest to smallest to ensure parents are processed before children they might contain
    flatNodes.sort((a, b) => b.area - a.area);

    const roots: ParsedNode[] = [];

    for (const node of flatNodes) {
        const parent = findSmallestContainingNode(roots, node);
        if (parent) {
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    }

    // Sort children inside parents natively by Y then X to maintain ordered stacks
    const sortChildren = (nodes: ParsedNode[]) => {
        nodes.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
            return a.x - b.x;
        });
        for (const n of nodes) {
            sortChildren(n.children);
        }
    };
    sortChildren(roots);

    return roots;
}

export function inferStackProperties(node: ParsedNode): StackProperties {
    if (node.children.length === 0) return { position: "absolute" };

    const children = node.children;
    
    // Check if horizontal or vertical
    // Compare bounds of children
    let isHorizontal = true;
    let isVertical = true;

    for (let i = 0; i < children.length - 1; i++) {
        const curr = children[i];
        const next = children[i+1];
        
        // Safety check for undefined (shouldn't happen but TypeScript requires it)
        if (!curr || !next) continue;

        // If next item is strictly below the current item's bottom, it's a vertical
        if (next.y > curr.y + (curr.height * 0.5)) {
            isHorizontal = false;
        }
        // If next item is strictly to the right, it's horizontal
        if (next.x > curr.x + (curr.width * 0.5)) {
            isVertical = false;
        }
    }

    // Defaults
    const direction: 'horizontal' | 'vertical' = isHorizontal && !isVertical ? "horizontal" : "vertical";

    // Rough gap calculation
    let gap = 0;
    if (children.length > 1) {
        let totalGap = 0;
        for (let i = 0; i < children.length - 1; i++) {
            const currChild = children[i];
            const nextChild = children[i+1];
            
            // Safety check for undefined
            if (!currChild || !nextChild) continue;
            
            if (direction === "vertical") {
                totalGap += Math.max(0, nextChild.y - (currChild.y + currChild.height));
            } else {
                totalGap += Math.max(0, nextChild.x - (currChild.x + currChild.width));
            }
        }
        gap = Math.round(totalGap / (children.length - 1));
    }

    // Rough padding calculation against the parent
    const firstChild = children[0];
    const topPadding = firstChild ? Math.max(0, firstChild.y - node.y) : 0;
    const leftPadding = firstChild ? Math.max(0, firstChild.x - node.x) : 0;

    return {
        layout: "stack",
        stackDirection: direction,
        gap: `${gap}px` as `${number}px`,
        padding: `${Math.round(topPadding)}px ${Math.round(leftPadding)}px ${Math.round(topPadding)}px ${Math.round(leftPadding)}px` as `${number}px ${number}px ${number}px ${number}px`,
        // Default stack distribution/alignment (Framer handles this natively nicely)
        stackDistribution: "start",
        stackAlignment: "start",
        position: "absolute" // The parent itself might still be randomly placed within its container
    };
}
