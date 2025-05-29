"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TicketPriority } from '@/lib/types'; // Using frontend types

export default function NewTicketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // In a real app, organizationId might be inferred from the logged-in user's context
      const response = await api.post('/tickets', { title, description, priority });
      toast({ title: "Ticket Created", description: `Ticket "${response.data.title}" has been successfully created.` });
      router.push(`/tickets/${response.data.id}`); // Navigate to the new ticket's detail page
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create ticket.';
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="mt-1"
            placeholder="Describe your issue in detail..."
          />
        </div>
        <div>
          <Label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TicketPriority).map(p => (
                <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </form>
    </div>
  );
}