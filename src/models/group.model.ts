import { Timestamp } from 'firebase-admin/firestore';

export interface GroupMember {
  uid: string;
  role: 'creator' | 'admin' | 'member'; // Example roles
  joinedAt: Timestamp;
}

export interface Group {
  id?: string; // Firestore document ID
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  tags?: string[];
  createdAt: Timestamp;
  createdBy: string; // User UID
  members: GroupMember[];
  // Add other relevant fields as needed, e.g.:
  // activityCount?: number;
  // memberCount?: number;
  // lastActivityAt?: Timestamp;
} 