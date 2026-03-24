/**
 * Insert service for managing component insertion operations
 * Requirements: 3.1, 3.2
 * 
 * Handles:
 * - Tracking insert operation status (idle, loading, success, error)
 * - Returning structured results with success, message, and fallbackUsed
 * - Coordinating with SVG parser and Framer API
 * - Component-based insertion using Framer Module URLs
 * - Native Framer frame creation with stacks
 */

import { parseFlatNodes, buildHierarchy, getSvgDimensions, inferStackProperties } from '../utils/heuristic-layout';
import { svgParsingCache } from './svg-cache';
import type { ComponentItem, ParsedNode } from '../types';

/**
 * Status of an insert operation
 * Requirement 3.1: Track loading state during insert operations
 * Requirement 3.2: Track success/error states
 */
export type InsertStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Result of an insert operation
 * Requirement 3.1, 3.2: Return structured result with success, message, fallbackUsed
 */
export interface InsertResult {
  success: boolean;
  message: string;
  nodeId?: string;
  fallbackUsed?: boolean;
}

/**
 * Options for insert operations
 */
export interface InsertOptions {
  item: ComponentItem;
  onStatusChange: (status: InsertStatus) => void;
  onComplete: (result: InsertResult) => void;
}

/**
 * Parse SVG string into a DOM element
 * @param svgString - The SVG markup string
 * @returns The parsed SVG element or null if parsing fails
 */
function parseSvgString(svgString: string): SVGSVGElement | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('[Insert Service] SVG parsing error:', parserError.textContent);
      return null;
    }
    
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      console.error('[Insert Service] No SVG element found in parsed document');
      return null;
    }
    
    return svgElement;
  } catch (error) {
    console.error('[Insert Service] Failed to parse SVG string:', error);
    return null;
  }
}

/**
 * Check if Framer API is available
 * @returns true if running in Framer plugin environment
 */
function isFramerAvailable(): boolean {
  return typeof window !== 'undefined' && 'framer' in window;
}

/**
 * Component URL mappings for Framer Code Components
 * These URLs point to actual Framer components that can be inserted as layout sections
 */
const componentUrls: Record<string, string> = {
  'header-12': 'https://framer.com/m/Header-iXrOqR.js@vJwYk761udHzdiA5EObl',
};

/**
 * Insert header using native Framer frames and stacks
 * This creates proper Framer frames with layout properties, matching how Framer's built-in sections work
 */
