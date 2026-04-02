import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CorteCajaService {
  constructor(private prisma: PrismaService) {}

  async getCortes(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.prisma.corteCaja.findMany({
      where,
      include: {
        cajero:    { select: { id: true, name: true } },
        validador: { select: { id: true, name: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async crearCorte(companyId: string, cajeroId: string, data: any) {
    const fecha = new Date(data.fecha);
    fecha.setHours(0, 0, 0, 0);

    const diferencia = Number(data.efectivoContado) - Number(data.totalEfectivo);

    return this.prisma.corteCaja.create({
      data: {
        companyId,
        cajeroId,
        fecha,
        status:          'PENDIENTE',
        totalVentas:     data.totalVentas     || 0,
        totalEfectivo:   data.totalEfectivo   || 0,
        totalTarjeta:    data.totalTarjeta    || 0,
        totalTransfer:   data.totalTransfer   || 0,
        totalCredito:    data.totalCredito    || 0,
        efectivoContado: data.efectivoContado || 0,
        diferencia,
        notasCajero:     data.notasCajero     || null,
        detalleVentas:   data.detalleVentas   || null,
      },
      include: { cajero: { select: { id: true, name: true } } },
    });
  }

  async validarCorte(corteId: string, validadorId: string, data: any) {
    const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
    if (!corte) throw new Error('Corte no encontrado');

    const efectivoFinal = data.efectivoReal !== undefined ? Number(data.efectivoReal) : Number(corte.efectivoContado);
    const diferencia = efectivoFinal - Number(corte.totalEfectivo);

    const updatedCorte = await this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        status:         'VALIDADO',
        efectivoReal:   efectivoFinal,
        diferencia,
        notasValidador: data.notasValidador || null,
        validadoPor:    validadorId,
        validadoAt:     new Date(),
      },
    });

    // Generar flujo bancario automático
    const branch = await this.prisma.branch.findFirst({ where: { companyId: corte.companyId } });

    // Efectivo → caja chica
    const cajaCuenta = await this.prisma.cashAccount.findFirst({
      where: { companyId: corte.companyId, type: 'EFECTIVO', isActive: true },
    });
    if (cajaCuenta && efectivoFinal > 0) {
      await this.prisma.flowMovement.create({
        data: {
          companyId:     corte.companyId,
          branchId:      branch!.id,
          cashAccountId: cajaCuenta.id,
          date:          corte.fecha,
          type:          'ENTRADA',
          originType:    'CORTE',
          originId:      corteId,
          amount:        efectivoFinal,
          currency:      'MXN',
          exchangeRate:  1,
          amountMxn:     efectivoFinal,
          notes:         `Corte de caja ${corte.fecha.toISOString().slice(0,10)}`,
        },
      });
    }

    // Tarjeta y transferencia → cuenta bancaria principal
    const bancoCuenta = await this.prisma.cashAccount.findFirst({
      where: { companyId: corte.companyId, type: 'BANCO', isActive: true },
    });
    const totalBanco = Number(corte.totalTarjeta) + Number(corte.totalTransfer);
    if (bancoCuenta && totalBanco > 0) {
      await this.prisma.flowMovement.create({
        data: {
          companyId:     corte.companyId,
          branchId:      branch!.id,
          cashAccountId: bancoCuenta.id,
          date:          corte.fecha,
          type:          'ENTRADA',
          originType:    'CORTE',
          originId:      corteId,
          amount:        totalBanco,
          currency:      'MXN',
          exchangeRate:  1,
          amountMxn:     totalBanco,
          notes:         `Tarjeta/Transferencia corte ${corte.fecha.toISOString().slice(0,10)}`,
        },
      });
    }

    return updatedCorte;
  }

  async rechazarCorte(corteId: string, validadorId: string, notas: string) {
    return this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        status:         'RECHAZADO',
        notasValidador: notas,
        validadoPor:    validadorId,
        validadoAt:     new Date(),
      },
    });
  }
}
