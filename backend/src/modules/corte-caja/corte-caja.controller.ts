import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CorteCajaService } from './corte-caja.service';
import { JwtAuthGuard } from '../auth/auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/companies/:companyId/corte-caja')
export class CorteCajaController {
  constructor(private svc: CorteCajaService) {}

  @Get()
  getCortes(@Param('companyId') cid: string, @Query('status') status?: string) {
    return this.svc.getCortes(cid, status);
  }

  @Post()
  crearCorte(@Param('companyId') cid: string, @Body() body: any, @Request() req: any) {
    return this.svc.crearCorte(cid, req.user.sub, body);
  }

  @Put(':corteId/validar')
  validarCorte(@Param('corteId') id: string, @Body() body: any, @Request() req: any) {
    return this.svc.validarCorte(id, req.user.sub, body);
  }

  @Put(':corteId/rechazar')
  rechazarCorte(@Param('corteId') id: string, @Body() body: any, @Request() req: any) {
    return this.svc.rechazarCorte(id, req.user.sub, body.notas);
  }
}
