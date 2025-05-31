// oteam/backend/src/tickets/tickets.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User, Ticket, TicketStatus, Role, Organization } from '@prisma/client'; // Make sure Role is imported
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy'; // For user type
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) { }

  async createTicket(createTicketDto: CreateTicketDto, user: AuthenticatedUser): Promise<Ticket> {
    const { title, description, priority, organizationId: dtoOrganizationId } = createTicketDto;

    let effectiveOrganizationId = dtoOrganizationId;

    // If user is CLIENT_SUB_USER or CLIENT_ADMIN, ensure they belong to an organization.
    // For this MVP, we assume a client user is already associated with an organization.
    // This association would happen during user creation or org setup by an admin.
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { organization: true }
    });

    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    if ((user.roles.includes(Role.CLIENT_ADMIN) || user.roles.includes(Role.CLIENT_SUB_USER))) {
      if (!dbUser.organizationId) {
        throw new BadRequestException('Client users must belong to an organization to create tickets.');
      }
      // If an org ID was provided in DTO, verify it matches user's org (or if admin, allow)
      if (dtoOrganizationId && dtoOrganizationId !== dbUser.organizationId) {
        // PLATFORM_ADMIN or other high-level admins might be able to create tickets for any org
        if (!user.roles.includes(Role.PLATFORM_ADMIN) && !user.roles.includes(Role.OPERATION_ADMIN)) {
          throw new ForbiddenException('You can only create tickets for your own organization.');
        }
      }
      effectiveOrganizationId = dbUser.organizationId; // Enforce user's organization
    } else if (!effectiveOrganizationId && (user.roles.includes(Role.PLATFORM_ADMIN) || user.roles.includes(Role.OPERATION_ADMIN))) {
      // Admins must specify an org ID if they are creating a ticket on behalf of a client
      throw new BadRequestException('Admins must specify an organization ID when creating a ticket.');
    } else if (!effectiveOrganizationId) {
      // Non-client users (like Experts, TDMs if they could create tickets) would need org context
      throw new BadRequestException('Organization ID is required for this user type to create a ticket.');
    }


    // Verify the organization exists if specified or inferred
    const organization = await this.prisma.organization.findUnique({ where: { id: effectiveOrganizationId } });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${effectiveOrganizationId} not found.`);
    }


    return this.prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || undefined, // Prisma handles undefined for optional enums
        status: TicketStatus.OPEN, // Default status
        createdById: user.userId,
        organizationId: effectiveOrganizationId, // Assign to the user's organization
      },
    });
  }

  async findTicketById(id: string, user: AuthenticatedUser): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignedExpert: { select: { id: true, email: true, firstName: true, lastName: true } },
        organization: true,
        // rca: true, // Include other relations as needed
        // chatMessages: true,
      }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    const requester = await this.prisma.user.findUnique({ where: { id: user.userId } });

    if (!requester) {
      throw new ForbiddenException('User performing the request not found.');
    }
    // Authorization: Check if user is allowed to see this ticket
    // PLATFORM_ADMIN, OPERATION_ADMIN, SDM can see all tickets
    if (user.roles.includes(Role.PLATFORM_ADMIN) || user.roles.includes(Role.OPERATION_ADMIN) || user.roles.includes(Role.SDM)) {
      return ticket;
    }
    // EXPERT or TDM can see if assigned or related (e.g., TDM manages the assigned expert)
    if ((user.roles.includes(Role.EXPERT) || user.roles.includes(Role.TDM)) && ticket.assignedExpertId === user.userId) {
      // TODO: Add logic for TDM to see tickets of their managed experts
      return ticket;
    }
    // CLIENT_ADMIN or CLIENT_SUB_USER can see if it belongs to their organization
    if ((user.roles.includes(Role.CLIENT_ADMIN) || user.roles.includes(Role.CLIENT_SUB_USER)) && ticket.organizationId === requester.organizationId) {
      const requester = await this.prisma.user.findUnique({ where: { id: user.userId } }); // fetch user to get orgId
      if (requester.organizationId && ticket.organizationId === requester.organizationId) return ticket;
    }


    throw new ForbiddenException('You do not have permission to view this ticket.');
  }

  // Placeholder for find all tickets with filtering and pagination
  async findAllTickets(user: AuthenticatedUser, /* query params for filtering/pagination */): Promise<Ticket[]> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) throw new ForbiddenException('User not found');

    const whereClause: Prisma.TicketWhereInput = {};

    if (user.roles.includes(Role.CLIENT_ADMIN) || user.roles.includes(Role.CLIENT_SUB_USER)) {
      if (!dbUser.organizationId) throw new ForbiddenException("Client user not associated with an organization.");
      whereClause.organizationId = dbUser.organizationId;
    } else if (user.roles.includes(Role.EXPERT)) {
      whereClause.assignedExpertId = user.userId;
    } else if (user.roles.includes(Role.TDM)) {
      // TODO: TDM should see tickets of their experts.
      // This requires knowing which experts a TDM manages.
      // For now, TDM can only see tickets directly assigned to them (if any).
      whereClause.assignedExpertId = user.userId; // Simplified
    } else if (!user.roles.includes(Role.PLATFORM_ADMIN) && !user.roles.includes(Role.OPERATION_ADMIN) && !user.roles.includes(Role.SDM)) {
      // If not any of the above and not a super admin, they can't see a general list.
      throw new ForbiddenException("You do not have permission to view all tickets.");
    }
    // PLATFORM_ADMIN, OPERATION_ADMIN, SDM can see all if no specific filters applied by them.

    return this.prisma.ticket.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignedExpert: { select: { id: true, email: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}