async function insertHeaderAsNativeFrames(item: ComponentItem): Promise<InsertResult> {
  if (!isFramerAvailable()) {
    return {
      success: false,
      message: 'Framer API not available',
      fallbackUsed: false,
    };
  }

  // Only handle header-12 for now
  if (item.id !== 'header-12') {
    return {
      success: false,
      message: `No native frame config for ${item.id}`,
      fallbackUsed: false,
    };
  }

  try {
    // @ts-expect-error - Framer API is injected at runtime
    const framer = window.framer;
    
    if (!framer || typeof framer.createFrameNode !== 'function') {
      return {
        success: false,
        message: 'Framer createFrameNode not available',
        fallbackUsed: false,
      };
    }

    // Create outer container (light gray background)
    const outerFrame = await framer.createFrameNode({
      name: 'Header Floating Gradient',
      width: '100%',
      height: '120px',
      backgroundColor: '#F5F7FB',
      layout: 'horizontal',
      stackDirection: 'horizontal',
      stackDistribute: 'center',
      stackAlign: 'center',
      padding: '20px 100px',
    });

    if (!outerFrame?.id) {
      return {
        success: false,
        message: 'Failed to create outer frame',
        fallbackUsed: false,
      };
    }

    // Create inner container (white floating card)
    const containerFrame = await framer.createFrameNode({
      name: 'Container',
      width: '1000px',
      height: '80px',
      backgroundColor: '#FFFFFF',
      borderRadius: '14px',
      layout: 'horizontal',
      stackDirection: 'horizontal',
      stackDistribute: 'space-between',
      stackAlign: 'center',
      padding: '0px 40px',
    });

    if (containerFrame?.id) {
      await framer.setParent(containerFrame.id, outerFrame.id);

      // Create Logo text
      const logoText = await framer.addText({
        characters: 'Logo',
        fontSize: 18,
        fontWeight: 600,
      });
      if (logoText?.id) {
        await framer.setParent(logoText.id, containerFrame.id);
        await framer.setAttributes(logoText.id, { name: 'Logo' });
      }

      // Create Nav container
      const navFrame = await framer.createFrameNode({
        name: 'Nav',
        layout: 'horizontal',
        stackDirection: 'horizontal',
        stackAlign: 'center',
        gap: '24px',
      });

      if (navFrame?.id) {
        await framer.setParent(navFrame.id, containerFrame.id);

        // Add nav items
        const navItems = ['Home', 'Product', 'Pricing', 'Docs', 'Contact'];
        for (const navItem of navItems) {
          const navText = await framer.addText({
            characters: navItem,
            fontSize: 14,
          });
          if (navText?.id) {
            await framer.setParent(navText.id, navFrame.id);
            await framer.setAttributes(navText.id, { name: navItem });
          }
        }
      }

      // Create CTA button frame with gradient
      const ctaFrame = await framer.createFrameNode({
        name: 'CTA Button',
        layout: 'horizontal',
        stackDirection: 'horizontal',
        stackAlign: 'center',
        padding: '10px 18px',
        borderRadius: '10px',
        backgroundGradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { position: 0, color: '#6366F1' },
            { position: 1, color: '#06B6D4' },
          ],
        },
      });

      if (ctaFrame?.id) {
        await framer.setParent(ctaFrame.id, containerFrame.id);

        // Add CTA text
        const ctaText = await framer.addText({
          characters: 'Get Started',
          fontSize: 14,
          fontWeight: 500,
        });
        if (ctaText?.id) {
          await framer.setParent(ctaText.id, ctaFrame.id);
          await framer.setAttributes(ctaText.id, { 
            name: 'CTA Text',
            // Set text color to white
          });
        }
      }
    }

    return {
      success: true,
      message: `Inserted "${item.name}" as native Framer frames`,
      nodeId: outerFrame.id,
      fallbackUsed: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to insert native frames: ${errorMessage}`,
      fallbackUsed: false,
    };
  }
}

/**
 * Insert component using Framer Code Component URL
 * Uses addComponentInstance to keep component as a live instance (preserves layout)
 * 
 * @param item - The component item to insert
 * @returns InsertResult indicating success/failure
 */
async function insertAsFramerComponent(item: ComponentItem): Promise<InsertResult> {
  if (!isFramerAvailable()) {
    return {
      success: false,
      message: 'Framer API not available',
      fallbackUsed: false,
    };
  }

  const componentUrl = componentUrls[item.id];
  if (!componentUrl) {
    return {
      success: false,
      message: `No component URL for ${item.id}`,
      fallbackUsed: false,
    };
  }

  try {
    // @ts-expect-error - Framer API is injected at runtime
    const framer = window.framer;
    
    console.log('[Insert Service] Attempting addComponentInstance with URL:', componentUrl);
    console.log('[Insert Service] framer.addComponentInstance available:', typeof framer?.addComponentInstance);
    
    // Use addComponentInstance - this keeps the component as a live instance
    // which preserves the React layout (like Framer's built-in Navigation sections)
    if (framer && typeof framer.addComponentInstance === 'function') {
      const result = await framer.addComponentInstance({
        url: componentUrl,
      });
      
      console.log('[Insert Service] addComponentInstance result:', result);
      
      if (result?.id) {
        return {
          success: true,
          message: `Inserted "${item.name}" as component instance`,
          nodeId: result.id,
          fallbackUsed: false,
        };
      }
      
      return {
        success: false,
        message: 'addComponentInstance returned no result',
        fallbackUsed: false,
      };
    }
    
    console.log('[Insert Service] addComponentInstance not available, trying addDetachedComponentLayers');
    
    // Fallback to addDetachedComponentLayers
    if (framer && typeof framer.addDetachedComponentLayers === 'function') {
      const result = await framer.addDetachedComponentLayers({
        url: componentUrl,
        layout: true,
      });
      
      console.log('[Insert Service] addDetachedComponentLayers result:', result);
      
      if (result?.id) {
        return {
          success: true,
          message: `Inserted "${item.name}" as layout section`,
          nodeId: result.id,
          fallbackUsed: false,
        };
      }
    }
    
    return {
      success: false,
      message: 'No component insertion method available - check plugin permissions',
      fallbackUsed: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Insert Service] Component insertion error:', error);
    return {
      success: false,
      message: `Failed to insert component: ${errorMessage}`,
      fallbackUsed: false,
    };
  }
}

/**
 * Insert component using native Framer SVG insertion (fallback method)
 * Requirement 4.4: Fall back to native Framer SVG insertion when parsing fails
 * 
 * @param item - The component item to insert
 * @returns InsertResult indicating success/failure
 */
async function insertNativeSvg(item: ComponentItem): Promise<InsertResult> {
  if (!isFramerAvailable()) {
    return {
      success: false,
      message: 'Framer API not available',
      fallbackUsed: true,
    };
  }

  try {
    // Use Framer's native SVG insertion
    // @ts-expect-error - Framer API is injected at runtime
    const framer = window.framer;
    
    if (framer && typeof framer.addSVG === 'function') {
      const nodeId = await framer.addSVG(item.svg);
      return {
        success: true,
        message: `Inserted "${item.name}" as native SVG`,
        nodeId,
        fallbackUsed: true,
      };
    }
    
    return {
      success: false,
      message: 'Native SVG insertion not supported',
      fallbackUsed: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to insert native SVG: ${errorMessage}`,
      fallbackUsed: true,
    };
  }
}

