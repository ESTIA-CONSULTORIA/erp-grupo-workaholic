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

  // ── PRODUCCIÓN ────────────────────────────────────────────
  getLotes(companyId: string) {
    return this.prisma.loteProduccion.findMany({
      where: { companyId },
      include: {
        insumos:  true,
        empaques: { include: { product: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async crearLote(companyId: string, userId: string, data: any) {
    const lote = await this.prisma.loteProduccion.create({
      data: {
        companyId,
        fecha:     new Date(data.fecha),
        tipo:      data.tipo,
        kgEntrada: data.kgEntrada || 0,
        notas:     data.notas    || null,
        creadoPor: userId,
        status:    'EN_PROCESO',
      },
    });

    // Registrar insumos y descontar stock
    if (data.insumos && data.insumos.length > 0) {
      for (const ins of data.insumos) {
        if (!ins.insumoId || !ins.cantidad) continue;
        const insumo = await (this.prisma as any).insumo.findUnique({
          where: { id: ins.insumoId },
        });
        if (!insumo) continue;
        const costoTotal = Number(ins.cantidad) * Number(insumo.costUnit);
        await this.prisma.loteInsumo.create({
          data: {
            loteId:        lote.id,
            insumoId:      ins.insumoId,
            nombre:        insumo.name,
            cantidad:      Number(ins.cantidad),
            unidad:        insumo.unit,
            costoUnitario: Number(insumo.costUnit),
            costoTotal,
          },
        });
        await (this.prisma as any).insumo.update({
          where: { id: ins.insumoId },
          data:  { stock: { decrement: Number(ins.cantidad) } },
        });
      }
    }

    return this.prisma.loteProduccion.findUnique({
      where: { id: lote.id },
      include: { insumos: true },
    });
  }

  async registrarSalidaHorno(loteId: string, data: any) {
    const lote = await this.prisma.loteProduccion.findUnique({ where: { id: loteId } });
    if (!lote) throw new Error('Lote no encontrado');

    const kgEntrada    = Number(lote.kgEntrada);
    const kgSalida     = Number(data.kgSalida     || 0);
    const kgGrasa      = Number(data.kgGrasa      || 0);
    const kgEscarchado = Number(data.kgEscarchado || 0);
    const kgMerma      = kgEntrada - kgSalida - kgGrasa;
    const rendimiento  = kgEntrada > 0 ? (kgSalida / kgEntrada) * 100 : 0;

    return this.prisma.loteProduccion.update({
      where: { id: loteId },
      data: { kgSalida, kgGrasa, kgEscarchado, kgMerma, rendimiento, status: 'EN_PROCESO' },
    });
  }

  async registrarEmpaque(loteId: string, data: any) {
    const lote = await this.prisma.loteProduccion.findUnique({
      where: { id: loteId },
      include: { insumos: true },
    });
    if (!lote) throw new Error('Lote no encontrado');

    // Calcular costo por kg del lote
    const costoTotalInsumos = lote.insumos.reduce((t, i) => t + Number(i.costoTotal), 0);
    const kgSalida          = Number(lote.kgSalida) || 1;
    const costoKg           = costoTotalInsumos / kgSalida;

    for (const linea of data.lineas) {
      // Buscar el producto para obtener gramsWeight
      const producto = await this.prisma.product.findUnique({
        where: { id: linea.productId },
      });
      const gramsWeight = Number((producto as any)?.gramsWeight || 0);
      const costoUnit   = gramsWeight > 0 ? (gramsWeight / 1000) * costoKg : 0;

      await this.prisma.loteEmpaque.create({
        data: {
          loteId,
          productId: linea.productId,
          cantidad:  linea.cantidad,
          costoUnit,
        },
      });

      // Actualizar inventario
      await this.prisma.productStock.updateMany({
        where: { productId: linea.productId },
        data:  { stock: { increment: linea.cantidad } },
      });
    }

    return this.prisma.loteProduccion.update({
      where: { id: loteId },
      data:  { status: 'EMPACADO' },
    });
  }

  async cerrarLote(loteId: string) {
    return this.prisma.loteProduccion.update({
      where: { id: loteId },
      data:  { status: 'CERRADO' },
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
        sku:            data.sku             || undefined,
        meatType:       data.meatType        || undefined,
        flavor:         data.flavor          || undefined,
        presentation:   data.presentation   || undefined,
        gramsWeight:    data.gramsWeight     !== undefined ? Number(data.gramsWeight)    : undefined,
      },
    });
  }

  async createProduct(companyId: string, data: any) {
    const product = await this.prisma.product.create({
      data: {
        companyId,
        sku:            data.sku,
        name:           data.name,
        meatType:       data.meatType,
        flavor:         data.flavor,
        presentation:   data.presentation,
        gramsWeight:    data.gramsWeight ? Number(data.gramsWeight) : null,
        priceMostrador: data.priceMostrador ? Number(data.priceMostrador) : null,
        priceMayoreo:   data.priceMayoreo   ? Number(data.priceMayoreo)   : null,
        priceOnline:    data.priceOnline    ? Number(data.priceOnline)    : null,
        priceML:        data.priceML        ? Number(data.priceML)        : null,
        isActive:       true,
      },
    });
    await this.prisma.productStock.create({
      data: { productId: product.id, stock: 0, minStock: data.minStock ? Number(data.minStock) : 5 },
    });
    return product;
  }

  async getPTInventory(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { currentStock: true },
    });
    return products.map(p => ({
      ...p,
      stock:    (p as any).currentStock?.stock    || 0,
      minStock: (p as any).currentStock?.minStock || 5,
      lowStock: ((p as any).currentStock?.stock || 0) < ((p as any).currentStock?.minStock || 5),
    }));
  }

  getInsumos(companyId: string) {
    return (this.prisma as any).insumo.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });
  }

  async createInsumo(companyId: string, data: any) {
    return (this.prisma as any).insumo.create({
      data: {
        companyId,
        sku:      data.sku,
        name:     data.name,
        unit:     data.unit     || 'kg',
        costUnit: data.costUnit ? Number(data.costUnit) : 0,
        group:    data.group    || 'GENERAL',
        stock:    data.stock    ? Number(data.stock)    : 0,
        minStock: data.minStock ? Number(data.minStock) : 0,
        isActive: true,
      },
    });
  }

  async updateInsumo(insumoId: string, data: any) {
    return (this.prisma as any).insumo.update({
      where: { id: insumoId },
      data: {
        name:     data.name     || undefined,
        unit:     data.unit     || undefined,
        costUnit: data.costUnit !== undefined ? Number(data.costUnit) : undefined,
        group:    data.group    || undefined,
        minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
        isActive: data.isActive !== undefined ? data.isActive         : undefined,
      },
    });
  }

  async comprarInsumo(companyId: string, data: any) {
    const cantidad      = Number(data.cantidad);
    const costoUnitario = Number(data.costoUnitario);
    const total         = cantidad * costoUnitario;

    await (this.prisma as any).insumo.update({
      where: { id: data.insumoId },
      data:  { stock: { increment: cantidad }, costUnit: costoUnitario },
    });

    const branch = await this.prisma.branch.findFirst({ where: { companyId } });
    if (data.metodoPago !== 'credito' && branch) {
      const cuenta = await this.prisma.cashAccount.findFirst({
        where: { companyId, code: data.cuentaId || 'efectivo_mxn', isActive: true },
      });
      if (cuenta) {
        await this.prisma.flowMovement.create({
          data: {
            companyId, branchId: branch.id, cashAccountId: cuenta.id,
            date: new Date(data.fecha), type: 'SALIDA', originType: 'COMPRA_INSUMO',
            originId: data.insumoId, amount: total, currency: 'MXN',
            exchangeRate: 1, amountMxn: total,
            notes: `Compra: ${data.nombreInsumo} x ${cantidad} ${data.unidad}`,
          },
        });
      }
    }
    return { success: true, total };
  }

  getRecipes(companyId: string) {
    return this.prisma.recipe.findMany({
      where: { companyId, isActive: true },
      include: { ingredients: true },
      orderBy: { key: 'asc' },
    });
  }

  getSales(companyId: string, period?: string, channel?: string, startDate?: string, endDate?: string) {
    const where: any = { companyId };
    if (channel) where.channel = channel;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    } else if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.sale.findMany({
      where,
      include: {
        lines:  { include: { product: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async registerSale(companyId: string, data: any) {
    const total = data.lines.reduce((t: number, l: any) => t + l.quantity * l.unitPrice, 0);

    // ── ENTREGA DE OC (preventa ya registrada) ────────────────
    // Si viene ocId, NO crear venta nueva — solo mover stock y actualizar OC
    // El ingreso ya fue registrado como CxC cuando se creó la OC
    if (data.ocId) {
      // 1. Mover stock
      for (const line of data.lines) {
        await this.prisma.productStock.updateMany({
          where: { productId: line.productId },
          data:  { stock: { decrement: line.quantity } },
        });
      }

      // 2. Actualizar OC
      try {
        const orden = await this.prisma.ordenCompra.findUnique({
          where: { id: data.ocId },
          include: { lineas: true },
        });
        if (orden) {
          const montoSurtido = Number(orden.montoSurtido) + total;
          const saldo        = Number(orden.montoTotal)   - montoSurtido;
          const status       = saldo <= 0 ? 'SURTIDO_COMPLETO' : 'SURTIDO_PARCIAL';

          await this.prisma.ordenCompra.update({
            where: { id: data.ocId },
            data:  { montoSurtido, saldo: Math.max(0, saldo), status },
          });

          for (const lineaVenta of data.lines) {
            const lineaOC = orden.lineas.find((l: any) => l.productId === lineaVenta.productId);
            if (lineaOC) {
              await this.prisma.lineaOC.update({
                where: { id: lineaOC.id },
                data:  { cantidadSurtida: { increment: lineaVenta.quantity } },
              });
            }
          }

          await this.prisma.surtidoOC.create({
            data: {
              ordenCompraId: data.ocId,
              fecha:         new Date(data.date),
              monto:         total,
              notes:         `Entrega desde POS`,
            },
          });
        }
      } catch (e: any) {
        console.error('ERROR OC:', e.message);
      }

      return { success: true, isOCDelivery: true, total };
    }

    // ── VENTA NORMAL (sin OC) ─────────────────────────────────
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

    // Crear CxC para ventas a crédito sin OC
    if ((data.isCredit === true || data.isCredit === 'true' || data.paymentMethod === 'credito') && data.clientId) {
      try {
        const saleDate = new Date(data.date);
        saleDate.setHours(0, 0, 0, 0);
        const dueDate = new Date(saleDate);
        dueDate.setDate(dueDate.getDate() + 30);

        await this.prisma.receivable.create({
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
      } catch (e: any) {
        console.error('ERROR CXC:', e.message);
      }
    }

    return sale;
  }
}
