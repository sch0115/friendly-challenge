import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray, MaxLength, MinLength, ArrayMaxSize } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @IsIn(['public', 'private'])
  visibility: 'public' | 'private';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(20, { each: true }) // Max length per tag
  @ArrayMaxSize(10) // Max 10 tags
  tags?: string[];
} 