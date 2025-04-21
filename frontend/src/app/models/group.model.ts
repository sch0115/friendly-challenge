import { Timestamp } from 'firebase/firestore'; // Use client-side timestamp

// Interface matching the backend GroupMember structure
export interface GroupMember {
  uid: string;       // User ID
  role: 'creator' | 'admin' | 'member'; // User's role in the group
  joinedAt: Timestamp; // When the user joined
}

// Interface matching the backend Group structure
export interface Group {
  id?: string; // Firestore document ID
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  createdBy: string; // User UID of the creator
  createdAt: Timestamp;
  // The backend service returns the members array (simplified)
  // If the full member details (incl. roles) are needed from the subcollection,
  // the backend API would need adjustment or separate calls.
  members?: GroupMember[]; // Array of members (could be simplified based on API response)
  // Optional counts (if added to backend)
  memberCount?: number;
  activityCount?: number;
} 