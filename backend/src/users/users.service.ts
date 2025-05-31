import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      // It's often better not to throw NotFoundException here if this service
      // is used internally by auth, as auth might want to handle null differently.
      // However, for a generic findById, it's appropriate.
      // For now, let's keep it simple and auth service can handle nulls.
      return null;
    }
    return user;
  }

 async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password as string, 10); // Ensure password is a string

    // data.roles is expected to be Prisma.UserCreaterolesInput, e.g. { set: [Role.CLIENT_SUB_USER] }
    // If data.roles or data.roles.set is not provided, default it.
    let rolesForDb: Prisma.UserCreaterolesInput;
    if (data.roles && (data.roles as Prisma.UserCreaterolesInput).set && ((data.roles as Prisma.UserCreaterolesInput).set as Role[]).length > 0) {
        rolesForDb = data.roles as Prisma.UserCreaterolesInput;
    } else {
        rolesForDb = { set: [Role.CLIENT_SUB_USER] };
    }

    return this.prisma.user.create({
      data: {
        ...data, // Spread other fields like email, firstName, lastName
        password: hashedPassword,
        roles: rolesForDb,
      },
    });
}

  // Basic placeholder for future admin user management
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        clientAdminOrganizationId: true, // Added
        managerId: true,                 // Added
        sdmId: true,                     // Added
        // Do NOT select password
      }
    });
    // The type assertion 'as Omit<User, 'password'>[]' might be needed if TS still complains,
    // but ideally the select should match the Omit type.
    return users as Omit<User, 'password'>[];
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    if (data.password && typeof data.password === 'string') {
        data.password = await bcrypt.hash(data.password, 10);
    }
    try {
        return await this.prisma.user.update({
            where: { id },
            data,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        throw error;
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
        return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        throw error;
    }
  }
}