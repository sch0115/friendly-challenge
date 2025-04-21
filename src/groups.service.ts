import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Group, GroupMember } from '../models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);
  private readonly groupsCollection = 'groups';

  constructor(private readonly firebaseService: FirebaseService) {}

  async createGroup(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const firestore = this.firebaseService.firestore;
    const groupsRef = firestore.collection(this.groupsCollection);

    const now = Timestamp.now();

    // Create the initial member (creator)
    const creatorMember: GroupMember = {
      uid: userId,
      role: 'creator',
      joinedAt: now,
    };

    const newGroupData: Omit<Group, 'id'> = {
      ...createGroupDto,
      createdBy: userId,
      createdAt: now,
      members: [creatorMember], // Start with only the creator
      // Initialize optional counts if desired
      // memberCount: 1,
      // activityCount: 0,
    };

    try {
      const groupDocRef = await groupsRef.add(newGroupData);

      // Add the creator to the members subcollection as well
      const memberRef = groupDocRef.collection('members').doc(userId);
      await memberRef.set(creatorMember);

      this.logger.log(`Group created successfully with ID: ${groupDocRef.id} by user ${userId}`);
      return { id: groupDocRef.id, ...newGroupData };

    } catch (error) {
      this.logger.error(`Failed to create group for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Could not create group.');
    }
  }

  // Placeholder for findGroupById
  async findGroupById(groupId: string): Promise<Group | null> {
    this.logger.log(`Fetching group with ID: ${groupId}`);
    try {
      const docRef = this.firebaseService.firestore.collection(this.groupsCollection).doc(groupId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
      // Consider fetching members from subcollection if needed for display
      return { id: docSnap.id, ...docSnap.data() } as Group;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch group ${groupId}`, error.stack);
      throw new InternalServerErrorException('Could not fetch group.');
    }
  }

  // Placeholder for findGroupsByUser (more complex query)
  async findGroupsByUser(userId: string): Promise<Group[]> {
    this.logger.log(`Fetching groups for user: ${userId}`);
    try {
      const groupsRef = this.firebaseService.firestore.collection(this.groupsCollection);
      // Query based on the 'members' subcollection - requires composite index on members subcollection
      // Or query based on the `members` array field if using that approach
      // Example using array field (less scalable):
      // const querySnapshot = await groupsRef.where('members', 'array-contains', { uid: userId, role: 'member' /* Adjust based on actual structure */ }).get();
      // Example querying based on subcollection existence (more complex client-side or requires separate user->groups mapping)
      // This example assumes a simple query for groups created by the user for now
      const querySnapshot = await groupsRef.where('createdBy', '==', userId).get();

      const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
      return groups;
    } catch (error) {
      this.logger.error(`Failed to fetch groups for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Could not fetch groups.');
    }
  }

  // Placeholder for updateGroup
  async updateGroup(groupId: string, updateData: Partial<Group>, userId: string): Promise<void> {
     this.logger.warn(`updateGroup not fully implemented. Called by ${userId} for group ${groupId}`);
    // Add authorization checks (is user creator/admin?)
    // Implement update logic
    // ...
    return Promise.resolve();
  }

  // Placeholder for deleteGroup
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    this.logger.warn(`deleteGroup not fully implemented. Called by ${userId} for group ${groupId}`);
    // Add authorization checks (is user creator/admin?)
    // Implement delete logic (consider soft delete)
    // Remember to delete subcollections if necessary (e.g., members)
    // ...
    return Promise.resolve();
  }
}
