import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Group, GroupMember } from '../models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);
  private readonly groupsCollection = 'groups';
  private readonly membersSubcollection = 'members'; // Define subcollection name

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
      const memberRef = groupDocRef.collection(this.membersSubcollection).doc(userId);
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

  // Find all groups a user is a member of
  async findGroupsByUser(userId: string): Promise<Group[]> {
    this.logger.log(`Fetching groups where user ${userId} is a member`);
    const firestore = this.firebaseService.firestore;
    const groups: Group[] = [];

    try {
      // Perform a collection group query on the 'members' subcollection
      // IMPORTANT: Requires a Firestore index on the 'members' collection group, filtering on 'uid'
      // Example index definition (firestore.indexes.json):
      // {
      //   "collectionGroup": "members",
      //   "queryScope": "COLLECTION_GROUP",
      //   "fields": [
      //     { "fieldPath": "uid", "order": "ASCENDING" }
      //   ]
      // }
      const membersQuerySnapshot = await firestore
        .collectionGroup(this.membersSubcollection)
        .where('uid', '==', userId)
        .get();

      if (membersQuerySnapshot.empty) {
        this.logger.log(`User ${userId} is not a member of any groups.`);
        return [];
      }

      // Get the parent group document for each membership found
      const groupPromises = membersQuerySnapshot.docs.map(memberDoc => {
        const groupRef = memberDoc.ref.parent.parent; // Get the parent document reference (the group)
        if (!groupRef) {
             this.logger.warn(`Could not get parent group reference for member doc ${memberDoc.id}`);
             return null;
        }
        return groupRef.get();
      });

      const groupSnapshots = await Promise.all(groupPromises);

      groupSnapshots.forEach(groupSnap => {
        if (groupSnap?.exists) {
          groups.push({ id: groupSnap.id, ...groupSnap.data() } as Group);
        }
      });

      // Optional: Sort groups (e.g., by creation date)
      groups.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      return groups;
    } catch (error) {
      this.logger.error(`Failed to fetch groups for user ${userId} using collection group query`, error.stack);
      // Check for specific Firestore errors (e.g., index missing)
      if (error.code === 'FAILED_PRECONDITION' && error.message.includes('index')) {
          this.logger.error('Firestore index missing for members collection group query on uid.');
          throw new InternalServerErrorException('Database query configuration error. Index required.');
      }
      throw new InternalServerErrorException('Could not fetch user groups.');
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
