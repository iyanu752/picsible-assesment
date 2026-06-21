import { Global, Logger, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('RedisModule');
        const retryStrategy = (times: number) => {
          if (times > 3) {
            return null;
          }

          return Math.min(times * 100, 1000);
        };

        const redisUrl = process.env.REDIS_URL;
        const password = process.env.REDIS_PASSWORD?.trim();
        const username = process.env.REDIS_USERNAME?.trim() ?? 'default';
        const tlsEnabled = process.env.REDIS_TLS === 'true';
        const redis = redisUrl
          ? new Redis(redisUrl, {
              retryStrategy,
              ...(tlsEnabled
                ? {
                    tls: {
                      rejectUnauthorized: false,
                    },
                  }
                : {}),
            })
          : new Redis({
              host:
                process.env.REDIS_HOST ?? 'coast-handy-engaging-30408.db.redis.io',
              port: Number(process.env.REDIS_PORT ?? 15487),
              username,
              ...(password ? { password } : {}),
              ...(tlsEnabled
                ? {
                    tls: {
                      rejectUnauthorized: false,
                    },
                  }
                : {}),
              retryStrategy,
            });

        redis.on('error', (error) => {
          logger.error(`Redis connection error: ${error.message}`);
        });

        redis.on('connect', () => {
          logger.log('Redis socket connected');
        });

        redis.on('ready', () => {
          logger.log('Redis connection ready');
        });

        return redis;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
