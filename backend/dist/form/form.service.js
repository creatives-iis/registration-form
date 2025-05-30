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
exports.FormService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const form_schema_1 = require("./form.schema");
const ExcelJS = require("exceljs");
let FormService = class FormService {
    formModel;
    constructor(formModel) {
        this.formModel = formModel;
    }
    async create(createFormDto) {
        try {
            const created = new this.formModel(createFormDto);
            return await created.save();
        }
        catch (error) {
            console.error('Error saving form:', error);
            throw error;
        }
    }
    async findAll() {
        return this.formModel.find().exec();
    }
    async exportToExcel(res) {
        const data = await this.formModel.find().lean();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Form Submissions');
        worksheet.columns = [
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Date of Application', key: 'dateOfApplication', width: 20 },
            { header: 'Signature', key: 'signature', width: 20 },
            { header: 'Photo', key: 'photo', width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true };
        let rowIndex = 2;
        for (const item of data) {
            worksheet.addRow({
                firstName: item.firstName,
                lastName: item.lastName,
                email: item.email,
                dateOfApplication: item.dateOfApplication || '',
                signature: '',
                photo: '',
            });
            ['A', 'B', 'C', 'D'].forEach((col) => {
                worksheet.getCell(`${col}${rowIndex}`).alignment = { wrapText: true, vertical: 'middle' };
            });
            worksheet.getRow(rowIndex).height = 80;
            function addImage(base64, col) {
                if (!base64)
                    return;
                const base64Data = base64.includes('base64,')
                    ? base64.split('base64,')[1]
                    : base64;
                const imageId = workbook.addImage({
                    base64: base64Data,
                    extension: 'png',
                });
                worksheet.addImage(imageId, {
                    tl: { col: col - 1 + 0.15, row: rowIndex - 1 + 0.15 },
                    ext: { width: 120, height: 60 },
                    editAs: 'oneCell',
                });
            }
            addImage(item.signature, 5);
            addImage(item.photo, 6);
            rowIndex++;
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=form-submissions.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.FormService = FormService;
exports.FormService = FormService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(form_schema_1.Form.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FormService);
//# sourceMappingURL=form.service.js.map