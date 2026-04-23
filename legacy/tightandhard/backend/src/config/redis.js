const Redis = require('ioredis');
require('dotenv').config();

// Redis configuration
const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true;
      }
      return false;
    }
  }
);

// Test Redis connection
const testConnection = async () => {
  try {
    await redis.ping();
    console.log('✅ Redis connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', error.message);
    return false;
  }
};

// Cache helper functions
const cache = {
  // Set cache with expiration
  async set(key, value, ttl = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await redis.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  // Get cached value
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  // Delete cached value
  async delete(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },

  // Delete multiple keys by pattern
  async deletePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return 0;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  },

  // Set multiple values
  async mset(keyValuePairs) {
    try {
      const serializedPairs = keyValuePairs.map(pair => [
        pair.key,
        JSON.stringify(pair.value)
      ]).flat();
      await redis.mset(...serializedPairs);
      return true;
    } catch (error) {
      console.error('Cache mset error:', error.message);
      return false;
    }
  },

  // Get multiple values
  async mget(keys) {
    try {
      const values = await redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error.message);
      return [];
    }
  }
};

// Session management helpers
const session = {
  // Create session
  async create(sessionId, data, ttl = 86400) {
    try {
      const sessionKey = `session:${sessionId}`;
      await cache.set(sessionKey, data, ttl);
      return true;
    } catch (error) {
      console.error('Session create error:', error.message);
      return false;
    }
  },

  // Get session
  async get(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      return await cache.get(sessionKey);
    } catch (error) {
      console.error('Session get error:', error.message);
      return null;
    }
  },

  // Update session
  async update(sessionId, data, ttl = 86400) {
    try {
      const sessionKey = `session:${sessionId}`;
      await cache.set(sessionKey, data, ttl);
      return true;
    } catch (error) {
      console.error('Session update error:', error.message);
      return false;
    }
  },

  // Delete session
  async delete(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      await cache.delete(sessionKey);
      return true;
    } catch (error) {
      console.error('Session delete error:', error.message);
      return false;
    }
  },

  // Check session exists
  async exists(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      return await cache.exists(sessionKey);
    } catch (error) {
      console.error('Session exists error:', error.message);
      return false;
    }
  }
};

// Rate limiting helpers
const rateLimit = {
  // Check rate limit
  async check(identifier, limit, window) {
    try {
      const key = `ratelimit:${identifier}`;
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, window);
      }
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        reset: await redis.ttl(key)
      };
    } catch (error) {
      console.error('Rate limit check error:', error.message);
      return { allowed: true, remaining: limit, reset: 0 };
    }
  },

  // Reset rate limit
  async reset(identifier) {
    try {
      const key = `ratelimit:${identifier}`;
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Rate limit reset error:', error.message);
      return false;
    }
  }
};

// Event pub/sub for real-time updates
const pubsub = {
  // Publish event
  async publish(channel, message) {
    try {
      const result = await redis.publish(channel, JSON.stringify(message));
      return result;
    } catch (error) {
      console.error('Pub/Sub publish error:', error.message);
      return 0;
    }
  },

  // Subscribe to channel
  async subscribe(channel, callback) {
    try {
      const subscriber = redis.duplicate();
      await subscriber.subscribe(channel);
      subscriber.on('message', (chan, message) => {
        if (chan === channel) {
          try {
            callback(JSON.parse(message));
          } catch (error) {
            console.error('Message parse error:', error.message);
          }
        }
      });
      return subscriber;
    } catch (error) {
      console.error('Pub/Sub subscribe error:', error.message);
      return null;
    }
  },

  // Unsubscribe from channel
  async unsubscribe(channel, subscriber) {
    try {
      if (subscriber) {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
      }
      return true;
    } catch (error) {
      console.error('Pub/Sub unsubscribe error:', error.message);
      return false;
    }
  }
};

module.exports = {
  redis,
  testConnection,
  cache,
  session,
  rateLimit,
  pubsub
};