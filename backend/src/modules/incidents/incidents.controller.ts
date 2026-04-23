// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { IncidentsService } from './incidents.service';
@Controller('companies/:companyId/incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private svc: IncidentsService) {}
  @Get('employee/:empId') getByEmp(@Param('companyId') cid:string, @Param('empId') eid:string) { return this.svc.getByEmployee(cid,eid); }
  @Get('period/:periodId') getByPeriod(@Param('companyId') cid:string, @Param('periodId') pid:string) { return this.svc.getByPeriod(cid,pid); }
  @Post() create(@Param('companyId') cid:string, @Request() req:any, @Body() body:any) { return this.svc.create(cid,req.user.sub,body); }
  @Put(':id') update(@Param('id') id:string, @Body() body:any) { return this.svc.update(id,body); }
  @Put(':id/approve') approve(@Param('id') id:string, @Request() req:any, @Body() body:any) { return this.svc.approve(id,req.user.sub,body.hrId||req.user.sub); }
}
