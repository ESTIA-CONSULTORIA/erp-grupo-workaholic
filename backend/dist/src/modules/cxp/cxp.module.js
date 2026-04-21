"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxpModule = void 0;
const common_1 = require("@nestjs/common");
const cxp_service_1 = require("./cxp.service");
const cxp_controller_1 = require("./cxp.controller");
let CxpModule = class CxpModule {
};
exports.CxpModule = CxpModule;
exports.CxpModule = CxpModule = __decorate([
    (0, common_1.Module)({
        providers: [cxp_service_1.CxpService],
        controllers: [cxp_controller_1.CxpController],
    })
], CxpModule);
//# sourceMappingURL=cxp.module.js.map