import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ example: 'Cannot login to finance app', description: 'Title of the ticket' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'When I try to login, I get an error message saying "Invalid Credentials", but my password is correct.', description: 'Detailed description of the issue' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.MEDIUM, description: 'Priority of the ticket', required: false })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  // Status is usually set by the system, not by user on creation.
  // @ApiProperty({ enum: TicketStatus, example: TicketStatus.OPEN, description: 'Status of the ticket', required: false })
  // @IsOptional()
  // @IsEnum(TicketStatus)
  // status?: TicketStatus;

  @ApiProperty({ example: 'org_cuid_xxxxxxxx', description: 'ID of the organization this ticket belongs to', required: false })
  @IsOptional() // If the user is part of only one org, this can be inferred
  @IsString()
  organizationId?: string; 
  
  // assignedExpertId will be set by the system or an admin, not on creation by user
}