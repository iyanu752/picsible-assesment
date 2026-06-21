import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { DashboardCacheService } from '../dashboard/dashboard-cache.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStageDto } from './dto/update-order-stage.dto';
import { Order } from './order.types';
import { OrderStoreService } from './order-store.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly orderStore: OrderStoreService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = {
      id: uuid(),
      customerName: createOrderDto.customerName,
      productName: createOrderDto.productName,
      quantity: createOrderDto.quantity,
      stage: createOrderDto.stage ?? 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const createdOrder = await this.orderStore.create(order);
    this.logger.log(`Created order ${createdOrder.id}`);
    await this.dashboardCache.invalidate(`order created: ${createdOrder.id}`);

    return createdOrder;
  }

  async updateStage(id: string, updateOrderStageDto: UpdateOrderStageDto): Promise<Order> {
    const order = await this.orderStore.findById(id);
    const updatedOrder: Order = {
      ...order,
      stage: updateOrderStageDto.stage,
      updatedAt: new Date().toISOString(),
    };

    const savedOrder = await this.orderStore.update(updatedOrder);
    this.logger.log(`Updated order ${savedOrder.id} stage to ${savedOrder.stage}`);
    await this.dashboardCache.invalidate(`order stage updated: ${savedOrder.id}`);

    return savedOrder;
  }

  async search(query?: string): Promise<Order[]> {
    const orders = await this.orderStore.search(query);
    this.logger.log(`Returned ${orders.length} orders${query ? ` for query "${query}"` : ''}`);

    return orders;
  }

  async findAll(): Promise<Order[]> {
    return this.orderStore.findAll();
  }
}
