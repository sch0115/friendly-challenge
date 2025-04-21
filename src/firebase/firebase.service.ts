import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private _firestore: admin.firestore.Firestore;
  private _auth: admin.auth.Auth;

  onModuleInit() {
    try {
      // Initialize Firebase Admin SDK
      // Ensure FIREBASE_SERVICE_ACCOUNT environment variable is set correctly
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
      }
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Optionally add databaseURL if needed: process.env.FIREBASE_DATABASE_URL,
      });

      this._firestore = admin.firestore();
      this._auth = admin.auth();

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error.stack);
      throw error; // Re-throw to prevent the app from starting incorrectly
    }
  }

  get firestore(): admin.firestore.Firestore {
    return this._firestore;
  }

  get auth(): admin.auth.Auth {
    return this._auth;
  }
} 