import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Option, Interview, Prisma, Expert } from '@prisma/client';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { IsActivated } from 'src/common/guards/is-activated.guard';
import { UserSideService } from './user-side.service';

@Controller('interviews')
export class UserSideController {
  constructor(private readonly userSideService: UserSideService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), IsActivated)
  async create(
    @Body() interviewDto: Prisma.InterviewCreateInput,
    @UserId() userId: number,
  ): Promise<Interview> {
    return await this.userSideService.create(interviewDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findMany(@UserId() userId: number): Promise<Interview[]> {
    return await this.userSideService.findMany(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Interview> {
    return await this.userSideService.findOne(+interviewId, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Body() interviewDto: Prisma.InterviewUpdateInput,
    @Param('id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Interview> {
    return await this.userSideService.update(
      interviewDto,
      +interviewId,
      userId,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Interview> {
    return await this.userSideService.remove(+interviewId, userId);
  }

  @Post(':id/options')
  @UseGuards(AuthGuard('jwt'))
  async createOption(
    @Body() optionDto: Prisma.OptionCreateInput,
    @Param('id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Option> {
    return await this.userSideService.createOption(
      optionDto,
      +interviewId,
      userId,
    );
  }

  @Put(':interviewId/options/:optionId')
  @UseGuards(AuthGuard('jwt'))
  async updateOption(
    @Body() optionDto: Prisma.OptionUpdateInput,
    @Param('optionId') optionId: string,
    @Param('interviewId') interviewId: string,
    @UserId() userId: number,
  ): Promise<Option> {
    return await this.userSideService.updateOption(
      optionDto,
      +optionId,
      +interviewId,
      userId,
    );
  }

  @Delete(':interviewId/options/:optionId')
  @UseGuards(AuthGuard('jwt'))
  async removeOption(
    @Param('optionId') optionId: string,
    @Param('interviewId') interviewId: string,
    @UserId() userId: number,
  ): Promise<Option> {
    return await this.userSideService.removeOption(
      +optionId,
      +interviewId,
      userId,
    );
  }

  @Post(':interviewId/experts')
  @UseGuards(AuthGuard('jwt'))
  async createExpert(
    @Body() expertDto: Prisma.ExpertCreateInput,
    @Param('interviewId') interviewId: string,
    @UserId() userId: number,
  ): Promise<Expert> {
    return await this.userSideService.createExpert(
      expertDto,
      +interviewId,
      userId,
    );
  }

  @Put(':interviewId/experts/:expertId')
  @UseGuards(AuthGuard('jwt'))
  async updateExpert(
    @Body() expertDto: Prisma.ExpertUpdateInput,
    @Param('expertId') expertId: string,
    @Param('interviewId') interviewId: string,
    @UserId() userId: number,
  ): Promise<Expert> {
    return await this.userSideService.updateExpert(
      expertDto,
      expertId,
      +interviewId,
      userId,
    );
  }

  @Delete(':interviewId/experts/:expertId')
  @UseGuards(AuthGuard('jwt'))
  async deleteExpert(
    @Param('expertId') expertId: string,
    @Param('interviewId') interviewId: string,
    @UserId() userId: number,
  ): Promise<Expert> {
    return await this.userSideService.removeExpert(
      expertId,
      +interviewId,
      userId,
    );
  }
}
