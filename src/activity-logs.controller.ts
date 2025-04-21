import { Controller, Post, Body, Req, UseGuards, ValidationPipe, HttpCode, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { ActivityLogsService, ActivityLogQueryDto } from './activity-logs.service';
import { CreateActivityLogDto } from './activity-logs/dto/create-activity-log.dto';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ActivityLog } from './models/activity-log.model';
// We might need GroupMemberGuard if we add group-specific endpoints accessible by members
// import { GroupMemberGuard } from './auth/group-member.guard';

@ApiTags('activity-logs')
@ApiBearerAuth() // Indicate that endpoints require Bearer token authentication
@UseGuards(FirebaseAuthGuard) // Apply Firebase auth guard to all endpoints in this controller
@Controller('activity-logs')
export class ActivityLogsController {
    constructor(private readonly activityLogsService: ActivityLogsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Log a completed activity for the authenticated user' })
    @ApiResponse({ status: 201, description: 'Activity log created successfully.', type: ActivityLog })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden. User not a member of the group.' })
    @ApiResponse({ status: 404, description: 'Group or Activity not found.' })
    async createLog(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createLogDto: CreateActivityLogDto,
        @Req() req: any,
    ): Promise<ActivityLog> {
        const userId = req.user.uid; // Get user ID from the authenticated request
        return this.activityLogsService.createLog(createLogDto, userId);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get activity logs for the authenticated user' })
    @ApiQuery({ name: 'groupId', required: false, description: 'Filter logs by a specific group ID', type: String })
    @ApiQuery({ name: 'startDate', required: false, description: 'Filter logs starting from this date (YYYY-MM-DD)', type: String })
    @ApiQuery({ name: 'endDate', required: false, description: 'Filter logs up to this date (YYYY-MM-DD)', type: String })
    @ApiQuery({ name: 'limit', required: false, description: 'Limit the number of results', type: Number })
    @ApiResponse({ status: 200, description: 'List of user's activity logs.', type: [ActivityLog] })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden when querying a group user is not part of.' })
    async getMyLogs(
        @Req() req: any,
        @Query('groupId') groupId?: string,
        @Query() queryParams?: ActivityLogQueryDto, // Capture other query params
    ): Promise<ActivityLog[]> {
        const userId = req.user.uid;
        // Ensure queryParams are handled correctly if groupId is also present
        const actualQueryParams = { ...queryParams };
        delete actualQueryParams['groupId']; // Avoid duplication if passed explicitly

        return this.activityLogsService.getLogsByUser(userId, groupId, actualQueryParams);
    }

    // Endpoint to get logs for a specific group (requires membership)
    @Get('group/:groupId')
    // Apply GroupMemberGuard here if strict membership check needed *before* service call
    // @UseGuards(GroupMemberGuard) // Alternatively, service layer handles this check
    @ApiOperation({ summary: 'Get all activity logs for a specific group' })
    @ApiParam({ name: 'groupId', description: 'ID of the group to fetch logs for', type: String })
    @ApiQuery({ name: 'startDate', required: false, description: 'Filter logs starting from this date (YYYY-MM-DD)', type: String })
    @ApiQuery({ name: 'endDate', required: false, description: 'Filter logs up to this date (YYYY-MM-DD)', type: String })
    @ApiQuery({ name: 'limit', required: false, description: 'Limit the number of results', type: Number })
    @ApiResponse({ status: 200, description: 'List of activity logs for the group.', type: [ActivityLog] })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden. User is not a member of the group.' })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    async getGroupLogs(
        @Param('groupId') groupId: string,
        @Req() req: any,
        @Query() queryParams?: ActivityLogQueryDto,
    ): Promise<ActivityLog[]> {
        const userId = req.user.uid; // Pass userId for membership check in service
        return this.activityLogsService.getLogsByGroup(groupId, userId, queryParams);
    }

    // Placeholder endpoints for Update/Delete can be added here later
    // Example:
    // @Put(':logId/notes')
    // @ApiOperation({ summary: 'Update notes on an activity log' })
    // async updateNotes(...) { ... }

    // @Delete(':logId')
    // @ApiOperation({ summary: 'Delete an activity log' })
    // async deleteLog(...) { ... }

} 