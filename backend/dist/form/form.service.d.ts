import { Model } from 'mongoose';
import { Form, FormDocument } from './form.schema';
import { Response } from 'express';
export declare class FormService {
    private formModel;
    constructor(formModel: Model<FormDocument>);
    create(createFormDto: any): Promise<Form>;
    findAll(): Promise<Form[]>;
    exportToExcel(res: Response): Promise<void>;
    generatePdf(id: string, res: Response): Promise<void>;
    generatePdfBuffer(form: Form): Promise<Buffer>;
    findOne(id: string): Promise<Form | null>;
}
