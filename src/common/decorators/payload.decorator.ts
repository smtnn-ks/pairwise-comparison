import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Payload = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const { sub, email } = context.switchToHttp().getRequest().user;
    return { sub, email };
  },
);
