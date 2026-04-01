import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MacheteService {
  constructor(private prisma: PrismaService) {}

  getProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId },
      include: { currentStock: true },
      orderBy: [{ meatType: 'asc' }, { flavor: 'asc' }],
    });
  }

  updateProduct(productId: string, data: any) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        priceMostrador: data.priceMostrador !== undefined ? Number(data.priceMostrador) : undefined,
        priceMayoreo:   data.priceMayoreo   !== undefined ? Number(data.priceMayoreo)   : undefined,
        priceOnline:    data.priceOnline     !== undefined ? Number(data.priceOnline)    : undefined,
        priceML:        data.priceML         !== undefined ? Number(data.priceML)        : undefined,
        name:           data.name            || undefined,
        isActive:       data.isActive        !== undefined ? data.isActive              : undefined,
      },
    });
  }

  async getPTInventory(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { currentStock: true },
    });
    return products.map(p => ({
      ...p,
      stock:    p.currentStock?.stock    || 0,
      minStock: p.currentStock?.minStock || 5,
      lowStock: (p.currentStock?.stock || 0) < (p.currentStock?.minStock || 5),
    }));
  }

  getRecipes(companyId: string) {
    return this.prisma.recipe.findMany({
      where: { companyId, isActive: true },
      include: { ingredients: true },
      orderBy: { key: 'asc' },
    });
  }

  getSales(companyId: string, period?: string, channel?: string) {
    const where: any = { companyId };
    if (channel) where.channel = channel;
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.sale.findMany({
      where,
      include: { lines: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
  }

async registerSale(companyId: string, data: any) {
    console.log('SALE DATA:', JSON.stringify({ isCredit: data.isCredit, paymentMethod: data.paymentMethod, clientId: data.clientId }));
    const total = data.lines.reduce((t: number, l: any) => t + l.quantity * l.unitPrice, 0);

    // 1. Crear venta e inventario en transacción
    const sale = await this.prisma.$transaction(async (tx) => {
      const s = await tx.sale.create({
        data: {
          companyId,
          date:          new Date(data.date),
          channel:       data.channel,
          clientName:    data.clientName    || null,
          clientId:      data.clientId      || null,
          isCredit:      data.isCredit      || false,
          total,
          paymentMethod: data.paymentMethod || 'efectivo',
          lines: {
            create: data.lines.map((l: any) => ({
              productId: l.productId,
              quantity:  l.quantity,
              unitPrice: l.unitPrice,
              total:     l.quantity * l.unitPrice,
            })),
          },
        },
        include: { lines: { include: { product: true } } },
      });

      for (const line of s.lines) {
        await tx.productStock.updateMany({
          where: { productId: line.productId },
          data:  { stock: { decrement: line.quantity } },
        });
      }

      return s;
    });

    // 2. Crear CxC FUERA de la transacción
    if ((data.isCredit === true || data.isCredit === 'true' || data.paymentMethod === 'credito') && data.clientId) {
      try {
        const saleDate = new Date(data.date);
        saleDate.setHours(0, 0, 0, 0);
        const dueDate = new Date(saleDate);
        dueDate.setDate(dueDate.getDate() + 30);

        const cxc = await this.prisma.receivable.create({
          data: {
            companyId,
            clientId:       data.clientId,
            date:           saleDate,
            dueDate,
            originalAmount: total,
            paidAmount:     0,
            balance:        total,
            currency:       'MXN',
            status:         'PENDIENTE',
          },
        });
        console.log('CXC CREADO:', cxc.id);
      } catch (e: any) {
        console.error('ERROR CXC:', e.message);
      }
    }

    return sale;
  }
      }
