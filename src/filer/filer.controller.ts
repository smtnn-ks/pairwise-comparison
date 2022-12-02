import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { prototype } from 'events';
import { FilerService } from './filer.service';

@Controller('filer')
export class FilerController {
  constructor(private filerService: FilerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<string> {
    return await this.filerService.uploadImage(image);
  }

  @Put(':imageName')
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('imageName') imageName: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<string> {
    return await this.filerService.updateImage(imageName, image);
  }

  @Delete(':imageName')
  async deleteImage(@Param('imageName') imageName: string): Promise<string> {
    return await this.filerService.deleteImage(imageName);
  }
}
