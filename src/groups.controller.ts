import { Controller, Post, Body, UseGuards, Req, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard'; // Assuming guard path
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Group } from '../models/group.model';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Post()
    @UseGuards(FirebaseAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth() // Indicates that the endpoint requires a bearer token
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

    // Add other endpoints (GET, PUT, DELETE) later as needed
}
