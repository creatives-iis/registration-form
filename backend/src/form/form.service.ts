import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from './form.schema';
import { CreateFormDto } from './create-form.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class FormService {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async create(createFormDto: any): Promise<Form> {
  try {
    const created = new this.formModel(createFormDto);
    return await created.save();
  } catch (error) {
    console.error('Error saving form:', error);
    throw error;  // so NestJS returns 500 with message
  }
}

  async findAll(): Promise<Form[]> {
    return this.formModel.find().exec();
  }

  async exportToExcel(res: Response): Promise<void> {
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

      // Wrap formatting
      ['A', 'B', 'C', 'D'].forEach((col) => {
        worksheet.getCell(`${col}${rowIndex}`).alignment = { wrapText: true, vertical: 'middle' };
      });

      worksheet.getRow(rowIndex).height = 80;

      // Helper to add image
      function addImage(base64: string, col: number) {
        if (!base64) return;

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

      addImage(item.signature, 5); // Column E
      addImage(item.photo, 6);     // Column F

      rowIndex++;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=form-submissions.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}
