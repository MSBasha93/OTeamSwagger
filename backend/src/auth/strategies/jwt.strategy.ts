import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
// import { UsersService } from '../../users/users.service'; // No longer directly needed
import { AuthService } from '../auth.service'; // Import AuthService
import { Role, User } from '@prisma/client';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: Role[];
}

// This type will be what `request.user` becomes after successful JWT validation
export type AuthenticatedUser = Omit<User, 'password'> & { userId: string };


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService, // Inject AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.authService.validateJwtUser({ sub: payload.sub });
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid.');
    }
    // The payload already contains email and roles. We are re-fetching user from DB
    // to ensure it's still valid and has up-to-date info.
    // We map it to ensure `request.user` has a consistent shape.
    return {
        ...user, // Spread the Omit<User, 'password'>
        userId: user.id, // Explicitly add userId, though user.id already exists
    };
  }
}