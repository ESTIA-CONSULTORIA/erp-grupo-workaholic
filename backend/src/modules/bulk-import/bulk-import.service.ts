// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BulkImportService {
  constructor(private prisma: PrismaService) {}

  private result(ok: number, errors: string[]) { return { ok, errors }; }

  async importGastos(companyId: string, rows: any[]) {
    let ok = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        const concept = row.concepto || row.concept;
        if (!concept) { errors.push(`Sin concepto: ${JSON.stringify(row)}`); continue; }
        const user = await this.prisma.user.findFirst({ where: { isActive: true } });
        if (!user) { errors.push('No hay usuario activo para asignar la importación'); continue; }
        const subtotal = Number(row.subtotal || row.total || 0);
        const tax = Number(row.iva || row.tax || 0);
        const total = Number(row.total || subtotal + tax || 0);
        await this.prisma.expense.create({ data: {
          companyId,
          userId: user.id,
          date: row.fecha ? new Date(row.fecha) : new Date(),
          concept,
          subtotal,
          tax,
          total,
          currency: row.moneda || row.currency || 'MXN',
          exchangeRate: Number(row.tipoCambio || row.exchangeRate || 1),
          totalMxn: total * Number(row.tipoCambio || row.exchangeRate || 1),
          paymentMethod: row.metodo || row.paymentMethod || 'EFECTIVO',
          paymentStatus: row.estatus || row.paymentStatus || 'PAGADO',
          invoiceRef: row.factura || row.invoiceRef || null,
          isExternal: false,
        }});
        ok++;
      } catch(e: any) { errors.push(`Error en fila: ${e.message}`); }
    }
    return this.result(ok, errors);
  }

  async importProveedores(companyId: string, rows: any[]) {
    let ok = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        const name = row.nombre || row.name || row.proveedor || row.supplier;
        if (!name) { errors.push('Sin nombre'); continue; }
        const exists = await this.prisma.supplier.findFirst({ where: { companyId, name: { equals: name, mode: 'insensitive' } } });
        if (exists) { errors.push(`Ya existe: ${name}`); continue; }
        await this.prisma.supplier.create({ data: {
          companyId,
          name,
          phone: row.telefono || row.phone || null,
          email: row.email || null,
          notes: row.notas || row.notes || null,
          isActive: true,
        }});
        ok++;
      } catch(e: any) { errors.push(`Error: ${e.message}`); }
    }
    return this.result(ok, errors);
  }

  async importClientes(companyId: string, rows: any[]) {
    let ok = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        const name = row.nombre || row.name;
        if (!name) { errors.push('Sin nombre'); continue; }
        const exists = await this.prisma.client.findFirst({ where: { companyId, name: { equals: name, mode: 'insensitive' } } });
        if (exists) { errors.push(`Ya existe: ${name}`); continue; }
        await this.prisma.client.create({ data: {
          companyId,
          name,
          rfc: row.rfc || null,
          phone: row.telefono || row.phone || null,
          email: row.email || null,
          address: row.direccion || row.address || null,
          creditLimit: Number(row.credito || row.creditLimit || 0),
          isActive: true,
        }});
        ok++;
      } catch(e: any) { errors.push(`Error: ${e.message}`); }
    }
    return this.result(ok, errors);
  }

  async importProductos(companyId: string, rows: any[]) { return this.result(0, ['Importación de productos no modificada en este parche']); }
  async importInsumos(companyId: string, rows: any[]) { return this.result(0, ['Importación de insumos no modificada en este parche']); }
  async importEmpleados(companyId: string, rows: any[]) { return this.result(0, ['Importación de empleados no modificada en este parche']); }

  async importCxC(companyId: string, rows: any[]) {
    let ok = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        const cliente = row.cliente || row.client || row.clientName;
        if (!cliente && !row.clientId) { errors.push('Sin cliente'); continue; }
        let clientId = row.clientId || null;
        if (!clientId && cliente) {
          let cl = await this.prisma.client.findFirst({ where: { companyId, name: { contains: cliente, mode: 'insensitive' } } });
          if (!cl) cl = await this.prisma.client.create({ data: { companyId, name: cliente, isActive: true } });
          clientId = cl.id;
        }
        const amount = Number(row.monto || row.originalAmount || row.total || 0);
        const paid = Number(row.pagado || row.paidAmount || 0);
        await this.prisma.cxC.create({ data: {
          companyId, clientId,
          date: row.fecha ? new Date(row.fecha) : new Date(),
          dueDate: row.vencimiento ? new Date(row.vencimiento) : null,
          concept: row.concepto || row.concept || 'Saldo importado',
          originalAmount: amount,
          paidAmount: paid,
          balance: amount - paid,
          status: row.estatus || (paid > 0 ? 'PARCIAL' : 'PENDIENTE'),
        }});
        ok++;
      } catch(e: any) { errors.push(`Error: ${e.message}`); }
    }
    return this.result(ok, errors);
  }

  async importCxP(companyId: string, rows: any[]) {
    let ok = 0; const errors: string[] = [];
    for (const row of rows) {
      try {
        const proveedor = row.proveedor || row.supplier || row.supplierName || row.Proveedor;
        if (!proveedor && !row.supplierId) { errors.push('Sin proveedor'); continue; }
        let supplierId = row.supplierId || null;
        if (!supplierId && proveedor) {
          let sp = await this.prisma.supplier.findFirst({ where: { companyId, name: { contains: proveedor, mode: 'insensitive' } } });
          if (!sp) sp = await this.prisma.supplier.create({ data: { companyId, name: proveedor, isActive: true } });
          supplierId = sp.id;
        }
        const amount = Number(row.monto || row.originalAmount || row.total || row.Monto || 0);
        const paid = Number(row.pagado || row.paidAmount || row.Pagado || 0);
        await this.prisma.payable.create({ data: {
          companyId,
          supplierId,
          rubricId: row.rubricId || null,
          date: row.fecha ? new Date(row.fecha) : new Date(),
          dueDate: row.vencimiento ? new Date(row.vencimiento) : null,
          concept: row.concepto || row.concept || row.factura || row.invoiceRef || 'Saldo importado',
          currency: row.moneda || row.currency || 'MXN',
          originalAmount: amount,
          paidAmount: paid,
          balance: amount - paid,
          status: row.estatus || (paid > 0 ? 'PARCIAL' : 'PENDIENTE'),
          notes: row.notas || row.notes || (row.factura || row.invoiceRef ? `Factura: ${row.factura || row.invoiceRef}` : null),
        }});
        ok++;
      } catch(e: any) { errors.push(`Error: ${e.message}`); }
    }
    return this.result(ok, errors);
  }

  async importCompras(companyId: string, rows: any[]) {
    let ok = 0; const errors: string[] = [];
    const user = await this.prisma.user.findFirst({ where: { isActive: true } });
    for (const row of rows) {
      try {
        if (!row.total && !row.monto) { errors.push('Sin monto'); continue; }
        if (!user) { errors.push('No hay usuario activo para asignar la importación'); continue; }
        let supplierId = row.supplierId;
        if (!supplierId && row.proveedor) {
          const sp = await this.prisma.supplier.findFirst({ where: { companyId, name: { contains: row.proveedor, mode: 'insensitive' } } });
          supplierId = sp?.id || null;
        }
        const total = Number(row.total || row.monto || 0);
        await this.prisma.purchase.create({ data: {
          companyId, supplierId, userId: user.id,
          date: row.fecha ? new Date(row.fecha) : new Date(),
          concept: row.concepto || row.concept || 'Compra importada',
          total,
          currency: row.moneda || row.currency || 'MXN',
          exchangeRate: Number(row.tipoCambio || row.exchangeRate || 1),
          totalMxn: total * Number(row.tipoCambio || row.exchangeRate || 1),
          paymentStatus: row.estatus || 'PAGADO',
          invoiceRef: row.factura || row.invoiceRef || null,
          affectsInventory: false,
        }});
        ok++;
      } catch(e: any) { errors.push(`Error: ${e.message}`); }
    }
    return this.result(ok, errors);
  }
}
