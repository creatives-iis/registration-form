import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { Form, FormSchema } from './form.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }])],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
