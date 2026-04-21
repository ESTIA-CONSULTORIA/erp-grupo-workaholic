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
const sdk_1 = require("@anthropic-ai/sdk");
let DocumentsService = class DocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
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
        const doc = await this.prisma.document.findUnique({ where: { id: docId } });
        if (!doc || !doc.fileUrl)
            throw new Error('Documento no encontrado');
        await this.prisma.document.update({
            where: { id: docId },
            data: { status: 'PROCESANDO' },
        });
        try {
            const base64Match = doc.fileUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!base64Match)
                throw new Error('Formato de imagen no válido');
            const mimeType = base64Match[1];
            const base64Data = base64Match[2];
            const response = await this.anthropic.messages.create({
                model: 'claude-opus-4-6',
                max_tokens: 1024,
                messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: { type: 'base64', media_type: mimeType, data: base64Data },
                            },
                            {
                                type: 'text',
                                text: `Analiza este ticket o factura y extrae la información en formato JSON.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con esta estructura exacta:
{
  "proveedor": "nombre del proveedor o tienda",
  "fecha": "YYYY-MM-DD",
  "subtotal": 0.00,
  "iva": 0.00,
  "total": 0.00,
  "moneda": "MXN",
  "conceptos": [
    { "descripcion": "descripción del producto/servicio", "cantidad": 1, "precioUnitario": 0.00, "total": 0.00 }
  ],
  "referencia": "número de ticket o factura si aparece",
  "metodoPago": "efectivo/tarjeta/transferencia si aparece"
}
Si no puedes leer algún campo, usa null. Si no es un ticket o factura, responde con {"error": "No es un ticket o factura"}.`,
                            },
                        ],
                    }],
            });
            const text = response.content[0].type === 'text' ? response.content[0].text : '';
            const clean = text.replace(/```json|```/g, '').trim();
            const extracted = JSON.parse(clean);
            await this.prisma.document.update({
                where: { id: docId },
                data: {
                    status: 'PENDIENTE_VALIDACION',
                    extractedJson: extracted,
                },
            });
            return { success: true, data: extracted };
        }
        catch (e) {
            await this.prisma.document.update({
                where: { id: docId },
                data: { status: 'CARGADO' },
            });
            throw new Error(`Error extrayendo datos: ${e.message}`);
        }
    }
    async update(docId, data) {
        if (data.status === 'CANCELADO') {
            const doc = await this.prisma.document.findUnique({ where: { id: docId } });
            if (doc?.linkedId && doc?.linkedType) {
                if (doc.linkedType === 'GASTO') {
                    await this.prisma.expense.update({
                        where: { id: doc.linkedId },
                        data: { paymentStatus: 'CANCELADO' },
                    }).catch(() => { });
                }
                else if (doc.linkedType === 'COMPRA') {
                    await this.prisma.purchase.update({
                        where: { id: doc.linkedId },
                        data: { paymentStatus: 'CANCELADO' },
                    }).catch(() => { });
                }
            }
        }
        return this.prisma.document.update({
            where: { id: docId },
            data,
        });
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