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

  getClients(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId, isActive: true },
      include: { _count: { select: { ordenesCompra: true } } },
      orderBy: { name: 'asc' },
    });
  }

  createClient(companyId: string, data: any) {
    return this.prisma.client.create({
      data: {
        companyId,
        name:         data.name,
        rfc:          data.rfc          || null,
        phone:        data.phone        || null,
        email:        data.email        || null,
        address:      data.address      || null,
        creditLimit:  data.creditLimit  || 0,
        creditDays:   data.creditDays   || 0,
        isActive:     true,
      },
    });
  }

  updateClient(clientId: string, data: any) {
    return this.prisma.client.update({
      where: { id: clientId },
      data: {
        name:        data.name,
        rfc:         data.rfc         || null,
        phone:       data.phone       || null,
        email:       data.email       || null,
        address:     data.address     || null,
        creditLimit: data.creditLimit || 0,
        creditDays:  data.creditDays  || 0,
      },
    });
  }

  getClientDetail(clientId: string) {
    return this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        ordenesCompra: {
          include: { surtidos: true },
          orderBy: { fecha: 'desc' },
        },
        receivables: {
          where: { status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async createOrdenCompra(companyId: string, clientId: string, data: any) {
    return this.prisma.ordenCompra.create({
      data: {
        companyId,
        clientId,
        numero:     data.numero,
        fecha:      new Date(data.fecha),
        montoTotal: data.montoTotal,
        saldo:      data.montoTotal,
        status:     'PENDIENTE',
        notes:      data.notes || null,
      },
    });
  }

  async registrarSurtido(ordenId: string, data: any) {
    const orden = await this.prisma.ordenCompra.findUnique({ where: { id: ordenId } });
    if (!orden) throw new Error('OC no encontrada');

    const nuevoSurtido = Number(data.monto);
    const nuevoMonto   = Number(orden.montoSurtido) + nuevoSurtido;
    const nuevoSaldo   = Number(orden.montoTotal)   - nuevoMonto;
    const nuevoStatus  = nuevoSaldo <= 0 ? 'SURTIDO_COMPLETO' : 'SURTIDO_PARCIAL';

    return this.prisma.$transaction([
      this.prisma.surtidoOC.create({
        data: {
          ordenCompraId: ordenId,
          fecha:         new Date(data.fecha),
          monto:         nuevoSurtido,
          notes:         data.notes || null,
        },
      }),
      this.prisma.ordenCompra.update({
        where: { id: ordenId },
        data: {
          montoSurtido: nuevoMonto,
          saldo:        nuevoSaldo,
          status:       nuevoStatus,
        },
      }),
    ]);
  }
