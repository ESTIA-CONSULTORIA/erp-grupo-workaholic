import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { CxpService } from './cxp.service';

@ApiTags('CxP')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/cxp')
export class CxpController {
  constructor(private svc: CxpService) {}

  @Get()
  findAll(
    @Param('companyId') cid: string,
    @Query('period') period?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ) { return this.svc.findAll(cid, period, status, supplierId); }

  @Get('summary')
  summary(@Param('companyId') cid: string) {
    return this.svc.getSummary(cid);
  }

  @Post()
  create(
    @Param('companyId') cid: string,
    @Body() body: any,
  ) { return this.svc.create(cid, body); }

  @Post(':id/payments')
  addPayment(
    @Param('id') id: string,
    @Body() body: any,
  ) { return this.svc.addPayment(id, body); }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
  ) { return this.svc.update(id, body); }
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.svc.cancelPayable(id, body.motivo || '');
  }
}
