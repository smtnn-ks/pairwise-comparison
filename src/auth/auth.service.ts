import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { EmailerService } from 'src/emailer/emailer.service';
import { generate } from 'shortid';
import { AppError } from 'src/common/errors/errors';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailerService: EmailerService,
  ) {}

  async signup(authDto: AuthDto): Promise<User> {
    const { email, password } = authDto;

    const candidate = await this.prisma.user.findUnique({ where: { email } });
    if (candidate) throw AppError.suchUserExistsException();

    const hashPassword = this.hashData(password);
    const activationLink = generate();

    this.emailerService.sendValidationEmail(email, activationLink);

    return await this.prisma.user.create({
      data: { email, password: hashPassword, activationLink },
    });
  }

  async validateUser(activationLink: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { activationLink },
      data: { isActivated: true },
    });
    if (!user) throw AppError.wrongActivationLinkException();
    return user;
  }

  async signin(authDto: AuthDto): Promise<Tokens> {
    const { email, password } = authDto;

    const candidate = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!candidate) throw AppError.wrongCredentialsException();

    const verifyPassword = this.compareData(password, candidate.password);
    if (!verifyPassword) throw AppError.wrongCredentialsException();

    return await this.generateTokens(
      candidate.id,
      candidate.email,
      candidate.isActivated,
    );
  }

  async logout(id: number): Promise<User> {
    if (!id) throw AppError.invalidTokenException();
    const user = await this.prisma.user.update({
      where: { id },
      data: { refreshToken: '' },
    });
    if (!user) throw AppError.invalidTokenException();
    return user;
  }

  async refresh(id: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !user.refreshToken) throw AppError.invalidTokenException();
    const verifyRefreshToken = this.compareData(
      refreshToken,
      user.refreshToken,
    );
    if (!verifyRefreshToken) throw AppError.invalidTokenException();

    return await this.generateTokens(id, user.email, user.isActivated);
  }

  async restorePassRequest(email: string): Promise<{ msg: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw AppError.noSuchUserException();

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        privateKey: process.env.PT_SECRET,
        expiresIn: '10m',
      },
    );

    this.emailerService.sendRestore(user.email, token);

    return { msg: 'email send' };
  }

  async restorePass(id: number, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.invalidTokenException();

    const hashPassword = this.hashData(password);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashPassword },
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
