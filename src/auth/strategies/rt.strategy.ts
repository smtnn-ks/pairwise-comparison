import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.RT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    return {
      ...payload,
      refreshToken: req.headers.authorization.replace('Bearer', '').trim(),
    };
  }
}
