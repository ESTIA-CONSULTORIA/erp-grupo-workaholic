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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let DocumentsService = class DocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        return this.prisma.document.findMany({
            where,
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    create(companyId, userId, data) {
        return this.prisma.document.create({
            data: {
                companyId,
                userId,
                type: data.type || 'TICKET',
                fileUrl: data.fileUrl || null,
                fileName: data.fileName || null,
                mimeType: data.mimeType || null,
                status: 'CARGADO',
            },
        });
    }
    async extract(companyId, docId) {
        await this.prisma.document.update({
            where: { id: docId },
            data: { status: 'PROCESANDO' },
        });
        setTimeout(async () => {
            await this.prisma.document.update({
                where: { id: docId },
                data: {
                    status: 'PENDIENTE_VALIDACION',
                    extractedJson: { proveedor: 'Por validar', total: 0, fecha: new Date().toISOString().slice(0, 10) },
                },
            });
        }, 2000);
        return { message: 'Extracción iniciada' };
    }
    validate(docId, validatedData) {
        return this.prisma.document.update({
            where: { id: docId },
            data: { status: 'VALIDADO', validatedJson: validatedData },
        });
    }
    reject(docId) {
        return this.prisma.document.update({
            where: { id: docId },
            data: { status: 'RECHAZADO' },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map