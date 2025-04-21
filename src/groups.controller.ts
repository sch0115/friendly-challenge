import { Controller, Post, Body, UseGuards, Req, ValidationPipe, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard'; // Assuming guard path
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Group } from '../models/group.model';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Post()
    @UseGuards(FirebaseAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new group' })
    @ApiResponse({ status: 201, description: 'Group created successfully.', type: Group /* Assuming Group model can be used for response shape */ })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createGroupDto: CreateGroupDto,
        @Req() req: any, // Use a more specific type if you have one for the authenticated request
    ): Promise<Group> {
        const userId = req.user.uid; // Extract user ID from the authenticated request (added by FirebaseAuthGuard)
        return this.groupsService.createGroup(createGroupDto, userId);
    }

    @Get('my') // New endpoint to get groups for the authenticated user
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Get groups the authenticated user is a member of' })
    @ApiResponse({ status: 200, description: 'List of user's groups.', type: [Group] })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 500, description: 'Internal server error (e.g., index missing).' })
    async getMyGroups(@Req() req: any): Promise<Group[]> {
        const userId = req.user.uid;
        return this.groupsService.findGroupsByUser(userId);
    }

    // Add other endpoints (GET, PUT, DELETE) later as needed
}
