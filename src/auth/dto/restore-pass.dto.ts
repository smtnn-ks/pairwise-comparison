import { Length } from 'class-validator';

export class RestorePassDto {
  token: string;
  @Length(8, 30)
  pass: string;
}
