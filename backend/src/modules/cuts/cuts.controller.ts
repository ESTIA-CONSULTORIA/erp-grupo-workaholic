import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { CutsService } from './cuts.service';

@ApiTags('Cuts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/cuts')
export class CutsController {
  constructor(private svc: CutsService) {}

  @Get()
  findAll(@Param('companyId') cid: string, @Query('period') period?: string) {
    return this.svc.findAll(cid, period);
  }

  @Post()
  create(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.create(cid, req.user.sub, body);
  }

  @Put(':id/submit')
  submit(@Param('id') id: string) { return this.svc.submit(id); }

  @Put(':id/approve')
  approve(@Param('id') id: string) { return this.svc.approve(id); }
}
