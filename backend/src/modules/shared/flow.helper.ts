// src/modules/shared/flow.helper.ts
// Registrar movimiento en flujo de caja desde cualquier servicio

import { PrismaClient } from '@prisma/client';

type FlowType = 'ENTRADA' | 'SALIDA';

interface FlowOpts {
  type:          FlowType;
  originType:    string;
  originId?:     string;
  amount:        number;
  paymentMethod?: string;
  currency?:     string;
  exchangeRate?:  number;
  date?:         Date;
  notes?:        string;
}

export async function registrarFlujo(
  prisma: any,
  companyId: string,
  opts: FlowOpts
): Promise<any> {
  if (!opts.amount || opts.amount <= 0) return null;

  const branch = await prisma.branch.findFirst({ where: { companyId } });
  if (!branch) return null;

  // Resolver cuenta según método de pago
  const metodo = (opts.paymentMethod || 'EFECTIVO').toUpperCase();
  let accountCode = 'efectivo_mxn';
  if (metodo.includes('TARJETA'))   accountCode = 'terminal_bancaria';
  else if (metodo === 'TRANSFERENCIA' || metodo === 'SPEI') accountCode = 'banregio_mxn';
  else if (metodo === 'PREPAGO')     accountCode = 'efectivo_mxn'; // prepago usa caja
  else if (metodo === 'USD')         accountCode = 'efectivo_usd';
  else if (metodo === 'MERCADO_PAGO') accountCode = 'mercado_pago';

  let cashAccount = await prisma.cashAccount.findFirst({
    where: { companyId, code: accountCode, isActive: true },
  });
  if (!cashAccount) {
    cashAccount = await prisma.cashAccount.findFirst({
      where: { companyId, type: 'EFECTIVO', currency: 'MXN', isActive: true },
    });
  }
  if (!cashAccount) return null;

  const currency     = opts.currency     || 'MXN';
  const exchangeRate = opts.exchangeRate || 1;
  const amountMxn    = opts.amount * exchangeRate;

  return prisma.flowMovement.create({
    data: {
      companyId,
      branchId:      branch.id,
      cashAccountId: cashAccount.id,
      date:          opts.date || new Date(),
      type:          opts.type,
      originType:    opts.originType,
      originId:      opts.originId || null,
      amount:        opts.amount,
      currency,
      exchangeRate,
      amountMxn,
      notes:         opts.notes || null,
    },
  }).catch((e: any) => {
    console.error('[FlujoCaja] Error:', e.message);
    return null;
  });
}
