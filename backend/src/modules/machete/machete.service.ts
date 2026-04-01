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
    const total = data.lines.reduce((t: number, l: any) => t + l.quantity * l.unitPrice, 0);
    return this.prisma.sale.create({
      data: {
        companyId,
        date:          new Date(data.date),
        channel:       data.channel,
        clientName:    data.clientName    || null,
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
  }

  async getSalesReport(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const sales = await this.prisma.sale.findMany({
      where: {
        companyId,
        date: { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) },
      },
      include: { lines: { include: { product: true } } },
    });

    const byChannel: Record<string, number> = {};
    const bySKU: Record<string, any> = {};
    let totalRevenue = 0;
    let totalUnits = 0;

    for (const sale of sales) {
      byChannel[sale.channel] = (byChannel[sale.channel] || 0) + Number(sale.total);
      totalRevenue += Number(sale.total);
      for (const line of sale.lines) {
        totalUnits += line.quantity;
        if (!bySKU[line.product.sku]) bySKU[line.product.sku] = { name: line.product.name, units: 0, revenue: 0 };
        bySKU[line.product.sku].units   += line.quantity;
        bySKU[line.product.sku].revenue += Number(line.total);
      }
    }

    return {
      period, totalRevenue, totalUnits,
      byChannel: Object.entries(byChannel).map(([canal, revenue]) => ({ canal, revenue })),
      bySKU:     Object.values(bySKU).sort((a: any, b: any) => b.revenue - a.revenue),
      production: { lotes: 0, totalKgIn: 0, totalKgOut: 0, totalWaste: 0, avgYield: 0 },
    };
  }
}
