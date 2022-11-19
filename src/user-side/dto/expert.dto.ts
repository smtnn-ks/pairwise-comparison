import { IsString, Length } from 'class-validator';

export class ExpertDto {
  @IsString()
  @Length(2, 30)
  name: string;
}
