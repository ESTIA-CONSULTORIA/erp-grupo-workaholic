"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArqueoContadorModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const arqueo_contador_service_1 = require("./arqueo-contador.service");
const arqueo_contador_controller_1 = require("./arqueo-contador.controller");
let ArqueoContadorModule = class ArqueoContadorModule {
};
exports.ArqueoContadorModule = ArqueoContadorModule;
exports.ArqueoContadorModule = ArqueoContadorModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [arqueo_contador_service_1.ArqueoContadorService],
        controllers: [arqueo_contador_controller_1.ArqueoContadorController],
    })
], ArqueoContadorModule);
//# sourceMappingURL=arqueo-contador.module.js.map