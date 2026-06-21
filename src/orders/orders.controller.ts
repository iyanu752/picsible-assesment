import { Body, Controller, Get, Patch, Post, Query, Param } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStageDto } from './dto/update-order-stage.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body() updateOrderStageDto: UpdateOrderStageDto,
  ) {
    return this.ordersService.updateStage(id, updateOrderStageDto);
  }

  @Get()
  search(@Query('q') query?: string) {
    return this.ordersService.search(query);
  }
}
