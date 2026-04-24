// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { PermissionGuard, RequirePermission } from '../permissions/permission.guard';
import { JwtAuthGuard } from '../auth/auth.guards';
import { TerminationsService } from './terminations.service';
@Controller('companies/:companyId/terminations')
@UseGuards(JwtAuthGuard)
export class TerminationsController {
  constructor(private svc: TerminationsService) {}
  @Get() getAll(@Param('companyId') cid:string) { return this.svc.getByCompany(cid); }
  @Get(':id') getOne(@Param('id') id:string) { return this.svc.findOne(id); }
  @Post() create(@Param('companyId') cid:string, @Request() req:any, @Body() body:any) { return this.svc.create(cid,req.user.sub,body); }
  @Put(':id') update(@Param('id') id:string, @Body() body:any) { return this.svc.update(id,body); }
  @Post(':id/submit') submit(@Param('id') id:string, @Request() req:any) {
    return this.svc.submitForApproval(id,req.user.sub,req.user.roleCode||'rh');
  }
}
