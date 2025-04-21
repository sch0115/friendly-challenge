import { Timestamp } from 'firebase-admin/firestore';

export interface Activity {
  id?: string; // Firestore document ID
  name: string;
  description: string;
  pointValue: number;
  groupId: string; // Reference to the parent Group document ID
  createdBy: string; // User UID of the creator
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // Optional fields:
  // frequency?: 'daily' | 'weekly' | 'onetime';
  // category?: string;
  // isActive?: boolean;
} 