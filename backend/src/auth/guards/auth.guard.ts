import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service'; // Import AuthService

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }
    try {
      // Verify the token using AuthService
      const decodedToken = await this.authService.verifyToken(token);
      // Attach the decoded token (which includes user info) to the request object
      // You might want to attach only specific user details (e.g., user ID) for security/simplicity
      request['user'] = decodedToken; // Standard practice is to attach to request.user
    } catch (e) {
      // AuthService.verifyToken throws UnauthorizedException on failure
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true; // Token is valid, allow access
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 