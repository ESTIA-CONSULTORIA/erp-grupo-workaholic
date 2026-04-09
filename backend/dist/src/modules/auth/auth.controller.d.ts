import { AuthService } from './auth.service';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
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
    verifyPin(body: {
        companyId: string;
        pin: string;
    }): Promise<{
        authorized: boolean;
        authorizedBy: string;
    }>;
    setPin(body: {
        userId: string;
        pin: string;
    }): Promise<{
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
