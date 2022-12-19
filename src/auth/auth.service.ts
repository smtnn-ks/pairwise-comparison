import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, UserResponseDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailerService } from 'src/emailer/emailer.service';
import { generate } from 'shortid';
import { AppException } from 'src/common/exceptions/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailerService: EmailerService,
  ) {}

  async signup(authDto: AuthDto): Promise<UserResponseDto> {
    const { email, password } = authDto;

    const candidate = await this.prisma.user.findUnique({ where: { email } });
    if (candidate) throw AppException.suchUserExistsException();

    const hashPassword = this.hashData(password);
    const activationLink = generate();

    try {
      this.emailerService.sendActivationEmail(email, activationLink);
    } catch (e) {
      throw AppException.emailerException(e);
    }

    return await this.prisma.user.create({
      data: { email, password: hashPassword, activationLink },
      select: { id: true, email: true, isActivated: true },
    });
  }

  async activateUser(activationLink: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { activationLink },
      data: { isActivated: true },
      select: { id: true, email: true, isActivated: true },
    });
    if (!user) throw AppException.wrongActivationLinkException();
    return user;
  }

  async signin(authDto: AuthDto): Promise<Tokens> {
    const { email, password } = authDto;

    const candidate = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!candidate) throw AppException.wrongCredentialsException();

    const verifyPassword = this.compareData(password, candidate.password);
    if (!verifyPassword) throw AppException.wrongCredentialsException();

    return await this.generateTokens(
      candidate.id,
      candidate.email,
      candidate.isActivated,
    );
  }

  async logout(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { refreshToken: '' },
      select: { id: true, email: true, isActivated: true },
    });
    if (!user) throw AppException.tokenRefersToNonExistingUserExcetption();
    return user;
  }

  async refresh(id: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw AppException.tokenRefersToNonExistingUserExcetption();
    if (!user.refreshToken)
      throw AppException.refreshTokenDoesNotMatchException();
    const verifyRefreshToken = this.compareData(
      refreshToken,
      user.refreshToken,
    );
    if (!verifyRefreshToken) throw AppException.invalidTokenException();

    return await this.generateTokens(id, user.email, user.isActivated);
  }

  async restorePassRequest(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw AppException.noSuchUserException();

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        privateKey: process.env.PT_SECRET,
        expiresIn: '10m',
      },
    );

    try {
      this.emailerService.sendRestore(user.email, token);
    } catch (e) {
      throw AppException.emailerException(e);
    }

    return 'email send';
  }

  async restorePass(id: number, password: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw AppException.tokenRefersToNonExistingUserExcetption();

    const hashPassword = this.hashData(password);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashPassword },
      select: { id: true, email: true, isActivated: true },
    });
  }

  // * Support functions

  hashData = (data: string) => bcrypt.hashSync(data, +process.env.SALT);

  compareData = (data: string, encrypted: string) =>
    bcrypt.compareSync(data, encrypted);

  async generateTokens(
    id: number,
    email: string,
    isActivated: boolean,
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          email,
          isActivated,
        },
        {
          privateKey: process.env.AT_SECRET,
          expiresIn: '10m',
        },
      ),

      this.jwtService.signAsync(
        {
          sub: id,
        },
        {
          privateKey: process.env.RT_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    const hashRt = this.hashData(rt);

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: hashRt },
    });

    return { accessToken: at, refreshToken: rt };
  }
}
