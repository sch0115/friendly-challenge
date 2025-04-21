import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityLogDto {
  @ApiProperty({ description: 'ID of the group the activity belongs to', example: 'group123' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'ID of the activity being logged', example: 'activity456' })
  @IsString()
  @IsNotEmpty()
  activityId: string;

  @ApiProperty({ description: 'Optional notes about the logged activity', maxLength: 500, required: false, example: 'Completed the morning run' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  // userId and points will be added by the backend service, not provided by the client
} 