import { Length } from 'class-validator';

export class OptionDto {
  @Length(1, 80)
  title: string;
  @Length(0, 255)
  description: string;
}
