import { getRedisClient } from '../config/redis.js';

/**
 * Normalize cache key by sorting query parameters alphabetically.
 * Ensures ?page=1&sort=newest and ?sort=newest&page=1 hit the same cache entry.
 */
const normalizeCacheKey = (url) => {
  try {
    const [path, queryString] = url.split('?');
    if (!queryString) return `cache:${url}`;
    const params = new URLSearchParams(queryString);
    const sorted = new URLSearchParams([...params.entries()].sort());
    return `cache:${path}?${sorted.toString()}`;
  } catch {
    return `cache:${url}`;
  }
};

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default from CACHE_TTL env or 60)
 */
export const cacheMiddleware = (duration) => {
  const ttl = duration || parseInt(process.env.CACHE_TTL) || 60;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = getRedisClient();
    
    // Skip caching if Redis is not available
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Create normalized cache key from URL and query params
      const cacheKey = normalizeCacheKey(req.originalUrl || req.url);
      
      // Try to get cached response
      const cachedResponse = await redisClient.get(cacheKey);
      
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
          .catch(err => console.error('Cache set error:', err.message));
        
        // Send response using original function
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Cache key pattern (e.g., 'cache:/api/products*')
 */
export const invalidateCache = async (pattern) => {
  const redisClient = getRedisClient();
  
  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    // Scan for keys matching the pattern
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️  Invalidated ${keys.length} cache entries matching: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  const redisClient = getRedisClient();
  
  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.flushDb();
    console.log('🗑️  All cache cleared');
  } catch (error) {
    console.error('Clear cache error:', error.message);
  }
};

/**
 * Warm cache for popular routes on server startup.
 * Pre-populates Redis with the most commonly hit product endpoints.
 * @param {string} baseUrl - Internal base URL for the API (e.g., http://localhost:5000/api)
 */
export const warmCache = async (baseUrl) => {
  const redisClient = getRedisClient();
  if (!redisClient || !redisClient.isOpen) return;

  const routes = [
    '/products?page=1&limit=12&sort=newest',
    '/products?page=1&limit=12&sort=trending',
    '/products?page=1&limit=12&sort=price_asc',
    '/products?page=2&limit=12&sort=newest',
  ];

  console.log('🔥 Warming cache for popular routes...');
  
  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route}`);
      if (response.ok) {
        const data = await response.json();
        const cacheKey = normalizeCacheKey(route);
        const ttl = parseInt(process.env.CACHE_TTL) || 60;
        await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
      }
    } catch {
      // Silently skip — cache warming is optional
    }
  }
  console.log('✅ Cache warming complete');
};
