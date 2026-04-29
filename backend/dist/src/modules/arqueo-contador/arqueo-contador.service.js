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
exports.ArqueoContadorService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ArqueoContadorService = class ArqueoContadorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureTable() {
        await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "contador_arqueos" (
        "id" TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        "createdById" TEXT,
        "folio" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "declaredJson" JSONB NOT NULL,
        "systemJson" JSONB NOT NULL,
        "summaryJson" JSONB NOT NULL,
        "notes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ENVIADO',
        "differenceVisibleAt" TIMESTAMP(3) NOT NULL,
        "reviewedById" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "reviewNotes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await this.prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "contador_arqueos_companyId_folio_key"
      ON "contador_arqueos"("companyId", "folio")
    `);
        await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "contador_arqueos_companyId_date_idx"
      ON "contador_arqueos"("companyId", "date")
    `);
    }
    async create(companyId, userId, body) {
        await this.ensureTable();
        const id = (0, crypto_1.randomUUID)();
        const folio = `ARQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;
        const differenceVisibleAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.$executeRawUnsafe(`INSERT INTO "contador_arqueos"
      ("id", "companyId", "createdById", "folio", "declaredJson", "systemJson", "summaryJson", "notes", "differenceVisibleAt")
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)`, id, companyId, userId, folio, JSON.stringify(body?.declared || {}), JSON.stringify(body?.system || {}), JSON.stringify(body?.summary || {}), body?.notes || null, differenceVisibleAt);
        return { id, folio, ok: true, differenceVisibleAt };
    }
    async findAll(companyId) {
        await this.ensureTable();
        return this.prisma.$queryRawUnsafe(`SELECT * FROM "contador_arqueos"
       WHERE "companyId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 50`, companyId);
    }
};
exports.ArqueoContadorService = ArqueoContadorService;
exports.ArqueoContadorService = ArqueoContadorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArqueoContadorService);
//# sourceMappingURL=arqueo-contador.service.js.map