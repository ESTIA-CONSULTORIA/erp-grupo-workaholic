"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminationsModule = void 0;
const common_1 = require("@nestjs/common");
const terminations_controller_1 = require("./terminations.controller");
const terminations_service_1 = require("./terminations.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
let TerminationsModule = class TerminationsModule {
};
exports.TerminationsModule = TerminationsModule;
exports.TerminationsModule = TerminationsModule = __decorate([
    (0, common_1.Module)({ imports: [prisma_module_1.PrismaModule], controllers: [terminations_controller_1.TerminationsController], providers: [terminations_service_1.TerminationsService], exports: [terminations_service_1.TerminationsService] })
], TerminationsModule);
//# sourceMappingURL=terminations.module.js.map