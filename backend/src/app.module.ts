import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { RcaModule } from './rca/rca.module';
import { ChatModule } from './chat/chat.module';
import { ScreenconnectModule } from './screenconnect/screenconnect.module';
import { AppController } from './app.controller'; // For health check

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // e.g., .env.development
      // Fallback to just .env if specific environment file not found
      // For Render, env vars are set directly, so .env files are less critical in prod
      ignoreEnvFile: process.env.NODE_ENV === 'production', // In prod, rely on Render's env vars
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    RcaModule,
    ChatModule,
    ScreenconnectModule,
  ],
  controllers: [AppController], // Add AppController here
  providers: [],
})
export class AppModule {}