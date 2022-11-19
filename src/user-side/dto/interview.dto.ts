import { IsString, Length } from 'class-validator';

export class InterviewDto {
  @IsString()
  @Length(2, 50)
  title: string;

  @IsString()
  @Length(0, 255)
  description: string;
}
