import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string, isExternal?: string) {
    const where: any = { companyId };
    if (isExternal !== undefined) where.isExternal = isExternal === 'true';
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.expense.findMany({
      where,
      include: {
        supplier: true,
        rubric: {
          include: {
            group: {
              include: {
                section: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' },
    });
  }

  // Check if a period is closed (blocks retroactive edits)
  private async isPeriodLocked(companyId: string, date: string): Promise<boolean> {
    try {
      const period = date.slice(0, 7); // YYYY-MM
      const closure = await this.prisma.periodClosure.findFirst({
        where: { companyId, period, status: 'CERRADO' },
      });
      return !!closure;
    } catch { return false; } // If table doesn't exist, allow
  }

  async create(companyId: string, userId: string, data: any) {
    const locked = await this.isPeriodLocked(companyId, data.date);
    if (locked) throw new Error(`El período ${data.date?.slice(0,7)} está cerrado. No se pueden registrar gastos en períodos cerrados.`);
    const subtotal = Number(data.subtotal || 0);
    const tax = Number(data.tax || 0);
    const total = subtotal + tax;
    const currency = data.currency || 'MXN';
    const exchangeRate = Number(data.exchangeRate || 1);
    const totalMxn = currency === 'MXN' ? total : total * exchangeRate;
    const paymentStatus = data.paymentStatus || 'PAGADO';
    const paymentMethod = data.paymentMethod || (paymentStatus === 'PENDIENTE' ? 'CREDITO' : 'EFECTIVO');

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          companyId,
          rubricId: data.rubricId || null,
          supplierId: data.supplierId || null,
          cashAccountId: data.cashAccountId || null,
          userId,
          date: new Date(data.date),
          concept: data.concept,
          description: data.description || null,
          subtotal,
          tax,
          total,
          currency,
          exchangeRate,
          totalMxn,
          paymentMethod,
          paymentStatus,
          invoiceRef: data.invoiceRef || null,
          isExternal: data.isExternal || false,
          externalNotes: data.externalNotes || null,
        },
        include: {
          supplier: true,
          rubric: {
            include: {
              group: {
                include: {
                  section: { select: { name: true } }
                }
              }
            }
          }
        },
      });

      // PENDIENTE o crédito: genera CxP correctamente.
      // Antes intentaba crear pendingAmount, campo que no existe en Prisma, y el catch ocultaba el error.
      if (paymentStatus === 'PENDIENTE' || paymentMethod === 'CREDITO') {
        const dueDate = data.dueDate
          ? new Date(data.dueDate)
          : new Date(new Date(data.date || new Date()).setDate(new Date(data.date || new Date()).getDate() + 30));

        await tx.payable.create({
          data: {
            companyId,
            supplierId: data.supplierId || null,
            rubricId: data.rubricId || null,
            concept: `Gasto: ${data.concept}`,
            date: new Date(data.date),
            dueDate,
            currency,
            originalAmount: total,
            paidAmount: 0,
            balance: total,
            status: 'PENDIENTE',
            notes: `Generado automáticamente del gasto ${expense.id}${data.invoiceRef ? ` · Factura ${data.invoiceRef}` : ''}`,
          },
        });
      }

      // PAGADO: registra salida en flujo de efectivo.
      if (paymentStatus === 'PAGADO' && paymentMethod !== 'CREDITO' && paymentMethod !== 'CREDITO_CLIENTE') {
        const branch = await tx.branch.findFirst({ where: { companyId } });

        let cashAccountId = data.cashAccountId;
        if (!cashAccountId) {
          const metodo = String(paymentMethod || '').toUpperCase();
          const esEfectivo = metodo.includes('EFECTIVO');
          const cuenta = await tx.cashAccount.findFirst({
            where: {
              companyId,
              isActive: true,
              type: esEfectivo ? 'EFECTIVO' : { in: ['BANCO', 'PLATAFORMA'] },
              currency,
            },
          });
          cashAccountId = cuenta?.id;
        }

        if (branch && cashAccountId) {
          await tx.flowMovement.create({
            data: {
              companyId,
              branchId: branch.id,
              cashAccountId,
              date: new Date(data.date),
              type: 'SALIDA',
              originType: 'GASTO',
              originId: expense.id,
              rubricId: data.rubricId || null,
              amount: total,
              currency,
              exchangeRate,
              amountMxn: totalMxn,
              reference: data.invoiceRef || null,
              notes: data.concept,
            },
          });
        }
      }

      return expense;
    });
  }

  update(id: string, data: any) {
    return this.prisma.expense.update({
      where: { id },
      data: {
        concept:       data.concept,
        subtotal:      data.subtotal      ? Number(data.subtotal)      : undefined,
        tax:           data.tax           !== undefined ? Number(data.tax) : undefined,
        total:         data.subtotal && data.tax ? Number(data.subtotal) + Number(data.tax) : undefined,
        date:          data.date          ? new Date(data.date)         : undefined,
        paymentMethod: data.paymentMethod || undefined,
        rubricId:      data.rubricId      || undefined,
        supplierId:    data.supplierId    || undefined,

      },
    });
  }

  delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
