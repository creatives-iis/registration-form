"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const ExcelJS = __importStar(require("exceljs"));
const pdf_lib_1 = require("pdf-lib");
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
    async generatePdf(id, res) {
        const form = await this.formModel.findById(id).lean();
        if (!form) {
            res.status(404).send('Form not found');
            return;
        }
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const drawText = (text, y) => {
            page.drawText(text, {
                x: 50,
                y,
                size: 12,
                font,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
        };
        drawText(`First Name: ${form.firstName}`, 350);
        drawText(`Last Name: ${form.lastName}`, 330);
        drawText(`Email: ${form.email}`, 310);
        drawText(`Date of Application: ${form.dateOfApplication || ''}`, 290);
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${form.firstName}_${form.lastName}.pdf`);
        res.send(Buffer.from(pdfBytes));
    }
    async generatePdfBuffer(form) {
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        page.drawText(`Name: ${form.firstName} ${form.lastName}`, { x: 50, y: height - 50, size: 12, font });
        page.drawText(`Email: ${form.email}`, { x: 50, y: height - 70, size: 12, font });
        page.drawText(`Date of Application: ${form.dateOfApplication}`, { x: 50, y: height - 90, size: 12, font });
        return Buffer.from(await pdfDoc.save());
    }
    async findOne(id) {
        return this.formModel.findById(id).exec();
    }
};
exports.FormService = FormService;
exports.FormService = FormService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(form_schema_1.Form.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FormService);
//# sourceMappingURL=form.service.js.map