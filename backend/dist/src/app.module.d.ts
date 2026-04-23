import { OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PermissionsService } from './modules/permissions/permissions.service';
export declare class AppModule implements OnModuleInit {
    private readonly httpAdapterHost;
    private readonly permissionsService;
    constructor(httpAdapterHost: HttpAdapterHost, permissionsService: PermissionsService);
    onModuleInit(): void;
}
