import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ReportsService } from './reports.service';

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Get('companies/:companyId/income-statement')
  incomeStatement(
    @Param('companyId') cid: string,
    @Query('period') period: string,
  ) { return this.svc.getIncomeStatement(cid, period || currentPeriod()); }

  @Get('companies/:companyId/cash-flow')
  cashFlow(
    @Param('companyId') cid: string,
    @Query('period') period: string,
  ) { return this.svc.getCashFlowStatement(cid, period || currentPeriod()); }

  @Get('companies/:companyId/balance-sheet')
  balanceSheet(
    @Param('companyId') cid: string,
    @Query('period') period: string,
  ) { return this.svc.getBalanceSheet(cid, period || currentPeriod()); }

  @Get('companies/:companyId/dashboard')
  dashboard(
    @Param('companyId') cid: string,
    @Query('period') period: string,
  ) { return this.svc.getDashboardData(cid, period || currentPeriod()); }

  @Get('consolidated')
  consolidated(@Query('period') period: string) {
    return this.svc.getConsolidado(period || currentPeriod());
  }

  // ── Endpoint de mantenimiento (usar una sola vez) ──────────
  @Post('companies/:companyId/maintenance/fix-oc-sales')
  async fixOCSales(@Param('companyId') cid: string) {
    return this.svc.fixOCSalesRetroactive(cid);
  }
}
