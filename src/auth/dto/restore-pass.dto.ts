import { Length } from 'class-validator';

export class RestorePassDto {
  @Length(8, 30)
  password: string;
}
