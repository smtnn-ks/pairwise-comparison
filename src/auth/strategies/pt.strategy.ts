import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PtStrategy extends PassportStrategy(Strategy, 'jwt-restore') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      ignoreExpiration: false,
      secretOrKey: process.env.PT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      ...payload,
    };
  }
}
