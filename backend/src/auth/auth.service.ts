// oteam/backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, Role } from '@prisma/client'; // Import Role
import { Prisma } from '@prisma/client';

export interface JwtTokenPayload {
  accessToken: string;
}
export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>): Promise<AuthResponse> {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user,
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, roles } = registerUserDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Ensure roles is an array of Role enum values
    const userRoles = roles && roles.length > 0 ? roles : [Role.CLIENT_SUB_USER];


    try {
      const newUser = await this.usersService.createUser({
        email,
        password, // Hashing is done in usersService.createUser
        firstName,
        lastName,
        roles: { set: userRoles }, // Prisma expects { set: [...] } for enum arrays
      });
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = newUser;
      return this.login(userWithoutPassword);

    } catch (error) {
        // Handle potential Prisma unique constraint errors if not caught by findByEmail (race condition, unlikely)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') { // Unique constraint failed
                throw new ConflictException('Email already exists.');
            }
        }
        console.error("Registration error:", error);
        throw new InternalServerErrorException('Could not register user.');
    }
  }

  // This method is used by JwtStrategy to re-validate token and fetch fresh user data
  async validateJwtUser(payload: { sub: string }): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}