import { MaintenanceService } from './maintenance.service';
export declare class MaintenanceController {
    private svc;
    constructor(svc: MaintenanceService);
    fixOCSales(cid: string): Promise<{
        total: number;
        created: number;
        errors: string[];
    }>;
    seedUsers(): Promise<{
        results: string[];
    }>;
}
