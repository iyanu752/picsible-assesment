export const ORDER_STAGES = [
  'pending',
  'in_production',
  'quality_check',
  'completed',
  'cancelled',
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export interface Order {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  stage: OrderStage;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalQuantity: number;
  byStage: Record<OrderStage, number>;
}
