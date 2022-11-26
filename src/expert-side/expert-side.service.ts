import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Expert, Option } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendResultDto } from './dto/send-result.dto';

@Injectable()
export class ExpertSideService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getOptions(expertId: string): Promise<Expert | { msg: string }> {
    const expert = await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });

    if (expert) {
      if (expert.interview.isComplete) {
        return expert;
      } else {
        return { msg: 'interview is not complete' };
      }
    } else {
      return { msg: 'no such expert' };
    }
  }

  // TODO: add ids validation
  // TODO: parallel as much as possible and not break it
  async sendResults(
    expertId: string,
    results: SendResultDto[],
  ): Promise<{ msg: string }> {
    const expertData = await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });

    // * results id validation
    // ! Yet to test
    if (!this.validateIDs(results, expertData.interview.options))
      throw new BadRequestException('set of ids is not valid');

    if (expertData.isDone) {
      throw new BadRequestException('This expert has passed interview already');
    } else if (!expertData.interview.isComplete) {
      throw new BadRequestException('Interview is not complete');
    } else {
      await this.prisma.expert.update({
        where: { id: expertId },
        data: { isDone: true },
      });
    }

    this.eventEmitter.emit('expertPassedTest', expertData.interview.id);

    const calls: Promise<Option>[] = [];

    results.forEach((t: SendResultDto) => {
      return new Promise<Option>(async (resolve) => {
        return resolve(
          this.prisma.option.update({
            where: { id: t.id },
            data: { score: { increment: t.score } },
          }),
        );
      });
    });

    await Promise.all(calls);

    return { msg: 'result is applied' };
  }

  validateIDs(results: SendResultDto[], options: Option[]): boolean {
    const resultIDs: Set<number> = new Set<number>();
    const optionIDs: Set<number> = new Set<number>();

    for (let t of results) {
      resultIDs.add(t.id);
    }

    for (let t of options) {
      optionIDs.add(t.id);
    }

    return (
      resultIDs.size === optionIDs.size &&
      [...resultIDs].every((value) => optionIDs.has(value))
    );
  }
}
