// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class PayrollReceiptsService {
  constructor(private prisma: PrismaService) {}

  getByEmployee(companyId:string, employeeId:string) {
    return this.prisma.payrollReceipt.findMany({where:{companyId,employeeId},orderBy:{createdAt:'desc'}});
  }

  getByPeriod(companyId:string, periodId:string) {
    return this.prisma.payrollReceipt.findMany({
      where:{companyId,payrollPeriodId:periodId},
      include:{employee:{select:{firstName:true,lastName:true,employeeNumber:true}}},
    });
  }

  async generate(companyId:string, periodId:string, userId:string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where:{id:periodId}, include:{lines:{include:{employee:true}}},
    });
    if(!period) throw new Error('Período no encontrado');

    const receipts = [];
    for(const line of period.lines) {
      const gross      = Number(line.grossSalary||0);
      const deductions = Number(line.imssEmployee||0)+Number(line.isrEmployee||0);
      const net        = gross - deductions;

      const receipt = await this.prisma.payrollReceipt.create({data:{
        companyId, payrollPeriodId:periodId, employeeId:line.employeeId,
        grossAmount:gross, deductions, netAmount:net,
        breakdown:{
          percepciones:[{concept:'Salario',amount:gross}],
          deducciones:[
            {concept:'IMSS Empleado',amount:Number(line.imssEmployee||0)},
            {concept:'ISR',amount:Number(line.isrEmployee||0)},
          ],
        },
        generatedById:userId, status:'BORRADOR',
      }});
      receipts.push(receipt);
    }
    return receipts;
  }

  async publish(periodId:string, userId:string) {
    await this.prisma.payrollReceipt.updateMany({
      where:{payrollPeriodId:periodId,status:'BORRADOR'},
      data:{status:'PUBLICADO',publishedAt:new Date()},
    });
    // Notify employees
    const receipts = await this.prisma.payrollReceipt.findMany({
      where:{payrollPeriodId:periodId},
    });
    for(const r of receipts) {
      const emp = await this.prisma.employee.findUnique({where:{id:r.employeeId}});
      if(emp?.userId) {
        await this.prisma.notification.create({data:{
          companyId:r.companyId, userId:emp.userId,
          type:'NOMINA', title:'Recibo de nómina disponible',
          body:'Tu recibo de nómina ya está disponible.',
          actionUrl:'/mi-perfil',
          sourceModule:'payroll-receipts', sourceId:r.id,
        }}).catch(()=>{});
      }
    }
    return { published: receipts.length };
  }

  async acknowledge(id:string, employeeId:string) {
    return this.prisma.payrollReceipt.update({
      where:{id}, data:{employeeAckAt:new Date()},
    });
  }
}
