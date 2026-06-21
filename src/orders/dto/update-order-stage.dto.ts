import { IsIn } from 'class-validator';
import { ORDER_STAGES, OrderStage } from '../order.types';

export class UpdateOrderStageDto {
  @IsIn(ORDER_STAGES)
  stage: OrderStage;
}
