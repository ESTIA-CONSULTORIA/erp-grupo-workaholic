"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let BulkImportService = class BulkImportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    result(ok, errors) { return { ok, errors }; }
    async importGastos(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.concept) {
                    errors.push(`Sin concepto: ${JSON.stringify(row)}`);
                    continue;
                }
                await this.prisma.expense.create({ data: {
                        companyId,
                        date: row.fecha ? new Date(row.fecha) : new Date(),
                        concept: row.concepto || row.concept || '',
                        subtotal: Number(row.subtotal || row.total || 0),
                        tax: Number(row.iva || row.tax || 0),
                        total: Number(row.total || row.subtotal || 0),
                        paymentMethod: row.metodo || row.paymentMethod || 'EFECTIVO',
                        paymentStatus: row.estatus || row.paymentStatus || 'PAGADO',
                        invoiceRef: row.factura || row.invoiceRef || null,
                        isExternal: false,
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error en fila: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importProveedores(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.nombre && !row.name) {
                    errors.push('Sin nombre');
                    continue;
                }
                const name = row.nombre || row.name;
                const exists = await this.prisma.supplier.findFirst({ where: { companyId, name } });
                if (exists) {
                    errors.push(`Ya existe: ${name}`);
                    continue;
                }
                await this.prisma.supplier.create({ data: {
                        companyId,
                        name,
                        rfc: row.rfc || null,
                        phone: row.telefono || row.phone || null,
                        email: row.email || null,
                        address: row.direccion || row.address || null,
                        contact: row.contacto || row.contact || null,
                        isActive: true,
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importClientes(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.nombre && !row.name) {
                    errors.push('Sin nombre');
                    continue;
                }
                const name = row.nombre || row.name;
                const exists = await this.prisma.client.findFirst({ where: { companyId, name } });
                if (exists) {
                    errors.push(`Ya existe: ${name}`);
                    continue;
                }
                await this.prisma.client.create({ data: {
                        companyId,
                        name,
                        rfc: row.rfc || null,
                        phone: row.telefono || row.phone || null,
                        email: row.email || null,
                        address: row.direccion || row.address || null,
                        contact: row.contacto || row.contact || null,
                        creditLimit: Number(row.credito || row.creditLimit || 0),
                        isActive: true,
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importProductos(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.sku || !row.nombre) {
                    errors.push(`SKU y nombre requeridos`);
                    continue;
                }
                const exists = await this.prisma.product.findFirst({ where: { companyId, sku: row.sku } });
                if (exists) {
                    errors.push(`SKU ya existe: ${row.sku}`);
                    continue;
                }
                const product = await this.prisma.product.create({ data: {
                        companyId,
                        sku: row.sku,
                        name: row.nombre || row.name,
                        meatType: row.tipo || row.meatType || 'RES',
                        flavor: row.sabor || row.flavor || 'NATURAL',
                        weight: Number(row.peso || row.weight || 0),
                        unit: row.unidad || row.unit || 'pza',
                        price: Number(row.precio || row.price || 0),
                        isActive: true,
                    } });
                await this.prisma.productStock.create({ data: {
                        productId: product.id,
                        stock: Number(row.stock || 0),
                        minStock: Number(row.minimo || row.minStock || 5),
                        maxStock: Number(row.maximo || row.maxStock || 0),
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error ${row.sku}: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importInsumos(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.nombre && !row.name) {
                    errors.push('Sin nombre');
                    continue;
                }
                const name = row.nombre || row.name;
                const exists = await this.prisma.insumo.findFirst({ where: { companyId, name } });
                if (exists) {
                    errors.push(`Ya existe: ${name}`);
                    continue;
                }
                await this.prisma.insumo.create({ data: {
                        companyId,
                        sku: row.sku || name.slice(0, 8).toUpperCase().replace(/\s+/g, '_'),
                        name,
                        unit: row.unidad || row.unit || 'kg',
                        costUnit: Number(row.costo || row.costUnit || 0),
                        group: row.grupo || row.group || 'GENERAL',
                        stock: Number(row.stock || 0),
                        minStock: Number(row.minimo || row.minStock || 0),
                        isActive: true,
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importEmpleados(companyId, rows) {
        let ok = 0;
        const errors = [];
        const last = await this.prisma.employee.findFirst({ where: { companyId }, orderBy: { employeeNumber: 'desc' } });
        let num = last ? parseInt(last.employeeNumber.replace(/\D/g, '')) + 1 : 1;
        for (const row of rows) {
            try {
                if (!row.nombre && !row.firstName) {
                    errors.push('Sin nombre');
                    continue;
                }
                await this.prisma.employee.create({ data: {
                        companyId,
                        employeeNumber: `EMP-${String(num++).padStart(4, '0')}`,
                        firstName: row.nombre || row.firstName,
                        lastName: row.apellido || row.lastName || '',
                        secondLastName: row.apellido2 || row.secondLastName || null,
                        rfc: row.rfc || null,
                        curp: row.curp || null,
                        nss: row.nss || null,
                        phone: row.telefono || row.phone || null,
                        email: row.email || null,
                        position: row.puesto || row.position || 'Sin puesto',
                        department: row.area || row.department || null,
                        contractType: row.contrato || row.contractType || 'INDEFINIDO',
                        startDate: row.ingreso ? new Date(row.ingreso) : new Date(),
                        grossSalary: Number(row.salario || row.grossSalary || 0),
                        dailySalary: Number(row.salarioDiario || row.dailySalary || 0),
                        bankAccount: row.clabe || row.bankAccount || null,
                        bankName: row.banco || row.bankName || null,
                        status: 'ACTIVO',
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importCxC(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.cliente && !row.clientId) {
                    errors.push('Sin cliente');
                    continue;
                }
                let clientId = row.clientId;
                if (!clientId) {
                    const cl = await this.prisma.client.findFirst({ where: { companyId, name: { contains: row.cliente } } });
                    if (!cl) {
                        errors.push(`Cliente no encontrado: ${row.cliente}`);
                        continue;
                    }
                    clientId = cl.id;
                }
                const amount = Number(row.monto || row.originalAmount || 0);
                await this.prisma.cxC.create({ data: {
                        companyId, clientId,
                        date: row.fecha ? new Date(row.fecha) : new Date(),
                        dueDate: row.vencimiento ? new Date(row.vencimiento) : null,
                        concept: row.concepto || row.concept || 'Saldo importado',
                        originalAmount: amount,
                        paidAmount: Number(row.pagado || row.paidAmount || 0),
                        balance: amount - Number(row.pagado || 0),
                        status: row.estatus || 'PENDIENTE',
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importCxP(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.proveedor && !row.supplierId) {
                    errors.push('Sin proveedor');
                    continue;
                }
                let supplierId = row.supplierId;
                if (!supplierId) {
                    const sp = await this.prisma.supplier.findFirst({ where: { companyId, name: { contains: row.proveedor } } });
                    if (!sp) {
                        errors.push(`Proveedor no encontrado: ${row.proveedor}`);
                        continue;
                    }
                    supplierId = sp.id;
                }
                const amount = Number(row.monto || row.originalAmount || 0);
                await this.prisma.payable.create({ data: {
                        companyId, supplierId,
                        date: row.fecha ? new Date(row.fecha) : new Date(),
                        dueDate: row.vencimiento ? new Date(row.vencimiento) : null,
                        concept: row.concepto || row.concept || 'Saldo importado',
                        invoiceRef: row.factura || row.invoiceRef || null,
                        originalAmount: amount,
                        paidAmount: Number(row.pagado || row.paidAmount || 0),
                        balance: amount - Number(row.pagado || 0),
                        status: row.estatus || 'PENDIENTE',
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
    async importCompras(companyId, rows) {
        let ok = 0;
        const errors = [];
        for (const row of rows) {
            try {
                if (!row.total && !row.monto) {
                    errors.push('Sin monto');
                    continue;
                }
                let supplierId = row.supplierId;
                if (!supplierId && row.proveedor) {
                    const sp = await this.prisma.supplier.findFirst({ where: { companyId, name: { contains: row.proveedor } } });
                    supplierId = sp?.id || null;
                }
                const total = Number(row.total || row.monto || 0);
                await this.prisma.purchase.create({ data: {
                        companyId, supplierId,
                        date: row.fecha ? new Date(row.fecha) : new Date(),
                        concept: row.concepto || row.concept || 'Compra importada',
                        total,
                        totalMxn: total,
                        paymentStatus: row.estatus || 'PAGADO',
                        invoiceRef: row.factura || row.invoiceRef || null,
                        affectsInventory: false,
                    } });
                ok++;
            }
            catch (e) {
                errors.push(`Error: ${e.message}`);
            }
        }
        return this.result(ok, errors);
    }
};
exports.BulkImportService = BulkImportService;
exports.BulkImportService = BulkImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BulkImportService);
//# sourceMappingURL=bulk-import.service.js.map