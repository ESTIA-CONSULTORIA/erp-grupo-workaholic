// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ApprovalsService } from './approvals.service';

@Controller('companies/:companyId/approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private svc: ApprovalsService) {}

  @Post()
  create(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    const role = req.user?.roleCode || 'empleado';
    return this.svc.create(cid, req.user.sub, role, body);
  }

  @Get()
  getAll(@Param('companyId') cid: string, @Query() q: any) {
    return this.svc.getByCompany(cid, q);
  }

  @Get('pending')
  getPending(@Param('companyId') cid: string, @Request() req: any, @Query('role') role: string) {
    return this.svc.getPendingForUser(cid, req.user.sub, role || 'cajero');
  }

  @Get(':id')
  getOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Put(':id/steps/:stepId/act')
  act(@Param('id') id: string, @Param('stepId') sid: string, @Request() req: any, @Body() body: any) {
    return this.svc.act(id, sid, req.user.sub, body.approved, body.comment);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.svc.cancel(id, req.user.sub, body.reason || '');
  }
}
