import { Module } from '@nestjs/common';
import { ExpertSideService } from './expert-side.service';
import { ExpertSideController } from './expert-side.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ExpertSideController],
  providers: [ExpertSideService],
  imports: [PrismaModule],
})
export class ExpertSideModule {}
