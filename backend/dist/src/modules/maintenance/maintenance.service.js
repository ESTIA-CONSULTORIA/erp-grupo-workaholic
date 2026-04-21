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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
let MaintenanceService = class MaintenanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seedUsers() {
        const hash = await bcrypt.hash('Workaholic2026!', 10);
        const results = [];
        const companies = await this.prisma.company.findMany();
        const byCode = Object.fromEntries(companies.map(c => [c.code, c]));
        const getRole = async (code) => {
            let r = await this.prisma.role.findUnique({ where: { code } });
            if (!r)
                r = await this.prisma.role.create({ data: { code, name: code, description: code } });
            return r;
        };
        const createUser = async (name, email, roleCode, codes) => {
            const existing = await this.prisma.user.findUnique({ where: { email } });
            if (existing) {
                results.push('exists: ' + email);
                return;
            }
            const role = await getRole(roleCode);
            const user = await this.prisma.user.create({ data: { name, email, password: hash, isActive: true } });
            for (const code of codes) {
                const company = byCode[code];
                if (!company)
                    continue;
                await this.prisma.companyUser.create({ data: { userId: user.id, companyId: company.id, roleId: role.id } }).catch(() => { });
            }
            results.push('created: ' + email);
        };
        await createUser('Cajero Workaholic', 'cajero@workaholic.com', 'cajero', ['WORKAHOLIC']);
        await createUser('Gerente Workaholic', 'gerente@workaholic.com', 'gerente', ['WORKAHOLIC']);
        await createUser('Cajero Palestra', 'cajero@palestra.com', 'cajero', ['PALESTRA']);
        await createUser('Gerente Palestra', 'gerente@palestra.com', 'gerente', ['PALESTRA']);
        await createUser('Cajero Lonche', 'cajero@lonche.com', 'cajero', ['LONCHE']);
        await createUser('Gerente Lonche', 'gerente@lonche.com', 'gerente', ['LONCHE']);
        return { results };
    }
    async fixOCSales(companyId) {
        const ocs = await this.prisma.ordenCompra.findMany({
            where: { companyId, status: { not: 'CANCELADA' } },
            include: { lineas: true },
        });
        let created = 0;
        const errors = [];
        for (const oc of ocs) {
            const existing = await this.prisma.sale.findFirst({
                where: { companyId, clientId: oc.clientId, isCredit: true, total: oc.montoTotal,
                    date: { gte: new Date(new Date(oc.fecha).setHours(0, 0, 0, 0)), lte: new Date(new Date(oc.fecha).setHours(23, 59, 59, 999)) } },
            });
            if (existing)
                continue;
            try {
                await this.prisma.sale.create({
                    data: { companyId, clientId: oc.clientId, date: new Date(oc.fecha),
                        channel: 'MOSTRADOR', isCredit: true, total: oc.montoTotal, paymentMethod: 'CREDITO_CLIENTE',
                        lines: oc.lineas.length > 0 ? { create: oc.lineas.map((l) => ({
                                productId: l.productId, quantity: l.cantidad, unitPrice: l.precioUnitario, total: l.total
                            })) } : undefined },
                });
                created++;
            }
            catch (e) {
                errors.push('OC ' + oc.numero + ': ' + e.message);
            }
        }
        return { total: ocs.length, created, errors };
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map