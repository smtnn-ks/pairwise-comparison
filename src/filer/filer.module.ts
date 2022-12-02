import { Module } from '@nestjs/common';
import { FilerService } from './filer.service';
import { FilerController } from './filer.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [FilerService],
  controllers: [FilerController],
  exports: [FilerService],
})
export class FilerModule {}
