import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firebaseAdmin } from '../../firebase/firebase.config'; // Import initialized Firebase Admin SDK
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  private readonly firebaseAuth = firebaseAdmin.auth();

  /**
   * Verifies a Firebase ID token.
   * @param token The Firebase ID token string.
   * @returns The decoded ID token if valid.
   * @throws UnauthorizedException if the token is invalid or expired.
   */
  async verifyToken(token: string): Promise<DecodedIdToken> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      // Remove "Bearer " prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decodedToken = await this.firebaseAuth.verifyIdToken(cleanToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
