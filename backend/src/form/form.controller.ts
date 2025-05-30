import { Controller, Post, Body, Get, Res, Param } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './create-form.dto';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import JSZip from 'jszip';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  async create(@Body() createFormDto: CreateFormDto) {
    return this.formService.create(createFormDto);
  }

   @Get('submissions')
  async findAll() {
    return this.formService.findAll();
  }

   @Get('export-excel')
  async exportExcel(@Res() res: Response) {
    return this.formService.exportToExcel(res);
  }

  // In form.controller.ts
@Get(':id/pdf')
async getPdf(@Param('id') id: string, @Res() res: Response) {
  return this.formService.generatePdf(id, res);
}

@Post('pdf-zip')
async downloadSelectedAsZip(@Body('ids') ids: string[], @Res() res: Response) {
  const zip = new JSZip();

  for (const id of ids) {
    const form = await this.formService.findOne(id);
    if (!form) continue;

    const pdfBuffer = await this.formService.generatePdfBuffer(form);
    zip.file(`${form.firstName}-${form.lastName}.pdf`, pdfBuffer);
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=selected-forms.zip');
  res.send(zipBuffer);
}


}
