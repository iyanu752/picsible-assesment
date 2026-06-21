import { Module } from '@nestjs/common';
import { DashboardCacheService } from './dashboard/dashboard-cache.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { RedisModule } from './config/redis.module';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrderStoreService } from './orders/order-store.service';

@Module({
  imports: [RedisModule],
  controllers: [OrdersController, DashboardController],
  providers: [OrderStoreService, OrdersService, DashboardService, DashboardCacheService],
})
export class AppModule {}
