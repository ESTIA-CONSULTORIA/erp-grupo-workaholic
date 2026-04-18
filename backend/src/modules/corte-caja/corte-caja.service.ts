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

  async getCorteById(corteId: string) {
    return this.prisma.corteCaja.findUnique({
      where: { id: corteId },
      include: {
        cajero:    { select: { id: true, name: true } },
        validador: { select: { id: true, name: true } },
      },
    });
  }

  async crearCorte(companyId: string, cajeroId: string, data: any) {
    const fecha = new Date(data.fecha);
    fecha.setHours(0, 0, 0, 0);

    const efectivoEsperado  = data.totalEfectivo || 0;
    const efectivoContado   = data.efectivoContado || 0;
    const terminalEsperada  = (data.totalTarjeta || 0) + (data.totalTransfer || 0);
    const terminalReportada = data.totalTerminal || 0;

    const diferenciaEfectivo = efectivoContado  - efectivoEsperado;
    const diferenciaTerminal = terminalReportada - terminalEsperada;
    const diferencia         = diferenciaEfectivo + diferenciaTerminal;

    return this.prisma.corteCaja.create({
      data: {
        companyId,
        cajeroId,
        fecha,
        status:                 'PENDIENTE',
        totalVentas:            data.totalVentas     || 0,
        totalEfectivo:          data.totalEfectivo   || 0,
        totalTarjeta:           data.totalTarjeta    || 0,
        totalTransfer:          data.totalTransfer   || 0,
        totalCredito:           data.totalCredito    || 0,
        totalDelivery:          data.totalDelivery   || 0,
        totalTerminal:          terminalReportada,
        efectivoContado,
        diferenciEfectivo:      diferenciaEfectivo,
        diferenciaTerminal,
        diferencia,
        notasCajero:            data.notasCajero     || null,
        detalleVentas:          data.detalleVentas   || null,
        desgloseDenominaciones: data.desgloseDenominaciones || null,
        desgloseTerminales:     data.desgloseTerminales     || null,
        desgloseDelivery:       data.desgloseDelivery       || null,
      },
      include: { cajero: { select: { id: true, name: true } } },
    });
  }

  async validarCorte(corteId: string, validadorId: string, data: any) {
    const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
    if (!corte) throw new Error('Corte no encontrado');

    const efectivoFinal = data.efectivoReal !== undefined
      ? Number(data.efectivoReal)
      : Number(corte.efectivoContado);
    const diferencia = efectivoFinal - Number(corte.totalEfectivo);

    // Agregar mensaje del contador al historial
    const historial = this._parsearHistorial(corte.notasCajero);
    if (data.notasValidador) {
      historial.push({
        tipo:    'contador',
        mensaje: data.notasValidador,
        fecha:   new Date().toISOString(),
      });
    }

    const updatedCorte = await this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        status:         'VALIDADO',
        efectivoReal:   efectivoFinal,
        diferencia,
        notasValidador: data.notasValidador || null,
        notasCajero:    JSON.stringify(historial),
        validadoPor:    validadorId,
        validadoAt:     new Date(),
      },
    });

    // Generar flujo bancario
    const branch = await this.prisma.branch.findFirst({ where: { companyId: corte.companyId } });
    const cajaCuenta = await this.prisma.cashAccount.findFirst({
      where: { companyId: corte.companyId, type: 'EFECTIVO', isActive: true },
    });

    if (cajaCuenta && efectivoFinal > 0 && branch) {
      await this.prisma.flowMovement.create({
        data: {
          companyId:     corte.companyId,
          branchId:      branch.id,
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

    return updatedCorte;
  }

  async rechazarCorte(corteId: string, validadorId: string, notas: string) {
    const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
    if (!corte) throw new Error('Corte no encontrado');

    // Agregar mensaje del contador al historial
    const historial = this._parsearHistorial(corte.notasCajero);
    historial.push({
      tipo:    'contador',
      mensaje: notas,
      fecha:   new Date().toISOString(),
      accion:  'rechazo',
    });

    return this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        status:         'RECHAZADO',
        notasValidador: notas,
        notasCajero:    JSON.stringify(historial),
        validadoPor:    validadorId,
        validadoAt:     new Date(),
      },
    });
  }

  async responderCorte(corteId: string, cajeroId: string, respuesta: string, ticketUrl?: string, ticketNombre?: string) {
    const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
    if (!corte) throw new Error('Corte no encontrado');

    // Construir historial como JSON
    const historial = this._parsearHistorial(corte.notasCajero);
    const entrada: any = {
      tipo:    'cajero',
      mensaje: respuesta,
      fecha:   new Date().toISOString(),
    };
    if (ticketUrl)    entrada.ticketUrl    = ticketUrl;
    if (ticketNombre) entrada.ticketNombre = ticketNombre;
    historial.push(entrada);

    return this.prisma.corteCaja.update({
      where: { id: corteId },
      data: {
        status:      'PENDIENTE',
        notasCajero: JSON.stringify(historial),
      },
    });
  }

  async getVentasDelDia(companyId: string, fecha: string) {
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: { companyId, date: { gte: start, lte: end } },
      include: { lines: { include: { product: { select: { name: true, sku: true } } } } },
    });

    const totalVentas   = sales.reduce((t, s) => t + Number(s.total), 0);
    const totalEfectivo = sales.filter(s => s.paymentMethod === 'EFECTIVO' || s.paymentMethod === 'EFECTIVO_MXN')
                               .reduce((t, s) => t + Number(s.total), 0);
    const totalTarjeta  = sales.filter(s => ['TARJETA_DEBITO','TARJETA_CREDITO'].includes(s.paymentMethod || ''))
                               .reduce((t, s) => t + Number(s.total), 0);
    const totalTransfer = sales.filter(s => s.paymentMethod === 'TRANSFERENCIA')
                               .reduce((t, s) => t + Number(s.total), 0);
    const totalCredito  = sales.filter(s => s.isCredit)
                               .reduce((t, s) => t + Number(s.total), 0);

    return {
      fecha, totalVentas, totalEfectivo, totalTarjeta, totalTransfer, totalCredito,
      numVentas: sales.length,
      ventas: sales,
    };
  }

  // Parsear historial — soporta tanto formato viejo (string) como nuevo (JSON)
  private _parsearHistorial(notasCajero: string | null): any[] {
    if (!notasCajero) return [];
    try {
      const parsed = JSON.parse(notasCajero);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    // Formato viejo: "RESPUESTA: texto | RESPUESTA: texto2"
    const mensajes = notasCajero.split('|').map(s => s.trim()).filter(Boolean);
    return mensajes.map(m => ({
      tipo:    'cajero',
      mensaje: m.replace(/^RESPUESTA:\s*/i, ''),
      fecha:   new Date().toISOString(),
    }));
  }
}
