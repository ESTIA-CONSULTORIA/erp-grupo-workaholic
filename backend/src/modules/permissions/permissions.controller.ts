import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private svc: PermissionsService) {}

  @Get('defaults')
  getDefaults() {
    return this.svc.getDefaultPermissions();
  }

  @Get('roles/:roleCode')
  getByRole(@Param('roleCode') role: string, @Query('companyId') cid?: string) {
    return this.svc.getPermissions(role, cid);
  }

  @Get('all')
  getAll(@Query('companyId') cid?: string) {
    return this.svc.getAllPermissions(cid);
  }

  @Put('roles/:roleCode/modules/:module/actions/:action')
  update(
    @Param('roleCode') role: string,
    @Param('module') mod: string,
    @Param('action') action: string,
    @Body() body: { allowed: boolean; companyId?: string },
  ) {
    return this.svc.updatePermission(role, mod, action, body.allowed, body.companyId);
  }

  @Post('roles/:roleCode/reset')
  reset(@Param('roleCode') role: string, @Body() body: { companyId?: string }) {
    return this.svc.resetToDefaults(role, body.companyId);
  }
}
