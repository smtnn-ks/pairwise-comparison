import { BadRequestException, Injectable } from '@nestjs/common';
import { Expert, Option } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendResultDto } from './dto/send-result.dto';

@Injectable()
export class ExpertSideService {
  constructor(private prisma: PrismaService) {}

  async getOptions(expertId: string): Promise<Expert> {
    return await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });
  }

  async sendResults(
    expertId: string,
    results: SendResultDto[],
  ): Promise<Option[]> {
    const expertData = await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });

    if (expertData.isDone) {
      throw new BadRequestException('This expert has passed interview already');
    } else {
      await this.prisma.expert.update({
        where: { id: expertId },
        data: { isDone: true },
      });
    }

    const calls: Promise<Option>[] = [];

    results.forEach((t: SendResultDto) => {
      return new Promise<Option>(async (resolve, reject) => {
        return resolve(
          await this.prisma.option.update({
            where: { id: t.id },
            data: { score: { increment: t.score } },
          }),
        );
      });
    });

    return Promise.all(calls);
  }
}
