// oteam/backend/src/tickets/tickets.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard'; // Your RolesGuard
import { Roles } from '../common/decorators/roles.decorator'; // Your Roles decorator
import { Role, Ticket } from '@prisma/client'; // Your Prisma Role enum
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { TicketResponseDto } from './dto/tickets.dto';

interface AuthenticatedRequestWithUser extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Tickets')
@ApiBearerAuth() // All endpoints in this controller require JWT
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JWT and Roles guard to the whole controller
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket successfully created.', type: TicketResponseDto }) // Assuming Ticket is your Prisma model
  @ApiResponse({ status: 400, description: 'Invalid input.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @Roles(Role.CLIENT_ADMIN, Role.CLIENT_SUB_USER, Role.PLATFORM_ADMIN, Role.OPERATION_ADMIN) // Only these roles can create tickets
  @Post()
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @Request() req: AuthenticatedRequestWithUser,
  ): Promise<Ticket> {
    return this.ticketsService.createTicket(createTicketDto, req.user);
  }

  @ApiOperation({ summary: 'Get all tickets (role-dependent)' })
  @ApiResponse({ status: 200, description: 'List of tickets.', type: [TicketResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  // All authenticated users can attempt to get tickets, service layer handles filtering by role
  @Roles(Role.CLIENT_ADMIN, Role.CLIENT_SUB_USER, Role.EXPERT, Role.TDM, Role.PLATFORM_ADMIN, Role.OPERATION_ADMIN, Role.SDM)
  @Get()
  async findAll(
    @Request() req: AuthenticatedRequestWithUser,
    // @Query() queryParams: any, // For future pagination and filtering
    ): Promise<Ticket[]> {
    return this.ticketsService.findAllTickets(req.user /*, queryParams */);
  }

  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket details.', type: TicketResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiResponse({ status: 404, description: 'Ticket not found.'})
  // All authenticated users can attempt to get a ticket, service layer handles authorization
  @Roles(Role.CLIENT_ADMIN, Role.CLIENT_SUB_USER, Role.EXPERT, Role.TDM, Role.PLATFORM_ADMIN, Role.OPERATION_ADMIN, Role.SDM)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequestWithUser,
  ): Promise<Ticket | null> {
    return this.ticketsService.findTicketById(id, req.user);
  }
}