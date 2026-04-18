import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { RhService } from './rh.service';

@Controller('companies/:companyId/rh')
@UseGuards(JwtAuthGuard)
export class RhController {
  constructor(private svc: RhService) {}

  // Portal empleado
  @Get('me')
  myProfile(@Param('companyId') cid: string, @Request() req: any) {
    return this.svc.getMyProfile(cid, req.user.sub);
  }

  @Post('me/vacations')
  myRequest(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.getMyProfile(cid, req.user.sub).then(async emp => {
      if (!emp) throw new Error('No tienes un expediente vinculado');
      return this.svc.requestVacation(cid, emp.id, req.user.sub, body);
    });
  }

  @Put('employees/:id/link-user')
  linkUser(@Param('id') id: string, @Body() body: any) {
    return this.svc.linkUserToEmployee(id, body.userId);
  }

  @Get('dashboard')
  dashboard(@Param('companyId') cid: string) { return this.svc.getDashboard(cid); }

  @Get('employees')
  findAll(@Param('companyId') cid: string, @Query() q: any) { return this.svc.findAllEmployees(cid, q); }

  @Post('employees')
  create(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createEmployee(cid, body); }

  @Get('employees/:id')
  findOne(@Param('id') id: string) { return this.svc.findOneEmployee(id); }

  @Put('employees/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateEmployee(id, body); }

  @Get('employees/:id/documents')
  getDocuments(@Param('id') id: string) { return this.svc.getDocuments(id); }

  @Get('employees/:id/documents/missing')
  getMissing(@Param('id') id: string) { return this.svc.getMissingDocuments(id); }

  @Post('employees/:id/documents')
  addDocument(@Param('companyId') cid: string, @Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.addDocument(cid, id, req.user.sub, body);
  }

  @Get('employees/:id/vacations/balance')
  balance(@Param('id') id: string) { return this.svc.getVacationBalance(id); }

  @Post('employees/:id/vacations')
  request(@Param('companyId') cid: string, @Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.requestVacation(cid, id, req.user.sub, body);
  }

  // Listar solicitudes filtradas por rol
  @Get('requests')
  getRequests(@Param('companyId') cid: string, @Request() req: any, @Query('role') role: string) {
    return this.svc.getRequests(cid, req.user.sub, role || 'rh');
  }

  @Put('vacations/:vacId')
  updateVacation(@Param('vacId') id: string, @Body() body: any) { return this.svc.updateVacation(id, body); }

  // Aprobación con rol del aprobador
  @Put('vacations/:vacId/approve')
  approve(@Param('vacId') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.approveVacation(id, req.user.sub, body.role || 'rh', body.approved, body.reason);
  }

  @Get('employees/:id/events')
  getEvents(@Param('id') id: string) { return this.svc.getEvents(id); }

  @Post('employees/:id/events')
  createEvent(@Param('companyId') cid: string, @Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.createEvent(cid, id, req.user.sub, body);
  }

  @Get('config')
  getConfig(@Param('companyId') cid: string) { return this.svc.getHRConfig(cid); }

  @Post('config')
  upsertConfig(@Param('companyId') cid: string, @Body() body: any) { return this.svc.upsertHRConfig(cid, body); }
}
