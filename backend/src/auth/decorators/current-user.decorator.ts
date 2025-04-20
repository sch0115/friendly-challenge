import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Custom decorator (@CurrentUser) to extract the authenticated user's information
 * from the request object, which was attached by the AuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DecodedIdToken | null => {
    const request = ctx.switchToHttp().getRequest();
    // Assumes AuthGuard attaches the decoded token to request.user
    return request.user || null;
  },
); 