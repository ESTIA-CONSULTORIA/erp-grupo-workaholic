import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
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
}
