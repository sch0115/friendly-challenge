import { Injectable, Logger, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ActivitiesService } from '../activities.service'; // To fetch activity details
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLog } from '../models/activity-log.model';
import { Timestamp } from 'firebase-admin/firestore';

// Define a type for query parameters, adjust as needed
export interface ActivityLogQueryDto {
    startDate?: string;
    endDate?: string;
    limit?: number;
    // Add other potential filters like activityId?
}

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);
  private readonly logsCollection = 'activityLogs';
  private readonly groupsCollection = 'groups';
  private readonly membersSubcollection = 'members';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly activitiesService: ActivitiesService, // Inject ActivitiesService
  ) {}

  // Helper to check group membership
  private async isUserGroupMember(groupId: string, userId: string): Promise<boolean> {
     try {
      const memberDoc = await this.firebaseService.firestore
        .collection(this.groupsCollection)
        .doc(groupId)
        .collection(this.membersSubcollection)
        .doc(userId)
        .get();
      return memberDoc.exists;
    } catch (error) {
      this.logger.error(`Error checking membership for user ${userId} in group ${groupId}`, error.stack);
      return false; // Default to false on error
    }
  }

  async createLog(createLogDto: CreateActivityLogDto, userId: string): Promise<ActivityLog> {
    const { groupId, activityId, notes } = createLogDto;

    // 1. Validate Group Membership
    if (!(await this.isUserGroupMember(groupId, userId))) {
        throw new ForbiddenException('User is not a member of the specified group.');
    }

    // 2. Validate Activity Existence and get details
    let activity;
    try {
        activity = await this.activitiesService.getActivityById(groupId, activityId);
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw new NotFoundException(`Activity with ID ${activityId} not found in group ${groupId}`);
        }
        throw error; // Re-throw other errors
    }

    // 3. Prepare Log Data
    const logData: Omit<ActivityLog, 'id'> = {
      userId,
      groupId,
      activityId,
      activityName: activity.name, // Denormalized name
      timestamp: Timestamp.now(),
      points: activity.pointValue, // Points from the activity definition
      ...(notes && { notes }), // Add notes if provided
    };

    // 4. Save Log
    const firestore = this.firebaseService.firestore;
    try {
      const docRef = await firestore.collection(this.logsCollection).add(logData);
      this.logger.log(`Activity log created successfully with ID: ${docRef.id} by user ${userId}`);
      return { id: docRef.id, ...logData };
    } catch (error) {
      this.logger.error(`Failed to create activity log for user ${userId} in group ${groupId}`, error.stack);
      throw new InternalServerErrorException('Could not create activity log.');
    }

    // TODO: Consider updating aggregated user points (e.g., in user profile or group member doc) in a transaction or via Cloud Function
  }

  // Fetch logs for a specific user (optionally filtered by group)
  async getLogsByUser(userId: string, groupId?: string, queryParams?: ActivityLogQueryDto): Promise<ActivityLog[]> {
    this.logger.log(`Fetching logs for user: ${userId}${groupId ? ' in group ' + groupId : ''}`);
    const firestore = this.firebaseService.firestore;
    let query: FirebaseFirestore.Query = firestore.collection(this.logsCollection)
                                                .where('userId', '==', userId);

    if (groupId) {
        // Before querying group logs, ensure user is member (optional, depends on access control needs)
         if (!(await this.isUserGroupMember(groupId, userId))) {
             // Depending on requirements, could throw ForbiddenException or just return empty array
            this.logger.warn(`User ${userId} attempted to query logs for group ${groupId} they are not a member of.`);
            return [];
         }
        query = query.where('groupId', '==', groupId);
    }

    // Apply optional time filters
    if (queryParams?.startDate) {
        query = query.where('timestamp', '>=', Timestamp.fromDate(new Date(queryParams.startDate)));
    }
    if (queryParams?.endDate) {
        query = query.where('timestamp', '<=', Timestamp.fromDate(new Date(queryParams.endDate)));
    }

    query = query.orderBy('timestamp', 'desc'); // Default order

    if (queryParams?.limit) {
        query = query.limit(queryParams.limit > 0 ? queryParams.limit : 20); // Default limit
    }

    try {
        const snapshot = await query.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
    } catch (error) {
        this.logger.error(`Failed to fetch logs for user ${userId}`, error.stack);
        throw new InternalServerErrorException('Could not fetch activity logs.');
    }
  }

  // Fetch all logs for a specific group (requires user to be a member)
  async getLogsByGroup(groupId: string, userId: string, queryParams?: ActivityLogQueryDto): Promise<ActivityLog[]> {
     this.logger.log(`Fetching logs for group: ${groupId} by user ${userId}`);
     // Ensure user is member
     if (!(await this.isUserGroupMember(groupId, userId))) {
        throw new ForbiddenException('User is not a member of this group.');
     }

     const firestore = this.firebaseService.firestore;
     let query: FirebaseFirestore.Query = firestore.collection(this.logsCollection)
                                                 .where('groupId', '==', groupId);

     // Apply optional time filters
    if (queryParams?.startDate) {
        query = query.where('timestamp', '>=', Timestamp.fromDate(new Date(queryParams.startDate)));
    }
    if (queryParams?.endDate) {
        query = query.where('timestamp', '<=', Timestamp.fromDate(new Date(queryParams.endDate)));
    }

    query = query.orderBy('timestamp', 'desc'); // Default order

    if (queryParams?.limit) {
        query = query.limit(queryParams.limit > 0 ? queryParams.limit : 20); // Default limit
    }

    try {
        const snapshot = await query.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
    } catch (error) {
        this.logger.error(`Failed to fetch logs for group ${groupId}`, error.stack);
        throw new InternalServerErrorException('Could not fetch activity logs.');
    }
  }

   // Placeholder for updating notes on a log (if allowed)
  async updateLogNotes(logId: string, notes: string, userId: string): Promise<ActivityLog> {
    this.logger.warn(`updateLogNotes not fully implemented. Called by ${userId} for log ${logId}`);
    const logRef = this.firebaseService.firestore.collection(this.logsCollection).doc(logId);
    // Add checks: ensure user owns the log, use security rules for validation
    await logRef.update({ notes: notes, updatedAt: Timestamp.now() });
    const updatedDoc = await logRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as ActivityLog;
  }

  // Placeholder for deleting a log (if allowed)
  async deleteLog(logId: string, userId: string): Promise<void> {
      this.logger.warn(`deleteLog not fully implemented. Called by ${userId} for log ${logId}`);
     const logRef = this.firebaseService.firestore.collection(this.logsCollection).doc(logId);
     // Add checks: ensure user owns the log (or is admin), use security rules
     await logRef.delete();
  }
} 