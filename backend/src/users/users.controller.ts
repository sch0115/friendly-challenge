import { Controller, Get, Put, Body, Req, UseGuards, ValidationPipe, Logger } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard'; // Assuming AuthGuard is correctly set up
import { UserProfile } from './interfaces/user-profile.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; // For Swagger documentation (optional but good practice)

@ApiTags('users') // Group endpoints in Swagger UI
@ApiBearerAuth() // Indicate that endpoints require Bearer token auth
@Controller('api/users') // Prefix all routes in this controller with 'api/users'
@UseGuards(AuthGuard) // Protect all routes in this controller
export class UsersController {
  private readonly logger = new Logger(UsersController.name); // Instantiate logger

  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async getProfile(@Req() req): Promise<UserProfile> {
    const uid = req.user.uid;
    this.logger.log(`[${uid}] GET /profile - Request received`); // Log entry
    try {
      const profile = await this.userService.getProfile(uid);
      this.logger.log(`[${uid}] GET /profile - Profile successfully retrieved`);
      return profile;
    } catch (error) {
      this.logger.error(`[${uid}] GET /profile - Error retrieving profile: ${error.message}`, error.stack);
      throw error; // Re-throw the error to let NestJS handle the response
    }
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update the profile of the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async updateProfile(
    @Req() req,
    // Apply ValidationPipe specifically here if not global, 
    // ensure DTO validation runs
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) updateProfileDto: UpdateProfileDto
  ): Promise<void> {
    const uid = req.user.uid;
    this.logger.log(`[${uid}] PUT /profile - Request received`); // Log entry
    this.logger.debug(`[${uid}] PUT /profile - DTO: ${JSON.stringify(updateProfileDto)}`); // Log DTO
    try {
      await this.userService.updateProfile(uid, updateProfileDto);
      this.logger.log(`[${uid}] PUT /profile - Profile successfully updated`);
      // Implicitly returns 200 OK on success
    } catch (error) {
      this.logger.error(`[${uid}] PUT /profile - Error updating profile: ${error.message}`, error.stack);
      throw error; // Re-throw the error
    }
  }
}
