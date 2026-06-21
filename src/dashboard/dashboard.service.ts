import { Injectable, Logger } from '@nestjs/common';
import { DashboardCacheService } from './dashboard-cache.service';
import { DashboardStats, ORDER_STAGES } from '../orders/order.types';
import { OrderStoreService } from '../orders/order-store.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly dashboardCache: DashboardCacheService,
    private readonly orderStore: OrderStoreService,
  ) {}

  async getDashboard(): Promise<DashboardStats> {
    const cachedStats = await this.dashboardCache.get();

    if (cachedStats) {
      return cachedStats;
    }

    this.logger.log('Computing dashboard stats from JSON store');
    const orders = await this.orderStore.findAll();
    const stats = orders.reduce<DashboardStats>(
      (dashboardStats, order) => {
        dashboardStats.totalOrders += 1;
        dashboardStats.totalQuantity += order.quantity;
        dashboardStats.byStage[order.stage] += 1;
        return dashboardStats;
      },
      {
        totalOrders: 0,
        totalQuantity: 0,
        byStage: ORDER_STAGES.reduce(
          (counts, stage) => ({ ...counts, [stage]: 0 }),
          {} as DashboardStats['byStage'],
        ),
      },
    );

    await this.dashboardCache.set(stats);
    return stats;
  }
}
