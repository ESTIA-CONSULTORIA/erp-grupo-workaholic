import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            companies: {
                companyId: string;
                companyCode: string;
                companyName: string;
                color: string;
                roleCode: string;
                permissions: any[];
            }[];
        };
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        phone: string | null;
        pin: string | null;
    }>;
    verifyPin(companyId: string, pin: string): Promise<{
        authorized: boolean;
        authorizedBy: string;
    }>;
    setPin(userId: string, pin: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        phone: string | null;
        pin: string | null;
    }>;
}
