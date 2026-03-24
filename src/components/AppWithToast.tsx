/**
 * AppWithToast - Wrapper component that integrates toast notifications with insert operations
 * Requirements: 3.3, 3.4, 3.5, 9.1
 *
 * This component wraps the main App and provides an insert handler that:
 * - Shows success toast on successful insert (Requirement 3.3)
 * - Shows error toast with descriptive message on failure (Requirement 3.4)
 * - Shows specific message for SVG parsing failures (Requirement 3.5)
 * - Tracks recently inserted components (Requirement 9.1)
 */

import React, { useCallback, useRef, useEffect } from "react";
import App from "../App";
import { useToast } from "../contexts/ToastContext";
import { useApp } from "../contexts/AppContext";
import { useThemeColor } from "../contexts/ThemeColorContext";
import {
  parseFlatNodes,
  buildHierarchy,
  inferStackProperties,
  getSvgDimensions,
  ParsedNode,
} from "../utils/heuristic-layout";
import type { ComponentItem } from "../types";

// Dynamic import for framer-plugin to avoid top-level await issues in browsers
type FramerAPI = typeof import("framer-plugin").framer;
let framerInstance: FramerAPI | null = null;

async function getFramer(): Promise<FramerAPI | null> {
  if (framerInstance) return framerInstance;
  try {
    const module = await import("framer-plugin");
    framerInstance = module.framer;
    return framerInstance;
  } catch (e) {
    console.log("Running outside Framer context");
    return null;
  }
}

/**
 * Component URL mappings for Framer Code Components
 * Currently disabled - using SVG skeleton approach instead for reliable layout
 */
const componentUrls: Record<string, string> = {
  // Disabled: 'header-12': 'https://framer.com/m/Header-iXrOqR.js@LeuVPstRQxHscwYEKTrK',
};

/**
 * Insert Header as native Framer frames with proper layout
 * This creates fully editable native frames using Framer's layout system
 */
