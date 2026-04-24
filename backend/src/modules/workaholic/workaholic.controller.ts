// @ts-nocheck
import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { WorkaholicService } from './workaholic.service';

@Controller('companies/:companyId/workaholic')
@UseGuards(JwtAuthGuard)
export class WorkaholicController {
  constructor(private svc: WorkaholicService) {}

  @Get('dashboard')
  dashboard(@Param('companyId') cid: string) { return this.svc.getDashboard(cid); }

  // Espacios
  @Get('spaces')
  getSpaces(@Param('companyId') cid: string) { return this.svc.getSpaces(cid); }
  @Post('spaces')
  createSpace(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createSpace(cid, body); }
  @Put('spaces/:id')
  updateSpace(@Param('id') id: string, @Body() body: any) { return this.svc.updateSpace(id, body); }

  // Tipos membresía
  @Get('membership-types')
  getTypes(@Param('companyId') cid: string) { return this.svc.getMembershipTypes(cid); }
  @Post('membership-types')
  createType(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createMembershipType(cid, body); }
  @Put('membership-types/:id')
  updateType(@Param('id') id: string, @Body() body: any) { return this.svc.updateMembershipType(id, body); }

  // Membresías
  @Get('memberships')
  getMemberships(@Param('companyId') cid: string, @Query() q: any) { return this.svc.getMemberships(cid, q); }
  @Post('memberships')
  createMembership(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createMembership(cid, body); }
  @Post('memberships/check-expired')
  checkExpired(@Param('companyId') cid: string) { return this.svc.checkExpired(cid); }
  @Post('memberships/:id/payments')
  registerPayment(@Param('id') id: string, @Body() body: any) { return this.svc.registerPayment(id, body); }

  // Reservaciones
  @Get('reservations')
  getReservations(@Param('companyId') cid: string, @Query() q: any) { return this.svc.getReservations(cid, q); }
  @Post('reservations')
  createReservation(@Param('companyId') cid: string, @Body() body: any) { return this.svc.createReservation(cid, body); }
  @Put('reservations/:id')
  updateReservation(@Param('id') id: string, @Body() body: any) { return this.svc.updateReservation(id, body); }

  // POS
  @Post('sales')
  registerSale(@Param('companyId') cid: string, @Body() body: any) { return this.svc.registerSale(cid, body); }

  // Soft Restaurant
  @Get('soft-imports')
  getSoftImports(@Param('companyId') cid: string) { return this.svc.getSoftImports(cid); }
  @Post('soft-imports')
  importSoft(@Param('companyId') cid: string, @Request() req: any, @Body() body: any) {
    return this.svc.importSoftRestaurant(cid, body, req.user.sub);
  }
}
