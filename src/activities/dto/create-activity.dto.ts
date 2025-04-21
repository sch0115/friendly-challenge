import { IsString, IsNotEmpty, IsNumber, Min, Max, MinLength, MaxLength, IsPositive } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  @Max(10000) // Example max points, adjust as needed
  pointValue: number;
} 