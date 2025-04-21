import { Injectable, NotFoundException, InternalServerErrorException, Logger, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserProfile } from './interfaces/user-profile.interface';
import { FIREBASE_ADMIN } from '../firebase/firebase.constants';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseAdminInstance: admin.app.App) {}

  private get db(): admin.firestore.Firestore {
    return this.firebaseAdminInstance.firestore();
  }

  /**
   * Fetches a user profile from Firestore by UID.
   * @param uid The user's Firebase Authentication UID.
   * @returns The user profile data.
   * @throws NotFoundException if the profile does not exist.
   * @throws InternalServerErrorException on other Firestore errors.
   */
  async getProfile(uid: string): Promise<UserProfile> {
    this.logger.log(`Attempting to fetch profile for UID: ${uid}`);
    const userRef = this.db.collection('users').doc(uid);
    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        this.logger.warn(`Profile not found for UID: ${uid}`);
        throw new NotFoundException(`User profile not found for UID: ${uid}`);
      }
      this.logger.log(`Successfully fetched profile for UID: ${uid}`);
      // We cast here, assuming the data conforms to the interface.
      // Consider adding runtime validation (e.g., with class-validator) for robustness.
      return { uid, ...userDoc.data() } as UserProfile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch profile for UID: ${uid}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user profile.');
    }
  }

  /**
   * Creates a new user profile in Firestore using info from the decoded token.
   * Should typically only be called once per user, often during first login.
   * @param decodedToken The decoded Firebase ID token containing user info.
   * @throws InternalServerErrorException on Firestore errors.
   */
  async createProfileFromToken(decodedToken: admin.auth.DecodedIdToken): Promise<void> {
    const uid = decodedToken.uid;
    this.logger.log(`Attempting to create profile for UID: ${uid} from token`);
    const userRef = this.db.collection('users').doc(uid);
    
    // Extract basic info directly from the token (might be slightly stale but usually sufficient)
    const profileData: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'lastLogin'>> = {
        displayName: decodedToken.name || '', // Use 'name' field from token
        email: decodedToken.email || '',
        photoURL: decodedToken.picture || '', // Use 'picture' field from token
    };
    
    try {
      await userRef.set({
        ...profileData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(), // Set lastLogin on creation too
      });
      this.logger.log(`Successfully created profile for UID: ${uid}`);
    } catch (error) {
      this.logger.error(`Failed to create profile for UID: ${uid}`, error.stack);
      throw new InternalServerErrorException('Failed to create user profile.');
    }
  }

  /**
   * Updates an existing user profile in Firestore.
   * @param uid The user's Firebase Authentication UID.
   * @param profileData Data to update.
   * @throws NotFoundException if the profile does not exist.
   * @throws InternalServerErrorException on other Firestore errors.
   */
  async updateProfile(uid: string, profileData: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>): Promise<void> {
    this.logger.log(`Attempting to update profile for UID: ${uid}`);
    const userRef = this.db.collection('users').doc(uid);
    try {
      // Use update to ensure the document exists and avoid overwriting createdAt
      await userRef.update({
        ...profileData,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(), // Always update lastLogin on profile update
      });
      this.logger.log(`Successfully updated profile for UID: ${uid}`);
    } catch (error) {
       // Firestore 'update' throws an error if the document doesn't exist (code 5, NOT_FOUND)
      if (error.code === 5) {
         this.logger.warn(`Attempted to update non-existent profile for UID: ${uid}`);
         throw new NotFoundException(`User profile not found for UID: ${uid}`);
      }
      this.logger.error(`Failed to update profile for UID: ${uid}`, error.stack);
      throw new InternalServerErrorException('Failed to update user profile.');
    }
  }

  /**
   * Updates the last login timestamp for a user.
   * @param uid The user's Firebase Authentication UID.
   */
  async updateLastLogin(uid: string): Promise<void> {
    this.logger.log(`Updating last login for UID: ${uid}`);
    const userRef = this.db.collection('users').doc(uid);
     try {
        await userRef.update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        });
        this.logger.log(`Successfully updated last login for UID: ${uid}`);
     } catch (error) {
         // Log error but don't necessarily throw critical exception if profile doesn't exist yet
         // or if the update fails, as profile fetch/creation logic should handle existence.
         if (error.code === 5) {
             this.logger.warn(`Profile not found when attempting to update last login for UID: ${uid}. This might happen during initial login flow.`);
         } else {
             this.logger.error(`Failed to update last login for UID: ${uid}`, error.stack);
             // Optionally re-throw or handle differently depending on requirements
             // throw new InternalServerErrorException('Failed to update last login time.');
         }
     }
  }
}
