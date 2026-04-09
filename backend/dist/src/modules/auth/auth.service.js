"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                companyRoles: {
                    include: {
                        company: true,
                        role: true,
                    },
                },
            },
        });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const companies = user.companyRoles.map((cr) => ({
            companyId: cr.company.id,
            companyCode: cr.company.code,
            companyName: cr.company.name,
            color: cr.company.color,
            roleCode: cr.role.code,
            permissions: [],
        }));
        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwt.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                companies,
            },
        };
    }
    async validateUser(userId) {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }
    async verifyPin(companyId, pin) {
        const users = await this.prisma.userCompanyRole.findMany({
            where: {
                companyId,
                role: { code: { in: ['gerente', 'admin', 'administrador'] } },
                user: { pin, isActive: true },
            },
            include: { user: { select: { id: true, name: true } }, role: true },
        });
        if (users.length === 0)
            throw new Error('PIN incorrecto o sin autorización');
        return { authorized: true, authorizedBy: users[0].user.name };
    }
    async setPin(userId, pin) {
        if (pin.length !== 4 || !/^\d{4}$/.test(pin))
            throw new Error('El PIN debe ser de 4 dígitos');
        return this.prisma.user.update({ where: { id: userId }, data: { pin } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map