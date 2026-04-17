import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    companyId: string; userId: string; action: string;
    entity: string; entityId?: string; before?: any; after?: any;
  }) {
    try {
      await this.prisma.auditLog.create({ data });
    } catch(e) {
      // Fail silently - never break main flow for logging
      console.error('Audit log error:', e);
    }
  }

  getLogs(companyId: string, filters?: { entity?: string; userId?: string; limit?: number }) {
    return this.prisma.auditLog.findMany({
      where: {
        companyId,
        ...(filters?.entity ? { entity: filters.entity } : {}),
        ...(filters?.userId ? { userId: filters.userId }  : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }
}
