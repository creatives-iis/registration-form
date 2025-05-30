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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormController = void 0;
const common_1 = require("@nestjs/common");
const form_service_1 = require("./form.service");
const create_form_dto_1 = require("./create-form.dto");
const jszip_1 = __importDefault(require("jszip"));
let FormController = class FormController {
    formService;
    constructor(formService) {
        this.formService = formService;
    }
    async create(createFormDto) {
        return this.formService.create(createFormDto);
    }
    async findAll() {
        return this.formService.findAll();
    }
    async exportExcel(res) {
        return this.formService.exportToExcel(res);
    }
    async getPdf(id, res) {
        return this.formService.generatePdf(id, res);
    }
    async downloadSelectedAsZip(ids, res) {
        const zip = new jszip_1.default();
        for (const id of ids) {
            const form = await this.formService.findOne(id);
            if (!form)
                continue;
            const pdfBuffer = await this.formService.generatePdfBuffer(form);
            zip.file(`${form.firstName}-${form.lastName}.pdf`, pdfBuffer);
        }
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=selected-forms.zip');
        res.send(zipBuffer);
    }
};
exports.FormController = FormController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_form_dto_1.CreateFormDto]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('submissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FormController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export-excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "getPdf", null);
__decorate([
    (0, common_1.Post)('pdf-zip'),
    __param(0, (0, common_1.Body)('ids')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "downloadSelectedAsZip", null);
exports.FormController = FormController = __decorate([
    (0, common_1.Controller)('form'),
    __metadata("design:paramtypes", [form_service_1.FormService])
], FormController);
//# sourceMappingURL=form.controller.js.map