import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { MacheteService } from './machete.service';

@ApiTags('Machete')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/machete')
export class MacheteController {
  constructor(private svc: MacheteService) {}

  @Get('products')
  getProducts(@Param('companyId') cid: string) { return this.svc.getProducts(cid); }

  @Put('products/:productId')
  updateProduct(@Param('productId') id: string, @Body() body: any) {
    return this.svc.updateProduct(id, body);
  }

  @Get('inventory/pt')
  getPT(@Param('companyId') cid: string) { return this.svc.getPTInventory(cid); }

  @Get('recipes')
  getRecipes(@Param('companyId') cid: string) { return this.svc.getRecipes(cid); }

  @Get('sales')
  getSales(
    @Param('companyId') cid: string,
    @Query('period') period?: string,
    @Query('channel') channel?: string,
  ) { return this.svc.getSales(cid, period, channel); }

  @Post('sales')
  registerSale(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.registerSale(cid, body);
  }

  @Get('reports/sales')
  salesReport(@Param('companyId') cid: string, @Query('period') period: string) {
    return this.svc.getSales(cid, period);
  }
}
