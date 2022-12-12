import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
        throw new ForbiddenException('interview is not complete');
      }
    } else {
      throw new NotFoundException('no such expert');
    }
  }

  async sendResults(
    expertId: string,
    results: SendResultDto[],
  ): Promise<{ msg: string }> {
    const expertData = await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });

    if (!expertData) throw new NotFoundException('no such expert');
    if (!expertData.interview.isComplete)
      throw new ForbiddenException('interview is not complete');
    if (expertData.isDone)
      throw new ForbiddenException(
        'this expert has passed the interview already',
      );
    if (!this.validateIDs(results, expertData.interview.options))
      throw new BadRequestException('set of ids is not valid');
    if (!this.validateScores(results))
      throw new BadRequestException('scores are not valid');

    await this.prisma.expert.update({
      where: { id: expertId },
      data: { isDone: true },
    });

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

    return { msg: 'results are applied' };
  }

  // support functions

  validateIDs(results: SendResultDto[], options: Option[]): boolean {
    const resultIDs: Set<number> = new Set<number>();
    const optionIDs: Set<number> = new Set<number>();

    for (const t of results) {
      resultIDs.add(t.id);
    }

    for (const t of options) {
      optionIDs.add(t.id);
    }

    return (
      resultIDs.size === optionIDs.size &&
      [...resultIDs].every((value) => optionIDs.has(value))
    );
  }

  validateScores(results: SendResultDto[]): boolean {
    let sum = 0;
    for (const item of results) {
      if (item.score > results.length) return false;
      sum += item.score;
    }
    return sum === this.factorial(results.length - 1);
  }

  factorial(x: number): number {
    if (x === 0 || x === 1) return 1;
    return x * this.factorial(x - 1);
  }
}
