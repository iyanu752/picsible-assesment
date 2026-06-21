import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ORDER_STAGES, OrderStage } from '../order.types';

export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsString()
  productName: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsIn(ORDER_STAGES)
  stage?: OrderStage;
}
