// oteam/backend/src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config'; // If you need API keys for AI
// import axios from 'axios'; // If calling external AI service

@Injectable()
export class ChatService {
  // constructor(private configService: ConfigService) {}

  async interactWithAi(message: string, userId?: string): Promise<{ reply: string, ticketId?: string, intent?: string }> {
    console.log(`AI interaction request from user ${userId || 'anonymous'}: "${message}"`);

    // TODO: Implement actual AI logic using a RAG model or other AI service
    // This is a very basic mock based on keywords
    if (message.toLowerCase().includes('password reset')) {
      return { reply: "I can help with that. To reset your password, please go to the login page and click on 'Forgot Password'. Would you like me to create a ticket for this issue if that doesn't work?" };
    } else if (message.toLowerCase().includes('create ticket') || message.toLowerCase().includes('new issue')) {
        // In a real scenario, you'd gather more details for the ticket
        return { reply: "Okay, I can help you create a ticket. What is the title of your issue?", intent: "CREATE_TICKET_START" };
    } else if (message.toLowerCase().includes('finance app error')) {
        return { reply: "I understand you're having an issue with the finance app. Can you describe the error message or what happens?", intent: "GATHER_INFO_FINANCE_APP" };
    }


    // Default fallback response
    const responses = [
        "I'm still learning! Can you please rephrase that? Or I can create a ticket for you.",
        "Thanks for your message. A human expert will review this shortly if I can't help. What else can I do?",
        "I've noted your request: '" + message + "'. Is there anything else?"
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return { reply: randomResponse };
  }
}