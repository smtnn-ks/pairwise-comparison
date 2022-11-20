import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Expert, Option } from '@prisma/client';
import { SendResultDto } from './dto/send-result.dto';
import { ExpertSideService } from './expert-side.service';

@Controller('expert')
export class ExpertSideController {
  constructor(private readonly expertSideService: ExpertSideService) {}

  @Get(':expertId')
  async getOptions(@Param('expertId') expertId: string): Promise<Expert> {
    return await this.expertSideService.getOptions(expertId);
  }

  @Post(':expertId')
  async sendResults(
    @Param('expertId') expertId: string,
    @Body() results: SendResultDto[],
  ): Promise<Option[]> {
    return await this.expertSideService.sendResults(expertId, results);
  }
}
