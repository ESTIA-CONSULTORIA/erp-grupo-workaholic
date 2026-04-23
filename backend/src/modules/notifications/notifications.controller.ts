// @ts-nocheck
import { Controller, Get, Put, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';
import { NotificationsService } from './notifications.service';

@Controller('companies/:companyId/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  get(@Param('companyId') cid: string, @Request() req: any, @Query('unread') unread: string) {
    return this.svc.getForUser(cid, req.user.sub, unread === 'true');
  }

  @Get('count')
  count(@Param('companyId') cid: string, @Request() req: any) {
    return this.svc.countUnread(cid, req.user.sub);
  }

  @Put(':id/read')
  markRead(@Param('id') id: string, @Request() req: any) {
    return this.svc.markRead(id, req.user.sub);
  }

  @Put('read-all')
  markAllRead(@Param('companyId') cid: string, @Request() req: any) {
    return this.svc.markAllRead(cid, req.user.sub);
  }
}
