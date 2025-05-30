import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormModule } from './form/form.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/myFormDB'),
    FormModule
  ],
})
export class AppModule {}