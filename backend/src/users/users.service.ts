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
        this.logger.warn(`[${uid}] Profile not found.`);
        throw new NotFoundException(`User profile not found for UID: ${uid}`);
      }
      const profile = { uid, ...userDoc.data() } as UserProfile;
      this.logger.log(`[${uid}] Successfully fetched profile.`);
      this.logger.debug(`[${uid}] Profile data: ${JSON.stringify(profile)}`);
      return profile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`[${uid}] getProfile failed: ${error.message}`);
        throw error;
      }
      this.logger.error(`[${uid}] Failed to fetch profile: ${error.message}`, error.stack);
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
    this.logger.log(`[${uid}] Attempting to create profile from token`);
    const userRef = this.db.collection('users').doc(uid);
    
    const profileData: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'lastLogin'>> = {
        displayName: decodedToken.name || 'Anonymous User',
        email: decodedToken.email || 'No Email Provided',
        photoURL: decodedToken.picture || 'assets/default-avatar.png',
    };
    this.logger.debug(`[${uid}] Profile data from token: ${JSON.stringify(profileData)}`);
    
    try {
      const fullProfile = {
        ...profileData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      };
      await userRef.set(fullProfile);
      this.logger.log(`[${uid}] Successfully created profile.`);
    } catch (error) {
      this.logger.error(`[${uid}] Failed to create profile: ${error.message}`, error.stack);
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
    this.logger.log(`[${uid}] Attempting to update profile.`);
    this.logger.debug(`[${uid}] Update data: ${JSON.stringify(profileData)}`);
    const userRef = this.db.collection('users').doc(uid);
    try {
      const updatePayload = {
        ...profileData,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      };
      await userRef.update(updatePayload);
      this.logger.log(`[${uid}] Successfully updated profile.`);
    } catch (error) {
      if (error.code === 5) {
         this.logger.warn(`[${uid}] Attempted to update non-existent profile.`);
         throw new NotFoundException(`User profile not found for UID: ${uid}`);
      }
      this.logger.error(`[${uid}] Failed to update profile: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update user profile.');
    }
  }

  /**
   * Updates the last login timestamp for a user.
   * @param uid The user's Firebase Authentication UID.
   */
  async updateLastLogin(uid: string): Promise<void> {
    this.logger.log(`[${uid}] Attempting to update last login timestamp.`);
    const userRef = this.db.collection('users').doc(uid);
     try {
        await userRef.update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        });
        this.logger.log(`[${uid}] Successfully updated last login.`);
     } catch (error) {
         if (error.code === 5) {
             this.logger.warn(`[${uid}] Profile not found when attempting to update last login. This might happen during initial login flow.`);
         } else {
             this.logger.error(`[${uid}] Failed to update last login: ${error.message}`, error.stack);
         }
     }
  }
}
