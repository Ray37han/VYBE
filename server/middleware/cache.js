import { getRedisClient } from '../config/redis.js';

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 */
export const cacheMiddleware = (duration = 300) => {
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
      // Create cache key from URL and query params
      const cacheKey = `cache:${req.originalUrl || req.url}`;
      
      // Try to get cached response
      const cachedResponse = await redisClient.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        redisClient.setEx(cacheKey, duration, JSON.stringify(data))
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
