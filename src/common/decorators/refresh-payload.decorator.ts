import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshPayload = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const { sub, refreshToken } = context.switchToHttp().getRequest();
    return { sub, refreshToken };
  },
);
