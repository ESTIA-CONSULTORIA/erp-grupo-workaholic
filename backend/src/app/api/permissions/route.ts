import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const permissions = await prisma.roleModulePermission.findMany({
    where: companyId ? { companyId } : { companyId: null },
  });
  return NextResponse.json(permissions);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { roleCode, module, action, allowed, companyId } = body;
  const permission = await prisma.roleModulePermission.upsert({
    where: {
      roleCode_module_action_companyId: {
        roleCode,
        module,
        action,
        companyId: companyId || null,
      },
    },
    update: { allowed },
    create: { roleCode, module, action, allowed, companyId },
  });
  return NextResponse.json(permission);
}
