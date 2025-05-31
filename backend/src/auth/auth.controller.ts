// oteam/backend/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard'; // We will create this
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // We will create this
import { ApiTags, ApiBody, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client'; // For typing request.user
import { AuthResponseDto } from './dto/auth-response.dto';

// Define a type for the request object when user is authenticated
interface AuthenticatedRequest extends Request {
  user: Omit<UserModel, 'password'>; // User object from LocalStrategy or JwtStrategy
}


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.', type: AuthResponseDto }) // Update type if AuthResponse changes
  @ApiResponse({ status: 400, description: 'Invalid input.'})
  @ApiResponse({ status: 409, description: 'Email already in use.'})
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    return this.authService.register(registerUserDto);
  }

  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in.', type: AuthResponseDto }) // Update type
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @UseGuards(LocalAuthGuard) // This guard uses passport-local strategy
  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly set 200 OK for POST login
  async login(@Request() req: AuthenticatedRequest): Promise<AuthResponse> {
    // req.user is populated by LocalAuthGuard -> LocalStrategy.validate
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth() // Indicates that this endpoint requires a Bearer token
  @ApiResponse({ status: 200, description: 'Current user profile.', /* type: UserProfileDto - create this DTO later */ })
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @UseGuards(JwtAuthGuard) // This guard uses passport-jwt strategy
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest): Omit<UserModel, 'password'> {
    // req.user is populated by JwtAuthGuard -> JwtStrategy.validate
    return req.user;
  }
}