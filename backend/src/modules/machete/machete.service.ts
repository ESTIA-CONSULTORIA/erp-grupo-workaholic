// @ts-nocheck
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

    // Mapeo de tipo de lote → SKU de carne
    const CARNE_SKU: Record<string, string> = {
      MACHETE_RES: 'INS-CARNE-RES',
      CHICALI_RES: 'INS-CARNE-RES',
      CERDO:       'INS-CARNE-CERDO',
      MACHACA:     'INS-CARNE-RES',
    };

    // Agregar automáticamente la carne según el tipo de lote
    const carneSku = CARNE_SKU[data.tipo];
    if (carneSku && data.kgEntrada > 0) {
      const carneInsumo = await (this.prisma as any).insumo.findFirst({
        where: { companyId, sku: carneSku, isActive: true },
      });
      if (carneInsumo) {
        const cantidad    = Number(data.kgEntrada);
        const costoTotal  = cantidad * Number(carneInsumo.costUnit);
        await this.prisma.loteInsumo.create({
          data: {
            loteId:        lote.id,
            insumoId:      carneInsumo.id,
            nombre:        carneInsumo.name,
            cantidad,
            unidad:        carneInsumo.unit,
            costoUnitario: Number(carneInsumo.costUnit),
            costoTotal,
          },
        });
        // Descontar stock de carne
        await (this.prisma as any).insumo.update({
          where: { id: carneInsumo.id },
          data:  { stock: { decrement: cantidad } },
        });
      }
    }

    // Registrar insumos adicionales (especias, etc.) capturados manualmente
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
      data: { kgSalida, kgGrasa, kgEscarchado, kgMerma, rendimiento, status: 'EMPACADO' },
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

      // Actualizar inventario — upsert para crear el registro si no existe
      const existingStock = await this.prisma.productStock.findFirst({
        where: { productId: linea.productId },
      });
      if (existingStock) {
        await this.prisma.productStock.update({
          where: { id: existingStock.id },
          data:  { stock: { increment: Number(linea.cantidad) } },
        });
      } else {
        await this.prisma.productStock.create({
          data: {
            productId: linea.productId,
            stock:     Number(linea.cantidad),
            minStock:  0,
            maxStock:  9999,
          },
        });
      }
    }

    // Verificar si ya se empacaron todos los kg disponibles → cerrar automáticamente
    const loteActualizado = await this.prisma.loteProduccion.findUnique({
      where: { id: loteId },
      include: { empaques: { include: { product: true } } },
    });

    const kgYaEmpacados = (loteActualizado?.empaques || []).reduce((t: number, e: any) => {
      const gramsWeight = Number(e.product?.gramsWeight || 0);
      return t + (gramsWeight > 0 ? (Number(e.cantidad) * gramsWeight) / 1000 : 0);
    }, 0);

    const kgDisponibles = Math.max(0, Number(loteActualizado?.kgSalida || 0) - kgYaEmpacados);
    const nuevoStatus = kgDisponibles <= 0.01 ? 'CERRADO' : 'EMPACADO';

    return this.prisma.loteProduccion.update({
      where: { id: loteId },
      data:  { status: nuevoStatus },
      include: { empaques: { include: { product: true } }, insumos: true },
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
      stock:    Number((p as any).currentStock?.stock    || 0),
      minStock: Number((p as any).currentStock?.minStock || 5),
      maxStock: Number((p as any).currentStock?.maxStock || 0),
      lowStock: Number((p as any).currentStock?.stock || 0) < Number((p as any).currentStock?.minStock || 5),
    }));
  }

  async updateProductStock(productId: string, data: any) {
    return this.prisma.productStock.upsert({
      where:  { productId },
      update: {
        minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
        maxStock: data.maxStock !== undefined ? Number(data.maxStock) : undefined,
      },
      create: {
        productId,
        stock:    0,
        minStock: data.minStock !== undefined ? Number(data.minStock) : 5,
        maxStock: data.maxStock !== undefined ? Number(data.maxStock) : 0,
      },
    });
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

  async cancelarCompra(companyId: string, compraId: string) {
    return this.prisma.purchase.update({
      where: { id: compraId, companyId },
      data:  { paymentStatus: 'CANCELADO' },
    });
  }

  async getCompras(companyId: string, filters?: any) {
    const where: any = { companyId };
    if (filters?.proveedorId) where.supplierId = filters.proveedorId;
    if (filters?.fechaIni || filters?.fechaFin) {
      where.date = {};
      if (filters.fechaIni) where.date.gte = new Date(filters.fechaIni);
      if (filters.fechaFin) where.date.lte = new Date(filters.fechaFin);
    }
    return this.prisma.purchase.findMany({
      where,
      include: { supplier: { select: { id: true, name: true } }, items: true },
      orderBy: { date: 'desc' },
    });
  }

  async crearCompra(companyId: string, userId: string, data: any) {
    const lineas = data.lineas || [];
    if (lineas.length === 0) throw new Error('Debe incluir al menos un insumo');
    const total = lineas.reduce((t: number, l: any) => t + Number(l.cantidad) * Number(l.costoUnitario), 0);

    // Generar folio COM-YYYYMM-XXXX
    const now = new Date();
    const prefix = `COM-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;
    const count = await this.prisma.purchase.count({ where: { companyId } });
    const folio = `${prefix}-${String(count + 1).padStart(4, '0')}`;

    const compra = await this.prisma.purchase.create({
      data: {
        companyId,
        userId,
        supplierId:      data.proveedorId || null,
        date:            new Date(data.fecha),
        concept:         `Compra ${folio} — ${lineas.length} insumo(s)`,
        total,
        totalMxn:        total,
        paymentStatus:   'PAGADO',
        affectsInventory: true,
        invoiceRef:      data.referencia || null,
        items: {
          create: lineas.map((l: any) => ({
            description: l.nombre || 'Insumo',
            quantity:    Number(l.cantidad),
            unit:        l.unidad || 'kg',
            unitCost:    Number(l.costoUnitario),
            total:       Number(l.cantidad) * Number(l.costoUnitario),
          })),
        },
      },
      include: { supplier: { select: { id: true, name: true } }, items: true },
    });

    // Actualizar stock e insumos
    for (const l of lineas) {
      if (l.insumoId) {
        await (this.prisma as any).insumo.update({
          where: { id: l.insumoId },
          data:  { stock: { increment: Number(l.cantidad) }, costUnit: Number(l.costoUnitario) },
        });
      }
    }

    // Registrar salida en flujo si no es crédito
    const branch = await this.prisma.branch.findFirst({ where: { companyId } });
    if (data.metodoPago !== 'CREDITO_CLIENTE' && branch) {
      const cuenta = await this.prisma.cashAccount.findFirst({
        where: { companyId, code: data.cuentaId || 'efectivo_mxn', isActive: true },
      });
      if (cuenta) {
        await this.prisma.flowMovement.create({
          data: {
            companyId, branchId: branch.id, cashAccountId: cuenta.id,
            date: new Date(data.fecha), type: 'SALIDA', originType: 'COMPRA_INSUMO',
            originId: compra.id, amount: total, currency: 'MXN',
            exchangeRate: 1, amountMxn: total,
            notes: `Compra ${folio}`,
          },
        });
      }
    }

    return compra;
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

  // Normalizar método de pago a valores canónicos
  private _normalizarMetodo(method: string): string {
    const map: Record<string,string> = {
      'efectivo': 'EFECTIVO', 'EFECTIVO_MXN': 'EFECTIVO', 'EFECTIVO_USD': 'EFECTIVO',
      'tarjeta': 'TARJETA_DEBITO', 'TARJETA': 'TARJETA_DEBITO', 'debito': 'TARJETA_DEBITO',
      'credito_card': 'TARJETA_CREDITO', 'TARJETA_CREDITO_CARD': 'TARJETA_CREDITO',
      'transferencia': 'TRANSFERENCIA', 'TRANSFERENCIA_BANCARIA': 'TRANSFERENCIA',
      'credito': 'CREDITO_CLIENTE', 'CREDITO': 'CREDITO_CLIENTE',
    };
    return map[method] || (method ? method.toUpperCase() : 'EFECTIVO');
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
    // Validar stock suficiente antes de proceder
    for (const line of data.lines) {
      const stock = await this.prisma.productStock.findFirst({
        where: { productId: line.productId },
      });
      const available = Number(stock?.stock || 0);
      if (available < Number(line.quantity)) {
        const product = await this.prisma.product.findUnique({ where: { id: line.productId } });
        throw new Error(`Stock insuficiente para "${product?.name || line.productId}". Disponible: ${available}, Solicitado: ${line.quantity}`);
      }
    }

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
          paymentMethod: this._normalizarMetodo(data.paymentMethod || 'EFECTIVO'),
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
    if ((data.isCredit === true || data.isCredit === 'true' || data.paymentMethod === 'CREDITO_CLIENTE' || data.paymentMethod === 'credito') && data.clientId) {
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
