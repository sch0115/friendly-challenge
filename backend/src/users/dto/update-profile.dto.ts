import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

/**
 * Data Transfer Object for updating user profile information.
 * Defines validation rules for incoming update requests.
 */
export class UpdateProfileDto {
  @IsOptional() // All fields are optional for update
  @IsString()
  @MaxLength(100, { message: 'Display name cannot exceed 100 characters' })
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Motivational text cannot exceed 200 characters' })
  motivationalText?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Photo URL must be a valid URL' })
  photoURL?: string;
} 