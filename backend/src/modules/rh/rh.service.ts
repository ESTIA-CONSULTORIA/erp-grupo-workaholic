// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// Días de vacaciones según LFT (años trabajados → días hábiles)
const LFT_VACATION_DAYS = [0, 12, 14, 16, 18, 20, 22, 22, 22, 22, 22,
  24, 24, 24, 24, 24, 26, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 32];

const DIAS_FESTIVOS_MX = [
  '01-01','02-05','03-21','05-01','09-16','11-02','11-20','12-25',
];

// workDays: 5 = L-V (administración), 6 = L-S (operación/producción)
function calcBusinessDays(start: Date, end: Date, workDays: 5|6 = 6): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    const mmdd = `${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
    const esFestivo = DIAS_FESTIVOS_MX.includes(mmdd);
    const esDomingo  = dow === 0;
    const esSabado   = dow === 6;
    // 6 días: solo excluye domingo y festivos
    // 5 días: excluye sábado, domingo y festivos
    if (!esDomingo && !esFestivo && !(workDays === 5 && esSabado)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function lftVacationDays(yearsWorked: number): number {
  const idx = Math.min(yearsWorked, LFT_VACATION_DAYS.length - 1);
  return LFT_VACATION_DAYS[Math.max(0, idx)];
}

@Injectable()
export class RhService {
  constructor(private prisma: PrismaService) {}

  // Portal empleado: obtener mi perfil por userId (raw SQL para evitar cliente cacheado)
  async getMyProfile(companyId: string, userId: string) {
    // Buscar empleado por userId usando raw SQL
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM employees 
      WHERE "companyId" = ${companyId} AND "userId" = ${userId}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    
    const empId = rows[0].id;
    const emp = await this.prisma.employee.findUnique({
      where: { id: empId },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        vacations: { orderBy: { startDate: 'desc' } },
        hrEvents:  { orderBy: { date: 'desc' } },
      },
    });
    if (!emp) return null;
    const balance = await this.getVacationBalance(emp.id);
    return { ...emp, vacationBalance: balance };
  }

  // Vincular usuario a empleado
  async linkUserToEmployee(employeeId: string, userId: string | null) {
    // Usar raw SQL para evitar problemas con Prisma client cacheado
    if (userId) {
      // Desvincular si ya está en otro empleado
      await this.prisma.$executeRaw`
        UPDATE employees SET "userId" = NULL 
        WHERE "userId" = ${userId} AND id != ${employeeId}
      `;
    }
    // Vincular (o desvincular si userId es null)
    await this.prisma.$executeRaw`
      UPDATE employees SET "userId" = ${userId} WHERE id = ${employeeId}
    `;
    return this.prisma.employee.findUnique({ where: { id: employeeId } });
  }

  getDashboard(companyId: string) {
    return Promise.all([
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVO' } }),
      this.prisma.vacationRequest.count({ where: { companyId, status: { in: ['PENDIENTE','APROBADO_JEFE'] } } }),
    ]).then(([total, active, pendingVacations]) => ({
      totalEmployees: total, activeEmployees: active, onLeave: 0,
      pendingVacations, expiringContracts: [],
    }));
  }

  findAllEmployees(companyId: string, filters: any) {
    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName:  { contains: filters.search, mode: 'insensitive' } },
        { position:  { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.employee.findMany({
      where,
      include: { branch: { select: { id: true, name: true } } },
      orderBy: [{ status: 'asc' }, { lastName: 'asc' }],
    });
  }

  findOneEmployee(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true,
        documents: { orderBy: { createdAt: 'desc' } },
        vacations: { orderBy: { startDate: 'desc' } },
        hrEvents:  { orderBy: { date: 'desc' } },
      },
    });
  }

  // Obtener solicitudes por rol del usuario
  async getRequests(companyId: string, userId: string, role: string) {
    const where: any = { companyId };
    if (role === 'empleado') {
      // Solo ve sus propias solicitudes
      const emp = await this.prisma.employee.findFirst({ where: { companyId } });
      where.employeeId = emp?.id;
    } else if (role === 'jefe') {
      // Ve las de su equipo + las propias (pendientes de su aprobación)
      where.status = { in: ['PENDIENTE', 'APROBADO_JEFE', 'APROBADO', 'RECHAZADO'] };
    }
    // admin/rh ven todo
    return this.prisma.vacationRequest.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, position: true, department: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEmployee(companyId: string, data: any) {
    const count = await this.prisma.employee.count({ where: { companyId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const prefix = company?.code.toUpperCase().slice(0, 3) || 'EMP';
    const employeeNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.employee.create({
      data: {
        companyId, employeeNumber,
        firstName: data.firstName, lastName: data.lastName,
        secondLastName: data.secondLastName || null,
        rfc: data.rfc || null, curp: data.curp || null, nss: data.nss || null,
        phone: data.phone || null, email: data.email || null,
        position: data.position, department: data.department || null,
        startDate: new Date(data.startDate),
        contractType: data.contractType || 'INDEFINIDO',
        salaryType: data.salaryType || 'MENSUAL',
        grossSalary: data.grossSalary || 0,
        dailySalary: data.dailySalary || data.grossSalary / 30,
        bankAccount: data.bankAccount || null, bankName: data.bankName || null,
        status: 'ACTIVO',
      },
    });
  }

  getDocuments(employeeId: string) {
    return this.prisma.employeeDocument.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  addDocument(companyId: string, employeeId: string, userId: string, data: any) {
    return this.prisma.employeeDocument.create({
      data: {
        companyId, employeeId, uploadedById: userId,
        type: data.type, title: data.title, fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        signedAt: data.signedAt ? new Date(data.signedAt) : null,
        notes: data.notes || null, status: 'VIGENTE',
      },
    });
  }

  getMissingDocuments(employeeId: string) {
    const required = ['INE', 'CURP', 'NSS', 'RFC', 'CONTRATO', 'ALTA_IMSS'];
    return this.prisma.employeeDocument.findMany({
      where: { employeeId, status: 'VIGENTE' }, select: { type: true },
    }).then(existing => {
      const types = existing.map(d => d.type);
      return required.filter(t => !types.includes(t));
    });
  }

  // Saldo de vacaciones con cálculo LFT
  async getVacationBalance(employeeId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) return { years: 0, entitled: 0, businessDays: 0, used: 0, balance: 0, primaVacacional: 0, workDays: 6 };
    const years = Math.floor((Date.now() - new Date(emp.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const entitled = lftVacationDays(years);
    const deptAdmin = ['administracion','administración','admin','finanzas','rh','recursos humanos','contabilidad'];
    const dept = (emp.department || '').toLowerCase();
    const workDays: 5|6 = deptAdmin.some(d => dept.includes(d)) ? 5 : 6;
    const used = await this.prisma.vacationRequest.aggregate({
      where: { employeeId, status: 'APROBADO', type: 'VACACIONES' },
      _sum: { days: true },
    });
    const usedDays = used._sum.days || 0;
    const dailySalary = Number(emp.dailySalary || 0);
    const primaVacacional = dailySalary * entitled * 0.25;
    return { years, entitled, businessDays: entitled, used: usedDays, balance: entitled - usedDays, primaVacacional, workDays, department: emp.department };
  }

  // Solicitar permiso/vacaciones con cálculo LFT
  async requestVacation(companyId: string, employeeId: string, userId: string, data: any) {
    const start = new Date(data.startDate);
    const end   = new Date(data.endDate);
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    // Administración trabaja 5 días, operación/producción trabaja 6 días
    const deptAdmin = ['administracion','administración','admin','finanzas','rh','recursos humanos','contabilidad'];
    const dept = (emp?.department || '').toLowerCase();
    const workDays: 5|6 = deptAdmin.some(d => dept.includes(d)) ? 5 : 6;
    const businessDays = calcBusinessDays(start, end, workDays);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24*60*60*1000)) + 1;
    const dailySalary = Number(emp?.dailySalary || 0);
    const type = data.type || 'VACACIONES';
    const conGoce = data.conGoce !== undefined ? data.conGoce : true;
    const primaVacacional = type === 'VACACIONES' ? dailySalary * businessDays * 0.25 : null;

    // Raw SQL para evitar cliente Prisma cacheado
    const id = `vac_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    await this.prisma.$executeRaw`
      INSERT INTO vacation_requests 
        (id, "companyId", "employeeId", type, "startDate", "endDate", days, 
         "businessDays", "primaVacacional", "conGoce", status, "requestedById", notes, "createdAt")
      VALUES 
        (${id}, ${companyId}, ${employeeId}, ${type}, ${start}, ${end}, ${totalDays},
         ${businessDays}, ${primaVacacional || null}, ${conGoce}, 'PENDIENTE', ${userId}, ${data.notes || null}, NOW())
    `;
    return this.prisma.vacationRequest.findUnique({ where: { id } });
  }

  // Aprobación doble: jefe primero, luego RH
  async approveVacation(id: string, userId: string, role: string, approved: boolean, reason?: string) {
    const req = await this.prisma.vacationRequest.findUnique({ where: { id } });
    if (!req) throw new Error('Solicitud no encontrada');

    // Jefe aprueba → pasa a APROBADO_JEFE (raw SQL)
    if (role === 'jefe' || role === 'gerente') {
      if (!approved) {
        await this.prisma.$executeRaw`UPDATE vacation_requests SET status='RECHAZADO', "approvedByJefe"=${userId}, "rejectedReason"=${reason||null} WHERE id=${id}`;
      } else {
        await this.prisma.$executeRaw`UPDATE vacation_requests SET status='APROBADO_JEFE', "approvedByJefe"=${userId} WHERE id=${id}`;
      }
      return this.prisma.vacationRequest.findUnique({ where: { id } });
    }

    // RH/Admin aprueba → APROBADO final (raw SQL)
    if (!approved) {
      await this.prisma.$executeRaw`UPDATE vacation_requests SET status='RECHAZADO', "approvedByRH"=${userId}, "rejectedReason"=${reason||null} WHERE id=${id}`;
    } else {
      await this.prisma.$executeRaw`UPDATE vacation_requests SET status='APROBADO', "approvedByRH"=${userId}, "approvedAt"=NOW() WHERE id=${id}`;
    }
    return this.prisma.vacationRequest.findUnique({ where: { id } });
  }

  updateEmployee(id: string, data: any) {
    const { id: _id, companyId: _c, createdAt: _ca, updatedAt: _ua,
            documents: _d, vacations: _v, hrEvents: _e, payrollLines: _p, ...updateData } = data;
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        grossSalary: updateData.grossSalary ? Number(updateData.grossSalary) : undefined,
        dailySalary: updateData.dailySalary ? Number(updateData.dailySalary) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      },
    });
  }

  updateVacation(id: string, data: any) {
    return this.prisma.vacationRequest.update({ where: { id }, data });
  }

  getEvents(employeeId: string) {
    return this.prisma.hREvent.findMany({ where: { employeeId }, orderBy: { date: 'desc' } });
  }

  createEvent(companyId: string, employeeId: string, userId: string, data: any) {
    return this.prisma.hREvent.create({
      data: { companyId, employeeId, createdById: userId, type: data.type,
        date: new Date(data.date), description: data.description, resolution: data.resolution || null },
    });
  }

  getHRConfig(companyId: string) {
    return this.prisma.companyHRConfig.findUnique({ where: { companyId } });
  }

  upsertHRConfig(companyId: string, data: any) {
    return this.prisma.companyHRConfig.upsert({
      where: { companyId }, update: data, create: { companyId, ...data },
    });
  }
  async cancelVacation(employeeId: string, vacationId: string) {
    const vac = await this.prisma.vacationRequest.findUnique({ where: { id: vacationId } });
    if (!vac) throw new Error('Solicitud no encontrada');
    if (vac.status !== 'PENDIENTE') throw new Error('Solo se pueden cancelar solicitudes pendientes');
    return this.prisma.vacationRequest.update({
      where: { id: vacationId },
      data: { status: 'CANCELADA' },
    });
  }

}