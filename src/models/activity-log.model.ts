import { Timestamp } from 'firebase-admin/firestore';

export interface ActivityLog {
  id?: string; // Firestore document ID
  userId: string; // UID of the user who logged the activity
  groupId: string; // ID of the group
  activityId: string; // ID of the logged activity
  activityName: string; // Denormalized activity name for display
  timestamp: Timestamp; // When the activity was logged
  points: number; // Points awarded for this specific log entry
  notes?: string; // Optional notes from the user
} 