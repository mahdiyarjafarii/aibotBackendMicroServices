import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ChatSessionId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies?.['session_id']; // Replace 'session_id' with your actual cookie name
  },
);