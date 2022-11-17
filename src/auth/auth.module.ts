import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
