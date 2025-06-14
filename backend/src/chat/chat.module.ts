import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
// ConfigModule is global if needed by ChatService

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}