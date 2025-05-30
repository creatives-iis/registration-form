import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateFormDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  dateOfApplication: string;

  @IsString()
  signature: string;

  @IsString()
  photo?: string;
}
