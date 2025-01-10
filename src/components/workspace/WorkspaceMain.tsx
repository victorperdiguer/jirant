'use client'
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState, useEffect } from 'react';
import { useAutoResize } from '@/hooks/useAutoResize';
import { ITicketType } from "@/types/ticket-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LoadingMessage } from "./LoadingMessage";
import { useSidebar } from "@/context/SidebarContext";
import { FormattedMessage } from "./FormattedMessage";
import { Message } from "@/types/message";

export function WorkspaceMain() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ticketTypes, setTicketTypes] = useState<ITicketType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshSidebar } = useSidebar();
  
  useAutoResize(textareaRef);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch('/api/ticket-types');
        if (!response.ok) throw new Error('Failed to fetch ticket types');
        const data = await response.json();
        setTicketTypes(data);
        if (data.length > 0) {
          setSelectedType(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching ticket types:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketTypes();
  }, []);

  const handleTypeChange = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedType || isProcessing) return;

    const userMessage = input.trim();
    const selectedTemplate = ticketTypes.find(t => t._id === selectedType);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsProcessing(true);

    try {
      // First, get AI response
      const aiResponse = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateStructure: selectedTemplate?.templateStructure || [],
          userInput: userMessage
        }),
      });

      // Log the response for debugging
      console.log('AI Response status:', aiResponse.status);
      const responseText = await aiResponse.text();
      console.log('AI Response text:', responseText);

      if (!aiResponse.ok) {
        throw new Error(`Failed to process request: ${aiResponse.status} ${responseText}`);
      }
      
      // Parse the response as JSON after logging the text
      const data = JSON.parse(responseText);
      console.log('Data:', data);
      const aiContent = data.generatedText as string;
      console.log('AI Content:', aiContent);
      
      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);

      // Create ticket with the AI response
      const ticketResponse = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: aiContent,
          ticketType: selectedTemplate?.name,
          status: 'active',
          createdBy: '6773d9d5e742a5daaac149d1',
          relatedTickets: [],
          userInput: userMessage,
        }),
      });

      if (!ticketResponse.ok) {
        const errorText = await ticketResponse.text();
        console.error('Failed to create ticket:', errorText);
        throw new Error(`Failed to create ticket: ${errorText}`);
      }

      // Refresh the sidebar after successful ticket creation
      refreshSidebar();

    } catch (error) {
      console.error('Error processing request:', error);
      console.log('Full error:', { error });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error || 'An unexpected error occurred'}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add event listener for ticket display
  useEffect(() => {
    const handleDisplayTicket = (event: CustomEvent<{
      messages: Message[];
      ticketType: string;
    }>) => {
      // Find the ticket type ID from the name
      const ticketType = ticketTypes.find(t => t.name === event.detail.ticketType);
      if (ticketType) {
        setSelectedType(ticketType._id);
      }
      
      // Set the messages
      setMessages(event.detail.messages);
      
      // Clear the input and processing state
      setInput('');
      setIsProcessing(false);
    };

    // Add event listener
    window.addEventListener('displayTicket', handleDisplayTicket as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('displayTicket', handleDisplayTicket as EventListener);
    };
  }, [ticketTypes]); // Add ticketTypes as dependency

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header Section */}
      <div className="p-8 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Workspace</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Plantilla:</span>
              <Select
                value={selectedType}
                onValueChange={handleTypeChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select template"}>
                    {selectedType && ticketTypes.find(t => t._id === selectedType)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                )}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <FormattedMessage content={message.content} />
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <LoadingMessage />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto relative p-4">
          <Textarea 
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isLoading 
                ? "Loading templates..." 
                : selectedType 
                  ? ticketTypes.find(t => t._id === selectedType)?.details || "Define un nuevo ticket"
                  : "Select a template"
            }
            className="min-h-[100px] max-h-[33vh] overflow-y-auto pr-24 resize-none"
            disabled={!selectedType || isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-6 bottom-6 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={!selectedType || isProcessing}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleSend}
              disabled={!input.trim() || !selectedType || isProcessing}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 