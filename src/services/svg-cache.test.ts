/**
 * Tests for SVG Parsing Cache Service
 * Requirement 5.3: Cache parsed SVG results to avoid re-parsing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SvgParsingCache, svgParsingCache } from './svg-cache';
import type { ParsedNode } from '../types';

// Helper to create mock parsed nodes
function createMockNode(id: string): ParsedNode {
  return {
    id,
    type: 'rect',
    tagName: 'rect',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    area: 10000,
    children: [],
    attributes: {
      fill: '#000000',
      strokeWidth: '0',
      stroke: 'none',
    },
  };
}

describe('SvgParsingCache', () => {
  let cache: SvgParsingCache;

  beforeEach(() => {
    cache = new SvgParsingCache();
  });

  describe('basic operations', () => {
    it('should store and retrieve cached results', () => {
      const svgContent = '<svg><rect width="100" height="100"/></svg>';
      const nodes = [createMockNode('node-1')];
      const dimensions = { width: 100, height: 100 };

      cache.set(svgContent, nodes, dimensions);
      const result = cache.get(svgContent);

      expect(result).toBeDefined();
      expect(result?.nodes).toEqual(nodes);
      expect(result?.dimensions).toEqual(dimensions);
    });

    it('should return undefined for uncached content', () => {
      const result = cache.get('<svg><rect/></svg>');
      expect(result).toBeUndefined();
    });

    it('should correctly report if content is cached', () => {
      const svgContent = '<svg><rect width="100" height="100"/></svg>';
      const nodes = [createMockNode('node-1')];
      const dimensions = { width: 100, height: 100 };

      expect(cache.has(svgContent)).toBe(false);
      
      cache.set(svgContent, nodes, dimensions);
      
      expect(cache.has(svgContent)).toBe(true);
    });

    it('should track cache size correctly', () => {
      expect(cache.size).toBe(0);

      cache.set('<svg>1</svg>', [createMockNode('1')], { width: 100, height: 100 });
      expect(cache.size).toBe(1);

      cache.set('<svg>2</svg>', [createMockNode('2')], { width: 200, height: 200 });
      expect(cache.size).toBe(2);
    });

    it('should clear all cached entries', () => {
      cache.set('<svg>1</svg>', [createMockNode('1')], { width: 100, height: 100 });
      cache.set('<svg>2</svg>', [createMockNode('2')], { width: 200, height: 200 });
      
      expect(cache.size).toBe(2);
      
      cache.clear();
      
      expect(cache.size).toBe(0);
      expect(cache.get('<svg>1</svg>')).toBeUndefined();
    });
  });

  describe('cache key generation', () => {
    it('should generate same key for identical content', () => {
      const svgContent = '<svg><rect width="100" height="100"/></svg>';
      const nodes = [createMockNode('node-1')];
      const dimensions = { width: 100, height: 100 };

      cache.set(svgContent, nodes, dimensions);
      
      // Same content should hit the cache
      const result = cache.get(svgContent);
      expect(result).toBeDefined();
    });

    it('should generate different keys for different content', () => {
      const svg1 = '<svg><rect width="100" height="100"/></svg>';
      const svg2 = '<svg><rect width="200" height="200"/></svg>';
      const nodes1 = [createMockNode('node-1')];
      const nodes2 = [createMockNode('node-2')];
      const dimensions = { width: 100, height: 100 };

      cache.set(svg1, nodes1, dimensions);
      cache.set(svg2, nodes2, dimensions);

      expect(cache.get(svg1)?.nodes).toEqual(nodes1);
      expect(cache.get(svg2)?.nodes).toEqual(nodes2);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entries when max size exceeded', () => {
      const smallCache = new SvgParsingCache({ maxEntries: 3 });
      const dimensions = { width: 100, height: 100 };

      // Add 3 entries
      smallCache.set('<svg>1</svg>', [createMockNode('1')], dimensions);
      smallCache.set('<svg>2</svg>', [createMockNode('2')], dimensions);
      smallCache.set('<svg>3</svg>', [createMockNode('3')], dimensions);

      expect(smallCache.size).toBe(3);

      // Add 4th entry, should evict the first one
      smallCache.set('<svg>4</svg>', [createMockNode('4')], dimensions);

      expect(smallCache.size).toBe(3);
      expect(smallCache.has('<svg>1</svg>')).toBe(false);
      expect(smallCache.has('<svg>2</svg>')).toBe(true);
      expect(smallCache.has('<svg>3</svg>')).toBe(true);
      expect(smallCache.has('<svg>4</svg>')).toBe(true);
    });

    it('should update access order on get', () => {
      const smallCache = new SvgParsingCache({ maxEntries: 3 });
      const dimensions = { width: 100, height: 100 };

      // Add 3 entries
      smallCache.set('<svg>1</svg>', [createMockNode('1')], dimensions);
      smallCache.set('<svg>2</svg>', [createMockNode('2')], dimensions);
      smallCache.set('<svg>3</svg>', [createMockNode('3')], dimensions);

      // Access the first entry to make it most recently used
      smallCache.get('<svg>1</svg>');

      // Add 4th entry, should evict the second one (now least recently used)
      smallCache.set('<svg>4</svg>', [createMockNode('4')], dimensions);

      expect(smallCache.has('<svg>1</svg>')).toBe(true);
      expect(smallCache.has('<svg>2</svg>')).toBe(false);
      expect(smallCache.has('<svg>3</svg>')).toBe(true);
      expect(smallCache.has('<svg>4</svg>')).toBe(true);
    });
  });

  describe('cache statistics', () => {
    it('should return correct statistics', () => {
      const dimensions = { width: 100, height: 100 };
      
      cache.set('<svg>1</svg>', [createMockNode('1')], dimensions);
      cache.set('<svg>2</svg>', [createMockNode('2')], dimensions);

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxEntries).toBe(100);
      expect(stats.keys).toHaveLength(2);
    });
  });

  describe('timestamp tracking', () => {
    it('should record timestamp when caching', () => {
      const svgContent = '<svg><rect/></svg>';
      const nodes = [createMockNode('node-1')];
      const dimensions = { width: 100, height: 100 };

      const beforeTime = Date.now();
      cache.set(svgContent, nodes, dimensions);
      const afterTime = Date.now();

      const result = cache.get(svgContent);
      
      expect(result?.cachedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(result?.cachedAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(svgParsingCache).toBeInstanceOf(SvgParsingCache);
    });

    it('should persist data across accesses', () => {
      const svgContent = '<svg>singleton-test</svg>';
      const nodes = [createMockNode('singleton')];
      const dimensions = { width: 100, height: 100 };

      svgParsingCache.set(svgContent, nodes, dimensions);
      
      // Clear after test to not affect other tests
      const result = svgParsingCache.get(svgContent);
      expect(result).toBeDefined();
      
      svgParsingCache.clear();
    });
  });
});
