import { IsEmail, Length } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;
  @Length(8, 30)
  password: string;
}
