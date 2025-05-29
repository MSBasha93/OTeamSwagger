// Mirror Prisma enums for frontend usage
export enum Role {
  CLIENT_ADMIN = "CLIENT_ADMIN",
  CLIENT_SUB_USER = "CLIENT_SUB_USER",
  EXPERT = "EXPERT",
  TDM = "TDM",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  OPERATION_ADMIN = "OPERATION_ADMIN",
  SDM = "SDM",
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  ESCALATED_L2 = "ESCALATED_L2",
  ESCALATED_L3 = "ESCALATED_L3",
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  sla?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  resolvedAt?: string | null;
  createdById: string;
  assignedExpertId?: string | null;
  organizationId: string;
  // Add more fields as needed from Prisma schema
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
}