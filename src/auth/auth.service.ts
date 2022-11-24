import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(authDto: AuthDto): Promise<User> {
    const { email, password } = authDto;

    const candidate = await this.prisma.user.findUnique({ where: { email } });
    if (candidate) throw new BadRequestException('Such users exists already');

    const hashPassword = this.hashData(password);
    return await this.prisma.user.create({
      data: { email, password: hashPassword },
    });
  }

  async signin(authDto: AuthDto): Promise<Tokens> {
    const { email, password } = authDto;

    const candidate = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!candidate) throw new BadRequestException('No such user');

    const verifyPassword = this.compareData(password, candidate.password);

    if (!verifyPassword) throw new BadRequestException('Wrong password');

    return this.generateTokens(candidate.id, candidate.email);
  }

  async logout(id: number): Promise<User> {
    if (!id) throw new NotFoundException('no id');
    return await this.prisma.user.update({
      where: { id },
      data: { refreshToken: '' },
    });
  }

  async refresh(id: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    // if (!user || !user.refreshToken)
    //   throw new BadRequestException('Invalid token');
    if (!user) throw new BadRequestException('no user');
    if (!user.refreshToken) throw new BadRequestException('no token in db');
    const verifyRefreshToken = this.compareData(
      refreshToken,
      user.refreshToken,
    );
    if (!verifyRefreshToken) throw new BadRequestException('Invalid token');

    return await this.generateTokens(id, user.email);
  }

  // * Support functions

  hashData = (data: string) => bcrypt.hashSync(data, +process.env.SALT);

  compareData = (data: string, encrypted: string) =>
    bcrypt.compareSync(data, encrypted);

  async generateTokens(id: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          email,
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
