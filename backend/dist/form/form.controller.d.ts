import { FormService } from './form.service';
import { CreateFormDto } from './create-form.dto';
import { Response } from 'express';
export declare class FormController {
    private readonly formService;
    constructor(formService: FormService);
    create(createFormDto: CreateFormDto): Promise<import("./form.schema").Form>;
    findAll(): Promise<import("./form.schema").Form[]>;
    exportExcel(res: Response): Promise<void>;
}
