import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Option, Interview, Prisma, Expert } from '@prisma/client';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { IsActivated } from 'src/common/guards/is-activated.guard';
import { UserSideService } from './user-side.service';

@Controller('interviews')
export class UserSideController {
  constructor(private readonly userSideService: UserSideService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), IsActivated)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() interviewDto: Prisma.InterviewCreateInput,
    @UploadedFile() image: Express.Multer.File,
    @UserId() userId: number,
  ): Promise<Interview> {
    return await this.userSideService.create(interviewDto, image, userId);
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
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() interviewDto: Prisma.InterviewUpdateInput,
    @UploadedFile() image: Express.Multer.File,
    @Param('id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Interview> {
    return await this.userSideService.update(
      interviewDto,
      image,
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
  @UseInterceptors(FileInterceptor('image'))
  async createOption(
    @Body() optionDto: Prisma.OptionCreateInput,
    @UploadedFile() image: Express.Multer.File,
    @Param('id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Option> {
    return await this.userSideService.createOption(
      optionDto,
      image,
      +interviewId,
      userId,
    );
  }

  @Put(':interview-id/options/:option-id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async updateOption(
    @Body() optionDto: Prisma.OptionUpdateInput,
    @UploadedFile() image: Express.Multer.File,
    @Param('option-id') optionId: string,
    @Param('interview-id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Option> {
    return await this.userSideService.updateOption(
      optionDto,
      image,
      +optionId,
      +interviewId,
      userId,
    );
  }

  @Delete(':interview-id/options/:option-id')
  @UseGuards(AuthGuard('jwt'))
  async removeOption(
    @Param('option-id') optionId: string,
    @Param('interview-id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Option> {
    return await this.userSideService.removeOption(
      +optionId,
      +interviewId,
      userId,
    );
  }

  @Post(':interview-id/experts')
  @UseGuards(AuthGuard('jwt'))
  async createExpert(
    @Body() expertDto: Prisma.ExpertCreateInput,
    @Param('interview-id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Expert> {
    return await this.userSideService.createExpert(
      expertDto,
      +interviewId,
      userId,
    );
  }

  @Put(':interview-id/experts/:expert-id')
  @UseGuards(AuthGuard('jwt'))
  async updateExpert(
    @Body() expertDto: Prisma.ExpertUpdateInput,
    @Param('expert-id') expertId: string,
    @Param('interview-id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Expert> {
    return await this.userSideService.updateExpert(
      expertDto,
      expertId,
      +interviewId,
      userId,
    );
  }

  @Delete(':interview-id/experts/:expert-id')
  @UseGuards(AuthGuard('jwt'))
  async deleteExpert(
    @Param('expert-id') expertId: string,
    @Param('interview-id') interviewId: string,
    @UserId() userId: number,
  ): Promise<Expert> {
    return await this.userSideService.removeExpert(
      expertId,
      +interviewId,
      userId,
    );
  }
}
