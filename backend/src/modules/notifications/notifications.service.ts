// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  getForUser(companyId: string, userId: string, onlyUnread = false) {
    return this.prisma.notification.findMany({
      where: { companyId, userId, ...(onlyUnread ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllRead(companyId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { companyId, userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  countUnread(companyId: string, userId: string) {
    return this.prisma.notification.count({
      where: { companyId, userId, read: false },
    });
  }
}
