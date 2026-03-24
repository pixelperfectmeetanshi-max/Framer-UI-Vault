/**
 * SVG Parsing Cache Service
 * Requirement 5.3: Cache parsed SVG results to avoid re-parsing on subsequent views
 * 
 * This service provides an in-memory cache for parsed SVG results.
 * It uses a hash of the SVG content as the cache key to efficiently
 * look up previously parsed results.
 */

import type { ParsedNode } from '../types';

/**
 * Cached SVG parse result
 */
export interface CachedSvgResult {
  /** The parsed node hierarchy */
  nodes: ParsedNode[];
  /** SVG dimensions */
  dimensions: { width: number; height: number };
  /** Timestamp when the result was cached */
  cachedAt: number;
}

/**
 * Configuration options for the SVG cache
 */
export interface SvgCacheOptions {
  /** Maximum number of entries to keep in cache (default: 100) */
  maxEntries?: number;
}

/**
 * Simple hash function for SVG content
 * Uses a fast string hashing algorithm suitable for cache keys
 * 
 * @param str - The string to hash
 * @returns A numeric hash value as a string
 */
function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
}

/**
 * SVG Parsing Cache
 * Requirement 5.3: THE Plugin SHALL cache parsed SVG results to avoid re-parsing
 * 
 * Provides an LRU-style cache for parsed SVG results to improve performance
 * when the same SVG content is viewed multiple times.
 */
class SvgParsingCache {
  private cache: Map<string, CachedSvgResult>;
  private maxEntries: number;
  private accessOrder: string[]; // Track access order for LRU eviction

  constructor(options: SvgCacheOptions = {}) {
    this.cache = new Map();
    this.maxEntries = options.maxEntries ?? 100;
    this.accessOrder = [];
  }

  /**
   * Generate a cache key from SVG content
   * @param svgContent - The SVG string content
   * @returns A unique cache key
   */
  private generateKey(svgContent: string): string {
    return hashString(svgContent);
  }

  /**
   * Update access order for LRU tracking
   * @param key - The cache key that was accessed
   */
  private updateAccessOrder(key: string): void {
    // Remove key from current position
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entries if cache exceeds max size
   */
  private evictIfNeeded(): void {
    while (this.cache.size >= this.maxEntries && this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Get cached parse result for SVG content
   * Requirement 5.3: Avoid re-parsing on subsequent views
   * 
   * @param svgContent - The SVG string content
   * @returns The cached result or undefined if not cached
   */
  get(svgContent: string): CachedSvgResult | undefined {
    const key = this.generateKey(svgContent);
    const result = this.cache.get(key);
    
    if (result) {
      this.updateAccessOrder(key);
    }
    
    return result;
  }

  /**
   * Cache a parse result for SVG content
   * Requirement 5.3: Cache parsed SVG results
   * 
   * @param svgContent - The SVG string content
   * @param result - The parse result to cache
   */
  set(svgContent: string, nodes: ParsedNode[], dimensions: { width: number; height: number }): void {
    const key = this.generateKey(svgContent);
    
    // Evict old entries if needed
    this.evictIfNeeded();
    
    this.cache.set(key, {
      nodes,
      dimensions,
      cachedAt: Date.now(),
    });
    
    this.updateAccessOrder(key);
  }

  /**
   * Check if SVG content is cached
   * @param svgContent - The SVG string content
   * @returns true if the content is cached
   */
  has(svgContent: string): boolean {
    const key = this.generateKey(svgContent);
    return this.cache.has(key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get the current number of cached entries
   * @returns The cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics for debugging/monitoring
   * @returns Cache statistics object
   */
  getStats(): { size: number; maxEntries: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export a singleton instance for global use
export const svgParsingCache = new SvgParsingCache();

// Export the class for testing or custom instances
export { SvgParsingCache };
