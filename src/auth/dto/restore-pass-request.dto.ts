import { IsEmail } from 'class-validator';

export class RestorePassRequestDto {
  @IsEmail()
  email: string;
}
