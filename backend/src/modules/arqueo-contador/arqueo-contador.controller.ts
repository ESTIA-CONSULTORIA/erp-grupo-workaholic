import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ArqueoContadorService } from './arqueo-contador.service';

@ApiTags('Arqueo Contador')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/arqueo')
export class ArqueoContadorController {
  constructor(private readonly service: ArqueoContadorService) {}

  @Post()
  create(@Param('companyId') companyId: string, @Body() body: any, @Req() req: any) {
    return this.service.create(companyId, req.user?.id || req.user?.sub || null, body);
  }

  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }
}
