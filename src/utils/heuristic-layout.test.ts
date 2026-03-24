/**
 * Unit tests for SVG parser error handling
 * Requirements: 4.1, 4.2, 4.3
 *
 * Tests:
 * - Default dimensions when width/height missing (4.1)
 * - Element skipping for missing required attributes (4.2)
 * - Fallback color handling for invalid fill references (4.3)
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { parseFlatNodes, getSvgDimensions, DEFAULT_SVG_WIDTH, DEFAULT_SVG_HEIGHT, buildHierarchy, inferStackProperties } from './heuristic-layout';
import type { ParsedNode } from '../types/svg-parser';

// Helper to create a mock SVG element
function createSvgElement(content: string, width?: string, height?: string, viewBox?: string): Element {
  const parser = new DOMParser();
  const widthAttr = width ? `width="${width}"` : '';
  const heightAttr = height ? `height="${height}"` : '';
  const viewBoxAttr = viewBox ? `viewBox="${viewBox}"` : '';
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" ${widthAttr} ${heightAttr} ${viewBoxAttr}>${content}</svg>`;
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  return doc.documentElement;
}

/**
 * Helper to safely access array element with assertion
 * Used in tests where we know the element exists
 */
function getNode(nodes: ParsedNode[], index: number): ParsedNode {
  const node = nodes[index];
  if (!node) {
    throw new Error(`Expected node at index ${index} but array has length ${nodes.length}`);
  }
  return node;
}

describe('getSvgDimensions', () => {
  /**
   * Requirement 4.1: Use default dimensions of 1200x800 when attributes missing
   */
  describe('Default dimension handling', () => {
    it('returns default dimensions when width and height are missing', () => {
      const svg = createSvgElement('');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(DEFAULT_SVG_WIDTH);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });

    it('returns default width when only width is missing', () => {
      const svg = createSvgElement('', undefined, '600');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(DEFAULT_SVG_WIDTH);
      expect(dimensions.height).toBe(600);
    });

    it('returns default height when only height is missing', () => {
      const svg = createSvgElement('', '800', undefined);
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });

    it('returns parsed dimensions when both are present', () => {
      const svg = createSvgElement('', '1000', '500');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(1000);
      expect(dimensions.height).toBe(500);
    });

    it('returns default dimensions for invalid numeric values', () => {
      const svg = createSvgElement('', 'invalid', 'NaN');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(DEFAULT_SVG_WIDTH);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });

    it('returns default dimensions for zero values', () => {
      const svg = createSvgElement('', '0', '0');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(DEFAULT_SVG_WIDTH);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });

    it('returns default dimensions for negative values', () => {
      const svg = createSvgElement('', '-100', '-50');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(DEFAULT_SVG_WIDTH);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });
  });

  describe('viewBox dimension handling', () => {
    it('extracts dimensions from viewBox when width/height missing', () => {
      const svg = createSvgElement('', undefined, undefined, '0 0 1200 600');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(1200);
      expect(dimensions.height).toBe(600);
    });

    it('prefers explicit width/height over viewBox', () => {
      const svg = createSvgElement('', '800', '400', '0 0 1200 600');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(400);
    });

    it('uses viewBox width when only explicit height provided', () => {
      const svg = createSvgElement('', undefined, '400', '0 0 1200 600');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(1200);
      expect(dimensions.height).toBe(400);
    });

    it('uses viewBox height when only explicit width provided', () => {
      const svg = createSvgElement('', '800', undefined, '0 0 1200 600');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(600);
    });

    it('handles viewBox with non-zero minX/minY', () => {
      const svg = createSvgElement('', undefined, undefined, '100 50 1000 500');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(1000);
      expect(dimensions.height).toBe(500);
    });

    it('handles viewBox with extra whitespace', () => {
      const svg = createSvgElement('', undefined, undefined, '0  0   1200    600');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(1200);
      expect(dimensions.height).toBe(600);
    });

    it('returns defaults for invalid viewBox format', () => {
      const svg = createSvgElement('', undefined, undefined, 'invalid');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(DEFAULT_SVG_WIDTH);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });

    it('returns defaults for viewBox with too few values', () => {
      const svg = createSvgElement('', undefined, undefined, '0 0 1200');
      const dimensions = getSvgDimensions(svg);
      
      expect(dimensions.width).toBe(1200);
      expect(dimensions.height).toBe(DEFAULT_SVG_HEIGHT);
    });
  });
});

