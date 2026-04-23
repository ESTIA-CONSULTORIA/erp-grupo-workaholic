// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { DisabilitiesService } from './disabilities.service';
@Controller('companies/:companyId/disabilities')
@UseGuards(JwtAuthGuard)
export class DisabilitiesController {
  constructor(private svc: DisabilitiesService) {}
  @Get('employee/:empId') get(@Param('companyId') cid:string, @Param('empId') eid:string) { return this.svc.getByEmployee(cid,eid); }
  @Post() create(@Param('companyId') cid:string, @Body() body:any) { return this.svc.create(cid,body); }
  @Put(':id') update(@Param('id') id:string, @Body() body:any) { return this.svc.update(id,body); }
  @Put(':id/validate') validate(@Param('id') id:string, @Request() req:any) { return this.svc.validate(id,req.user.sub); }
}
