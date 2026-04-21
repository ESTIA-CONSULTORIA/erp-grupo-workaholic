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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SuppliersService = class SuppliersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(companyId, active) {
        const where = { companyId };
        if (active !== undefined)
            where.isActive = active !== 'false';
        return this.prisma.supplier.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    create(companyId, data) {
        return this.prisma.supplier.create({
            data: {
                companyId,
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                notes: data.notes || null,
                isActive: true,
            },
        });
    }
    update(id, data) {
        return this.prisma.supplier.update({
            where: { id },
            data: {
                name: data.name || undefined,
                email: data.email !== undefined ? data.email : undefined,
                phone: data.phone !== undefined ? data.phone : undefined,
                notes: data.notes !== undefined ? data.notes : undefined,
                isActive: data.isActive !== undefined ? data.isActive : undefined,
            },
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map