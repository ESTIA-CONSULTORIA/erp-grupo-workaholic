// ─── documents.module.ts ──────────────────────────────────────
import { Module }               from '@nestjs/common';
import { DocumentsService }     from './documents.service';
import { DocumentsController }  from './documents.controller';

@Module({
  providers:   [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}

// ─── documents.service.ts ─────────────────────────────────────
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService }  from '../../common/prisma/prisma.service';
import { ConfigService }  from '@nestjs/config';
import Anthropic          from '@anthropic-ai/sdk';
import * as fs            from 'fs';
import * as path          from 'path';

@Injectable()
export class DocumentsService {
  private anthropic: Anthropic;

  constructor(
    private prisma:  PrismaService,
    private config:  ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get('ANTHROPIC_API_KEY'),
    });
  }

  // ── 1. Subir documento y guardar metadata ─────────────────
  async upload(companyId: string, userId: string, data: {
    type:      string;  // CORTE | COMPRA | GASTO | FACTURA | TICKET | RECIBO
    fileUrl:   string;  // URL en S3/R2 o base64 temporal
    fileName:  string;
    mimeType:  string;
  }) {
    return this.prisma.documentUpload.create({
      data: {
        companyId,
        userId,
        type:     data.type,
        fileUrl:  data.fileUrl,
        fileName: data.fileName,
        mimeType: data.mimeType,
        status:   'CARGADO',
      },
    });
  }

  // ── 2. Extraer datos con Claude Vision ────────────────────
  async extract(documentId: string) {
    const doc = await this.prisma.documentUpload.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new BadRequestException('Documento no encontrado');

    // Actualizar estado
    await this.prisma.documentUpload.update({
      where: { id: documentId },
      data:  { status: 'PROCESANDO' },
    });

    try {
      // Llamar a Claude Vision con el documento
      const response = await this.anthropic.messages.create({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role:    'user',
          content: [
            {
              type:   'image',
              source: {
                type:       'url',
                url:        doc.fileUrl,
              },
            },
            {
              type: 'text',
              text: `Analiza este documento (ticket, factura, recibo o corte de caja) y extrae la información.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional, con esta estructura:
{
  "tipo_documento": "ticket | factura | recibo | corte | otro",
  "proveedor": "nombre del negocio o emisor",
  "fecha": "YYYY-MM-DD o null",
  "folio": "número de folio o ticket si existe",
  "subtotal": número o null,
  "iva": número o null,
  "total": número (el monto total final, sin signo $),
  "moneda": "MXN | USD",
  "metodo_pago": "efectivo | tarjeta | transferencia | mixto | null",
  "conceptos": ["descripción de artículos o servicios"],
  "notas": "observaciones relevantes si las hay"
}
Si no puedes leer un campo, pon null. El campo 'total' es el más importante.`,
            },
          ],
        }],
      });

      const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
      let extracted: any = null;

      try {
        const clean = rawText.replace(/```json|```/g, '').trim();
        extracted = JSON.parse(clean);
      } catch {
        extracted = { error: 'No se pudo parsear la respuesta', rawText };
      }

      // Guardar extracción y poner en estado pendiente de validación
      await this.prisma.documentUpload.update({
        where: { id: documentId },
        data: {
          rawText,
          extractedJson: extracted,
          status: 'PENDIENTE_VALIDACION',
        },
      });

      return { documentId, extracted, status: 'PENDIENTE_VALIDACION' };

    } catch (error) {
      await this.prisma.documentUpload.update({
        where: { id: documentId },
        data:  { status: 'CARGADO' },
      });
      throw error;
    }
  }

  // ── 3. El usuario revisa y valida / edita los datos ───────
  async validate(documentId: string, userId: string, validatedData: any) {
    // El usuario revisó los datos extraídos, los corrigió si era necesario,
    // y confirma que son correctos.
    // Este paso es OBLIGATORIO antes de guardar el gasto/compra.
    return this.prisma.documentUpload.update({
      where: { id: documentId },
      data: {
        validatedJson:  validatedData,
        validatedById:  userId,
        validatedAt:    new Date(),
        status:         'VALIDADO',
      },
    });
  }

  // ── 4. Rechazar documento ─────────────────────────────────
  async reject(documentId: string, userId: string) {
    return this.prisma.documentUpload.update({
      where: { id: documentId },
      data:  { status: 'RECHAZADO', validatedById: userId, validatedAt: new Date() },
    });
  }

  // ── 5. Archivar documento ─────────────────────────────────
  async archive(documentId: string) {
    return this.prisma.documentUpload.update({
      where: { id: documentId },
      data:  { status: 'ARCHIVADO' },
    });
  }

  // ── Obtener bandeja documental ────────────────────────────
  async findAll(companyId: string, filters: {
    status?: string;
    type?:   string;
  }) {
    return this.prisma.documentUpload.findMany({
      where: {
        companyId,
        ...(filters.status && { status: filters.status }),
        ...(filters.type   && { type:   filters.type   }),
      },
      include: {
        user:    { select: { id: true, name: true } },
        expense: { select: { id: true, concept: true, total: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.documentUpload.findUnique({
      where:   { id },
      include: {
        user:    { select: { id: true, name: true } },
        expense: { select: { id: true, concept: true } },
      },
    });
  }
}

// ─── documents.controller.ts ──────────────────────────────────
import {
  Controller, Get, Post, Put, Param,
  Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/documents')
export class DocumentsController {
  constructor(private svc: DocumentsService) {}

  @Get()
  findAll(
    @Param('companyId') id:      string,
    @Query('status')    status?: string,
    @Query('type')      type?:   string,
  ) {
    return this.svc.findAll(id, { status, type });
  }

  @Get(':docId')
  findOne(@Param('docId') docId: string) {
    return this.svc.findOne(docId);
  }

  @Post()
  upload(
    @Param('companyId') companyId: string,
    @Body()             body:      any,
    @Request()          req:       any,
  ) {
    return this.svc.upload(companyId, req.user.sub, body);
  }

  // Disparar extracción IA
  @Post(':docId/extract')
  extract(@Param('docId') docId: string) {
    return this.svc.extract(docId);
  }

  // Validar datos extraídos (OBLIGATORIO antes de guardar)
  @Put(':docId/validate')
  validate(
    @Param('docId') docId: string,
    @Body()         body:  any,
    @Request()      req:   any,
  ) {
    return this.svc.validate(docId, req.user.sub, body.validatedData);
  }

  @Put(':docId/reject')
  reject(@Param('docId') docId: string, @Request() req: any) {
    return this.svc.reject(docId, req.user.sub);
  }

  @Put(':docId/archive')
  archive(@Param('docId') docId: string) {
    return this.svc.archive(docId);
  }
}
