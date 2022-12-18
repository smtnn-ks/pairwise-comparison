import { Length } from 'class-validator';

export class ExpertDto {
  @Length(1, 30)
  name: string;
}
