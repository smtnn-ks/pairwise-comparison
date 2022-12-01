import {
  Controller,
  Get,
  Param,
  Post,
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
  @UseInterceptors(FileInterceptor('file'))
  async createFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    return await this.filerService.createFile(file);
  }
}
