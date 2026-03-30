// ─── machete.module.ts ────────────────────────────────────────
import { Module }            from '@nestjs/common';
import { MacheteService }    from './machete.service';
import { MacheteController } from './machete.controller';

@Module({
  providers:   [MacheteService],
  controllers: [MacheteController],
  exports:     [MacheteService],
})
export class MacheteModule {}

// ─── machete.service.ts ───────────────────────────────────────
import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MacheteService {
  constructor(private prisma: PrismaService) {}

  // ══════════════════════════════════════════════════════════
  //  CATÁLOGO DE PRODUCTOS (SKUs)
  // ══════════════════════════════════════════════════════════

  async getProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId },
      include: { currentStock: true },
      orderBy: [{ meatType:'asc' }, { flavor:'asc' }, { gramsWeight:'asc' }],
    });
  }

  async upsertProduct(companyId: string, data: {
    sku:          string;
    name:         string;
    meatType:     string;
    flavor:       string;
    presentation: string;
    gramsWeight?: number;
    priceMostrador?: number;
    priceMayoreo?:   number;
    priceOnline?:    number;
    priceML?:        number;
  }) {
    return this.prisma.product.upsert({
      where:  { companyId_sku: { companyId, sku: data.sku } },
      update: data,
      create: { companyId, ...data },
    });
  }

  async updatePrices(companyId: string, sku: string, prices: {
    priceMostrador?: number;
    priceMayoreo?:   number;
    priceOnline?:    number;
    priceML?:        number;
  }) {
    return this.prisma.product.update({
      where: { companyId_sku: { companyId, sku } },
      data:  prices,
    });
  }

  async setStockMin(companyId: string, sku: string, minStock: number) {
    const product = await this.prisma.product.findUnique({
      where: { companyId_sku: { companyId, sku } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.prisma.productStock.upsert({
      where:  { productId: product.id },
      update: { minStock },
      create: { productId: product.id, stock:0, minStock },
    });
  }

  // ══════════════════════════════════════════════════════════
  //  RECETAS CON VERSIONES
  // ══════════════════════════════════════════════════════════

  async getActiveRecipes(companyId: string) {
    return this.prisma.recipe.findMany({
      where:   { companyId, isActive: true },
      include: { ingredients: true },
      orderBy: { key: 'asc' },
    });
  }

  async getRecipeHistory(companyId: string, key: string) {
    return this.prisma.recipe.findMany({
      where:   { companyId, key },
      include: { ingredients: true },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async saveRecipeVersion(companyId: string, data: {
    key:              string;
    theoreticalYield: number;
    changedById:      string;
    changeNote?:      string;
    ingredients: {
      inputName:       string;
      quantityPer100g: number;
      unit:            string;
    }[];
  }) {
    // Desactivar versión anterior
    await this.prisma.recipe.updateMany({
      where: { companyId, key: data.key, isActive: true },
      data:  { isActive: false },
    });

    // Obtener siguiente número de versión
    const last = await this.prisma.recipe.findFirst({
      where:   { companyId, key: data.key },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (last?.versionNumber || 0) + 1;

    // Crear nueva versión
    return this.prisma.recipe.create({
      data: {
        companyId,
        key:              data.key,
        theoreticalYield: data.theoreticalYield,
        versionNumber,
        isActive:         true,
        changedById:      data.changedById,
        changeNote:       data.changeNote,
        ingredients: {
          create: data.ingredients,
        },
      },
      include: { ingredients: true },
    });
  }

  // ══════════════════════════════════════════════════════════
  //  INVENTARIO MP (Materia Prima)
  // ══════════════════════════════════════════════════════════

  async getMPInventory(companyId: string) {
    // Agregar movimientos de entrada y salida por insumo
    const batches = await this.prisma.productionBatch.findMany({
      where: { companyId },
      select: { inputsUsed: true, status: true },
    });

    // Los insumos se gestionan via JSON en el lote
    // Aquí retornamos el resumen agregado
    const inputMap: Record<string, { name:string; totalUsed:number; unit:string }> = {};

    for (const batch of batches.filter(b => b.status === 'TERMINADO')) {
      const inputs = (batch.inputsUsed as any[]) || [];
      for (const inp of inputs) {
        if (!inputMap[inp.inputName]) {
          inputMap[inp.inputName] = { name: inp.inputName, totalUsed: 0, unit: inp.unit };
        }
        inputMap[inp.inputName].totalUsed += inp.quantity;
      }
    }

    return Object.values(inputMap);
  }

  // ══════════════════════════════════════════════════════════
  //  INVENTARIO PT (Producto Terminado)
  // ══════════════════════════════════════════════════════════

  async getPTInventory(companyId: string) {
    const products = await this.prisma.product.findMany({
      where:   { companyId, isActive: true },
      include: { currentStock: true },
    });

    return products.map(p => ({
      ...p,
      stock:     p.currentStock?.stock    || 0,
      minStock:  p.currentStock?.minStock || 5,
      lowStock:  (p.currentStock?.stock || 0) < (p.currentStock?.minStock || 5),
    }));
  }

  // ══════════════════════════════════════════════════════════
  //  PRODUCCIÓN — LOTES
  // ══════════════════════════════════════════════════════════

  async getBatches(companyId: string, filters: { period?: string; status?: string }) {
    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.period) {
      const [y, m] = filters.period.split('-').map(Number);
      where.startDate = {
        gte: new Date(y, m-1, 1),
        lte: new Date(y, m,   0),
      };
    }
    return this.prisma.productionBatch.findMany({
      where,
      include: { recipe: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async startBatch(companyId: string, data: {
    recipeId:   string;
    recipeKey:  string;
    startDate:  string;
    kgInput:    number;
    inputsUsed: { inputName:string; quantity:number; unit:string }[];
    notes?:     string;
  }) {
    return this.prisma.productionBatch.create({
      data: {
        companyId,
        recipeId:   data.recipeId,
        recipeKey:  data.recipeKey,
        startDate:  new Date(data.startDate),
        status:     'MARINANDO',
        kgInput:    data.kgInput,
        inputsUsed: data.inputsUsed,
        notes:      data.notes,
      },
    });
  }

  async updateBatchStatus(batchId: string, status: string) {
    return this.prisma.productionBatch.update({
      where: { id: batchId },
      data:  { status },
    });
  }

  async closeBatch(batchId: string, data: {
    kgOutput:     number;
    distribution: { sku:string; units:number }[];
    endDate:      string;
  }) {
    const batch = await this.prisma.productionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Lote no encontrado');

    const kgWaste   = Number(batch.kgInput) - data.kgOutput;
    const realYield = Number(batch.kgInput) > 0 ? data.kgOutput / Number(batch.kgInput) : 0;
    const recipe    = await this.prisma.recipe.findUnique({ where: { id: batch.recipeId } });
    const yieldOk   = recipe ? (realYield - Number(recipe.theoreticalYield)) >= -0.03 : true;

    return this.prisma.$transaction(async (tx) => {
      // 1. Cerrar lote
      await tx.productionBatch.update({
        where: { id: batchId },
        data: {
          kgOutput:     data.kgOutput,
          kgWaste,
          realYield,
          yieldOk,
          endDate:      new Date(data.endDate),
          distribution: data.distribution,
          status:       'TERMINADO',
        },
      });

      // 2. Sumar unidades al inventario PT
      for (const dist of data.distribution) {
        const product = await tx.product.findFirst({
          where: { sku: dist.sku, companyId: batch.companyId },
          include: { currentStock: true },
        });
        if (!product) continue;

        const currentStock = product.currentStock?.stock || 0;
        await tx.productStock.upsert({
          where:  { productId: product.id },
          update: { stock: Number(currentStock) + dist.units },
          create: { productId: product.id, stock: dist.units, minStock: 5 },
        });
      }

      return tx.productionBatch.findUnique({ where: { id: batchId } });
    });
  }

  // ══════════════════════════════════════════════════════════
  //  POS — VENTAS
  // ══════════════════════════════════════════════════════════

  async getSales(companyId: string, filters: { period?: string; channel?: string }) {
    const where: any = { companyId };
    if (filters.channel) where.channel = filters.channel;
    if (filters.period) {
      const [y, m] = filters.period.split('-').map(Number);
      where.date = { gte: new Date(y, m-1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.sale.findMany({
      where,
      include: { lines: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async registerSale(companyId: string, data: {
    date:          string;
    channel:       string;
    clientName?:   string;
    paymentMethod: string;
    lines: { productId:string; quantity:number; unitPrice:number }[];
  }) {
    const total = data.lines.reduce((t, l) => t + l.quantity * l.unitPrice, 0);

    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar y descontar stock
      for (const line of data.lines) {
        const product = await tx.product.findFirst({
          where: { id: line.productId },
          include: { currentStock: true },
        });
        if (!product) throw new NotFoundException(`Producto no encontrado`);

        const stock = Number(product.currentStock?.stock || 0);
        if (stock < line.quantity) {
          throw new BadRequestException(
            `Sin stock suficiente para ${product.name}. Disponible: ${stock}`
          );
        }

        await tx.productStock.update({
          where: { productId: product.id },
          data:  { stock: stock - line.quantity },
        });
      }

      // 2. Registrar venta
      const sale = await tx.sale.create({
        data: {
          companyId,
          date:          new Date(data.date),
          channel:       data.channel,
          clientName:    data.clientName || null,
          total,
          paymentMethod: data.paymentMethod,
          lines: {
            create: data.lines.map(l => ({
              productId: l.productId,
              quantity:  l.quantity,
              unitPrice: l.unitPrice,
              total:     l.quantity * l.unitPrice,
            })),
          },
        },
        include: { lines: { include: { product: true } } },
      });

      return sale;
    });
  }

  // ══════════════════════════════════════════════════════════
  //  REPORTES MACHETE
  // ══════════════════════════════════════════════════════════

  async getSalesReport(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const startDate = new Date(y, m-1, 1);
    const endDate   = new Date(y, m,   0);

    const sales = await this.prisma.sale.findMany({
      where: { companyId, date: { gte: startDate, lte: endDate } },
      include: { lines: { include: { product: true } } },
    });

    // Agregar por canal, tipo, sabor, presentación
    const byChannel:      Record<string,number> = {};
    const byMeatType:     Record<string,number> = {};
    const byFlavor:       Record<string,number> = {};
    const byPresentation: Record<string,number> = {};
    const bySKU:          Record<string,{ name:string; units:number; revenue:number }> = {};

    let totalRevenue = 0;
    let totalUnits   = 0;

    for (const sale of sales) {
      byChannel[sale.channel] = (byChannel[sale.channel] || 0) + Number(sale.total);
      totalRevenue += Number(sale.total);

      for (const line of sale.lines) {
        const p = line.product;
        totalUnits += line.quantity;

        byMeatType[p.meatType]         = (byMeatType[p.meatType]         || 0) + Number(line.total);
        byFlavor[p.flavor]             = (byFlavor[p.flavor]             || 0) + Number(line.total);
        byPresentation[p.presentation] = (byPresentation[p.presentation] || 0) + Number(line.total);

        if (!bySKU[p.sku]) bySKU[p.sku] = { name:p.name, units:0, revenue:0 };
        bySKU[p.sku].units   += line.quantity;
        bySKU[p.sku].revenue += Number(line.total);
      }
    }

    // Rendimiento de lotes del mes
    const batches = await this.prisma.productionBatch.findMany({
      where: { companyId, startDate: { gte: startDate, lte: endDate }, status: 'TERMINADO' },
    });

    const totalKgIn  = batches.reduce((t, b) => t + Number(b.kgInput  || 0), 0);
    const totalKgOut = batches.reduce((t, b) => t + Number(b.kgOutput || 0), 0);

    return {
      period, totalRevenue, totalUnits,
      byChannel:      Object.entries(byChannel).map(([k,v])      => ({ canal:k,      revenue:v }),),
      byMeatType:     Object.entries(byMeatType).map(([k,v])     => ({ tipo:k,       revenue:v }),),
      byFlavor:       Object.entries(byFlavor).map(([k,v])       => ({ sabor:k,      revenue:v }),),
      byPresentation: Object.entries(byPresentation).map(([k,v]) => ({ presentacion:k,revenue:v }),),
      bySKU:          Object.values(bySKU).sort((a,b) => b.revenue - a.revenue),
      production: {
        lotes:      batches.length,
        totalKgIn,
        totalKgOut,
        totalWaste: totalKgIn - totalKgOut,
        avgYield:   totalKgIn > 0 ? totalKgOut / totalKgIn : 0,
      },
    };
  }
}

// ─── machete.controller.ts ────────────────────────────────────
import {
  Controller, Get, Post, Put, Param,
  Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Machete')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/machete')
export class MacheteController {
  constructor(private svc: MacheteService) {}

  // ── Catálogo ───────────────────────────────────────────────
  @Get('products')
  getProducts(@Param('companyId') cid: string) {
    return this.svc.getProducts(cid);
  }

  @Post('products')
  upsertProduct(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.upsertProduct(cid, body);
  }

  @Put('products/:sku/prices')
  updatePrices(
    @Param('companyId') cid: string,
    @Param('sku') sku: string,
    @Body() body: any,
  ) {
    return this.svc.updatePrices(cid, sku, body);
  }

  @Put('products/:sku/min-stock')
  setStockMin(
    @Param('companyId') cid: string,
    @Param('sku') sku: string,
    @Body() body: { minStock: number },
  ) {
    return this.svc.setStockMin(cid, sku, body.minStock);
  }

  // ── Recetas ─────────────────────────────────────────────────
  @Get('recipes')
  getRecipes(@Param('companyId') cid: string) {
    return this.svc.getActiveRecipes(cid);
  }

  @Get('recipes/:key/history')
  getRecipeHistory(
    @Param('companyId') cid: string,
    @Param('key') key: string,
  ) {
    return this.svc.getRecipeHistory(cid, key);
  }

  @Post('recipes')
  saveRecipe(
    @Param('companyId') cid: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.svc.saveRecipeVersion(cid, { ...body, changedById: req.user.sub });
  }

  // ── Inventarios ──────────────────────────────────────────────
  @Get('inventory/pt')
  getPT(@Param('companyId') cid: string) {
    return this.svc.getPTInventory(cid);
  }

  // ── Producción / Lotes ───────────────────────────────────────
  @Get('batches')
  getBatches(
    @Param('companyId') cid: string,
    @Query('period') period?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.getBatches(cid, { period, status });
  }

  @Post('batches')
  startBatch(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.startBatch(cid, body);
  }

  @Put('batches/:batchId/status')
  updateStatus(
    @Param('batchId') id: string,
    @Body() body: { status: string },
  ) {
    return this.svc.updateBatchStatus(id, body.status);
  }

  @Put('batches/:batchId/close')
  closeBatch(@Param('batchId') id: string, @Body() body: any) {
    return this.svc.closeBatch(id, body);
  }

  // ── POS ──────────────────────────────────────────────────────
  @Get('sales')
  getSales(
    @Param('companyId') cid: string,
    @Query('period') period?: string,
    @Query('channel') channel?: string,
  ) {
    return this.svc.getSales(cid, { period, channel });
  }

  @Post('sales')
  registerSale(@Param('companyId') cid: string, @Body() body: any) {
    return this.svc.registerSale(cid, body);
  }

  // ── Reportes ─────────────────────────────────────────────────
  @Get('reports/sales')
  salesReport(
    @Param('companyId') cid: string,
    @Query('period') period: string,
  ) {
    return this.svc.getSalesReport(cid, period);
  }
}
