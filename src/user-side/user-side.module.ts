import { Module } from '@nestjs/common';
import { UserSideService } from './user-side.service';
import { UserSideController } from './user-side.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailerModule } from 'src/emailer/emailer.module';

@Module({
  controllers: [UserSideController],
  providers: [UserSideService],
  imports: [PrismaModule, EmailerModule],
})
export class UserSideModule {}
