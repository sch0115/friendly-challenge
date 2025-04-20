import * as admin from 'firebase-admin';

/**
 * Represents the structure of a user profile document in Firestore.
 */
export interface UserProfile {
  uid: string; // Matches the Firebase Auth UID and the document ID
  displayName: string;
  email: string; // Should match the Firebase Auth email, primarily for lookup/display
  photoURL: string;
  createdAt: admin.firestore.Timestamp; // Timestamp of initial profile creation
  lastLogin: admin.firestore.Timestamp; // Timestamp of the last login event
  description?: string; // Optional user-provided description or bio
  motivationalText?: string; // Optional user-provided motivational text
} 