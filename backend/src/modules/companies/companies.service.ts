import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.company.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: { branches: true },
    });
  }

  getUsers(companyId: string) {
    return this.prisma.userCompanyRole.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        role: true,
      },
    });
  }
}
