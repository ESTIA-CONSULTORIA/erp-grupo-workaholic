import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { RhService } from './rh.service';

@ApiTags('RH')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/rh')
export class RhController {
  constructor(private svc: RhService) {}

  @Get('dashboard')
  dashboard(@Param('companyId') cid: string) { return this.svc.getDashboard(cid); }

  @Get('config')
  getConfig(@Param('companyId') cid: string) { return this.svc.getHRConfig(cid); }

  @Put('config')
  updateConfig(@Param('companyId') cid: string, @Body() body: any) { return this.svc.upsertHRConfig(cid, body); }

  @Get('employees')
  list(@Param('companyId') cid: string, @Query() q: any) { return this.svc.findAllEmployees(cid, q); }

  @Post('employees')
  create(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createEmployee(cid, body); }

  @Get('employees/:id')
  findOne(@Param('id') id: string) { return this.svc.findOneEmployee(id); }

  @Get('employees/:id/documents')
  getDocs(@Param('id') id: string) { return this.svc.getDocuments(id); }

  @Get('employees/:id/documents/missing')
  getMissing(@Param('id') id: string) { return this.svc.getMissingDocuments(id); }

  @Post('employees/:id/documents')
  addDoc(@Param('companyId') cid: string, @Param('id') eid: string, @Request() req: any, @Body() body: any) {
    return this.svc.addDocument(cid, eid, req.user.sub, body);
  }

  @Get('employees/:id/vacations/balance')
  vacBalance(@Param('id') id: string) { return this.svc.getVacationBalance(id); }

  @Post('employees/:id/vacations')
  requestVac(@Param('companyId') cid: string, @Param('id') eid: string, @Body() body: any) {
    return this.svc.requestVacation(cid, eid, body);
  }

  @Put('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateEmployee(id, body);
  }

  @Put('vacations/:vacId')
  updateVacation(@Param('vacId') id: string, @Body() body: any, @Request() req: any) {
    if (body.status) {
      return this.svc.approveVacation(id, req.user.sub, body.status === 'APROBADO');
    }
    return this.svc.updateVacation(id, body);
  }

  @Put('vacations/:vacId/approve')
  approveVac(@Param('vacId') id: string, @Request() req: any, @Body() body: { approved: boolean }) {
    return this.svc.approveVacation(id, req.user.sub, body.approved);
  }

  @Get('employees/:id/events')
  getEvents(@Param('id') id: string) { return this.svc.getEvents(id); }

  @Post('employees/:id/events')
  createEvent(@Param('companyId') cid: string, @Param('id') eid: string, @Request() req: any, @Body() body: any) {
    return this.svc.createEvent(cid, eid, req.user.sub, body);
  }
}
