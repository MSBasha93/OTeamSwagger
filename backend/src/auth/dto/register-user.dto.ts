import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client'; // Import Role enum

export class RegisterUserDto {
  @ApiProperty({ example: 'test@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
  
  // Roles might be assigned by admin later, or default during registration.
  // For self-registration, typically a default role is assigned.
  // This field might be used by an admin creating a user.
  @ApiProperty({ example: [Role.CLIENT_SUB_USER], enum: Role, isArray: true, required: false })
  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[]; 
}