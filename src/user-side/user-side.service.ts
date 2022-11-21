import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Expert, Interview, Option, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { generate } from 'shortid';

@Injectable()
export class UserSideService {
  constructor(private prisma: PrismaService) {}

  async create(
    interviewDto: Prisma.InterviewCreateInput,
    userId: number,
  ): Promise<Interview> {
    const { title, description } = interviewDto;
    return await this.prisma.interview.create({
      data: { title, description, userId },
    });
  }

  async findMany(userId: number): Promise<Interview[]> {
    return await this.prisma.interview.findMany({ where: { userId } });
  }

  async findOne(interviewId: number, userId: number): Promise<Interview> {
    await this.validateUser(interviewId, userId);
    return await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { options: true, experts: true },
    });
  }

  async update(
    interviewDto: Prisma.InterviewUpdateInput,
    interviewId: number,
    userId: number,
  ): Promise<Interview> {
    await this.validateUser(interviewId, userId);
    await this.resetInterviewProgress(interviewId);
    return await this.prisma.interview.update({
      where: { id: interviewId },
      data: interviewDto,
    });
  }

  async remove(interviewId: number, userId: number): Promise<Interview> {
    await this.validateUser(interviewId, userId);
    return await this.prisma.interview.delete({ where: { id: interviewId } });
  }

  // * Option

  async createOption(
    optionDto: Prisma.OptionCreateInput,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    await this.validateUser(interviewId, userId);
    await this.validateInterviewCompleteness(interviewId);
    await this.resetInterviewProgress(interviewId);
    const { title, description } = optionDto;
    return await this.prisma.option.create({
      data: { title, description, interviewId },
    });
  }

  async updateOption(
    optionDto: Prisma.OptionUpdateInput,
    optionId: number,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    await this.validateUser(interviewId, userId);
    await this.resetInterviewProgress(interviewId);
    const { title, description } = optionDto;
    return await this.prisma.option.update({
      where: { id: optionId },
      data: { title, description },
    });
  }

  async removeOption(
    optionId: number,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    await this.validateUser(interviewId, userId);
    await this.validateInterviewCompleteness(interviewId);
    await this.resetInterviewProgress(interviewId);
    return await this.prisma.option.delete({ where: { id: optionId } });
  }

  // * Expert

  async createExpert(
    expertDto: Prisma.ExpertCreateInput,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    await this.validateInterviewCompleteness(interviewId);
    await this.resetInterviewProgress(interviewId);
    const { name } = expertDto;
    return await this.prisma.expert.create({
      data: { id: generate(), name, interviewId },
    });
  }

  async updateExpert(
    expertDto: Prisma.ExpertUpdateInput,
    expertId: string,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    await this.resetInterviewProgress(interviewId);
    const { name } = expertDto;
    return await this.prisma.expert.update({
      where: { id: expertId },
      data: { name },
    });
  }

  async removeExpert(
    expertId: string,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    await this.validateInterviewCompleteness(interviewId);
    await this.resetInterviewProgress(interviewId);
    return await this.prisma.expert.delete({ where: { id: expertId } });
  }

  // * support functions

  // TODO: Find a way to perform validation somewhere else

  async validateUser(interviewId: number, userId: number): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
    });
    if (!interview) throw new NotFoundException();
    if (interview.userId !== userId)
      throw new BadRequestException(
        `Interview ${interviewId} does not belong to user ${userId}`,
      );
    return interview;
  }

  async validateInterviewCompleteness(interviewId: number): Promise<void> {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { options: true, experts: true },
    });

    if (interview.options.length >= 2 && interview.experts.length >= 2) {
      if (!interview.isComplete) {
        await this.prisma.interview.update({
          where: { id: interviewId },
          data: { isComplete: true },
        });
      }
    } else {
      if (interview.isComplete) {
        await this.prisma.interview.update({
          where: { id: interviewId },
          data: { isComplete: false },
        });
      }
    }
  }

  async resetInterviewProgress(interviewId: number): Promise<void> {
    await this.prisma.option.updateMany({
      where: { interviewId },
      data: { score: 0 },
    });
    await this.prisma.expert.updateMany({
      where: { interviewId },
      data: { isDone: false },
    });
  }
}
