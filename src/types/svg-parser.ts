/**
 * SVG Parser type definitions for the Framer UI Vault plugin
 * Requirements: 12.5, 13.2
 * 
 * These types define the structure for parsing SVG elements and converting
 * them to Framer Frame nodes.
 */

/**
 * Supported node types in the parsed SVG structure
 */
export type NodeType = 'rect' | 'circle' | 'text' | 'group';

/**
 * Attributes for parsed SVG nodes
 * Contains styling and content information extracted from SVG elements
 */
export interface NodeAttributes {
  // Common attributes
  rx?: string;
  fill: string;
  imageUrl?: string | null;
  strokeWidth: string;
  stroke: string;
  
  // Text-specific attributes
  originalY?: number;
  fontSize?: number;
  fontWeightStr?: string;
  fontFamily?: string;
  textData?: string;
  name?: string;
}

/**
 * Represents a parsed SVG node with position, dimensions, and styling
 * Requirement 13.2: ParsedNode interface with all required properties typed
 */
export interface ParsedNode {
  id: string;
  type: NodeType;
  tagName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  children: ParsedNode[];
  attributes: NodeAttributes;
}

/**
 * Error encountered during SVG parsing
 */
export interface ParseError {
  element: string;
  message: string;
  recoverable: boolean;
}

/**
 * Result of parsing an SVG document
 */
export interface ParseResult {
  success: boolean;
  nodes: ParsedNode[];
  errors: ParseError[];
  warnings: string[];
}

/**
 * Stack layout properties inferred from node hierarchy
 * Used when converting parsed nodes to Framer Frame stacks
 * Note: Types match Framer API expectations
 */
export interface StackProperties {
  layout?: 'stack';
  stackDirection?: 'horizontal' | 'vertical';
  gap?: `${number}px`;
  padding?: `${number}px` | `${number}px ${number}px ${number}px ${number}px`;
  stackDistribution?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  stackAlignment?: 'start' | 'center' | 'end';
  position: 'absolute' | 'relative';
}
