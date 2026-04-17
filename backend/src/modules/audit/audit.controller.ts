import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('api/v1/companies/:companyId/audit')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get()
  getLogs(
    @Param('companyId') cid: string,
    @Query('entity') entity?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getLogs(cid, { entity, limit: limit ? parseInt(limit) : 100 });
  }
}
