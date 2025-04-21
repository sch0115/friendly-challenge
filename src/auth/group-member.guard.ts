import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class GroupMemberGuard implements CanActivate {
  private readonly logger = new Logger(GroupMemberGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.uid; // Assumes user is attached by FirebaseAuthGuard
    const groupId = request.params.groupId; // Assumes groupId is a route parameter

    if (!userId) {
      this.logger.warn('No user ID found on request in GroupMemberGuard');
      throw new ForbiddenException('Authentication required.');
    }

    if (!groupId) {
      this.logger.warn('No groupId found in route parameters in GroupMemberGuard');
      // Or handle differently if groupId might come from body/query
      throw new NotFoundException('Group context not found.');
    }

    try {
      const memberDoc = await this.firebaseService.firestore
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .get();

      if (!memberDoc.exists) {
         this.logger.debug(`User ${userId} is not a member of group ${groupId}`);
        throw new ForbiddenException('User is not a member of this group.');
      }
      // Optional: Check for specific roles if needed for the endpoint
      // const memberData = memberDoc.data();
      // if (!['creator', 'admin', 'member'].includes(memberData.role)) {
      //   throw new ForbiddenException('Insufficient permissions within the group.');
      // }

      return true; // User is a member
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error checking membership for user ${userId} in group ${groupId}`, error.stack);
      throw new InternalServerErrorException('Error verifying group membership.');
    }
  }
}

// Specific guard for Creator/Admin roles
@Injectable()
export class GroupAdminGuard implements CanActivate {
  private readonly logger = new Logger(GroupAdminGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.uid;
    const groupId = request.params.groupId;

    if (!userId) {
      this.logger.warn('No user ID found on request in GroupAdminGuard');
      throw new ForbiddenException('Authentication required.');
    }
    if (!groupId) {
        this.logger.warn('No groupId found in route parameters in GroupAdminGuard');
        throw new NotFoundException('Group context not found.');
    }

    try {
      const memberDoc = await this.firebaseService.firestore
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .get();

      if (!memberDoc.exists) {
         this.logger.debug(`User ${userId} is not a member of group ${groupId}`);
         throw new ForbiddenException('User is not a member of this group.');
      }

      const memberData = memberDoc.data();
      if (memberData?.role !== 'creator' && memberData?.role !== 'admin') {
        this.logger.debug(`User ${userId} is not admin/creator of group ${groupId}. Role: ${memberData?.role}`);
        throw new ForbiddenException('User does not have sufficient permissions in this group.');
      }

      return true; // User is creator or admin
    } catch (error) {
        if (error instanceof ForbiddenException || error instanceof NotFoundException) {
            throw error;
        }
      this.logger.error(`Error checking admin status for user ${userId} in group ${groupId}`, error.stack);
      throw new InternalServerErrorException('Error verifying group permissions.');
    }
  }
} 