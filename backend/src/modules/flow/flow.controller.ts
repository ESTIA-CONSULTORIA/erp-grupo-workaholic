import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { FlowService } from './flow.service';

@ApiTags('Flow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/flow')
export class FlowController {
  constructor(private svc: FlowService) {}

  @Get('balances')
  getBalances(@Param('companyId') id: string) {
    return this.svc.getBalances(id);
  }

  @Post('transfer')
  transfer(@Param('companyId') id: string, @Body() body: any) {
    return this.svc.transfer(id, body);
  }

  @Post('movements')
  createMovement(
    @Param('companyId') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.svc.createMovement(id, req.user.sub, body);
  }

  @Get('movements')
  getMovements(
    @Param('companyId') id: string,
    @Query('fecha') fecha?: string,
    @Query('period') period?: string,
  ) {
    return this.svc.getMovements(id, fecha, period);
  }

  @Put('accounts/:accountId')
  updateAccount(
    @Param('accountId') accountId: string,
    @Body() body: any,
  ) {
    return this.svc.updateAccount(accountId, body);
  }
}
