export interface Group {
  id: string; // Or number, depending on backend
  name: string;
  description?: string;
  members?: string[]; // Assuming member IDs or usernames
  visibility: 'public' | 'private'; // Added visibility
  membersCount?: number; // Added optional membersCount
  // Add other relevant fields based on the backend API
} 