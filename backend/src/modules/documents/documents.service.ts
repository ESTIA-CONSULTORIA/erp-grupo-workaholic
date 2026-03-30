import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DocumentsService {
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
    await this.prisma.document.update({
      where: { id: docId },
      data: { status: 'PROCESANDO' },
    });

    // Simulación de extracción (en producción se usa Claude Vision API)
    setTimeout(async () => {
      await this.prisma.document.update({
        where: { id: docId },
        data: {
          status: 'PENDIENTE_VALIDACION',
          extractedJson: { proveedor: 'Por validar', total: 0, fecha: new Date().toISOString().slice(0,10) },
        },
      });
    }, 2000);

    return { message: 'Extracción iniciada' };
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
