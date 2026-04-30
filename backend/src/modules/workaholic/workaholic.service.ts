// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WorkaholicService {
  constructor(private prisma: PrismaService) {}

  // ── ESPACIOS ─────────────────────────────────────────────
  getSpaces(companyId: string) {
    return this.prisma.workaholicSpace.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  createSpace(companyId: string, data: any) {
    return this.prisma.workaholicSpace.create({
      data: {
        companyId, name: data.name, type: data.type,
        capacity: data.capacity || 1, floor: data.floor || null,
        amenities: data.amenities || null,
        pricePerHour:  data.pricePerHour  ? Number(data.pricePerHour)  : null,
        pricePerDay:   data.pricePerDay   ? Number(data.pricePerDay)   : null,
        pricePerMonth: data.pricePerMonth ? Number(data.pricePerMonth) : null,
      },
    });
  }

  updateSpace(id: string, data: any) {
    return this.prisma.workaholicSpace.update({ where: { id }, data });
  }

  // ── TIPOS DE MEMBRESÍA ────────────────────────────────────
  getMembershipTypes(companyId: string) {
    return this.prisma.workaholicMembershipType.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  createMembershipType(companyId: string, data: any) {
    return this.prisma.workaholicMembershipType.create({
      data: {
        companyId, name: data.name, description: data.description || null,
        type: data.type, duration: data.duration,
        price: Number(data.price), hoursIncluded: Number(data.hoursIncluded || 0),
        accessDays: data.accessDays || 'LUNES-VIERNES',
      },
    });
  }

  updateMembershipType(id: string, data: any) {
    return this.prisma.workaholicMembershipType.update({ where: { id }, data });
  }

  // ── MEMBRESÍAS ────────────────────────────────────────────
  async getMemberships(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { holderName:  { contains: filters.search, mode: 'insensitive' } },
        { folio:       { contains: filters.search, mode: 'insensitive' } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.workaholicMembership.findMany({
      where,
      include: { membershipType: true, payments: { orderBy: { paidAt: 'desc' }, take: 3 } },
      orderBy: { folio: 'asc' },
    });
  }

  async createMembership(companyId: string, data: any) {
    const count = await this.prisma.workaholicMembership.count({ where: { companyId } });
    const folio = `WKH-${String(count + 1).padStart(4, '0')}`;

    const type = await this.prisma.workaholicMembershipType.findUnique({
      where: { id: data.membershipTypeId },
    });
    if (!type) throw new Error('Tipo de membresía no encontrado');

    const start = new Date(data.startDate);
    const end   = this._calcEndDate(start, type.duration);

    const m = await this.prisma.workaholicMembership.create({
      data: {
        companyId, folio,
        membershipTypeId: data.membershipTypeId,
        holderName:   data.holderName,
        holderEmail:  data.holderEmail  || null,
        holderPhone:  data.holderPhone  || null,
        holderRfc:    data.holderRfc    || null,
        companyName:  data.companyName  || null,
        startDate:    start,
        endDate:      end,
        status:       'ACTIVA',
        autoRenew:    data.autoRenew    || false,
        paymentMethod:data.paymentMethod|| 'TRANSFERENCIA',
        notes:        data.notes        || null,
      },
    });

    // Registrar pago inicial si aplica
    if (data.registerPayment) {
      await this.prisma.workaholicPayment.create({
        data: {
          companyId, membershipId: m.id,
          concept: `Membresía ${type.name} — ${type.duration}`,
          amount:  type.price,
          paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
          reference: data.reference || null,
          period: this._periodLabel(start),
          status: 'PAGADO',
        },
      });
      // Afecta ER como Sale
      await this.prisma.sale.create({
        data: {
          companyId, date: new Date(),
          channel: 'MOSTRADOR', clientName: data.holderName,
          total: type.price, paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
          isCredit: false,
        },
      });
    }

    return this.prisma.workaholicMembership.findUnique({
      where: { id: m.id },
      include: { membershipType: true, payments: true },
    });
  }

  async registerPayment(membershipId: string, data: any) {
    const m = await this.prisma.workaholicMembership.findUnique({
      where: { id: membershipId }, include: { membershipType: true },
    });
    if (!m) throw new Error('Membresía no encontrada');

    const payment = await this.prisma.workaholicPayment.create({
      data: {
        companyId: m.companyId, membershipId,
        concept: data.concept || `Membresía ${m.membershipType.name}`,
        amount:  Number(data.amount || m.membershipType.price),
        paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
        reference: data.reference || null,
        period: data.period || this._periodLabel(new Date()),
        status: 'PAGADO',
      },
    });

    // Renovar si vencida
    if (m.status === 'VENCIDA' || data.renew) {
      const newEnd = this._calcEndDate(new Date(), m.membershipType.duration);
      await this.prisma.workaholicMembership.update({
        where: { id: membershipId },
        data: { status: 'ACTIVA', endDate: newEnd },
      });
    }

    // Afecta ER
    await this.prisma.sale.create({
      data: {
        companyId: m.companyId, date: new Date(),
        channel: 'MOSTRADOR', clientName: m.holderName,
        total: payment.amount, paymentMethod: payment.paymentMethod,
        isCredit: false,
      },
    });

    return payment;
  }

  async checkExpired(companyId: string) {
    const today = new Date(); today.setHours(0,0,0,0);
    const result = await this.prisma.workaholicMembership.updateMany({
      where: { companyId, status: 'ACTIVA', endDate: { lt: today } },
      data: { status: 'VENCIDA' },
    });
    return { expired: result.count };
  }

  // ── RESERVACIONES ─────────────────────────────────────────
  async getReservations(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.date)    where.date    = new Date(filters.date);
    if (filters.spaceId) where.spaceId = filters.spaceId;
    if (filters.status)  where.status  = filters.status;
    return this.prisma.workaholicReservation.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { space: true, membership: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createReservation(companyId: string, data: any) {
    const space = await this.prisma.workaholicSpace.findUnique({ where: { id: data.spaceId } });
    if (!space) throw new Error('Espacio no encontrado');

    // Verificar disponibilidad
    const conflict = await this.prisma.workaholicReservation.findFirst({
      where: {
        companyId, spaceId: data.spaceId,
        date: new Date(data.date),
        status: { in: ['CONFIRMADA', 'EN_CURSO'] },
        OR: [
          { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } },
        ],
      },
    });
    if (conflict) throw new Error(`Espacio ocupado de ${conflict.startTime} a ${conflict.endTime}`);

    const hours = this._calcHours(data.startTime, data.endTime);
    const unitPrice = Number(space.pricePerHour || 0);
    const total     = hours * unitPrice;

    // Si viene de membresía, descontar horas
    let fromMembership = false;
    if (data.membershipId) {
      const m = await this.prisma.workaholicMembership.findUnique({
        where: { id: data.membershipId }, include: { membershipType: true },
      });
      if (m && m.status === 'ACTIVA') {
        const remaining = Number(m.membershipType.hoursIncluded) - Number(m.hoursUsed);
        if (remaining >= hours) {
          await this.prisma.workaholicMembership.update({
            where: { id: data.membershipId },
            data: { hoursUsed: { increment: hours } },
          });
          fromMembership = true;
        }
      }
    }

    const reservation = await this.prisma.workaholicReservation.create({
      data: {
        companyId, spaceId: data.spaceId,
        membershipId: data.membershipId || null,
        clientName:    data.clientName,
        clientEmail:   data.clientEmail   || null,
        clientPhone:   data.clientPhone   || null,
        clientCompany: data.clientCompany || null,
        date:          new Date(data.date),
        startTime:     data.startTime,
        endTime:       data.endTime,
        hours, unitPrice, total: fromMembership ? 0 : total,
        paymentMethod: data.paymentMethod || 'EFECTIVO',
        fromMembership,
        status: 'CONFIRMADA',
        notes: data.notes || null,
      },
      orderBy: { date: 'asc' },
      include: { space: true, membership: { select: { id:true, clientName:true, remainingHours:true } } },
    });

    // Registrar en ventas si no es de membresía
    if (!fromMembership && total > 0) {
      await this.prisma.sale.create({
        data: {
          companyId, date: new Date(), channel: 'MOSTRADOR',
          clientName: data.clientName,
          total: total, paymentMethod: data.paymentMethod || 'EFECTIVO',
          isCredit: false,
        },
      });
    }

    return reservation;
  }

  updateReservation(id: string, data: any) {
    return this.prisma.workaholicReservation.update({ where: { id }, data });
  }

  // ── DASHBOARD ─────────────────────────────────────────────
  async getDashboard(companyId: string) {
    const today = new Date(); today.setHours(0,0,0,0);
    const [totalMem, activeMem, vencidas, todayRes, spaces] = await Promise.all([
      this.prisma.workaholicMembership.count({ where: { companyId } }),
      this.prisma.workaholicMembership.count({ where: { companyId, status: 'ACTIVA' } }),
      this.prisma.workaholicMembership.count({ where: { companyId, status: 'VENCIDA' } }),
      this.prisma.workaholicReservation.count({ where: { companyId, date: today, status: { in: ['CONFIRMADA','EN_CURSO'] } } }),
      this.prisma.workaholicSpace.count({ where: { companyId, isActive: true } }),
    ]);
    return { totalMem, activeMem, vencidas, todayRes, spaces };
  }

  // ── POS WORKAHOLIC ────────────────────────────────────────
  async registerSale(companyId: string, data: any) {
    const total = (data.lines || []).reduce((t: number, l: any) => t + Number(l.price) * Number(l.qty), 0);
    return this.prisma.sale.create({
      data: {
        companyId, date: new Date(), channel: 'MOSTRADOR',
        clientName: data.clientName || null,
        total, paymentMethod: data.paymentMethod || 'EFECTIVO',
        isCredit: false,
      },
    });
  }

  // ── SOFT RESTAURANT (mismo modelo que Palestra) ───────────
  importSoftRestaurant(companyId: string, data: any, userId?: string) {
    return this.prisma.softRestaurantImport.create({
      data: {
        companyId, fecha: new Date(data.fecha),
        totalVentas: data.totalVentas, totalEfectivo: data.totalEfectivo || 0,
        totalTarjeta: data.totalTarjeta || 0, totalOtros: data.totalOtros || 0,
        numTransacciones: data.numTransacciones || 0,
        rawData: data.rawData || null, importedById: userId || null,
      },
    });
  }

  getSoftImports(companyId: string) {
    return this.prisma.softRestaurantImport.findMany({
      where: { companyId }, orderBy: { fecha: 'desc' }, take: 90,
    });
  }

  // ── HELPERS ───────────────────────────────────────────────
  private _calcEndDate(start: Date, duration: string): Date {
    const d = new Date(start);
    switch(duration) {
      case 'MENSUAL':     d.setMonth(d.getMonth() + 1);   break;
      case 'TRIMESTRAL':  d.setMonth(d.getMonth() + 3);   break;
      case 'SEMESTRAL':   d.setMonth(d.getMonth() + 6);   break;
      case 'ANUAL':       d.setFullYear(d.getFullYear()+1); break;
      default:            d.setMonth(d.getMonth() + 1);
    }
    d.setDate(d.getDate() - 1);
    return d;
  }

  private _calcHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 100) / 100;
  }

  private _periodLabel(date: Date): string {
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }
  async getServices(companyId: string) {
    return (this.prisma as any).workaholicService.findMany({
      where: { companyId, isActive: true },
      orderBy: { category: 'asc' },
    }).catch(() => []);
  }

}