import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailerModule } from 'src/emailer/emailer.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  imports: [JwtModule.register({}), PrismaModule, EmailerModule],
})
export class AuthModule {}
