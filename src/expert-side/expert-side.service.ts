import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Expert, Option } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendResultDto } from './dto/send-result.dto';
import { AppException } from 'src/common/exceptions/exceptions';

@Injectable()
export class ExpertSideService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getOptions(expertId: string): Promise<Expert> {
    const expert = await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });

    if (expert) {
      if (expert.interview.isComplete) {
        return expert;
      } else {
        throw AppException.interviewIsNotCompleteException();
      }
    } else {
      throw AppException.noSuchExpertException();
    }
  }

  async sendResults(
    expertId: string,
    results: SendResultDto[],
  ): Promise<string> {
    const expertData = await this.prisma.expert.findUnique({
      where: { id: expertId },
      include: { interview: { include: { options: true } } },
    });

    if (!expertData) throw AppException.noSuchExpertException();
    if (!expertData.interview.isComplete)
      throw AppException.interviewIsNotCompleteException();
    if (expertData.isDone)
      throw AppException.expertPassedInterviewAlreadyException();
    if (!this.validateIDs(results, expertData.interview.options))
      throw AppException.invalidSetOfIdsException();
    if (!this.validateScores(results))
      throw AppException.invalidScoresException();

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

    return 'results are applied';
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
