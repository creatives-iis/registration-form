import { Document } from 'mongoose';
export type FormDocument = Form & Document;
export declare class Form {
    firstName: string;
    lastName: string;
    email: string;
    dateOfApplication: string;
    signature: string;
    photo: string;
}
export declare const FormSchema: import("mongoose").Schema<Form, import("mongoose").Model<Form, any, any, any, Document<unknown, any, Form, any> & Form & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Form, Document<unknown, {}, import("mongoose").FlatRecord<Form>, {}> & import("mongoose").FlatRecord<Form> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
