"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkaholicModule = void 0;
const common_1 = require("@nestjs/common");
const workaholic_controller_1 = require("./workaholic.controller");
const workaholic_service_1 = require("./workaholic.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
let WorkaholicModule = class WorkaholicModule {
};
exports.WorkaholicModule = WorkaholicModule;
exports.WorkaholicModule = WorkaholicModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [workaholic_controller_1.WorkaholicController],
        providers: [workaholic_service_1.WorkaholicService],
        exports: [workaholic_service_1.WorkaholicService],
    })
], WorkaholicModule);
//# sourceMappingURL=workaholic.module.js.map