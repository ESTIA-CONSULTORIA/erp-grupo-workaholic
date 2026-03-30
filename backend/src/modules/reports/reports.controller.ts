import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ReportsService } from './reports.service';

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
  ) { return this.svc.getIncomeStatement(cid, period || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`); }

  @Get('consolidated')
  consolidated(@Query('period') period: string) {
    return this.svc.getConsolidated(period || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`);
  }
}
