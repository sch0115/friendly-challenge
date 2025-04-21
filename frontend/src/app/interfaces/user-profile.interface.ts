/**
 * Represents the structure of a user profile as received from the backend.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string | Date; // Firestore Timestamps often serialize to strings
  lastLogin: string | Date;
  description?: string;
  motivationalText?: string;
} 