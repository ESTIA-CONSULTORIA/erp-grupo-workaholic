// documents.controller.ts
import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/documents')
export class DocumentsController {
  constructor(private svc: DocumentsService) {}

  @Get()
  findAll(@Param('companyId') cid: string, @Query('status') status?: string) {
    return this.svc.findAll(cid, status);
  }

  @Post()
  create(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.create(cid, req.user.sub, body);
  }

  @Post(':id/extract')
  extract(@Param('companyId') cid: string, @Param('id') id: string) {
    return this.svc.extract(cid, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Put(':id/validate')
  validate(@Param('id') id: string, @Body() body: any) {
    return this.svc.validate(id, body.validatedData);
  }

  @Put(':id/reject')
  reject(@Param('id') id: string) { return this.svc.reject(id); }
}
