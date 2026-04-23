// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class DisabilitiesService {
  constructor(private prisma: PrismaService) {}
  getByEmployee(companyId:string, employeeId:string) { return this.prisma.disability.findMany({where:{companyId,employeeId},orderBy:{startDate:'desc'}}); }
  async create(companyId:string, data:any) {
    const d = await this.prisma.disability.create({data:{
      companyId, employeeId:data.employeeId, type:data.type,
      startDate:new Date(data.startDate), endDate:new Date(data.endDate),
      days:data.days, folio:data.folio||null, documentUrl:data.documentUrl||null,
      subsidioIMSS:data.subsidioIMSS||null, pagoPatronal:data.pagoPatronal||null,
      status:'REGISTRADA', notes:data.notes||null,
    }});
    // Auto-create hr_incident
    await this.prisma.hrIncident.create({data:{
      companyId, employeeId:data.employeeId, type:'INCAPACIDAD',
      dateFrom:new Date(data.startDate), dateTo:new Date(data.endDate),
      quantity:data.days, unit:'DIAS', affectsPayroll:true, affectsAttendance:true,
      sourceModule:'disabilities', sourceId:d.id, status:'PENDIENTE',
    }});
    return d;
  }
  update(id:string, data:any) { return this.prisma.disability.update({where:{id},data}); }
  validate(id:string, hrId:string) { return this.prisma.disability.update({where:{id},data:{status:'VALIDADA'}}); }
}
