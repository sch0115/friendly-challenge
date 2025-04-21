import { Injectable, Logger, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from '../models/activity.model';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);
  private readonly groupsCollection = 'groups';
  private readonly activitiesSubcollection = 'activities';

  constructor(private readonly firebaseService: FirebaseService) {}

  // Helper to check if user is creator/admin of a group
  private async isUserGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    try {
      const memberDoc = await this.firebaseService.firestore
        .collection(this.groupsCollection)
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .get();

      if (!memberDoc.exists) return false;
      const memberData = memberDoc.data();
      return memberData?.role === 'creator' || memberData?.role === 'admin';
    } catch (error) {
      this.logger.error(`Error checking admin status for user ${userId} in group ${groupId}`, error.stack);
      return false; // Default to false on error
    }
  }

  async createActivity(groupId: string, createActivityDto: CreateActivityDto, userId: string): Promise<Activity> {
    // Authorization check: Ensure user is admin/creator of the group
    if (!(await this.isUserGroupAdmin(groupId, userId))) {
      throw new ForbiddenException('User is not authorized to add activities to this group.');
    }

    const firestore = this.firebaseService.firestore;
    const activitiesRef = firestore.collection(this.groupsCollection).doc(groupId).collection(this.activitiesSubcollection);

    const newActivityData: Omit<Activity, 'id'> = {
      ...createActivityDto,
      groupId: groupId,
      createdBy: userId,
      createdAt: Timestamp.now(),
    };

    try {
      const docRef = await activitiesRef.add(newActivityData);
      this.logger.log(`Activity created successfully with ID: ${docRef.id} in group ${groupId}`);
      return { id: docRef.id, ...newActivityData };
    } catch (error) {
      this.logger.error(`Failed to create activity in group ${groupId}`, error.stack);
      throw new InternalServerErrorException('Could not create activity.');
    }
  }

  async getActivitiesByGroup(groupId: string): Promise<Activity[]> {
    this.logger.log(`Fetching activities for group: ${groupId}`);
    try {
      const activitiesRef = this.firebaseService.firestore
        .collection(this.groupsCollection)
        .doc(groupId)
        .collection(this.activitiesSubcollection)
        .orderBy('createdAt', 'desc'); // Example order

      const snapshot = await activitiesRef.get();
      if (snapshot.empty) {
        return [];
      }
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      return activities;
    } catch (error) {
      this.logger.error(`Failed to fetch activities for group ${groupId}`, error.stack);
      throw new InternalServerErrorException('Could not fetch activities.');
    }
  }

  async getActivityById(groupId: string, activityId: string): Promise<Activity> {
     this.logger.log(`Fetching activity ${activityId} from group ${groupId}`);
     try {
        const docRef = this.firebaseService.firestore
            .collection(this.groupsCollection)
            .doc(groupId)
            .collection(this.activitiesSubcollection)
            .doc(activityId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            throw new NotFoundException(`Activity with ID ${activityId} not found in group ${groupId}`);
        }
        return { id: docSnap.id, ...docSnap.data() } as Activity;
     } catch (error) {
        if (error instanceof NotFoundException) throw error;
        this.logger.error(`Failed to fetch activity ${activityId} from group ${groupId}`, error.stack);
        throw new InternalServerErrorException('Could not fetch activity.');
     }
  }

  async updateActivity(groupId: string, activityId: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<Activity> {
    // Authorization check
    if (!(await this.isUserGroupAdmin(groupId, userId))) {
      throw new ForbiddenException('User is not authorized to update activities in this group.');
    }

    const activityRef = this.firebaseService.firestore
      .collection(this.groupsCollection)
      .doc(groupId)
      .collection(this.activitiesSubcollection)
      .doc(activityId);

    try {
      const docSnap = await activityRef.get();
      if (!docSnap.exists) {
        throw new NotFoundException(`Activity with ID ${activityId} not found in group ${groupId}`);
      }

      const updateData = { ...updateActivityDto, updatedAt: Timestamp.now() };
      await activityRef.update(updateData);
      this.logger.log(`Activity ${activityId} updated successfully in group ${groupId}`);
      // Return the updated activity data
      return { id: activityId, ...docSnap.data(), ...updateData } as Activity;
    } catch (error) {
       if (error instanceof NotFoundException) throw error;
       this.logger.error(`Failed to update activity ${activityId} in group ${groupId}`, error.stack);
       throw new InternalServerErrorException('Could not update activity.');
    }
  }

  async deleteActivity(groupId: string, activityId: string, userId: string): Promise<void> {
    // Authorization check
    if (!(await this.isUserGroupAdmin(groupId, userId))) {
      throw new ForbiddenException('User is not authorized to delete activities from this group.');
    }

    const activityRef = this.firebaseService.firestore
      .collection(this.groupsCollection)
      .doc(groupId)
      .collection(this.activitiesSubcollection)
      .doc(activityId);

    try {
       const docSnap = await activityRef.get();
        if (!docSnap.exists) {
            throw new NotFoundException(`Activity with ID ${activityId} not found in group ${groupId}`);
        }
      await activityRef.delete();
      this.logger.log(`Activity ${activityId} deleted successfully from group ${groupId}`);
    } catch (error) {
        if (error instanceof NotFoundException) throw error;
       this.logger.error(`Failed to delete activity ${activityId} from group ${groupId}`, error.stack);
       throw new InternalServerErrorException('Could not delete activity.');
    }
  }

}
