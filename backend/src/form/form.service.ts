import { Injectable,  NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Form, FormDocument } from './form.schema';
import { CreateFormDto } from './create-form.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class FormService {
  constructor(@InjectModel(Form.name) private formModel: Model<FormDocument>) {}

  async create(createFormDto: any): Promise<Form> {
    try {
      const created = new this.formModel(createFormDto);
      return await created.save();
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
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

      ['A', 'B', 'C', 'D'].forEach((col) => {
        worksheet.getCell(`${col}${rowIndex}`).alignment = { wrapText: true, vertical: 'middle' };
      });

      worksheet.getRow(rowIndex).height = 80;

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

      addImage(item.signature, 5);
      addImage(item.photo, 6);

      rowIndex++;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=form-submissions.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

 async generatePdf(id: string, res: Response): Promise<void> {
  const form = await this.formModel.findById(id).lean();
  if (!form) {
    res.status(404).send('Form not found');
    return;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, y: number) => {
    page.drawText(text, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
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

async generatePdfBuffer(form: Form): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(`Name: ${form.firstName} ${form.lastName}`, { x: 50, y: height - 50, size: 12, font });
  page.drawText(`Email: ${form.email}`, { x: 50, y: height - 70, size: 12, font });
  page.drawText(`Date of Application: ${form.dateOfApplication}`, { x: 50, y: height - 90, size: 12, font });

  return Buffer.from(await pdfDoc.save());
}

async findOne(id: string): Promise<Form | null> {
  return this.formModel.findById(id).exec();
}

}
