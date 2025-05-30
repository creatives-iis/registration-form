import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './create-form.dto';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

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

}
