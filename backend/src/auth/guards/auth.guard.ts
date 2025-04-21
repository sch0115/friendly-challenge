import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service'; // Import AuthService
import { UserService } from '../../users/users.service'; // Import UserService

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService // Only inject UserService
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }
    try {
      const decodedToken = await this.authService.verifyToken(token);
      request['user'] = decodedToken; // Attach decoded token to request
      const uid = decodedToken.uid;

      // --- Start: Ensure User Profile Exists --- 
      try {
        // Check if profile exists
        await this.userService.getProfile(uid);
        // Profile exists, update last login (fire-and-forget)
        this.userService.updateLastLogin(uid).catch(err => {
          this.logger.error(`Failed to update last login for ${uid} during guard check: ${err.message}`, err.stack);
        });
        this.logger.log(`Profile found for ${uid}, updated last login.`);

      } catch (error) {
        if (error instanceof NotFoundException) {
          // Profile not found, create it using info from the token
          this.logger.log(`Profile not found for ${uid}. Creating new profile from token...`);
          try {
            // Call the updated service method
            await this.userService.createProfileFromToken(decodedToken);
            this.logger.log(`Successfully created profile for ${uid}.`);
          } catch (creationError) {
            this.logger.error(`Failed create profile from token for UID: ${uid}`, creationError.stack);
            // Decide if failure to create profile should block access
            throw new UnauthorizedException('Failed to create user profile during authentication.');
          }
        } else {
          // Unexpected error during profile check
          this.logger.error(`Unexpected error checking profile for ${uid}: ${error.message}`, error.stack);
          throw new UnauthorizedException('Error checking user profile during authentication.');
        }
      }
      // --- End: Ensure User Profile Exists --- 

    } catch (e) {
       if (e instanceof UnauthorizedException) {
         // Re-throw exceptions from verifyToken or our profile logic
         throw e;
       } else {
         // Catch any other unexpected errors during token verification
         this.logger.error(`Unexpected error during token verification: ${e.message}`, e.stack);
         throw new UnauthorizedException('Authentication failed due to an unexpected error.');
       }
    }
    return true; // Token is valid and profile ensured, allow access
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 