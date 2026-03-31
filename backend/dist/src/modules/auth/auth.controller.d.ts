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
}
