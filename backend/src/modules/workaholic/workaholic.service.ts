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
        pricePerHour: data.pricePerHour || null,
        pricePerDay: data.pricePerDay || null,
        pricePerMonth: data.pricePerMonth || null,
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
      orderBy: { price: 'asc' },
    });
  }

  createMembershipType(companyId: string, data: any) {
    return this.prisma.workaholicMembershipType.create({
      data: {
        companyId, name: data.name, description: data.description || null,
        type: data.type, duration: data.duration,
        price: data.price, hoursIncluded: data.hoursIncluded || 0,
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
        { holderName:   { contains: filters.search, mode: 'insensitive' } },
        { companyName:  { contains: filters.search, mode: 'insensitive' } },
        { folio:        { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.workaholicMembership.findMany({
      where,
      include: {
        membershipType: true,
        payments:  { orderBy: { paidAt: 'desc' }, take: 3 },
        reservations: { orderBy: { date: 'desc' }, take: 5 },
      },
      orderBy: { folio: 'asc' },
    });
  }

  async createMembership(companyId: string, data: any) {
    const count = await this.prisma.workaholicMembership.count({ where: { companyId } });
    const folio = `WKH-${String(count + 1).padStart(4, '0')}`;

    const type = await this.prisma.workaholicMembershipType.findUnique({
      where: { id: data.membershipTypeId },
    });

    const startDate = new Date(data.startDate || new Date());
    startDate.setHours(0, 0, 0, 0);
    const endDate = this._calcEndDate(startDate, type?.duration || 'MENSUAL');

    const m = await this.prisma.workaholicMembership.create({
      data: {
        companyId, folio,
        membershipTypeId: data.membershipTypeId,
        holderName:   data.holderName,
        holderEmail:  data.holderEmail  || null,
        holderPhone:  data.holderPhone  || null,
        holderRfc:    data.holderRfc    || null,
        companyName:  data.companyName  || null,
        startDate, endDate,
        autoRenew:    data.autoRenew    || false,
        paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
        notes:        data.notes        || null,
        status: 'ACTIVA',
      },
    });

    // Auto-register payment if paid upfront
    if (data.paidNow) {
      await this.prisma.workaholicPayment.create({
        data: {
          companyId, membershipId: m.id,
          concept: `Alta membresía ${type?.name} — ${folio}`,
          amount: type?.price || data.amount || 0,
          paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
          reference: data.reference || null,
          period: this._getPeriodLabel(startDate),
          status: 'PAGADO',
        },
      });
      // Register as Sale for ER
      await this.prisma.sale.create({
        data: {
          companyId, date: new Date(), channel: 'MOSTRADOR',
          clientName: data.holderName,
          total: type?.price || data.amount || 0,
          paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
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
      where: { id: membershipId },
      include: { membershipType: true },
    });
    if (!m) throw new Error('Membresía no encontrada');

    const payment = await this.prisma.workaholicPayment.create({
      data: {
        companyId: m.companyId, membershipId,
        concept: data.concept || `Renovación ${m.membershipType?.name}`,
        amount: data.amount || m.membershipType?.price || 0,
        paymentMethod: data.paymentMethod || 'TRANSFERENCIA',
        reference: data.reference || null,
        period: data.period || this._getPeriodLabel(new Date()),
        status: 'PAGADO',
      },
    });

    // Extend end date if renewal
    if (data.isRenewal) {
      const newEnd = this._calcEndDate(new Date(m.endDate), m.membershipType?.duration || 'MENSUAL');
      await this.prisma.workaholicMembership.update({
        where: { id: membershipId },
        data: { endDate: newEnd, status: 'ACTIVA' },
      });
    }

    // Register as Sale
    await this.prisma.sale.create({
      data: {
        companyId: m.companyId, date: new Date(), channel: 'MOSTRADOR',
        clientName: m.holderName, total: payment.amount,
        paymentMethod: payment.paymentMethod, isCredit: false,
      },
    });

    return payment;
  }

  // ── RESERVACIONES ─────────────────────────────────────────
  async getReservations(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.date)    where.date    = new Date(filters.date);
    if (filters.spaceId) where.spaceId = filters.spaceId;
    if (filters.status)  where.status  = filters.status;
    return this.prisma.workaholicReservation.findMany({
      where,
      include: {
        space: { select: { name: true, type: true } },
        membership: { select: { folio: true, holderName: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createReservation(companyId: string, data: any) {
    const space = await this.prisma.workaholicSpace.findUnique({ where: { id: data.spaceId } });
    if (!space) throw new Error('Espacio no encontrado');

    // Check availability
    const conflict = await this.prisma.workaholicReservation.findFirst({
      where: {
        companyId, spaceId: data.spaceId,
        date: new Date(data.date),
        status: { in: ['CONFIRMADA', 'EN_CURSO'] },
        OR: [
          { startTime: { lte: data.startTime }, endTime: { gt: data.startTime } },
          { startTime: { lt: data.endTime },    endTime: { gte: data.endTime } },
          { startTime: { gte: data.startTime }, endTime: { lte: data.endTime } },
        ],
      },
    });
    if (conflict) throw new Error(`Conflicto de horario: espacio ocupado de ${conflict.startTime} a ${conflict.endTime}`);

    const hours = this._calcHours(data.startTime, data.endTime);
    const unitPrice = Number(space.pricePerHour || 0);
    const total = unitPrice * hours;

    // Check if membership has hours
    let fromMembership = false;
    if (data.membershipId) {
      const mem = await this.prisma.workaholicMembership.findUnique({
        where: { id: data.membershipId }, include: { membershipType: true },
      });
      if (mem && mem.membershipType) {
        const hoursLeft = Number(mem.membershipType.hoursIncluded) - Number(mem.hoursUsed);
        if (hoursLeft >= hours) {
          fromMembership = true;
          await this.prisma.workaholicMembership.update({
            where: { id: data.membershipId },
            data: { hoursUsed: { increment: hours } },
          });
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
        date: new Date(data.date),
        startTime: data.startTime, endTime: data.endTime,
        hours, unitPrice, total: fromMembership ? 0 : total,
        paymentMethod: data.paymentMethod || 'EFECTIVO',
        fromMembership, status: 'CONFIRMADA',
        notes: data.notes || null,
      },
      include: { space: true },
    });

    // Register sale if paid
    if (!fromMembership && total > 0) {
      await this.prisma.sale.create({
        data: {
          companyId, date: new Date(), channel: 'MOSTRADOR',
          clientName: data.clientName, total,
          paymentMethod: data.paymentMethod || 'EFECTIVO', isCredit: false,
        },
      });
    }

    return reservation;
  }

  updateReservation(id: string, data: any) {
    return this.prisma.workaholicReservation.update({ where: { id }, data });
  }

  // ── POS WORKAHOLIC ────────────────────────────────────────
  async registerSale(companyId: string, data: any) {
    const total = data.lines.reduce((t: number, l: any) => t + Number(l.price) * Number(l.qty), 0);
    return this.prisma.sale.create({
      data: {
        companyId, date: new Date(data.date || new Date()),
        channel: 'MOSTRADOR', clientName: data.clientName || null,
        total, paymentMethod: data.paymentMethod || 'EFECTIVO', isCredit: false,
      },
    });
  }

  // ── DASHBOARD ─────────────────────────────────────────────
  async getDashboard(companyId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [totalMem, activeMem, vencidasMem, todayRes, spaces] = await Promise.all([
      this.prisma.workaholicMembership.count({ where: { companyId } }),
      this.prisma.workaholicMembership.count({ where: { companyId, status: 'ACTIVA' } }),
      this.prisma.workaholicMembership.count({ where: { companyId, status: 'VENCIDA' } }),
      this.prisma.workaholicReservation.findMany({
        where: { companyId, date: today, status: { in: ['CONFIRMADA','EN_CURSO'] } },
        include: { space: { select: { name: true, type: true } } },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.workaholicSpace.count({ where: { companyId, isActive: true } }),
    ]);
    return { totalMem, activeMem, vencidasMem, todayRes, spaces };
  }

  // ── CHECK VENCIDAS ────────────────────────────────────────
  async checkExpired(companyId: string) {
    const today = new Date(); today.setHours(0,0,0,0);
    const result = await this.prisma.workaholicMembership.updateMany({
      where: { companyId, status: 'ACTIVA', endDate: { lt: today } },
      data: { status: 'VENCIDA' },
    });
    return { expired: result.count };
  }

  // ── SOFT RESTAURANT IMPORT ────────────────────────────────
  async importSoftRestaurant(companyId: string, data: any, userId?: string) {
    const fecha = new Date(data.fecha); fecha.setHours(0,0,0,0);
    const existing = await this.prisma.softRestaurantImport.findFirst({ where: { companyId, fecha } });

    const imp = existing
      ? await this.prisma.softRestaurantImport.update({
          where: { id: existing.id },
          data: { totalVentas: data.totalVentas, totalEfectivo: data.totalEfectivo || 0,
                  totalTarjeta: data.totalTarjeta || 0, totalOtros: data.totalOtros || 0,
                  numTransacciones: data.numTransacciones || 0, rawData: data.rawData || null },
        })
      : await this.prisma.softRestaurantImport.create({
          data: {
            companyId, fecha, totalVentas: data.totalVentas,
            totalEfectivo: data.totalEfectivo || 0, totalTarjeta: data.totalTarjeta || 0,
            totalOtros: data.totalOtros || 0, numTransacciones: data.numTransacciones || 0,
            rawData: data.rawData || null, importedById: userId || null,
          },
        });

    // Register as Sale for ER
    if (!existing) {
      await this.prisma.sale.create({
        data: {
          companyId, date: fecha, channel: 'RESTAURANTE',
          clientName: 'A&B Workaholic', total: data.totalVentas,
          paymentMethod: 'MIXTO', isCredit: false,
        },
      });
    }
    return imp;
  }

  getSoftImports(companyId: string) {
    return this.prisma.softRestaurantImport.findMany({
      where: { companyId }, orderBy: { fecha: 'desc' }, take: 90,
    });
  }

  // ── HELPERS ───────────────────────────────────────────────
  private _calcEndDate(start: Date, duration: string): Date {
    const d = new Date(start);
    switch (duration) {
      case 'MENSUAL':     d.setMonth(d.getMonth() + 1);      break;
      case 'TRIMESTRAL':  d.setMonth(d.getMonth() + 3);      break;
      case 'SEMESTRAL':   d.setMonth(d.getMonth() + 6);      break;
      case 'ANUAL':       d.setFullYear(d.getFullYear() + 1); break;
      default:            d.setMonth(d.getMonth() + 1);
    }
    d.setDate(d.getDate() - 1);
    return d;
  }

  private _calcHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  private _getPeriodLabel(date: Date): string {
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }
}
