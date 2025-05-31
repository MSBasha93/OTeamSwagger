// oteam/backend/src/chat/chat.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface ChatRequestBody {
  message: string;
  // conversationId?: string; // For maintaining context later
}

interface AuthenticatedChatRequest extends Request {
    user: AuthenticatedUser; // Assuming user is always authenticated for this
}


@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // All chat interactions require authentication
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Send a message to the AI agent' })
  @ApiResponse({ status: 200, description: 'AI agent response.' }) // Define a DTO for response later
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @Post('ai-interact')
  async aiInteract(
    @Body() body: ChatRequestBody,
    @Request() req: AuthenticatedChatRequest,
  ): Promise<{ reply: string, ticketId?: string, intent?: string }> {
    return this.chatService.interactWithAi(body.message, req.user.userId);
  }

  // TODO: Add endpoints for client <-> expert chat later
}