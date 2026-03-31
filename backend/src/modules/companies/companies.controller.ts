import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/auth.guards';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private svc: CompaniesService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Get(':id/users')
  getUsers(@Param('id') id: string) { return this.svc.getUsers(id); }
  @Post(':id/users')
  async createUser(@Param('id') companyId: string, @Body() body: any) {
    return this.svc.createUser(companyId, body);
  }
}
