"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const server_1 = require("next/server");
const prisma_1 = require("@/lib/prisma");
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const permissions = await prisma_1.prisma.roleModulePermission.findMany({
        where: companyId ? { companyId } : { companyId: null },
    });
    return server_1.NextResponse.json(permissions);
}
async function PUT(req) {
    const body = await req.json();
    const { roleCode, module, action, allowed, companyId } = body;
    const permission = await prisma_1.prisma.roleModulePermission.upsert({
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
    return server_1.NextResponse.json(permission);
}
//# sourceMappingURL=route.js.map