async function insertHeaderAsNativeFrames(
  item: ComponentItem
): Promise<{ success: boolean; message: string; nodeId?: string }> {
  try {
    const framer = await getFramer();
    if (!framer) {
      return { success: false, message: "Framer API not available" };
    }
    
    console.log('[AppWithToast] Creating native Framer frames for header');

    // Create outer wrapper (background)
    const wrapper = await framer.createFrameNode({
      name: item.name,
      width: "1fr",
      backgroundColor: "#F5F7FB",
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 40,
      paddingRight: 40,
    } as any);

    if (!wrapper?.id) {
      return { success: false, message: "Failed to create wrapper frame" };
    }

    // Create card container
    const card = await framer.createFrameNode({
      name: "Card",
      width: "1fr",
      backgroundColor: "#FFFFFF",
      paddingLeft: 40,
      paddingRight: 40,
    } as any, wrapper.id);

    if (!card?.id) {
      return { success: false, message: "Failed to create card frame" };
    }

    // Create Logo text
    const logoText = await framer.addText("Logo") as unknown as { id: string } | null;
    if (logoText?.id) {
      await framer.setParent(logoText.id, card.id);
      await framer.setAttributes(logoText.id, {
        name: "Logo",
        fontSize: 20,
        fontWeight: 600,
        color: "#111111",
      } as any);
    }

    // Create Nav container
    const nav = await framer.createFrameNode({
      name: "Nav",
      backgroundColor: "transparent",
    } as any, card.id);

    if (nav?.id) {
      // Add nav items
      const navItems = ["Home", "Product", "Pricing", "Docs", "Contact"];
      for (const navItem of navItems) {
        const navText = await framer.addText(navItem) as unknown as { id: string } | null;
        if (navText?.id) {
          await framer.setParent(navText.id, nav.id);
          await framer.setAttributes(navText.id, {
            name: navItem,
            fontSize: 15,
            color: "#444444",
          } as any);
        }
      }
    }

    // Create CTA button frame
    const ctaButton = await framer.createFrameNode({
      name: "CTA Button",
      backgroundColor: "#6366F1",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 24,
      paddingRight: 24,
    } as any, card.id);

    if (ctaButton?.id) {
      // Add CTA text
      const ctaText = await framer.addText("Get Started") as unknown as { id: string } | null;
      if (ctaText?.id) {
        await framer.setParent(ctaText.id, ctaButton.id);
        await framer.setAttributes(ctaText.id, {
          name: "CTA Text",
          fontSize: 15,
          fontWeight: 500,
          color: "#FFFFFF",
        } as any);
      }
    }

    return {
      success: true,
      message: `Inserted "${item.name}" as native editable frames`,
      nodeId: wrapper.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[AppWithToast] Native frame insertion error:", error);
    return {
      success: false,
      message: `Failed to insert native frames: ${errorMessage}`,
    };
  }
}

/**
 * Insert a parsed node recursively into Framer canvas
 * Note: We use type assertions for Framer API properties that have strict types
 * but accept string values at runtime (borderRadius, border)
 */
async function insertParsedNode(
  node: ParsedNode,
  parentId: string,
  parentX: number = 0,
  parentY: number = 0
) {
  const framer = await getFramer();
  if (!framer) return null;
  
  let createdNodeId = null;

  if (node.type === "rect") {
    const layoutProps = inferStackProperties(node);
    const hasStack = node.children.length > 0;

    // Build border property only if stroke is defined
    const borderProp = node.attributes.strokeWidth !== "0" &&
      node.attributes.stroke !== "none"
        ? { border: `${node.attributes.strokeWidth}px solid ${node.attributes.stroke}` as unknown as undefined }
        : {};

    const frameNode = await framer.createFrameNode(
      {
        name: hasStack ? "Stack" : "Rectangle",
        width: `${node.width}px`,
        height: `${node.height}px`,
        left: `${node.x - parentX}px`,
        top: `${node.y - parentY}px`,
        borderRadius: `${node.attributes.rx ?? 0}px` as unknown as undefined,
        backgroundColor: node.attributes.fill,
        ...borderProp,
        ...(hasStack ? layoutProps : { position: "absolute" }),
      },
      parentId
    );

    if (frameNode) createdNodeId = frameNode.id;
  } else if (node.type === "circle") {
    // Build border property only if stroke is defined
    const borderProp = node.attributes.strokeWidth !== "0" &&
      node.attributes.stroke !== "none"
        ? { border: `${node.attributes.strokeWidth}px solid ${node.attributes.stroke}` as unknown as undefined }
        : {};

    const frameNode = await framer.createFrameNode(
      {
        name: "Circle/Avatar",
        width: `${node.width}px`,
        height: `${node.height}px`,
        left: `${node.x - parentX}px`,
        top: `${node.y - parentY}px`,
        borderRadius: "50%" as unknown as undefined,
        backgroundColor: node.attributes.fill,
        ...borderProp,
        position: "absolute",
      },
      parentId
    );
    if (frameNode) createdNodeId = frameNode.id;
  } else if (node.type === "text") {
    await framer.setSelection([parentId]);
    const textContent = node.attributes.textData ?? "Sample Text";
    await framer.addText(textContent);

    const currentSelection = await framer.getSelection();
    if (
      currentSelection.length > 0 &&
      currentSelection[0] &&
      (currentSelection[0] as any).text
    ) {
      const newTextNode = currentSelection[0];
      await framer.setParent(newTextNode.id, parentId);

      await framer.setAttributes(newTextNode.id, {
        name: node.attributes.name,
        left: `${node.x}px`,
        top: `${node.y}px`,
        color: node.attributes.fill,
        fill: node.attributes.fill,
        fontSize: node.attributes.fontSize,
        position: "relative",
      } as any);
      createdNodeId = newTextNode.id;
    }
  }

  // Recurse for children
  if (createdNodeId && node.children.length > 0) {
    for (const child of node.children) {
      await insertParsedNode(child, createdNodeId, node.x, node.y);
    }
  }
  
  return createdNodeId;
}

/**
 * Insert component using Framer Code Component URL
 * Uses addComponentInstance to insert as a live component with property controls
 */
async function insertAsFramerComponent(
  item: ComponentItem,
  componentUrl: string
): Promise<{ success: boolean; message: string; nodeId?: string }> {
  try {
    const framer = await getFramer();
    if (!framer) {
      return { success: false, message: "Framer API not available" };
    }
    
    console.log('[AppWithToast] Attempting addComponentInstance with URL:', componentUrl);
    
    // Use addComponentInstance - inserts as a live component instance
    // The component has property controls so users can edit text, colors, etc. in Framer's right panel
    if (typeof framer.addComponentInstance === 'function') {
      const result = await framer.addComponentInstance({
        url: componentUrl,
      });
      
      console.log('[AppWithToast] addComponentInstance result:', result);
      
      if (result?.id) {
        return {
          success: true,
          message: `Inserted "${item.name}" - edit properties in right panel`,
          nodeId: result.id,
        };
      }
      
      return {
        success: false,
        message: 'addComponentInstance returned no result',
      };
    }
    
    console.log('[AppWithToast] addComponentInstance not available');
    
    return {
      success: false,
      message: 'addComponentInstance not available - check plugin permissions',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AppWithToast] Component insertion error:', error);
    return {
      success: false,
      message: `Failed to insert component: ${errorMessage}`,
    };
  }
}

/**
 * AppWithToast component - Wraps App with toast-integrated insert handler
 *
 * Requirement 3.3: Show success toast on successful insert
 * Requirement 3.4: Show error toast with descriptive message on failure
 * Requirement 3.5: Show specific message for SVG parsing failures
 * Requirement 9.1: Track the last 10 inserted components
 */
export const AppWithToast: React.FC = () => {
  const { showToast } = useToast();
  const { addToRecentlyUsed } = useApp();
  const { getTransformedSvg } = useThemeColor();
  const framerRef = useRef<FramerAPI | null>(null);

  // Initialize framer on mount
  useEffect(() => {
    getFramer().then((f) => {
      framerRef.current = f;
    });
  }, []);

  /**
   * Insert component with native Framer SVG fallback
   * Shows appropriate toast notification based on result
   * Requirement 9.1: Track recently inserted components
   * Requirement 4.1: Apply theme color transformations before insertion
   */
  const insertWithNativeFallback = useCallback(
    async (svg: string, name: string, reason: string, item: ComponentItem): Promise<void> => {
      const framer = framerRef.current || await getFramer();
      if (!framer) {
        showToast("Framer API not available - running in preview mode", "error");
        return;
      }
      
      console.log(`[SVG Fallback] Using native Framer SVG insertion: ${reason}`);
      // Apply theme color transformation before insertion
      const transformedSvg = getTransformedSvg(svg);
      await framer.addSVG({ svg: transformedSvg, name });
      framer.notify(`✅ Inserted ${name} with all complex vector graphic details!`);
      showToast(`Inserted "${name}" successfully`, "success");
      // Track recently used component (Requirement 9.1)
      addToRecentlyUsed(item);
    },
    [showToast, addToRecentlyUsed, getTransformedSvg]
  );

  /**
   * Handle insert operation with toast notifications
   * Requirement 3.3: Show success toast on successful insert
   * Requirement 3.4: Show error toast with descriptive message on failure
   * Requirement 3.5: Show specific message for SVG parsing failures
   * Requirement 9.1: Track the last 10 inserted components
   */
  const handleInsert = useCallback(
    async (item: ComponentItem) => {
      const framer = framerRef.current || await getFramer();
      if (!framer) {
        showToast("Framer API not available - running in preview mode", "error");
        return;
      }
      
      // Check if this component has a Framer Code Component URL
      // Use addComponentInstance for proper layout preservation
      const componentUrl = componentUrls[item.id];
      if (componentUrl) {
        console.log(`[AppWithToast] Component ${item.id} has URL, using addComponentInstance`);
        const result = await insertAsFramerComponent(item, componentUrl);
        
        if (result.success) {
          framer.notify(`✅ Inserted ${item.name} - edit via properties panel`);
          showToast(`Inserted "${item.name}" successfully`, "success");
          addToRecentlyUsed(item);
          return;
        }
        
        // If component insertion fails, fall through to SVG insertion
        console.log('[AppWithToast] Component insertion failed, falling back to SVG:', result.message);
        showToast(`Component insert failed: ${result.message}, trying SVG fallback...`, "error");
      }

      if (item.svg) {
        try {
          // Apply theme color transformation before parsing and insertion
          const transformedSvg = getTransformedSvg(item.svg);
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(transformedSvg, "image/svg+xml");
          const svgNode = doc.querySelector("svg");

          // Check for XML parsing errors
          // Requirement 3.5: Show specific message for SVG parsing failures
          const parseError = doc.querySelector("parsererror");
          if (parseError || !svgNode) {
            showToast(
              `Failed to parse SVG for "${item.name}": Invalid SVG markup`,
              "error"
            );
            console.error("[SVG Insert] SVG parsing failed - invalid SVG markup");
            return;
          }

          // Check if this layout contains complex vector graphics
          const hasComplexVectors =
            svgNode.querySelectorAll("path, ellipse, polygon, line").length > 0;
          if (hasComplexVectors) {
            await insertWithNativeFallback(
              transformedSvg,
              item.name,
              "Complex vector graphics detected (paths, ellipses, polygons, or lines)",
              item
            );
            return;
          }

          // Get SVG dimensions with default handling (Requirement 4.1)
          const { width, height } = getSvgDimensions(svgNode);

          // Parse flat nodes from SVG
          const flatNodes = parseFlatNodes(svgNode);

          // Requirement 4.4: Fall back to native Framer SVG insertion when parsing fails
          if (flatNodes.length === 0) {
            await insertWithNativeFallback(
              transformedSvg,
              item.name,
              "Heuristic parser failed to parse any elements",
              item
            );
            return;
          }

          const parentNode = await framer.createFrameNode({
            name: item.name,
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: "transparent",
          });

          if (!parentNode) {
            await insertWithNativeFallback(
              transformedSvg,
              item.name,
              "Failed to create parent frame node",
              item
            );
            return;
          }

          const hierarchy = buildHierarchy(flatNodes);

          for (const rootNode of hierarchy) {
            await insertParsedNode(rootNode, parentNode.id);
          }

          framer.notify(
            `✅ Inserted ${item.name} perfectly! Fully natively editable.`
          );
          // Requirement 3.3: Show success toast on successful insert
          showToast(`Inserted "${item.name}" successfully`, "success");
          // Requirement 9.1: Track recently inserted components
          addToRecentlyUsed(item);
        } catch (e) {
          // Catch-all for any unexpected errors during parsing or insertion
          console.error(
            "[SVG Insert] Unexpected error during Frame conversion:",
            e
          );
          const errorMessage =
            e instanceof Error ? e.message : "Unknown error occurred";

          // Requirement 3.4: Show error toast with descriptive message on failure
          showToast(`Failed to insert "${item.name}": ${errorMessage}`, "error");

          // Try native fallback as last resort
          try {
            const transformedSvgFallback = getTransformedSvg(item.svg);
            await framer.addSVG({ svg: transformedSvgFallback, name: item.name });
            framer.notify(
              `✅ Inserted ${item.name} with all complex vector graphic details!`
            );
            showToast(`Inserted "${item.name}" using fallback method`, "success");
            // Requirement 9.1: Track recently inserted components
            addToRecentlyUsed(item);
          } catch (fallbackError) {
            console.error("[SVG Insert] Fallback also failed:", fallbackError);
            showToast(
              `Insert failed completely for "${item.name}"`,
              "error"
            );
          }
        }
      }
    },
    [showToast, insertWithNativeFallback, addToRecentlyUsed, getTransformedSvg]
  );

  return <App onInsert={handleInsert} />;
};

export default AppWithToast;
