// @ts-nocheck
import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { PermissionsService } from './permissions.service';

@Controller('companies/:companyId/permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private svc: PermissionsService) {}

  // ── Modules available for this company ──────────────────────
  @Get('modules')
  getModules(@Param('companyId') cid: string, @Query('companyCode') code: string) {
    return this.svc.getModulesForCompany(code);
  }

  // ── Roles ────────────────────────────────────────────────────
  @Get('roles')
  getRoles(@Param('companyId') cid: string, @Query('companyCode') code: string) {
    return this.svc.getRoles(cid, code);
  }

  @Post('roles')
  createRole(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.createRole(cid, body);
  }

  @Put('roles/:roleCode')
  updateRole(@Param('companyId') cid: string, @Param('roleCode') rc: string, @Body() body: any) {
    return this.svc.updateRole(cid, rc, body);
  }

  @Put('roles/:roleCode/suspend')
  suspendRole(@Param('companyId') cid: string, @Param('roleCode') rc: string) {
    return this.svc.suspendRole(cid, rc);
  }

  @Delete('roles/:roleCode')
  deleteRole(@Param('companyId') cid: string, @Param('roleCode') rc: string) {
    return this.svc.deleteRole(cid, rc);
  }

  @Post('roles/:roleCode/copy-from/:fromRole')
  copyFrom(@Param('companyId') cid: string, @Param('roleCode') to: string, @Param('fromRole') from: string) {
    return this.svc.copyPermissions(cid, from, to);
  }

  // ── Permissions ──────────────────────────────────────────────
  @Get('all')
  getAll(@Param('companyId') cid: string) {
    return this.svc.getAllForCompany(cid);
  }

  @Get('roles/:roleCode')
  getForRole(@Param('companyId') cid: string, @Param('roleCode') rc: string) {
    return this.svc.getForRole(cid, rc);
  }

  @Put('roles/:roleCode/modules/:module/actions/:action')
  setPermission(
    @Param('companyId') cid: string,
    @Param('roleCode') role: string,
    @Param('module') module: string,
    @Param('action') action: string,
    @Body() body: { allowed: boolean },
  ) {
    return this.svc.setPermission(cid, role, module, action, body.allowed);
  }

  @Post('roles/:roleCode/reset')
  reset(@Param('companyId') cid: string, @Param('roleCode') rc: string) {
    return this.svc.resetToDefaults(cid, rc);
  }

  @Get('defaults')
  getDefaults() { return this.svc.getDefaults(); }

  @Get('module-actions')
  getModuleActions() { return this.svc.getModuleActions(); }
}
