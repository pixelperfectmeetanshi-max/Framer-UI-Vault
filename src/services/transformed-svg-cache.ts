/**
 * Transformed SVG Cache Service
 * Requirements: 6.2
 * 
 * LRU cache for storing transformed SVG results.
 * Keyed by SVG hash + theme mode + accent color.
 */

export interface CacheKey {
  svgHash: string;
  themeMode: 'light' | 'dark';
  accentColor: string;
}

/** Maximum cache size (number of entries) */
const MAX_CACHE_SIZE = 500;

/**
 * Simple hash function for SVG content
 * Uses djb2 algorithm for fast hashing
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Generate cache key string from CacheKey object
 */
function getCacheKeyString(key: CacheKey): string {
  return `${key.svgHash}|${key.themeMode}|${key.accentColor.toUpperCase()}`;
}

/**
 * LRU Cache implementation for transformed SVGs
 */
class TransformedSvgCache {
  private cache: Map<string, string> = new Map();
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  /**
   * Generate hash for SVG content
   */
  hashSvg(svg: string): string {
    return hashString(svg);
  }

  /**
   * Get cached transformed SVG
   */
  get(key: CacheKey): string | undefined {
    const keyStr = getCacheKeyString(key);
    const value = this.cache.get(keyStr);
    
    if (value !== undefined) {
      // Move to end (most recently used) - LRU behavior
      this.cache.delete(keyStr);
      this.cache.set(keyStr, value);
    }
    
    return value;
  }

  /**
   * Store transformed SVG in cache
   */
  set(key: CacheKey, transformedSvg: string): void {
    const keyStr = getCacheKeyString(key);
    
    // If key exists, delete it first (to update position)
    if (this.cache.has(keyStr)) {
      this.cache.delete(keyStr);
    }
    
    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(keyStr, transformedSvg);
  }

  /**
   * Check if transformation is cached
   */
  has(key: CacheKey): boolean {
    return this.cache.has(getCacheKeyString(key));
  }

  /**
   * Clear all cached transformations
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear cache entries for a specific theme/color combination
   */
  clearForSettings(themeMode: 'light' | 'dark', accentColor: string): void {
    const suffix = `|${themeMode}|${accentColor.toUpperCase()}`;
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.endsWith(suffix)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const transformedSvgCache = new TransformedSvgCache();

// Export class for testing
export { TransformedSvgCache };
