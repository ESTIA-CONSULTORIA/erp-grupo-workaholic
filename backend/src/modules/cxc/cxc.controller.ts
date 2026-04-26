// cxc.controller.ts
import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { CxcService } from './cxc.service';

@ApiTags('CxC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/cxc')
export class CxcController {
  constructor(private svc: CxcService) {}

  @Get()
@Get()
  findAll(
    @Param('companyId') cid: string,
    @Query('period') period?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) { return this.svc.findAll(cid, period, status, clientId); }
  
 @Get('summary')
  summary(
    @Param('companyId') cid: string,
    @Query('clientId') clientId?: string,
  ) { return this.svc.getSummary(cid, clientId); }
  @Post(':id/payments')
  addPayment(
    @Param('companyId') cid: string,
    @Param('id') receivableId: string,
    @Body() body: any,
  ) {
    return this.svc.addPayment(receivableId, body.cashAccountId, body);
  }
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.svc.cancelReceivable(id, body.motivo || '');
  }
}
