"use client";
import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming shadcn/ui
import { Paperclip, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // For ScrollArea's viewport

  // Mock initial greeting from AI
  useEffect(() => {
    setMessages([
      { id: 'ai-greeting', text: 'Hello! How can I help you today? I can assist with common issues or help you create a new support ticket.', sender: 'ai', timestamp: new Date() }
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Replace with actual API call to your backend AI chat endpoint
      // The backend would then interact with the real AI service
      const response = await api.post('/chat/ai-interact', { message: input, userId: user?.id });
      const aiResponse: Message = {
        id: Date.now().toString() + '-ai',
        text: response.data.reply, // Assuming backend returns { reply: "..." }
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorResponse: Message = {
        id: Date.now().toString() + '-err',
        text: "Sorry, I couldn't connect to the AI assistant right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-150px)] bg-white shadow-xl rounded-lg">
      <header className="bg-slate-700 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-semibold">OTeam AI Support</h1>
      </header>
      
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                <div className="flex items-center mb-1">
                  {msg.sender === 'ai' ? <Bot size={16} className="mr-2 text-slate-600"/> : <User size={16} className="mr-2 text-blue-200"/>}
                  <span className="font-semibold text-sm">{msg.sender === 'user' ? (user?.firstName || 'You') : 'AI Assistant'}</span>
                </div>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-70 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg bg-slate-200 text-slate-800">
                <div className="flex items-center">
                    <Bot size={16} className="mr-2 text-slate-600"/>
                    <span className="font-semibold text-sm">AI Assistant is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-slate-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
            <Paperclip size={20} /> {/* For attachments later */}
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send size={18} className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}