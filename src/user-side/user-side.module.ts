import { Module } from '@nestjs/common';
import { UserSideService } from './user-side.service';
import { UserSideController } from './user-side.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailerModule } from 'src/emailer/emailer.module';
import { FilerModule } from 'src/filer/filer.module';

@Module({
  controllers: [UserSideController],
  providers: [UserSideService],
  imports: [PrismaModule, EmailerModule, FilerModule],
})
export class UserSideModule {}
