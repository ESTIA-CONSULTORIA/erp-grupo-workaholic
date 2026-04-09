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
          include: {
            lineas: { include: { product: true } },
            surtidos: true,
          },
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
    const montoTotal = data.lineas
      ? data.lineas.reduce((t: number, l: any) => t + (l.cantidad * l.precioUnitario), 0)
      : Number(data.montoTotal || 0);

    return this.prisma.ordenCompra.create({
      data: {
        companyId,
        clientId,
        numero:     data.numero,
        fecha:      new Date(data.fecha),
        montoTotal,
        saldo:      montoTotal,
        status:     'PENDIENTE',
        notes:      data.notes || null,
        lineas: data.lineas ? {
          create: data.lineas.map((l: any) => ({
            productId:      l.productId,
            cantidad:       l.cantidad,
            precioUnitario: l.precioUnitario,
            total:          l.cantidad * l.precioUnitario,
          })),
        } : undefined,
      },
      include: { lineas: { include: { product: true } } },
    });
  }

  async registrarSurtido(ordenId: string, data: any) {
    const orden = await this.prisma.ordenCompra.findUnique({
      where: { id: ordenId },
      include: { lineas: true },
    });
    if (!orden) throw new Error('OC no encontrada');
    if (orden.status === 'CANCELADA') throw new Error('No se puede surtir una OC cancelada');

    let montoSurtido = 0;

    // Si vienen líneas específicas, actualizar cantidades surtidas
    if (data.lineas && data.lineas.length > 0) {
      for (const ls of data.lineas) {
        const linea = orden.lineas.find((l: any) => l.id === ls.lineaId);
        if (!linea) continue;
        const nuevaCantSurtida = Number(linea.cantidadSurtida) + Number(ls.cantidad);
        await this.prisma.lineaOC.update({
          where: { id: ls.lineaId },
          data: { cantidadSurtida: nuevaCantSurtida },
        });
        montoSurtido += Number(ls.cantidad) * Number(linea.precioUnitario);
      }
    } else {
      montoSurtido = Number(data.monto || 0);
    }

    const nuevoMontoSurtido = Number(orden.montoSurtido) + montoSurtido;
    const nuevoSaldo        = Number(orden.montoTotal)   - nuevoMontoSurtido;
    const nuevoStatus       = nuevoSaldo <= 0 ? 'SURTIDO_COMPLETO' : 'SURTIDO_PARCIAL';

    return this.prisma.$transaction([
      this.prisma.surtidoOC.create({
        data: {
          ordenCompraId: ordenId,
          fecha:         new Date(data.fecha),
          monto:         montoSurtido,
          notes:         data.notes || null,
        },
      }),
      this.prisma.ordenCompra.update({
        where: { id: ordenId },
        data: { montoSurtido: nuevoMontoSurtido, saldo: nuevoSaldo, status: nuevoStatus },
      }),
    ]);
  }

async cancelarOC(ordenId: string, motivo: string) {
    return this.prisma.ordenCompra.update({
      where: { id: ordenId },
      data:  { status: 'CANCELADA', notes: motivo },
    });
  }

  async cerrarOCParcial(ordenId: string) {
    const orden = await this.prisma.ordenCompra.findUnique({ where: { id: ordenId } });
    if (!orden) throw new Error('OC no encontrada');
    return this.prisma.ordenCompra.update({
      where: { id: ordenId },
      data:  { status: 'SURTIDO_COMPLETO' },
    });
  }
