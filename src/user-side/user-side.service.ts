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

  async findOne(id: number, userId: number): Promise<Interview> {
    await this.validateUser(id, userId);
    return await this.prisma.interview.findUnique({
      where: { id },
      include: { optoins: true, experts: true },
    });
  }

  async update(
    interviewDto: Prisma.InterviewUpdateInput,
    id: number,
    userId: number,
  ): Promise<Interview> {
    await this.validateUser(id, userId);
    return await this.prisma.interview.update({
      where: { id },
      data: interviewDto,
    });
  }

  async remove(id: number, userId: number): Promise<Interview> {
    await this.validateUser(id, userId);
    return await this.prisma.interview.delete({ where: { id } });
  }

  // * Option

  async createOption(
    optionDto: Prisma.OptionCreateInput,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    await this.validateUser(interviewId, userId);
    const { title, description } = optionDto;
    return await this.prisma.option.create({
      data: { title, description, interviewId },
    });
  }

  async updateOption(
    optionDto: Prisma.OptionUpdateInput,
    id: number,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    await this.validateUser(interviewId, userId);
    const { title, description } = optionDto;
    return await this.prisma.option.update({
      where: { id },
      data: { title, description },
    });
  }

  async removeOption(
    id: number,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    await this.validateUser(interviewId, userId);
    return await this.prisma.option.delete({ where: { id } });
  }

  // * Expert

  async createExpert(
    expertDto: Prisma.ExpertCreateInput,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    const { name } = expertDto;
    return await this.prisma.expert.create({
      data: { id: generate(), name, interviewId },
    });
  }

  async updateExpert(
    expertDto: Prisma.ExpertUpdateInput,
    id: string,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    const { name } = expertDto;
    return await this.prisma.expert.update({ where: { id }, data: { name } });
  }

  async removeExpert(
    id: string,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    return await this.prisma.expert.delete({ where: { id } });
  }

  // * support functions

  // TODO: Find a way to perform validation somewhere else

  async validateUser(id: number, userId: number): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException();
    if (interview.userId !== userId)
      throw new BadRequestException(
        `Interview ${id} does not belong to user ${userId}`,
      );
    return interview;
  }
}
