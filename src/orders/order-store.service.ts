import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Order } from './order.types';

@Injectable()
export class OrderStoreService {
  private readonly logger = new Logger(OrderStoreService.name);
  private readonly filePath = join(process.cwd(), 'db', 'orders.json');

  async findAll(): Promise<Order[]> {
    return this.readOrders();
  }

  async search(query?: string): Promise<Order[]> {
    const orders = await this.readOrders();
    const normalizedQuery = query?.trim().toLowerCase();

    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) =>
      [order.id, order.customerName, order.productName, order.stage].some(
        (value) => value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }

  async create(order: Order): Promise<Order> {
    const orders = await this.readOrders();
    const updatedOrders = [...orders, order];

    await this.writeOrders(updatedOrders);
    this.logger.log(`Order ${order.id} saved to JSON store`);

    return order;
  }

  async update(order: Order): Promise<Order> {
    const orders = await this.readOrders();
    const orderIndex = orders.findIndex((existingOrder) => existingOrder.id === order.id);

    if (orderIndex === -1) {
      throw new NotFoundException(`Order ${order.id} not found`);
    }

    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = order;

    await this.writeOrders(updatedOrders);
    this.logger.log(`Order ${order.id} updated in JSON store`);

    return order;
  }

  async findById(id: string): Promise<Order> {
    const orders = await this.readOrders();
    const order = orders.find((existingOrder) => existingOrder.id === id);

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  private async readOrders(): Promise<Order[]> {
    try {
      const file = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(file) as Order[];
    } catch (error) {
      if (this.isNodeError(error) && error.code === 'ENOENT') {
        await fs.mkdir(join(process.cwd(), 'db'), { recursive: true });
        await this.writeOrders([]);
        return [];
      }

      throw error;
    }
  }

  private async writeOrders(orders: Order[]): Promise<void> {
    await fs.mkdir(join(process.cwd(), 'db'), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(orders, null, 2));
  }

  private isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error;
  }
}
