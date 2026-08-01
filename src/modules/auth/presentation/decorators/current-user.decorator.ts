// presentation/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../../domain/interfaces/token-payload';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: TokenPayload }>();
    const user = request.user;
    return user;
  },
);
