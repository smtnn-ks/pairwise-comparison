import { Length } from 'class-validator';

export class InterviewDto {
  @Length(1, 80)
  title: string;
  @Length(0, 255)
  description: string;
}
