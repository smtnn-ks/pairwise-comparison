import { IsInt, IsPositive } from 'class-validator';

export class SendResultDto {
  @IsInt()
  @IsPositive()
  id: number;

  @IsInt()
  @IsPositive()
  score: number;
}
