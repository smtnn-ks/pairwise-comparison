import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserSideModule } from './user-side/user-side.module';
import { ExpertSideModule } from './expert-side/expert-side.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserSideModule,
    ExpertSideModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
