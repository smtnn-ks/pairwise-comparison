import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthDto, RestorePassDto } from './dto';
import { User } from '@prisma/client';
import { Tokens } from './types';
import { Request } from 'express';
import { Payload } from 'src/common/decorators/payload.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() authDto: AuthDto): Promise<User> {
    return await this.authService.signup(authDto);
  }

  @Get('validate/:activation-link')
  async validateUser(
    @Param('activation-link') activationLink: string,
  ): Promise<User> {
    return await this.authService.validateUser(activationLink);
  }

  @Post('signin')
  async signin(@Body() authDto: AuthDto): Promise<Tokens> {
    return await this.authService.signin(authDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Payload() payload: any): Promise<User> {
    return await this.authService.logout(payload.sub);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: Request): Promise<Tokens> {
    return await this.authService.refresh(
      req.user['sub'],
      req.user['refreshToken'],
    );
  }

  @Post('restore-pass-request')
  async restorePassRequest(
    @Body() body: { email: string },
  ): Promise<{ msg: string }> {
    const { email } = body;
    return await this.authService.restorePassRequest(email);
  }

  @Post('restore-pass')
  @UseGuards(AuthGuard('jwt-restore'))
  async restorePass(
    @UserId() userId: number,
    @Body() body: RestorePassDto,
  ): Promise<User> {
    const { pass } = body;
    return await this.authService.restorePass(userId, pass);
  }
}
