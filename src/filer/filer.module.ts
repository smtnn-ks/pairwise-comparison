import { Module } from '@nestjs/common';
import { FilerService } from './filer.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [FilerService],
  exports: [FilerService],
})
export class FilerModule {}