/**
 * Convert parsed nodes to Framer Frame nodes
 * @param nodes - The parsed SVG nodes
 * @param dimensions - The SVG dimensions
 * @returns The created Framer node ID or null
 */
async function createFramerNodes(
  nodes: ParsedNode[],
  dimensions: { width: number; height: number }
): Promise<string | null> {
  if (!isFramerAvailable()) {
    return null;
  }

  try {
    // @ts-expect-error - Framer API is injected at runtime
    const framer = window.framer;
    
    if (!framer || typeof framer.addFrame !== 'function') {
      return null;
    }

    // Create root frame with SVG dimensions
    const rootId = await framer.addFrame({
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: 'transparent',
    });

    // Recursively create child frames
    const createChildFrames = async (parentId: string, children: ParsedNode[]) => {
      for (const node of children) {
        const stackProps = inferStackProperties(node);
        
        const frameProps: Record<string, unknown> = {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          backgroundColor: node.attributes.fill || 'transparent',
          borderRadius: node.attributes.rx ? parseInt(node.attributes.rx, 10) : 0,
          ...stackProps,
        };

        // Handle text nodes
        if (node.type === 'text' && node.attributes.textData) {
          frameProps.text = node.attributes.textData;
          frameProps.fontSize = node.attributes.fontSize;
          frameProps.fontFamily = node.attributes.fontFamily;
          frameProps.fontWeight = node.attributes.fontWeightStr;
        }

        // Handle image nodes
        if (node.attributes.imageUrl) {
          frameProps.image = node.attributes.imageUrl;
        }

        const childId = await framer.addFrame(frameProps, parentId);
        
        // Recursively create children
        if (node.children.length > 0) {
          await createChildFrames(childId, node.children);
        }
      }
    };

    await createChildFrames(rootId, nodes);
    return rootId;
  } catch (error) {
    console.error('[Insert Service] Failed to create Framer nodes:', error);
    return null;
  }
}

/**
 * Insert a component onto the Framer canvas
 * Requirement 3.1: Display loading spinner during insert operation
 * Requirement 3.2: Disable insert button during operation
 * 
 * @param options - Insert options including item, status callback, and completion callback
 */
