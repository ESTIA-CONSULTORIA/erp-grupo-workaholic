import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/expenses')
export class ExpensesController {
  constructor(private svc: ExpensesService) {}

  @Get()
  findAll(
    @Param('companyId') cid: string,
    @Query('period') period?: string,
    @Query('isExternal') isExternal?: string,
  ) {
    return this.svc.findAll(cid, period, isExternal);
  }

  @Post()
  create(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.create(cid, req.user.sub, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) { return this.svc.delete(id); }
}
