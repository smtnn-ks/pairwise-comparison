import {
  Body,
  Controller,
  Param,
  Patch,
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
import { Payload } from 'src/common/decorators/payload.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() authDto: AuthDto): Promise<UserResponseDto> {
    return await this.authService.signup(authDto);
  }

  @Patch('validate/:activationLink')
  async validateUser(
    @Param('activationLink') activationLink: string,
  ): Promise<UserResponseDto> {
    return await this.authService.validateUser(activationLink);
  }

  @Post('signin')
  async signin(@Body() authDto: AuthDto): Promise<Tokens> {
    return await this.authService.signin(authDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Payload() payload: any): Promise<UserResponseDto> {
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