export async function insertComponent(options: InsertOptions): Promise<void> {
  const { item, onStatusChange, onComplete } = options;

  // Set loading status
  onStatusChange('loading');

  try {
    // Check if this component has a Framer Code Component URL
    // If so, use addDetachedComponentLayers for proper layout section insertion
    if (componentUrls[item.id]) {
      const componentResult = await insertAsFramerComponent(item);
      
      if (componentResult.success) {
        onStatusChange('success');
        onComplete(componentResult);
        return;
      }
      // If component insertion fails, fall through to SVG insertion
      console.log('[Insert Service] Component insertion failed, falling back to SVG:', componentResult.message);
    }

    // Check if SVG contains text elements - if so, use native SVG insertion
    // to preserve the exact layout (text positioning is complex to convert to frames)
    const hasTextElements = item.svg.includes('<text');
    
    if (hasTextElements) {
      // Use native SVG insertion for text-heavy layouts to preserve positioning
      const nativeResult = await insertNativeSvg(item);
      
      if (nativeResult.success) {
        onStatusChange('success');
        onComplete({
          ...nativeResult,
          message: `Inserted "${item.name}" as native SVG`,
        });
      } else {
        onStatusChange('error');
        onComplete(nativeResult);
      }
      return;
    }

    // Parse the SVG string
    const svgElement = parseSvgString(item.svg);
    
    if (!svgElement) {
      // SVG parsing failed, try native fallback
      onStatusChange('error');
      const fallbackResult = await insertNativeSvg(item);
      
      if (fallbackResult.success) {
        onStatusChange('success');
      }
      
      onComplete({
        ...fallbackResult,
        message: fallbackResult.success 
          ? fallbackResult.message 
          : `Failed to parse SVG for "${item.name}": Malformed SVG`,
      });
      return;
    }

    // Check cache first for parsed SVG results
    // Requirement 5.3: Cache parsed SVG results to avoid re-parsing
    const cachedResult = svgParsingCache.get(item.svg);
    
    let hierarchy: ParsedNode[];
    let dimensions: { width: number; height: number };
    
    if (cachedResult) {
      // Use cached result
      hierarchy = cachedResult.nodes;
      dimensions = cachedResult.dimensions;
    } else {
      // Get SVG dimensions (with defaults for missing attributes)
      dimensions = getSvgDimensions(svgElement);

      // Parse SVG into flat nodes
      const flatNodes = parseFlatNodes(svgElement);

      // Check if any nodes were parsed
      if (flatNodes.length === 0) {
        // No parseable elements, try native fallback
        const fallbackResult = await insertNativeSvg(item);
        
        if (fallbackResult.success) {
          onStatusChange('success');
          onComplete({
            ...fallbackResult,
            message: `Inserted "${item.name}" using native SVG (no parseable elements)`,
          });
        } else {
          onStatusChange('error');
          onComplete({
            success: false,
            message: `No parseable elements found in "${item.name}"`,
            fallbackUsed: true,
          });
        }
        return;
      }

      // Build hierarchy from flat nodes
      hierarchy = buildHierarchy(flatNodes);
      
      // Cache the parsed result for future use
      // Requirement 5.3: Cache parsed SVG results to avoid re-parsing on subsequent views
      svgParsingCache.set(item.svg, hierarchy, dimensions);
    }

    // Create Framer nodes
    const nodeId = await createFramerNodes(hierarchy, dimensions);

    if (nodeId) {
      onStatusChange('success');
      onComplete({
        success: true,
        message: `Successfully inserted "${item.name}"`,
        nodeId,
        fallbackUsed: false,
      });
    } else {
      // Framer node creation failed, try native fallback
      const fallbackResult = await insertNativeSvg(item);
      
      if (fallbackResult.success) {
        onStatusChange('success');
        onComplete(fallbackResult);
      } else {
        onStatusChange('error');
        onComplete({
          success: false,
          message: `Failed to insert "${item.name}" onto canvas`,
          fallbackUsed: true,
        });
      }
    }
  } catch (error) {
    onStatusChange('error');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try native fallback on any error
    const fallbackResult = await insertNativeSvg(item);
    
    if (fallbackResult.success) {
      onStatusChange('success');
      onComplete({
        ...fallbackResult,
        message: `Inserted "${item.name}" using fallback (${errorMessage})`,
      });
    } else {
      onComplete({
        success: false,
        message: `Insert failed: ${errorMessage}`,
        fallbackUsed: true,
      });
    }
  }
}

/**
 * Create an insert handler function for use in components
 * This provides a simpler interface for components that just need callbacks
 * 
 * @param onStatusChange - Callback for status changes
 * @param onSuccess - Callback for successful inserts
 * @param onError - Callback for failed inserts
 * @returns A function that handles component insertion
 */
export function createInsertHandler(
  onStatusChange: (status: InsertStatus) => void,
  onSuccess: (result: InsertResult) => void,
  onError: (result: InsertResult) => void
): (item: ComponentItem) => Promise<void> {
  return async (item: ComponentItem) => {
    await insertComponent({
      item,
      onStatusChange,
      onComplete: (result) => {
        if (result.success) {
          onSuccess(result);
        } else {
          onError(result);
        }
      },
    });
  };
}

/**
 * Synchronous insert status tracker for use with React state
 * Provides a simple way to track insert status for a single component
 */
export class InsertStatusTracker {
  private status: InsertStatus = 'idle';
  private listeners: Set<(status: InsertStatus) => void> = new Set();

  getStatus(): InsertStatus {
    return this.status;
  }

  setStatus(status: InsertStatus): void {
    this.status = status;
    this.listeners.forEach(listener => listener(status));
  }

  subscribe(listener: (status: InsertStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.setStatus('idle');
  }
}
