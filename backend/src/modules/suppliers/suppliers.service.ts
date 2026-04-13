import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, active?: string) {
    const where: any = { companyId };
    if (active !== undefined) where.isActive = active !== 'false';
    return this.prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  create(companyId: string, data: any) {
    return this.prisma.supplier.create({
      data: {
        companyId,
        name:     data.name,
        email:    data.email    || null,
        phone:    data.phone    || null,
        notes:    data.notes    || null,
        isActive: true,
      },
    });
  }

  update(id: string, data: any) {
    return this.prisma.supplier.update({
      where: { id },
      data: {
        name:     data.name     || undefined,
        email:    data.email    !== undefined ? data.email    : undefined,
        phone:    data.phone    !== undefined ? data.phone    : undefined,
        notes:    data.notes    !== undefined ? data.notes    : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });
  }
}
