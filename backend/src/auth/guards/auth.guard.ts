import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { AuthService } from '../auth.service'; // Import AuthService
import { UserService } from '../../users/users.service'; // Import UserService

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService // Only inject UserService
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    this.logger.log('AuthGuard: canActivate called'); // Log entry
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('AuthGuard: Authorization token not found in header.'); // Log warning
      throw new UnauthorizedException('Authorization token not found');
    }
    this.logger.debug('AuthGuard: Token extracted from header.'); // Log debug

    try {
      const decodedToken = await this.authService.verifyToken(token);
      this.logger.log(`AuthGuard: Token verified for UID: ${decodedToken.uid}`);
      request['user'] = decodedToken; // Attach decoded token to request
      const uid = decodedToken.uid;

      // --- Start: Ensure User Profile Exists --- 
      this.logger.log(`AuthGuard: Checking/Ensuring profile exists for UID: ${uid}`);
      try {
        // Check if profile exists
        const profile = await this.userService.getProfile(uid);
        this.logger.log(`AuthGuard: Profile found for UID: ${uid}. Updating last login.`);
        // Profile exists, update last login (fire-and-forget)
        this.userService.updateLastLogin(uid).catch(err => {
          // Use warn for fire-and-forget failures unless critical
          this.logger.warn(`AuthGuard: Failed to update last login for ${uid}: ${err.message}`, err.stack);
        });
        // this.logger.log(`Profile found for ${uid}, updated last login.`); // Removed duplicate log

      } catch (error) {
        if (error instanceof NotFoundException) {
          // Profile not found, create it using info from the token
          this.logger.log(`AuthGuard: Profile not found for UID: ${uid}. Attempting creation...`);
          try {
            // Call the updated service method
            await this.userService.createProfileFromToken(decodedToken);
            this.logger.log(`AuthGuard: Successfully created profile for UID: ${uid}.`);
          } catch (creationError) {
            this.logger.error(`AuthGuard: Failed to CREATE profile from token for UID: ${uid}`, creationError.stack);
            // Decide if failure to create profile should block access
            throw new UnauthorizedException('Failed to create user profile during authentication.');
          }
        } else {
          // Unexpected error during profile check
          this.logger.error(`AuthGuard: Unexpected error CHECKING profile for UID: ${uid}: ${error.message}`, error.stack);
          throw new UnauthorizedException('Error checking user profile during authentication.');
        }
      }
      // --- End: Ensure User Profile Exists --- 
      this.logger.log(`AuthGuard: Profile ensured for UID: ${uid}. Granting access.`);
      return true; // Token is valid and profile ensured, allow access

    } catch (e) {
       if (e instanceof UnauthorizedException) {
         // Re-throw exceptions from verifyToken or our profile logic
         this.logger.warn(`AuthGuard: Unauthorized access attempt: ${e.message}`);
         throw e;
       } else if (e instanceof Error) {
         // Catch any other unexpected errors during token verification
         this.logger.error(`AuthGuard: Unexpected error during token verification/profile check: ${e.message}`, e.stack);
         throw new UnauthorizedException('Authentication failed due to an unexpected error.');
       } else {
         this.logger.error(`AuthGuard: Unexpected non-Error object thrown during auth: ${e}`);
         throw new UnauthorizedException('Authentication failed due to an unknown error.');
       }
    }
    // This line should not be reached due to throws in catch blocks
    // return false;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ') ?? [];
    const result = type === 'Bearer' ? token : undefined;
    this.logger.debug(`extractTokenFromHeader result: ${result ? 'Token Found' : 'No Bearer Token'}`);
    return result;
  }
} 