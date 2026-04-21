"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guards_1 = require("../auth/auth.guards");
const reports_service_1 = require("./reports.service");
const currentPeriod = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
let ReportsController = class ReportsController {
    constructor(svc) {
        this.svc = svc;
    }
    incomeStatement(cid, period) { return this.svc.getIncomeStatement(cid, period || currentPeriod()); }
    cashFlow(cid, period) { return this.svc.getCashFlowStatement(cid, period || currentPeriod()); }
    balanceSheet(cid, period) { return this.svc.getBalanceSheet(cid, period || currentPeriod()); }
    dashboard(cid, period) { return this.svc.getDashboardData(cid, period || currentPeriod()); }
    consolidated(period) {
        return this.svc.getConsolidado(period || currentPeriod());
    }
    async fixOCSales(cid) {
        return this.svc.fixOCSalesRetroactive(cid);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('companies/:companyId/income-statement'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "incomeStatement", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/cash-flow'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "cashFlow", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/balance-sheet'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "balanceSheet", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/dashboard'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('consolidated'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "consolidated", null);
__decorate([
    (0, common_1.Post)('companies/:companyId/maintenance/fix-oc-sales'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "fixOCSales", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map