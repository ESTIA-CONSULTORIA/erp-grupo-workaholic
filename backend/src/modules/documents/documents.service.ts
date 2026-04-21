// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class DocumentsService {
  private anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.prisma.document.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(companyId: string, userId: string, data: any) {
    return this.prisma.document.create({
      data: {
        companyId,
        userId,
        type:     data.type     || 'TICKET',
        fileUrl:  data.fileUrl  || null,
        fileName: data.fileName || null,
        mimeType: data.mimeType || null,
        status:   'CARGADO',
      },
    });
  }

  async extract(companyId: string, docId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: docId } });
    if (!doc || !doc.fileUrl) throw new Error('Documento no encontrado');

    await this.prisma.document.update({
      where: { id: docId },
      data: { status: 'PROCESANDO' },
    });

    try {
      // Extraer base64 del fileUrl
      const base64Match = (doc.fileUrl as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) throw new Error('Formato de imagen no válido');

      const mimeType = base64Match[1] as any;
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
    } catch (e: any) {
      await this.prisma.document.update({
        where: { id: docId },
        data: { status: 'CARGADO' },
      });
      throw new Error(`Error extrayendo datos: ${e.message}`);
    }
  }

  async update(docId: string, data: any) {
    // If cancelling a VALIDADO document, reverse the linked record
    if (data.status === 'CANCELADO') {
      const doc = await this.prisma.document.findUnique({ where: { id: docId } });
      if (doc?.linkedId && doc?.linkedType) {
        if (doc.linkedType === 'GASTO') {
          await this.prisma.expense.update({
            where: { id: doc.linkedId },
            data:  { paymentStatus: 'CANCELADO' },
          }).catch(() => {});
        } else if (doc.linkedType === 'COMPRA') {
          await this.prisma.purchase.update({
            where: { id: doc.linkedId },
            data:  { paymentStatus: 'CANCELADO' },
          }).catch(() => {});
        }
      }
    }
    return this.prisma.document.update({
      where: { id: docId },
      data,
    });
  }

  validate(docId: string, validatedData: any) {
    return this.prisma.document.update({
      where: { id: docId },
      data: { status: 'VALIDADO', validatedJson: validatedData },
    });
  }

  reject(docId: string) {
    return this.prisma.document.update({
      where: { id: docId },
      data: { status: 'RECHAZADO' },
    });
  }
}
