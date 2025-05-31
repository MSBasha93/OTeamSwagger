// Create a tickets.dto.ts or similar
import { TicketPriority, TicketStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TicketResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: TicketStatus}) status: TicketStatus;
  @ApiProperty({ enum: TicketPriority}) priority: TicketPriority;
  // ... add all other fields you want to expose, with @ApiProperty
  @ApiProperty() createdAt: Date; // Or string if you format it
  @ApiProperty() organizationId: string;
  // etc.
}