// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class TerminationsService {
  constructor(private prisma: PrismaService) {}

  getByCompany(companyId:string) {
    return this.prisma.employeeTermination.findMany({
      where:{companyId}, include:{employee:{select:{firstName:true,lastName:true,employeeNumber:true,startDate:true}},legalDocuments:true},
      orderBy:{createdAt:'desc'},
    });
  }

  findOne(id:string) {
    return this.prisma.employeeTermination.findUnique({
      where:{id}, include:{employee:true,legalDocuments:true},
    });
  }

  async create(companyId:string, userId:string, data:any) {
    const emp = await this.prisma.employee.findUnique({where:{id:data.employeeId}});
    if(!emp) throw new Error('Empleado no encontrado');

    const startDate = new Date(emp.startDate);
    const termDate  = new Date(data.terminationDate);
    const diasLaborados = Math.floor((termDate.getTime()-startDate.getTime())/(1000*60*60*24));

    // Cálculo básico LFT
    const dailySalary    = Number(emp.dailySalary||0);
    const years          = Math.floor(diasLaborados/365);
    const vacDays        = this._lftVacDays(years);
    const vacsPendientes = (vacDays/365) * (diasLaborados % 365) / 12;
    const partes         = dailySalary * (diasLaborados % 365) / 365 * 15; // aguinaldo proporcional
    const primaAntig     = data.type === 'RENUNCIA_VOLUNTARIA' && years >= 15 ? dailySalary * 12 * years * 0.12 : 0;
    const indemnizacion  = data.type === 'DESPIDO_INJUSTIFICADO_PRESUNTO' ? dailySalary * 90 + dailySalary * 20 * years : 0;
    const totalFiniquito = (vacsPendientes * dailySalary) + partes + primaAntig + indemnizacion;

    const t = await this.prisma.employeeTermination.create({data:{
      companyId, employeeId:data.employeeId, type:data.type,
      reason:data.reason||null,
      terminationDate:new Date(data.terminationDate),
      lastWorkDay:new Date(data.lastWorkDay||data.terminationDate),
      notificationDate:data.notificationDate?new Date(data.notificationDate):null,
      diasLaborados, vacacionesPendientes:vacsPendientes,
      partesProporcionales:partes, primaAntiguedad:primaAntig,
      indemnizacion, totalFiniquito,
      status:'BORRADOR', notes:data.notes||null,
    }});

    return t;
  }

  update(id:string, data:any) { return this.prisma.employeeTermination.update({where:{id},data}); }

  async submitForApproval(id:string, userId:string, roleCode:string) {
    const t = await this.findOne(id);
    // Create approval request via raw to avoid circular dep
    const req = await this.prisma.approvalRequest.create({data:{
      companyId:t.companyId, type:'BAJA', entityId:id, entityType:'EmployeeTermination',
      requestedById:userId, requestedByRole:roleCode,
      priority:'ALTA', status:'PENDIENTE', currentStep:1,
      metadata:{employeeName:`${t.employee?.firstName} ${t.employee?.lastName}`,type:t.type,totalFiniquito:t.totalFiniquito},
    }});
    // Steps
    await this.prisma.approvalStep.createMany({data:[
      {requestId:req.id,stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'rh',status:'PENDIENTE'},
      {requestId:req.id,stepOrder:2,stepType:'SEQUENTIAL',roleRequired:'administrador',status:'PENDIENTE'},
    ]});
    await this.prisma.employeeTermination.update({where:{id},data:{approvalRequestId:req.id,status:'EN_REVISION_RH'}});
    return req;
  }

  private _lftVacDays(years:number) {
    const t=[12,14,16,18,20];
    if(years<=0)return 12;
    if(years<=5)return t[years-1]||20;
    return 20+Math.floor((years-5)/5)*2;
  }
}
