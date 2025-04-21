import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GroupMemberGuard, GroupAdminGuard } from '../auth/group-member.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Activity } from '../models/activity.model';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post('groups/:groupId/activities')
  @UseGuards(GroupAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new activity within a group' })
  @ApiParam({ name: 'groupId', description: 'ID of the group', type: String })
  @ApiResponse({ status: 201, description: 'Activity created successfully.', type: Activity })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not admin/creator of the group.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async create(
    @Param('groupId') groupId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createActivityDto: CreateActivityDto,
    @Req() req: any,
  ): Promise<Activity> {
    const userId = req.user.uid;
    return this.activitiesService.createActivity(groupId, createActivityDto, userId);
  }

  @Get('groups/:groupId/activities')
  @UseGuards(GroupMemberGuard)
  @ApiOperation({ summary: 'Get all activities for a specific group' })
  @ApiParam({ name: 'groupId', description: 'ID of the group', type: String })
  @ApiResponse({ status: 200, description: 'List of activities.', type: [Activity] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not a member of the group.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async findAllByGroup(@Param('groupId') groupId: string): Promise<Activity[]> {
    return this.activitiesService.getActivitiesByGroup(groupId);
  }

  @Get('groups/:groupId/activities/:activityId')
  @UseGuards(GroupMemberGuard)
  @ApiOperation({ summary: 'Get a specific activity by ID within a group' })
  @ApiParam({ name: 'groupId', description: 'ID of the group', type: String })
  @ApiParam({ name: 'activityId', description: 'ID of the activity', type: String })
  @ApiResponse({ status: 200, description: 'Activity details.', type: Activity })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not a member of the group.' })
  @ApiResponse({ status: 404, description: 'Group or Activity not found.' })
  async findOne(
      @Param('groupId') groupId: string,
      @Param('activityId') activityId: string
    ): Promise<Activity> {
    return this.activitiesService.getActivityById(groupId, activityId);
  }

  @Put('groups/:groupId/activities/:activityId')
  @UseGuards(GroupAdminGuard)
  @ApiOperation({ summary: 'Update an existing activity within a group' })
  @ApiParam({ name: 'groupId', description: 'ID of the group', type: String })
  @ApiParam({ name: 'activityId', description: 'ID of the activity to update', type: String })
  @ApiResponse({ status: 200, description: 'Activity updated successfully.', type: Activity })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not admin/creator of the group.' })
  @ApiResponse({ status: 404, description: 'Group or Activity not found.' })
  async update(
    @Param('groupId') groupId: string,
    @Param('activityId') activityId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) updateActivityDto: UpdateActivityDto,
    @Req() req: any,
  ): Promise<Activity> {
    const userId = req.user.uid;
    return this.activitiesService.updateActivity(groupId, activityId, updateActivityDto, userId);
  }

  @Delete('groups/:groupId/activities/:activityId')
  @UseGuards(GroupAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity within a group' })
  @ApiParam({ name: 'groupId', description: 'ID of the group', type: String })
  @ApiParam({ name: 'activityId', description: 'ID of the activity to delete', type: String })
  @ApiResponse({ status: 204, description: 'Activity deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not admin/creator of the group.' })
  @ApiResponse({ status: 404, description: 'Group or Activity not found.' })
  async remove(
      @Param('groupId') groupId: string,
      @Param('activityId') activityId: string,
      @Req() req: any,
    ): Promise<void> {
    const userId = req.user.uid;
    return this.activitiesService.deleteActivity(groupId, activityId, userId);
  }
}
