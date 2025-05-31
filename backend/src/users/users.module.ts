import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// PrismaModule is global
// If you add a UsersController later:
// import { UsersController } from './users.controller';

@Module({
  // controllers: [UsersController], // Add if you create UsersController
  providers: [UsersService],
  exports: [UsersService], // Export service for AuthModule
})
export class UsersModule {}