// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { LoncheService } from './lonche.service';

@Controller('companies/:companyId/lonche')
@UseGuards(JwtAuthGuard)
export class LoncheController {
  constructor(private svc: LoncheService) {}

  @Get('dashboard')
  dashboard(@Param('companyId') cid: string) { return this.svc.getDashboard(cid); }

  // Catálogo
  @Get('products')
  getProducts(@Param('companyId') cid: string) { return this.svc.getProducts(cid); }
  @Post('products')
  createProduct(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createProduct(cid, body); }
  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: any) { return this.svc.updateProduct(id, body); }

  // Turnos
  @Get('turnos')
  getTurnos(@Param('companyId') cid: string) { return this.svc.getTurnos(cid); }
  @Get('turnos/activo')
  getTurnoActivo(@Param('companyId') cid: string) { return this.svc.getTurnoActivo(cid); }
  @Post('turnos/abrir')
  abrirTurno(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.abrirTurno(cid, req.user.sub, body.cajeroName || req.user.email);
  }
  @Put('turnos/:id/cerrar')
  cerrarTurno(@Param('id') id: string, @Body() body: any) { return this.svc.cerrarTurno(id, body); }
  @Put('turnos/:id/reabrir')
  reabrirTurno(@Param('companyId') cid: string, @Param('id') id: string,
    @Request() req: any, @Body() body: any) {
    return this.svc.reabrirTurno(id, req.user.sub, body.motivo || '');
  }

  @Put('turnos/:id/validar')
  validarTurno(@Param('id') id: string, @Request() req: any) { return this.svc.validarTurno(id, req.user.sub); }

  // Surtido
  @Post('turnos/:id/surtido')
  crearSurtido(@Param('companyId') cid: string, @Param('id') turnoId: string,
    @Request() req: any, @Body() body: any) {
    return this.svc.crearSurtido(turnoId, cid, req.user.sub, body.items, body.type);
  }

  // Ventas POS
  @Post('turnos/:id/ventas')
  registrarVenta(@Param('companyId') cid: string, @Param('id') turnoId: string, @Body() body: any) {
    return this.svc.registrarVenta(cid, turnoId, body);
  }

  // Alumnos / prepago
  @Get('students')
  getStudents(@Param('companyId') cid: string, @Query('search') search: string) {
    return this.svc.getStudents(cid, search);
  }
  @Get('students/by-code/:code')
  findByCode(@Param('companyId') cid: string, @Param('code') code: string) {
    return this.svc.findStudentByCode(cid, code);
  }
  @Post('students')
  createStudent(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createStudent(cid, body); }
  @Put('students/:id')
  updateStudent(@Param('id') id: string, @Body() body: any) { return this.svc.updateStudent(id, body); }
  @Post('students/:id/recargar')
  recargar(@Param('companyId') cid: string, @Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.recargar(cid, id, { ...body, rechargedById: req.user.sub });
  }
  @Get('students/:id/transactions')
  getTransactions(@Param('companyId') cid: string, @Param('id') id: string) {
    return this.svc.getTransactions(cid, id);
  }

  // Reportes
  @Get('reportes/cooperativa')
  reporteCooperativa(@Param('companyId') cid: string, @Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.svc.getReporteCooperativa(cid, desde || new Date().toISOString().slice(0,10), hasta || new Date().toISOString().slice(0,10));
  }
  @Get('reportes/tutor/:studentId')
  reporteTutor(@Param('companyId') cid: string, @Param('studentId') sid: string,
    @Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.svc.getReporteTutor(cid, sid, desde || new Date().toISOString().slice(0,10), hasta || new Date().toISOString().slice(0,10));
  }
}
