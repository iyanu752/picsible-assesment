import { Module } from '@nestjs/common';
import { RedisModule } from './config/redis.module';

@Module({
  imports: [RedisModule],
})
export class AppModule {}
