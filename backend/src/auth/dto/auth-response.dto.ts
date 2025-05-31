// backend/src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client'; // Or your frontend Role enum if you create a shared one

// You might want a User DTO that omits the password for responses
// Let's create a simple one here for now.
// Ideally, this UserDto would be more comprehensive and reusable.
class UserResponseDto {
    @ApiProperty({ example: 'clqj3k2x00000v9z3h4g6e8k2', description: 'User ID' })
    id: string;

    @ApiProperty({ example: 'test@example.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: 'John', description: 'User first name', required: false })
    firstName?: string;

    @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
    lastName?: string;

    @ApiProperty({ enum: Role, isArray: true, example: [Role.CLIENT_SUB_USER], description: 'User roles' })
    roles: Role[];

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation timestamp' })
    createdAt: Date; // Or string depending on serialization

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Update timestamp' })
    updatedAt: Date; // Or string
    
    @ApiProperty({ example: 'org_adj3k2x00000v9z3h4g6e8k2', description: 'Organization ID', required: false, nullable: true })
    organizationId?: string | null;

    @ApiProperty({ example: null, description: 'Client Admin Organization ID', required: false, nullable: true })
    clientAdminOrganizationId?: string | null;
    
    @ApiProperty({ example: null, description: 'Manager ID', required: false, nullable: true })
    managerId?: string | null;
    
    @ApiProperty({ example: null, description: 'SDM ID', required: false, nullable: true })
    sdmId?: string | null;

    // Add other fields from your User model that you want to expose, EXCLUDING password
}


export class AuthResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT Access Token',
    })
    accessToken: string;

    @ApiProperty({ type: () => UserResponseDto, description: 'Authenticated user details' })
    user: UserResponseDto;
}