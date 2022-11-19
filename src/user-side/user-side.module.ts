import { Module } from '@nestjs/common';
import { UserSideService } from './user-side.service';
import { UserSideController } from './user-side.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [UserSideController],
  providers: [UserSideService],
  imports: [PrismaModule],
})
export class UserSideModule {}
