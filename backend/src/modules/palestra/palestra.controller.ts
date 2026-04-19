import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { PalestraService } from './palestra.service';

@Controller('companies/:companyId/palestra')
@UseGuards(JwtAuthGuard)
export class PalestraController {
  constructor(private svc: PalestraService) {}

  // Dashboard
  @Get('dashboard')
  dashboard(@Param('companyId') cid: string) { return this.svc.getDashboard(cid); }

  // Catálogo de servicios
  @Get('services')
  getServices(@Param('companyId') cid: string) { return this.svc.getServices(cid); }

  @Post('services')
  createService(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createService(cid, body); }

  @Put('services/:id')
  updateService(@Param('id') id: string, @Body() body: any) { return this.svc.updateService(id, body); }

  @Put('services/:id/toggle')
  toggleService(@Param('id') id: string, @Body() body: any) { return this.svc.toggleService(id, body.isActive); }

  // Tipos de membresía
  @Get('membership-types')
  getMembershipTypes(@Param('companyId') cid: string) { return this.svc.getMembershipTypes(cid); }

  @Post('membership-types')
  createMembershipType(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createMembershipType(cid, body); }

  @Put('membership-types/:id')
  updateMembershipType(@Param('id') id: string, @Body() body: any) { return this.svc.updateMembershipType(id, body); }

  // Membresías
  @Get('memberships')
  getMemberships(@Param('companyId') cid: string, @Query() q: any) { return this.svc.getMemberships(cid, q); }

  @Post('memberships')
  createMembership(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createMembership(cid, body); }

  @Post('memberships/:id/members')
  addMember(@Param('id') id: string, @Body() body: any) { return this.svc.addMember(id, body); }

  @Delete('memberships/members/:memberId')
  removeMember(@Param('memberId') mid: string) { return this.svc.removeMember(mid); }

  @Get('memberships/:id/payments')
  getPayments(@Param('id') id: string) { return this.svc.getMembershipPayments(id); }

  @Post('memberships/:id/payments')
  registerPayment(@Param('id') id: string, @Body() body: any) { return this.svc.registerPayment(id, body); }

  @Post('memberships/check-overdue')
  checkOverdue(@Param('companyId') cid: string) { return this.svc.checkAndBlockOverdue(cid); }

  // Comisiones de coach
  @Get('commissions')
  getCommissions(@Param('companyId') cid: string, @Query() q: any) { return this.svc.getCommissions(cid, q); }

  @Post('commissions')
  createCommission(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createCommission(cid, body); }

  @Post('commissions/release')
  releaseCommissions(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.releaseCommissions(cid, body.weekPeriod, body.employeeId);
  }

  @Put('commissions/:id/freeze')
  freezeCommission(@Param('id') id: string, @Body() body: any) { return this.svc.freezeCommission(id, body.reason); }

  // Soft Restaurant
  @Get('soft-imports')
  getSoftImports(@Param('companyId') cid: string) { return this.svc.getSoftImports(cid); }

  @Post('soft-imports')
  importSoft(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.importSoftRestaurant(cid, body, req.user.sub);
  }

  // POS Palestra
  @Post('sales')
  registerSale(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.registerSale(cid, req.user.sub, body);
  }
}
