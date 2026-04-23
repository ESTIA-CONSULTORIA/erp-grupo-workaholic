// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}
  getByEmployee(companyId: string, employeeId: string) {
    return this.prisma.hrIncident.findMany({ where:{companyId,employeeId}, orderBy:{createdAt:'desc'} });
  }
  getByPeriod(companyId: string, periodId: string) {
    return this.prisma.hrIncident.findMany({ where:{companyId,payrollPeriodId:periodId,affectsPayroll:true}, include:{employee:{select:{firstName:true,lastName:true,employeeNumber:true}}} });
  }
  create(companyId: string, userId: string, data: any) {
    return this.prisma.hrIncident.create({ data:{
      companyId, employeeId:data.employeeId, type:data.type,
      dateFrom:new Date(data.dateFrom), dateTo:new Date(data.dateTo||data.dateFrom),
      date:data.date?new Date(data.date):null, quantity:data.quantity||1,
      unit:data.unit||'DIAS', amount:data.amount||null,
      calculationMode:data.calculationMode||'DAILY',
      conceptCode:data.conceptCode||null,
      affectsPayroll:data.affectsPayroll!==false,
      affectsAttendance:data.affectsAttendance!==false,
      payrollPeriodId:data.payrollPeriodId||null,
      sourceModule:data.sourceModule||'manual',
      sourceId:data.sourceId||null,
      approvalRequestId:data.approvalRequestId||null,
      evidenceUrl:data.evidenceUrl||null,
      status:data.status||'PENDIENTE',
      notes:data.notes||null,
    }});
  }
  update(id: string, data: any) { return this.prisma.hrIncident.update({where:{id},data}); }
  approve(id: string, managerId: string, hrId: string) {
    return this.prisma.hrIncident.update({ where:{id}, data:{status:'APROBADA',approvedByManagerId:managerId,approvedByHrId:hrId} });
  }
  applyToPayroll(id: string, payrollId: string) {
    return this.prisma.hrIncident.update({ where:{id}, data:{status:'APLICADA',appliedInPayrollId:payrollId} });
  }
}
