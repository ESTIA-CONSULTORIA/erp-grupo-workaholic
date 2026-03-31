"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RhModule = void 0;
const common_1 = require("@nestjs/common");
const rh_service_1 = require("./rh.service");
const rh_controller_1 = require("./rh.controller");
const payroll_service_1 = require("./payroll.service");
const payroll_controller_1 = require("./payroll.controller");
let RhModule = class RhModule {
};
exports.RhModule = RhModule;
exports.RhModule = RhModule = __decorate([
    (0, common_1.Module)({
        providers: [rh_service_1.RhService, payroll_service_1.PayrollService],
        controllers: [rh_controller_1.RhController, payroll_controller_1.PayrollController],
        exports: [rh_service_1.RhService, payroll_service_1.PayrollService],
    })
], RhModule);
//# sourceMappingURL=rh.module.js.map