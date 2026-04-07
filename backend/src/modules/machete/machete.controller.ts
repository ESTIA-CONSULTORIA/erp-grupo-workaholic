import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
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

  @Get('lotes')
  getLotes(@Param('companyId') cid: string) {
    return this.svc.getLotes(cid);
  }

  @Post('lotes')
  crearLote(@Param('companyId') cid: string, @Body() body: any, @Request() req: any) {
    return this.svc.crearLote(cid, req.user.sub, body);
  }

  @Put('lotes/:loteId/salida-horno')
  salida(@Param('loteId') id: string, @Body() body: any) {
    return this.svc.registrarSalidaHorno(id, body);
  }

  @Put('lotes/:loteId/empaque')
  empaque(@Param('loteId') id: string, @Body() body: any) {
    return this.svc.registrarEmpaque(id, body);
  }

  @Put('lotes/:loteId/cerrar')
  cerrar(@Param('loteId') id: string) {
    return this.svc.cerrarLote(id);
  }
  
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
    @Query('period')    period?: string,
    @Query('channel')   channel?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
  ) { return this.svc.getSales(cid, period, channel, startDate, endDate); }

  @Post('sales')
  registerSale(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.registerSale(cid, body);
  }

  @Get('reports/sales')
  salesReport(@Param('companyId') cid: string, @Query('period') period: string) {
    return this.svc.getSales(cid, period);
  }
}