describe('parseFlatNodes', () => {
  let consoleWarnSpy: MockInstance;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  /**
   * Requirement 4.2: Skip elements with missing required attributes and continue parsing
   */
  describe('Element skip logic for missing attributes', () => {
    describe('rect elements', () => {
      it('skips rect with missing width attribute', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" height="100" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[SVG Parser] Skipping <rect> element')
        );
      });

      it('skips rect with missing height attribute', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[SVG Parser] Skipping <rect> element')
        );
      });

      it('skips rect with missing both width and height', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('skips rect with zero width', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="0" height="100" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('skips rect with zero height', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="0" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('skips rect with invalid width (NaN)', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="invalid" height="100" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('parses rect with valid width and height', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].type).toBe('rect');
        expect(nodes[0].width).toBe(100);
        expect(nodes[0].height).toBe(50);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('uses default x and y when missing (valid rect)', () => {
        const svg = createSvgElement(
          '<rect width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(0);
        expect(nodes[0].y).toBe(0);
      });
    });

    describe('image elements', () => {
      it('skips image with missing width attribute', () => {
        const svg = createSvgElement(
          '<image x="10" y="20" height="100" href="https://example.com/img.png" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[SVG Parser] Skipping <image> element')
        );
      });

      it('skips image with missing height attribute', () => {
        const svg = createSvgElement(
          '<image x="10" y="20" width="100" href="https://example.com/img.png" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('parses image with valid width and height', () => {
        const svg = createSvgElement(
          '<image x="10" y="20" width="100" height="50" href="https://example.com/img.png" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].type).toBe('rect');
        expect(nodes[0].tagName).toBe('image');
      });
    });

    describe('circle elements', () => {
      it('skips circle with missing radius attribute', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[SVG Parser] Skipping <circle> element')
        );
      });

      it('skips circle with zero radius', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="50" r="0" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('skips circle with invalid radius (NaN)', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="50" r="invalid" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      it('parses circle with valid radius', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="50" r="25" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].type).toBe('circle');
        expect(nodes[0].width).toBe(50);
        expect(nodes[0].height).toBe(50);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('uses default cx and cy when missing (valid circle)', () => {
        const svg = createSvgElement(
          '<circle r="25" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(-25); // cx(0) - r(25)
        expect(nodes[0].y).toBe(-25); // cy(0) - r(25)
      });
    });

    describe('text elements', () => {
      it('parses text elements without x and y (uses defaults)', () => {
        const svg = createSvgElement(
          '<text font-size="16">Hello World</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].type).toBe('text');
        expect(nodes[0].x).toBe(0);
        // Text elements don't require x/y as they have sensible defaults
      });

      it('parses text with all attributes', () => {
        const svg = createSvgElement(
          '<text x="100" y="200" font-size="24" fill="#333333">Sample Text</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].type).toBe('text');
        expect(nodes[0].x).toBe(100);
        expect(nodes[0].attributes.fontSize).toBe(24);
        expect(nodes[0].attributes.textData).toBe('Sample Text');
      });
    });

    describe('mixed elements - continue parsing after skip', () => {
      it('continues parsing valid elements after skipping invalid ones', () => {
        const svg = createSvgElement(`
          <rect x="10" y="20" fill="#FF0000" />
          <rect x="50" y="60" width="100" height="80" fill="#00FF00" />
          <circle cx="100" cy="100" fill="#0000FF" />
          <circle cx="200" cy="200" r="30" fill="#FFFF00" />
          <text x="10" y="300" font-size="16">Valid Text</text>
        `);
        const nodes = parseFlatNodes(svg);
        
        // Should have 3 valid elements: 1 rect, 1 circle, 1 text
        expect(nodes).toHaveLength(3);
        
        // Verify the valid elements were parsed
        expect(nodes.find(n => n.type === 'rect')).toBeDefined();
        expect(nodes.find(n => n.type === 'circle')).toBeDefined();
        expect(nodes.find(n => n.type === 'text')).toBeDefined();
        
        // Should have logged 2 warnings (1 for invalid rect, 1 for invalid circle)
        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      });

      it('returns empty array when all elements are invalid', () => {
        const svg = createSvgElement(`
          <rect x="10" y="20" fill="#FF0000" />
          <rect x="50" y="60" width="0" height="80" fill="#00FF00" />
          <circle cx="100" cy="100" fill="#0000FF" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
      });

      it('parses all elements when all are valid', () => {
        const svg = createSvgElement(`
          <rect x="10" y="20" width="100" height="50" fill="#FF0000" />
          <rect x="50" y="60" width="100" height="80" fill="#00FF00" />
          <circle cx="100" cy="100" r="25" fill="#0000FF" />
          <text x="10" y="300" font-size="16">Valid Text</text>
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(4);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('warning messages', () => {
      it('logs descriptive warning for skipped rect', () => {
        const svg = createSvgElement('<rect x="10" y="20" fill="#FF0000" />');
        parseFlatNodes(svg);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[SVG Parser] Skipping <rect> element: missing or invalid width/height attributes'
        );
      });

      it('logs descriptive warning for skipped circle', () => {
        const svg = createSvgElement('<circle cx="50" cy="50" fill="#FF0000" />');
        parseFlatNodes(svg);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[SVG Parser] Skipping <circle> element: missing or invalid radius attribute'
        );
      });

      it('logs descriptive warning for skipped image', () => {
        const svg = createSvgElement('<image x="10" y="20" href="https://example.com/img.png" />');
        parseFlatNodes(svg);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[SVG Parser] Skipping <image> element: missing or invalid width/height attributes'
        );
      });
    });
  });
});


describe('parseFlatNodes - Fill reference handling', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  /**
   * Requirement 4.3: Use fallback color when fill reference is invalid
   */
  describe('Fallback color handling for invalid fill references', () => {
    const FALLBACK_COLOR = '#EAEAEA';

    describe('non-existent references', () => {
      it('uses fallback color when fill references non-existent gradient', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="url(#nonexistent)" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Fill reference not found: "nonexistent"')
        );
      });

      it('uses fallback color for circle with non-existent fill reference', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="50" r="25" fill="url(#missingGradient)" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Fill reference not found: "missingGradient"')
        );
      });
    });

    describe('invalid reference formats', () => {
      it('uses fallback color for malformed url() reference', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="url()" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid fill reference format')
        );
      });

      it('uses fallback color for url() without hash', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="url(gradient)" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid fill reference format')
        );
      });

      it('uses fallback color for ID with special characters', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="url(#123invalid)" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid fill reference ID')
        );
      });

      it('uses fallback color for ID starting with number', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="url(#9gradient)" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid fill reference ID')
        );
      });
    });

    describe('non-gradient references', () => {
      it('uses fallback color when reference is a pattern', () => {
        const svg = createSvgElement(`
          <defs>
            <pattern id="myPattern" width="10" height="10">
              <rect width="10" height="10" fill="red" />
            </pattern>
          </defs>
          <rect x="10" y="20" width="100" height="50" fill="url(#myPattern)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Fill reference "myPattern" is not a gradient')
        );
      });

      it('uses fallback color when reference is a clipPath', () => {
        const svg = createSvgElement(`
          <defs>
            <clipPath id="myClip">
              <rect width="100" height="100" />
            </clipPath>
          </defs>
          <rect x="10" y="20" width="100" height="50" fill="url(#myClip)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Fill reference "myClip" is not a gradient')
        );
      });
    });

    describe('gradient with missing stop colors', () => {
      it('uses fallback color when gradient has no stops', () => {
        const svg = createSvgElement(`
          <defs>
            <linearGradient id="emptyGradient">
            </linearGradient>
          </defs>
          <rect x="10" y="20" width="100" height="50" fill="url(#emptyGradient)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Gradient "emptyGradient" has no valid stop colors')
        );
      });

      it('uses fallback color when gradient stops have no stop-color attribute', () => {
        const svg = createSvgElement(`
          <defs>
            <linearGradient id="noColorGradient">
              <stop offset="0%" />
              <stop offset="100%" />
            </linearGradient>
          </defs>
          <rect x="10" y="20" width="100" height="50" fill="url(#noColorGradient)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe(FALLBACK_COLOR);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Gradient "noColorGradient" has no valid stop colors')
        );
      });
    });

    describe('valid gradient references', () => {
      it('extracts color from valid linearGradient', () => {
        const svg = createSvgElement(`
          <defs>
            <linearGradient id="validGradient">
              <stop offset="0%" stop-color="#FF0000" />
              <stop offset="100%" stop-color="#0000FF" />
            </linearGradient>
          </defs>
          <rect x="10" y="20" width="100" height="50" fill="url(#validGradient)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe('#FF0000');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('extracts color from valid radialGradient', () => {
        const svg = createSvgElement(`
          <defs>
            <radialGradient id="radialGrad">
              <stop offset="0%" stop-color="#00FF00" />
              <stop offset="100%" stop-color="#FF00FF" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="25" fill="url(#radialGrad)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe('#00FF00');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('handles gradient ID with valid special characters (underscore, hyphen)', () => {
        const svg = createSvgElement(`
          <defs>
            <linearGradient id="my_gradient-1">
              <stop offset="0%" stop-color="#AABBCC" />
            </linearGradient>
          </defs>
          <rect x="10" y="20" width="100" height="50" fill="url(#my_gradient-1)" />
        `);
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe('#AABBCC');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('direct fill values', () => {
      it('uses direct color value when not a url() reference', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="#FF5500" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe('#FF5500');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('uses transparent for fill="none"', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="none" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe('transparent');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('uses transparent when fill attribute is missing', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fill).toBe('transparent');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });
  });
});


describe('parseFlatNodes - Numeric attribute validation', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  /**
   * Requirement 4.5: Validate numeric attributes before parsing to prevent NaN values
   */
  describe('NaN prevention for numeric attributes', () => {
    describe('rect elements', () => {
      it('uses default x=0 when x attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<rect x="invalid" y="20" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(0);
        expect(Number.isNaN(nodes[0].x)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "invalid"')
        );
      });

      it('uses default y=0 when y attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<rect x="10" y="not-a-number" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].y).toBe(0);
        expect(Number.isNaN(nodes[0].y)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "not-a-number"')
        );
      });

      it('uses default x=0 when x attribute is empty string', () => {
        const svg = createSvgElement(
          '<rect x="" y="20" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(0);
        expect(Number.isNaN(nodes[0].x)).toBe(false);
      });

      it('parses valid negative x and y values', () => {
        const svg = createSvgElement(
          '<rect x="-50" y="-100" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(-50);
        expect(nodes[0].y).toBe(-100);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('parses valid decimal x and y values', () => {
        const svg = createSvgElement(
          '<rect x="10.5" y="20.75" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(10.5);
        expect(nodes[0].y).toBe(20.75);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('circle elements', () => {
      it('uses default cx=0 when cx attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<circle cx="abc" cy="50" r="25" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(-25); // cx(0) - r(25)
        expect(Number.isNaN(nodes[0].x)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "abc"')
        );
      });

      it('uses default cy=0 when cy attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="xyz" r="25" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].y).toBe(-25); // cy(0) - r(25)
        expect(Number.isNaN(nodes[0].y)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "xyz"')
        );
      });

      it('uses default r=0 when r attribute is invalid (NaN) - element skipped', () => {
        // Note: Invalid radius causes element to be skipped by hasValidCircleAttributes
        const svg = createSvgElement(
          '<circle cx="50" cy="50" r="invalid" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(0);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Skipping <circle> element')
        );
      });

      it('parses valid decimal cx and cy values', () => {
        const svg = createSvgElement(
          '<circle cx="50.5" cy="75.25" r="25" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(25.5); // cx(50.5) - r(25)
        expect(nodes[0].y).toBe(50.25); // cy(75.25) - r(25)
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('text elements', () => {
      it('uses default x=0 when x attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<text x="invalid" y="100" font-size="16">Hello</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(0);
        expect(Number.isNaN(nodes[0].x)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "invalid"')
        );
      });

      it('uses default y=0 when y attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<text x="100" y="not-valid" font-size="16">Hello</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        // y is adjusted by fontSize, so check it's not NaN
        expect(Number.isNaN(nodes[0].y)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "not-valid"')
        );
      });

      it('uses default font-size=16 when font-size attribute is invalid (NaN)', () => {
        const svg = createSvgElement(
          '<text x="100" y="200" font-size="bad">Hello</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fontSize).toBe(16);
        expect(Number.isNaN(nodes[0].attributes.fontSize)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid numeric value: "bad"')
        );
      });

      it('uses default font-size=16 when font-size attribute is empty', () => {
        const svg = createSvgElement(
          '<text x="100" y="200" font-size="">Hello</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fontSize).toBe(16);
        expect(Number.isNaN(nodes[0].attributes.fontSize)).toBe(false);
      });

      it('parses valid decimal font-size values', () => {
        const svg = createSvgElement(
          '<text x="100" y="200" font-size="24.5">Hello</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].attributes.fontSize).toBe(24.5);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('calculates correct width and height with valid font-size', () => {
        const svg = createSvgElement(
          '<text x="100" y="200" font-size="20">Test</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        // width = textData.length * (fontSize * 0.6) = 4 * (20 * 0.6) = 48
        expect(nodes[0].width).toBe(48);
        // height = fontSize = 20
        expect(nodes[0].height).toBe(20);
        expect(Number.isNaN(nodes[0].width)).toBe(false);
        expect(Number.isNaN(nodes[0].height)).toBe(false);
      });
    });

    describe('area calculation', () => {
      it('calculates valid area for rect with valid dimensions', () => {
        const svg = createSvgElement(
          '<rect x="10" y="20" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].area).toBe(5000); // 100 * 50
        expect(Number.isNaN(nodes[0].area)).toBe(false);
      });

      it('calculates valid area for circle with valid radius', () => {
        const svg = createSvgElement(
          '<circle cx="50" cy="50" r="25" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].area).toBe(2500); // (25*2) * (25*2)
        expect(Number.isNaN(nodes[0].area)).toBe(false);
      });

      it('calculates valid area for text with valid font-size', () => {
        const svg = createSvgElement(
          '<text x="100" y="200" font-size="20">Test</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        // area = width * height = 48 * 20 = 960
        expect(nodes[0].area).toBe(960);
        expect(Number.isNaN(nodes[0].area)).toBe(false);
      });
    });

    describe('multiple invalid attributes', () => {
      it('handles multiple invalid attributes on same element', () => {
        const svg = createSvgElement(
          '<rect x="bad" y="worse" width="100" height="50" fill="#FF0000" />'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(0);
        expect(nodes[0].y).toBe(0);
        expect(Number.isNaN(nodes[0].x)).toBe(false);
        expect(Number.isNaN(nodes[0].y)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      });

      it('handles mix of valid and invalid attributes', () => {
        const svg = createSvgElement(
          '<text x="invalid" y="200" font-size="bad">Hello</text>'
        );
        const nodes = parseFlatNodes(svg);
        
        expect(nodes).toHaveLength(1);
        expect(nodes[0].x).toBe(0);
        expect(nodes[0].attributes.fontSize).toBe(16);
        // y should be valid (200 - fontSize * 0.85)
        expect(Number.isNaN(nodes[0].y)).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      });
    });
  });
});


describe('Native fallback trigger conditions', () => {
  /**
   * Requirement 4.4: Fall back to native Framer SVG insertion when parsing fails
   * These tests verify the conditions that would trigger native fallback
   */
  describe('parseFlatNodes returns empty array for fallback scenarios', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('returns empty array for SVG with only invalid elements (triggers native fallback)', () => {
      const svg = createSvgElement(`
        <rect fill="#FF0000" />
        <circle fill="#0000FF" />
        <image href="https://example.com/img.png" />
      `);
      const nodes = parseFlatNodes(svg);
      
      // Empty array triggers native fallback in main.tsx
      expect(nodes).toHaveLength(0);
    });

    it('returns empty array for SVG with only elements inside defs (triggers native fallback)', () => {
      const svg = createSvgElement(`
        <defs>
          <rect x="10" y="20" width="100" height="50" fill="#FF0000" />
          <circle cx="50" cy="50" r="25" fill="#0000FF" />
        </defs>
      `);
      const nodes = parseFlatNodes(svg);
      
      // Elements inside defs are skipped, empty array triggers native fallback
      expect(nodes).toHaveLength(0);
    });

    it('returns empty array for SVG with only elements inside clipPath (triggers native fallback)', () => {
      const svg = createSvgElement(`
        <clipPath id="myClip">
          <rect x="10" y="20" width="100" height="50" fill="#FF0000" />
        </clipPath>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(0);
    });

    it('returns empty array for SVG with only elements inside pattern (triggers native fallback)', () => {
      const svg = createSvgElement(`
        <pattern id="myPattern" width="10" height="10">
          <rect width="10" height="10" fill="red" />
        </pattern>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(0);
    });

    it('returns empty array for empty SVG (triggers native fallback)', () => {
      const svg = createSvgElement('');
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(0);
    });

    it('returns empty array for SVG with only unsupported elements (triggers native fallback)', () => {
      // Note: path, ellipse, polygon, line are handled by complex vector check in main.tsx
      // This tests that the parser doesn't crash on unknown elements
      const svg = createSvgElement(`
        <g>
          <foreignObject x="10" y="20" width="100" height="50">
            <div>HTML content</div>
          </foreignObject>
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(0);
    });

    it('returns non-empty array when at least one valid element exists (no fallback)', () => {
      const svg = createSvgElement(`
        <rect fill="#FF0000" />
        <rect x="10" y="20" width="100" height="50" fill="#00FF00" />
        <circle fill="#0000FF" />
      `);
      const nodes = parseFlatNodes(svg);
      
      // At least one valid element, no native fallback needed
      expect(nodes).toHaveLength(1);
      expect(nodes[0].type).toBe('rect');
    });
  });
});


describe('parseFlatNodes - Stroke attribute handling', () => {
  /**
   * Additional edge case tests for stroke attributes
   */
  describe('stroke attributes', () => {
    it('parses stroke and stroke-width attributes for rect', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" stroke="#000000" stroke-width="2" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.stroke).toBe('#000000');
      expect(nodes[0].attributes.strokeWidth).toBe('2');
    });

    it('uses default stroke="none" when stroke attribute is missing', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.stroke).toBe('none');
    });

    it('uses default stroke-width="0" when stroke-width attribute is missing', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.strokeWidth).toBe('0');
    });

    it('parses stroke attributes for circle', () => {
      const svg = createSvgElement(
        '<circle cx="50" cy="50" r="25" fill="#FF0000" stroke="#0000FF" stroke-width="3" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.stroke).toBe('#0000FF');
      expect(nodes[0].attributes.strokeWidth).toBe('3');
    });

    it('parses stroke attributes for text', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16" fill="#333333" stroke="#000000" stroke-width="1">Hello</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.stroke).toBe('#000000');
      expect(nodes[0].attributes.strokeWidth).toBe('1');
    });
  });
});


describe('parseFlatNodes - rx attribute handling', () => {
  /**
   * Tests for border radius (rx) attribute handling
   */
  describe('rx attribute for rect elements', () => {
    it('parses rx attribute for rect', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" rx="10" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.rx).toBe('10');
    });

    it('uses default rx="0" when rx attribute is missing for rect', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.rx).toBe('0');
    });

    it('uses default rx="8" for image elements', () => {
      const svg = createSvgElement(
        '<image x="10" y="20" width="100" height="50" href="https://example.com/img.png" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.rx).toBe('8');
    });

    it('parses rx attribute for image when provided', () => {
      const svg = createSvgElement(
        '<image x="10" y="20" width="100" height="50" href="https://example.com/img.png" rx="16" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.rx).toBe('16');
    });
  });
});


describe('parseFlatNodes - Image element handling', () => {
  /**
   * Tests for image element specific handling
   */
  describe('image href and xlink:href attributes', () => {
    it('parses image with href attribute', () => {
      const svg = createSvgElement(
        '<image x="10" y="20" width="100" height="50" href="https://example.com/img.png" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].type).toBe('rect');
      expect(nodes[0].tagName).toBe('image');
      expect(nodes[0].attributes.imageUrl).toBe('https://example.com/img.png');
      expect(nodes[0].attributes.fill).toBe('transparent');
    });

    it('parses image with xlink:href attribute (legacy)', () => {
      const parser = new DOMParser();
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
        <image x="10" y="20" width="100" height="50" xlink:href="https://example.com/legacy.png" />
      </svg>`;
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svg = doc.documentElement;
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.imageUrl).toBe('https://example.com/legacy.png');
    });

    it('uses transparent fill for image elements', () => {
      const svg = createSvgElement(
        '<image x="10" y="20" width="100" height="50" href="https://example.com/img.png" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fill).toBe('transparent');
    });
  });
});


describe('parseFlatNodes - Text element handling', () => {
  /**
   * Additional tests for text element specific handling
   */
  describe('text element attributes', () => {
    it('parses font-weight attribute', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16" font-weight="bold">Bold Text</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fontWeightStr).toBe('bold');
    });

    it('uses default font-weight="400" when missing', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16">Normal Text</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fontWeightStr).toBe('400');
    });

    it('parses font-family attribute', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16" font-family="Arial, sans-serif">Custom Font</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fontFamily).toBe('Arial, sans-serif');
    });

    it('uses default font-family="Inter, sans-serif" when missing', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16">Default Font</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fontFamily).toBe('Inter, sans-serif');
    });

    it('parses data-name attribute for text', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16" data-name="Heading">Title</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.name).toBe('Heading');
    });

    it('uses default name="Text" when data-name is missing', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16">Unnamed</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.name).toBe('Text');
    });

    it('uses "Sample Text" when text content is empty', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16"></text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.textData).toBe('Sample Text');
    });

    it('stores original y coordinate in attributes', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16">Test</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.originalY).toBe(200);
    });

    it('adjusts y coordinate by fontSize * 0.85', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="20">Test</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      // adjustedY = y - (fontSize * 0.85) = 200 - (20 * 0.85) = 200 - 17 = 183
      expect(nodes[0].y).toBe(183);
    });

    it('uses default fill="#111111" for text when fill is missing', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16">No Fill</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fill).toBe('#111111');
    });

    it('parses fill attribute for text', () => {
      const svg = createSvgElement(
        '<text x="100" y="200" font-size="16" fill="#FF5500">Colored Text</text>'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fill).toBe('#FF5500');
    });
  });
});


describe('parseFlatNodes - Elements with decorative classes', () => {
  /**
   * Tests for skipping decorative elements
   */
  describe('decorative element skipping', () => {
    it('skips elements with mesh-bg class', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" class="mesh-bg" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(0);
    });

    it('skips elements with float-obj class', () => {
      const svg = createSvgElement(
        '<circle cx="50" cy="50" r="25" fill="#FF0000" class="float-obj" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(0);
    });

    it('parses elements without decorative classes', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" class="normal-class" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
    });
  });
});


describe('parseFlatNodes - Node ID generation', () => {
  /**
   * Tests for unique node ID generation
   */
  describe('unique ID generation', () => {
    it('generates unique IDs for multiple elements', () => {
      const svg = createSvgElement(`
        <rect x="10" y="20" width="100" height="50" fill="#FF0000" />
        <rect x="50" y="60" width="100" height="80" fill="#00FF00" />
        <circle cx="100" cy="100" r="25" fill="#0000FF" />
        <text x="10" y="300" font-size="16">Text</text>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(4);
      const ids = nodes.map(n => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(4);
    });

    it('generates IDs in format "node-{counter}"', () => {
      const svg = createSvgElement(
        '<rect x="10" y="20" width="100" height="50" fill="#FF0000" />'
      );
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toMatch(/^node-\d+$/);
    });
  });
});


describe('buildHierarchy', () => {
  /**
   * Tests for hierarchy building from flat nodes
   */

  describe('parent-child relationships', () => {
    it('nests smaller elements inside larger containing elements', () => {
      const flatNodes: ParsedNode[] = [
        {
          id: 'parent',
          type: 'rect',
          tagName: 'rect',
          x: 0, y: 0, width: 200, height: 200, area: 40000,
          children: [],
          attributes: { fill: '#FFFFFF', strokeWidth: '0', stroke: 'none' }
        },
        {
          id: 'child',
          type: 'rect',
          tagName: 'rect',
          x: 10, y: 10, width: 50, height: 50, area: 2500,
          children: [],
          attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
        }
      ];
      
      const hierarchy = buildHierarchy(flatNodes);
      
      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].id).toBe('parent');
      expect(hierarchy[0].children).toHaveLength(1);
      expect(hierarchy[0].children[0].id).toBe('child');
    });

    it('keeps non-overlapping elements as siblings', () => {
      const flatNodes: ParsedNode[] = [
        {
          id: 'rect1',
          type: 'rect',
          tagName: 'rect',
          x: 0, y: 0, width: 100, height: 100, area: 10000,
          children: [],
          attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
        },
        {
          id: 'rect2',
          type: 'rect',
          tagName: 'rect',
          x: 150, y: 0, width: 100, height: 100, area: 10000,
          children: [],
          attributes: { fill: '#00FF00', strokeWidth: '0', stroke: 'none' }
        }
      ];
      
      const hierarchy = buildHierarchy(flatNodes);
      
      expect(hierarchy).toHaveLength(2);
    });

    it('handles deeply nested elements', () => {
      const flatNodes: ParsedNode[] = [
        {
          id: 'grandparent',
          type: 'rect',
          tagName: 'rect',
          x: 0, y: 0, width: 300, height: 300, area: 90000,
          children: [],
          attributes: { fill: '#FFFFFF', strokeWidth: '0', stroke: 'none' }
        },
        {
          id: 'parent',
          type: 'rect',
          tagName: 'rect',
          x: 10, y: 10, width: 200, height: 200, area: 40000,
          children: [],
          attributes: { fill: '#CCCCCC', strokeWidth: '0', stroke: 'none' }
        },
        {
          id: 'child',
          type: 'rect',
          tagName: 'rect',
          x: 20, y: 20, width: 50, height: 50, area: 2500,
          children: [],
          attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
        }
      ];
      
      const hierarchy = buildHierarchy(flatNodes);
      
      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].id).toBe('grandparent');
      expect(hierarchy[0].children).toHaveLength(1);
      expect(hierarchy[0].children[0].id).toBe('parent');
      expect(hierarchy[0].children[0].children).toHaveLength(1);
      expect(hierarchy[0].children[0].children[0].id).toBe('child');
    });

    it('returns empty array for empty input', () => {
      const hierarchy = buildHierarchy([]);
      expect(hierarchy).toHaveLength(0);
    });
  });
});


describe('inferStackProperties', () => {
  /**
   * Tests for stack property inference
   */

  describe('stack direction inference', () => {
    it('returns absolute position for nodes without children', () => {
      const node: ParsedNode = {
        id: 'single',
        type: 'rect',
        tagName: 'rect',
        x: 0, y: 0, width: 100, height: 100, area: 10000,
        children: [],
        attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
      };
      
      const props = inferStackProperties(node);
      
      expect(props.position).toBe('absolute');
      expect(props.layout).toBeUndefined();
    });

    it('infers vertical stack for vertically arranged children', () => {
      const node: ParsedNode = {
        id: 'parent',
        type: 'rect',
        tagName: 'rect',
        x: 0, y: 0, width: 200, height: 300, area: 60000,
        children: [
          {
            id: 'child1',
            type: 'rect',
            tagName: 'rect',
            x: 10, y: 10, width: 100, height: 50, area: 5000,
            children: [],
            attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
          },
          {
            id: 'child2',
            type: 'rect',
            tagName: 'rect',
            x: 10, y: 80, width: 100, height: 50, area: 5000,
            children: [],
            attributes: { fill: '#00FF00', strokeWidth: '0', stroke: 'none' }
          }
        ],
        attributes: { fill: '#FFFFFF', strokeWidth: '0', stroke: 'none' }
      };
      
      const props = inferStackProperties(node);
      
      expect(props.layout).toBe('stack');
      expect(props.stackDirection).toBe('vertical');
    });

    it('infers horizontal stack for horizontally arranged children', () => {
      const node: ParsedNode = {
        id: 'parent',
        type: 'rect',
        tagName: 'rect',
        x: 0, y: 0, width: 300, height: 100, area: 30000,
        children: [
          {
            id: 'child1',
            type: 'rect',
            tagName: 'rect',
            x: 10, y: 10, width: 50, height: 50, area: 2500,
            children: [],
            attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
          },
          {
            id: 'child2',
            type: 'rect',
            tagName: 'rect',
            x: 80, y: 10, width: 50, height: 50, area: 2500,
            children: [],
            attributes: { fill: '#00FF00', strokeWidth: '0', stroke: 'none' }
          }
        ],
        attributes: { fill: '#FFFFFF', strokeWidth: '0', stroke: 'none' }
      };
      
      const props = inferStackProperties(node);
      
      expect(props.layout).toBe('stack');
      expect(props.stackDirection).toBe('horizontal');
    });

    it('calculates gap between children', () => {
      const node: ParsedNode = {
        id: 'parent',
        type: 'rect',
        tagName: 'rect',
        x: 0, y: 0, width: 200, height: 300, area: 60000,
        children: [
          {
            id: 'child1',
            type: 'rect',
            tagName: 'rect',
            x: 10, y: 10, width: 100, height: 50, area: 5000,
            children: [],
            attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
          },
          {
            id: 'child2',
            type: 'rect',
            tagName: 'rect',
            x: 10, y: 80, width: 100, height: 50, area: 5000,
            children: [],
            attributes: { fill: '#00FF00', strokeWidth: '0', stroke: 'none' }
          }
        ],
        attributes: { fill: '#FFFFFF', strokeWidth: '0', stroke: 'none' }
      };
      
      const props = inferStackProperties(node);
      
      // Gap = child2.y - (child1.y + child1.height) = 80 - (10 + 50) = 20
      expect(props.gap).toBe('20px');
    });

    it('calculates padding from parent edges', () => {
      const node: ParsedNode = {
        id: 'parent',
        type: 'rect',
        tagName: 'rect',
        x: 0, y: 0, width: 200, height: 200, area: 40000,
        children: [
          {
            id: 'child1',
            type: 'rect',
            tagName: 'rect',
            x: 20, y: 30, width: 50, height: 50, area: 2500,
            children: [],
            attributes: { fill: '#FF0000', strokeWidth: '0', stroke: 'none' }
          }
        ],
        attributes: { fill: '#FFFFFF', strokeWidth: '0', stroke: 'none' }
      };
      
      const props = inferStackProperties(node);
      
      // topPadding = child.y - parent.y = 30 - 0 = 30
      // leftPadding = child.x - parent.x = 20 - 0 = 20
      expect(props.padding).toBe('30px 20px 30px 20px');
    });
  });
});


describe('parseFlatNodes - Transform offset handling', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Elements inside <g transform="translate(x, y)"> groups', () => {
    it('applies translate offset to rect elements inside a group', () => {
      const svg = createSvgElement(`
        <g transform="translate(100, 50)">
          <rect x="10" y="20" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(110); // 10 + 100
      expect(nodes[0].y).toBe(70);  // 20 + 50
    });

    it('applies translate offset to circle elements inside a group', () => {
      const svg = createSvgElement(`
        <g transform="translate(200, 100)">
          <circle cx="50" cy="50" r="25" fill="#00FF00" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(225); // (50 + 200) - 25
      expect(nodes[0].y).toBe(125); // (50 + 100) - 25
    });

    it('applies translate offset to text elements inside a group', () => {
      const svg = createSvgElement(`
        <g transform="translate(150, 75)">
          <text x="10" y="20" font-size="16">Hello</text>
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(160); // 10 + 150
      // y is adjusted for text baseline
    });

    it('accumulates transforms from nested groups', () => {
      const svg = createSvgElement(`
        <g transform="translate(100, 50)">
          <g transform="translate(50, 25)">
            <rect x="10" y="10" width="80" height="40" fill="#FF0000" />
          </g>
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(160); // 10 + 100 + 50
      expect(nodes[0].y).toBe(85);  // 10 + 50 + 25
    });

    it('handles translate with single value (y defaults to 0)', () => {
      const svg = createSvgElement(`
        <g transform="translate(100)">
          <rect x="10" y="20" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(110); // 10 + 100
      expect(nodes[0].y).toBe(20);  // 20 + 0
    });

    it('handles translate with spaces around values', () => {
      const svg = createSvgElement(`
        <g transform="translate( 100 , 50 )">
          <rect x="10" y="20" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(110);
      expect(nodes[0].y).toBe(70);
    });

    it('handles negative translate values', () => {
      const svg = createSvgElement(`
        <g transform="translate(-50, -25)">
          <rect x="100" y="100" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(50);  // 100 - 50
      expect(nodes[0].y).toBe(75);  // 100 - 25
    });

    it('handles decimal translate values', () => {
      const svg = createSvgElement(`
        <g transform="translate(100.5, 50.25)">
          <rect x="10" y="20" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(110.5);
      expect(nodes[0].y).toBe(70.25);
    });

    it('ignores non-translate transforms (scale, rotate)', () => {
      const svg = createSvgElement(`
        <g transform="scale(2) rotate(45)">
          <rect x="10" y="20" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      // Without translate, coordinates should remain unchanged
      expect(nodes[0].x).toBe(10);
      expect(nodes[0].y).toBe(20);
    });

    it('extracts translate from combined transform string', () => {
      const svg = createSvgElement(`
        <g transform="scale(2) translate(100, 50) rotate(45)">
          <rect x="10" y="20" width="80" height="40" fill="#FF0000" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].x).toBe(110); // 10 + 100
      expect(nodes[0].y).toBe(70);  // 20 + 50
    });
  });

  describe('Gallery/Portfolio Layout 2 pattern (multiple groups)', () => {
    it('correctly positions elements in multiple sibling groups', () => {
      const svg = createSvgElement(`
        <rect width="1200" height="600" fill="#F8FAFC" />
        <rect x="100" y="40" width="200" height="32" rx="16" fill="#0F172A" />
        <g transform="translate(100, 120)">
          <rect width="320" height="400" rx="16" fill="#E2E8F0" />
          <rect y="320" width="320" height="80" fill="rgba(15,23,42,0.8)" />
        </g>
        <g transform="translate(440, 120)">
          <rect width="320" height="400" rx="16" fill="#E2E8F0" />
          <rect y="320" width="320" height="80" fill="rgba(15,23,42,0.8)" />
        </g>
        <g transform="translate(780, 120)">
          <rect width="320" height="400" rx="16" fill="#E2E8F0" />
          <rect y="320" width="320" height="80" fill="rgba(15,23,42,0.8)" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      // Should have: 1 background + 1 title + 6 rects in groups = 8 total
      expect(nodes).toHaveLength(8);
      
      // Find the card backgrounds (320x400 rects)
      const cardBackgrounds = nodes.filter(n => n.width === 320 && n.height === 400);
      expect(cardBackgrounds).toHaveLength(3);
      
      // Verify positions
      expect(cardBackgrounds[0].x).toBe(100);  // First group
      expect(cardBackgrounds[0].y).toBe(120);
      
      expect(cardBackgrounds[1].x).toBe(440);  // Second group
      expect(cardBackgrounds[1].y).toBe(120);
      
      expect(cardBackgrounds[2].x).toBe(780);  // Third group
      expect(cardBackgrounds[2].y).toBe(120);
      
      // Find the overlay rects (320x80 rects)
      const overlays = nodes.filter(n => n.width === 320 && n.height === 80);
      expect(overlays).toHaveLength(3);
      
      // Verify overlay positions (y=320 in local coords + group offset)
      expect(overlays[0].x).toBe(100);
      expect(overlays[0].y).toBe(440);  // 320 + 120
      
      expect(overlays[1].x).toBe(440);
      expect(overlays[1].y).toBe(440);
      
      expect(overlays[2].x).toBe(780);
      expect(overlays[2].y).toBe(440);
    });

    it('handles rgba fill colors correctly', () => {
      const svg = createSvgElement(`
        <g transform="translate(100, 120)">
          <rect width="320" height="80" fill="rgba(15,23,42,0.8)" />
        </g>
      `);
      const nodes = parseFlatNodes(svg);
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0].attributes.fill).toBe('rgba(15,23,42,0.8)');
    });
  });
});
