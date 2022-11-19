import { IsString, Length } from 'class-validator';

export class OptionDto {
  @IsString()
  @Length(2, 50)
  title: string;

  @IsString()
  @Length(2, 50)
  description: string;
}
