import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private svc: MaintenanceService) {}

  @Post('fix-oc-sales/:companyId')
  fixOCSales(@Param('companyId') cid: string) {
    return this.svc.fixOCSales(cid);
  }

  @Post('seed-users')
  seedUsers() {
    return this.svc.seedUsers();
  }
}
