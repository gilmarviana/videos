import Redis from 'ioredis';
import { config } from '../config';

class RedisClient {
  private client: Redis | null = null;
  private isConnected = false;

  async connect(): Promise<Redis> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      this.client = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const redisClient = new RedisClient();

export default redisClient;

// Helper functions for common Redis operations
export const redisHelpers = {
  // Session management
  async setSession(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    const client = await redisClient.connect();
    await client.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  },

  async getSession(sessionId: string): Promise<any | null> {
    const client = await redisClient.connect();
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  async deleteSession(sessionId: string): Promise<void> {
    const client = await redisClient.connect();
    await client.del(`session:${sessionId}`);
  },

  // Trial time tracking
  async setTrialTime(userId: string, minutesUsed: number): Promise<void> {
    const client = await redisClient.connect();
    await client.setex(`trial:${userId}`, 86400, minutesUsed.toString()); // 24 hours TTL
  },

  async getTrialTime(userId: string): Promise<number> {
    const client = await redisClient.connect();
    const minutes = await client.get(`trial:${userId}`);
    return minutes ? parseInt(minutes, 10) : 0;
  },

  // Caching
  async setCache(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    const client = await redisClient.connect();
    await client.setex(`cache:${key}`, ttlSeconds, JSON.stringify(data));
  },

  async getCache(key: string): Promise<any | null> {
    const client = await redisClient.connect();
    const data = await client.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  },

  async deleteCache(key: string): Promise<void> {
    const client = await redisClient.connect();
    await client.del(`cache:${key}`);
  },

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const client = await redisClient.connect();
    const current = await client.incr(`rate:${key}`);
    
    if (current === 1) {
      await client.expire(`rate:${key}`, windowSeconds);
    }
    
    const remaining = Math.max(0, limit - current);
    return {
      allowed: current <= limit,
      remaining
    };
  }
};