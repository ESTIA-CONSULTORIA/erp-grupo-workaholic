"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisabilitiesModule = void 0;
const common_1 = require("@nestjs/common");
const disabilities_controller_1 = require("./disabilities.controller");
const disabilities_service_1 = require("./disabilities.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
let DisabilitiesModule = class DisabilitiesModule {
};
exports.DisabilitiesModule = DisabilitiesModule;
exports.DisabilitiesModule = DisabilitiesModule = __decorate([
    (0, common_1.Module)({ imports: [prisma_module_1.PrismaModule], controllers: [disabilities_controller_1.DisabilitiesController], providers: [disabilities_service_1.DisabilitiesService], exports: [disabilities_service_1.DisabilitiesService] })
], DisabilitiesModule);
//# sourceMappingURL=disabilities.module.js.map