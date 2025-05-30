import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormDocument = Form & Document;

@Schema()
export class Form {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  dateOfApplication: string;

  @Prop()
  signature: string;

  @Prop()
  photo: string;
}

export const FormSchema = SchemaFactory.createForClass(Form);
