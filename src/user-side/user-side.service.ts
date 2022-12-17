import { Injectable } from '@nestjs/common';
import { Expert, Interview, Option, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { generate } from 'shortid';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailerService } from 'src/emailer/emailer.service';
import { FilerService } from 'src/filer/filer.service';
import { AppException } from 'src/common/exceptions/exceptions';

@Injectable()
export class UserSideService {
  constructor(
    private prisma: PrismaService,
    private emailerService: EmailerService,
    private filerService: FilerService,
  ) {}

  async create(
    interviewDto: Prisma.InterviewCreateInput,
    image: Express.Multer.File,
    userId: number,
  ): Promise<Interview> {
    try {
      const { title, description } = interviewDto;
      const imageName = image ? await this.filerService.uploadImage(image) : '';
      return await this.prisma.interview.create({
        data: { title, description, userId, image: imageName },
      });
    } catch (e) {
      throw AppException.fileServerException(e);
    }
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
    image: Express.Multer.File,
    interviewId: number,
    userId: number,
  ): Promise<Interview> {
    try {
      await this.validateUser(interviewId, userId);
      await this.resetInterviewProgress(interviewId);

      const interview = await this.prisma.interview.update({
        where: { id: interviewId },
        data: { ...interviewDto },
      });

      if (image) await this.filerService.updateImage(interview.image, image);

      return interview;
    } catch (e) {
      throw AppException.fileServerException(e);
    }
  }

  async remove(interviewId: number, userId: number): Promise<Interview> {
    try {
      await this.validateUser(interviewId, userId);
      const interview = await this.prisma.interview.delete({
        where: { id: interviewId },
      });
      await this.filerService.deleteImage(interview.image);
      return interview;
    } catch (e) {
      throw AppException.fileServerException(e);
    }
  }

  // * Option

  async createOption(
    optionDto: Prisma.OptionCreateInput,
    image: Express.Multer.File,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    try {
      await this.validateUser(interviewId, userId);
      await this.resetInterviewProgress(interviewId);

      const { title, description } = optionDto;
      const imageName = image ? await this.filerService.uploadImage(image) : '';

      const option = await this.prisma.option.create({
        data: { title, description, interviewId, image: imageName },
      });

      await this.checkInterviewCompleteness(interviewId);
      return option;
    } catch (e) {
      throw AppException.fileServerException(e);
    }
  }

  async updateOption(
    optionDto: Prisma.OptionUpdateInput,
    image: Express.Multer.File,
    optionId: number,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    try {
      await this.validateUser(interviewId, userId);
      await this.resetInterviewProgress(interviewId);

      const { title, description } = optionDto;
      const option = await this.prisma.option.update({
        where: { id: optionId },
        data: { title, description },
      });
      if (image) await this.filerService.updateImage(option.image, image);
      return option;
    } catch (e) {
      throw AppException.fileServerException(e);
    }
  }

  async removeOption(
    optionId: number,
    interviewId: number,
    userId: number,
  ): Promise<Option> {
    try {
      await this.validateUser(interviewId, userId);
      await this.resetInterviewProgress(interviewId);
      const option = await this.prisma.option.delete({
        where: { id: optionId },
      });
      await this.checkInterviewCompleteness(interviewId);
      await this.filerService.deleteImage(option.image);
      return option;
    } catch (e) {
      throw AppException.fileServerException(e);
    }
  }

  // * Expert

  async createExpert(
    expertDto: Prisma.ExpertCreateInput,
    interviewId: number,
    userId: number,
  ): Promise<Expert> {
    await this.validateUser(interviewId, userId);
    await this.resetInterviewProgress(interviewId);

    const { name } = expertDto;
    const expert = await this.prisma.expert.create({
      data: { id: generate(), name, interviewId },
    });

    await this.checkInterviewCompleteness(interviewId);
    return expert;
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
    await this.resetInterviewProgress(interviewId);
    const expert = await this.prisma.expert.delete({ where: { id: expertId } });
    await this.checkInterviewCompleteness(interviewId);
    return expert;
  }

  // * support functions

  // TODO: Find a way to perform validation somewhere else

  async validateUser(interviewId: number, userId: number): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
    });
    if (!interview) throw AppException.noInterviewException();
    if (interview.userId !== userId)
      throw AppException.interviewDoesNotBelongToUserException();
    return interview;
  }

  async checkInterviewCompleteness(interviewId: number): Promise<void> {
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
    await Promise.all([
      this.prisma.option.updateMany({
        where: { interviewId },
        data: { score: 0 },
      }),
      this.prisma.expert.updateMany({
        where: { interviewId },
        data: { isDone: false },
      }),
      this.prisma.interview.update({
        where: { id: interviewId },
        data: { isDone: false },
      }),
    ]);
  }

  @OnEvent('expertPassedTest')
  async expertPassedTestCheck(interviewId: number): Promise<void> {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { experts: true },
    });

    if (interview.experts.every((t: Expert) => t.isDone)) {
      const interview = await this.prisma.interview.update({
        where: { id: interviewId },
        data: { isDone: true },
        include: { user: true },
      });

      this.emailerService.sendInterviewCompleteNotification(
        interview.user.email,
        interview.title,
        interview.id,
      );
    }
  }
}
