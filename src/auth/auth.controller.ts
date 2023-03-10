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
import {
  AuthDto,
  RestorePassDto,
  RestorePassRequestDto,
  UserResponseDto,
} from './dto';
import { Tokens } from './types';
import { Request } from 'express';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() authDto: AuthDto): Promise<UserResponseDto> {
    return await this.authService.signup(authDto);
  }

  @Get('activate/:activationLink')
  async activateUser(
    @Param('activationLink') activationLink: string,
  ): Promise<UserResponseDto> {
    return await this.authService.activateUser(activationLink);
  }

  @Post('signin')
  async signin(@Body() authDto: AuthDto): Promise<Tokens> {
    return await this.authService.signin(authDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@UserId() userId: number): Promise<UserResponseDto> {
    return await this.authService.logout(userId);
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
    @Body() body: RestorePassRequestDto,
  ): Promise<string> {
    const { email } = body;
    return await this.authService.restorePassRequest(email);
  }

  @Post('restore-pass')
  @UseGuards(AuthGuard('jwt-restore'))
  async restorePass(
    @UserId() userId: number,
    @Body() body: RestorePassDto,
  ): Promise<UserResponseDto> {
    const { pass } = body;
    return await this.authService.restorePass(userId, pass);
  }
}
