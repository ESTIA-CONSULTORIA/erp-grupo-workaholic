import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/suppliers')
export class SuppliersController {
  constructor(private svc: SuppliersService) {}

  @Get()
  findAll(
    @Param('companyId') cid: string,
    @Query('active') active?: string,
  ) { return this.svc.findAll(cid, active); }

  @Post()
  create(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.create(cid, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }
}
