import { PartialType } from '@nestjs/swagger'; // Or @nestjs/mapped-types if not using Swagger
import { CreateActivityDto } from './create-activity.dto';

// UpdateActivityDto inherits validation rules from CreateActivityDto
// but makes all fields optional.
export class UpdateActivityDto extends PartialType(CreateActivityDto) {} 