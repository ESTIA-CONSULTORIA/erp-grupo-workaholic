// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { PayrollReceiptsService } from './payroll-receipts.service';
@Controller('companies/:companyId/payroll-receipts')
@UseGuards(JwtAuthGuard)
export class PayrollReceiptsController {
  constructor(private svc: PayrollReceiptsService) {}
  @Get('employee/:empId') getByEmp(@Param('companyId') cid:string, @Param('empId') eid:string) { return this.svc.getByEmployee(cid,eid); }
  @Get('period/:periodId') getByPeriod(@Param('companyId') cid:string, @Param('periodId') pid:string) { return this.svc.getByPeriod(cid,pid); }
  @Post('period/:periodId/generate') generate(@Param('companyId') cid:string, @Param('periodId') pid:string, @Request() req:any) { return this.svc.generate(cid,pid,req.user.sub); }
  @Put('period/:periodId/publish') publish(@Param('periodId') pid:string, @Request() req:any) { return this.svc.publish(pid,req.user.sub); }
  @Put(':id/acknowledge') ack(@Param('id') id:string, @Request() req:any, @Body() body:any) { return this.svc.acknowledge(id,body.employeeId); }
}
