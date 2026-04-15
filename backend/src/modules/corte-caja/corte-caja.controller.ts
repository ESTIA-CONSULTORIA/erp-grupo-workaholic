import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { CorteCajaService } from './corte-caja.service';
import { JwtAuthGuard } from '../auth/auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/corte-caja')
export class CorteCajaController {
  constructor(private svc: CorteCajaService) {}

  @Get()
  getCortes(@Param('companyId') cid: string, @Query('status') status?: string) {
    return this.svc.getCortes(cid, status);
  }

  @Get('ventas-del-dia')
  getVentasDelDia(@Param('companyId') cid: string, @Query('fecha') fecha: string) {
    return this.svc.getVentasDelDia(cid, fecha || new Date().toISOString().slice(0,10));
  }

  @Post()
  crearCorte(@Param('companyId') cid: string, @Body() body: any, @Request() req: any) {
    return this.svc.crearCorte(cid, req.user.sub, body);
  }

  @Put(':corteId/validar')
  validar(@Param('corteId') id: string, @Body() body: any, @Request() req: any) {
    return this.svc.validarCorte(id, req.user.sub, body);
  }

  @Put(':corteId/rechazar')
  rechazar(@Param('corteId') id: string, @Body() body: any, @Request() req: any) {
    return this.svc.rechazarCorte(id, req.user.sub, body.notas || '');
  }

  // Cajero responde a un corte rechazado — regresa a PENDIENTE para re-validación
  @Put(':corteId/responder')
  responder(@Param('corteId') id: string, @Body() body: any, @Request() req: any) {
    return this.svc.responderCorte(id, req.user.sub, body.respuesta || '', body.ticketUrl, body.ticketNombre);
  }
}
