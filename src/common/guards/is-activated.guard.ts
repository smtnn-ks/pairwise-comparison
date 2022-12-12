import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class IsActivated implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!context.switchToHttp().getRequest().user.isActivated)
      throw new ForbiddenException('user is not activated');
    return true;
  }
}
