import { Controller, Get, Post, Put, Param, Body, Query, Request } from '@nestjs/common';
import { IntercompanyService } from './intercompany.service';

@Controller('api/v1/companies/:companyId/intercompany')
export class IntercompanyController {
  constructor(private readonly svc: IntercompanyService) {}

  @Get()
  getTransfers(@Param('companyId') cid: string, @Query('period') period?: string) {
    return this.svc.getTransfers(cid, period);
  }

  @Post()
  create(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.createTransfer(cid, req.user.sub, body);
  }

  @Put(':transferId/approve')
  approve(@Param('transferId') id: string, @Request() req: any, @Body() body: { approved: boolean }) {
    return this.svc.approveTransfer(id, req.user.sub, body.approved);
  }
}
