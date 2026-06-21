import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../config/redis.module';
import { DashboardStats } from '../orders/order.types';

const DASHBOARD_CACHE_KEY = 'dashboard:stats';
const DASHBOARD_CACHE_TTL_SECONDS = 60;

@Injectable()
export class DashboardCacheService {
  private readonly logger = new Logger(DashboardCacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get(): Promise<DashboardStats | null> {
    try {
      this.logger.log(`Checking Redis cache key ${DASHBOARD_CACHE_KEY}`);
      const cachedStats = await this.redis.get(DASHBOARD_CACHE_KEY);

      if (!cachedStats) {
        this.logger.log(`Redis cache miss for ${DASHBOARD_CACHE_KEY}`);
        return null;
      }

      this.logger.log(`Redis cache hit for ${DASHBOARD_CACHE_KEY}`);
      return JSON.parse(cachedStats) as DashboardStats;
    } catch (error) {
      this.logger.warn(`Redis cache read failed: ${this.errorMessage(error)}`);
      return null;
    }
  }

  async set(stats: DashboardStats): Promise<void> {
    try {
      await this.redis.set(
        DASHBOARD_CACHE_KEY,
        JSON.stringify(stats),
        'EX',
        DASHBOARD_CACHE_TTL_SECONDS,
      );
      this.logger.log(
        `Redis cache set for ${DASHBOARD_CACHE_KEY} with ${DASHBOARD_CACHE_TTL_SECONDS}s TTL`,
      );
    } catch (error) {
      this.logger.warn(`Redis cache write failed: ${this.errorMessage(error)}`);
    }
  }

  async invalidate(reason: string): Promise<void> {
    try {
      const deletedKeys = await this.redis.del(DASHBOARD_CACHE_KEY);
      this.logger.log(
        `Redis cache invalidated for ${DASHBOARD_CACHE_KEY}; deleted=${deletedKeys}; reason=${reason}`,
      );
    } catch (error) {
      this.logger.warn(`Redis cache invalidation failed: ${this.errorMessage(error)}`);
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
