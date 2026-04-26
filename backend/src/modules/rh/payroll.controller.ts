import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/auth.guards';
import { PayrollService } from './payroll.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/payroll')
export class PayrollController {
  constructor(private svc: PayrollService) {}

  @Get('periods')
  getPeriods(@Param('companyId') cid: string) { return this.svc.getPeriods(cid); }

  @Post('periods')
  createPeriod(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createPeriod(cid, body); }

  @Post('periods/:periodId/load')
  loadEmployees(@Param('periodId') id: string) { return this.svc.loadEmployees(id); }

  @Get('periods/:periodId/lines')
  getLines(@Param('periodId') id: string) { return this.svc.getLines(id); }

  @Put('lines/:lineId')
  updateLine(@Param('lineId') id: string, @Body() body: any) { return this.svc.updateLine(id, body); }

  @Post('periods/:periodId/export')
  async exportContpaq(@Param('periodId') id: string, @Res() res: Response) {
    const result = await this.svc.exportToContpaq(id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send('\uFEFF' + result.csv);
  }

  @Post('periods/:periodId/pay')
  registerPayment(@Param('periodId') id: string, @Request() req: any, @Body() body: { cashAccountId: string }) {
    return this.svc.registerPayment(id, body.cashAccountId, req.user.sub);
  }

  @Post('periods/:periodId/calculate')
  calculate(@Param('periodId') id: string) { return this.svc.calculatePeriod(id); }

  @Post('periods/:periodId/close')
  close(@Param('periodId') id: string) { return this.svc.closePeriod(id); }

  @Post('periods/:periodId/publish-receipts')
  publishReceipts(@Param('periodId') id: string, @Request() req: any) {
    return this.svc.publishReceipts(id, req.user.sub);
  }
}
