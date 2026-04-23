// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { LegalService } from './legal.service';
@Controller('companies/:companyId/legal')
@UseGuards(JwtAuthGuard)
export class LegalController {
  constructor(private svc: LegalService) {}
  @Get('employee/:empId') get(@Param('companyId') cid:string, @Param('empId') eid:string) { return this.svc.getByEmployee(cid,eid); }
  @Post('generate') generate(@Param('companyId') cid:string, @Request() req:any, @Body() body:any) { return this.svc.generate(cid,req.user.sub,body); }
  @Put(':id') update(@Param('id') id:string, @Body() body:any) { return this.svc.update(id,body); }
  @Put(':id/sign') sign(@Param('id') id:string, @Request() req:any, @Body() body:any) { return this.svc.sign(id,req.user.sub,body.byEmployee||false); }
}
