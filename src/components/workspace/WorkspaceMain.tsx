'use client'
import { Mic, Send, X, LinkIcon, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAutoResize } from '@/hooks/useAutoResize';
import { ITicketType } from "@/types/ticket-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LoadingMessage } from "./LoadingMessage";
import { useSidebar } from "@/context/SidebarContext";
import { FormattedMessage } from "./FormattedMessage";
import { Message } from "@/types/message";
import { defaultTicketTypes } from "@/config/ticketTypeIcons";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AudioWaveform } from './AudioWaveform';
import { useSession, signIn } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";


interface Ticket {
  _id: string;
  title: string;
  ticketType: string;
  createdAt: string;
  status: string;
  description: string;
  userInput?: string;
}

export function WorkspaceMain() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ticketTypes, setTicketTypes] = useState<ITicketType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshSidebar, setActiveTicketId } = useSidebar();
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [contextTickets, setContextTickets] = useState<Ticket[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  
  useAutoResize(textareaRef);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        if (!session) {
          setTicketTypes([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/ticket-types');
        if (!response.ok) {
          if (response.status === 401) {
            setTicketTypes([]);
            return;
          }
          throw new Error('Failed to fetch ticket types');
        }
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
  }, [session]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!session) {
        setAvailableTickets([]);
        return;
      }

      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
          if (response.status === 401) {
            setAvailableTickets([]);
            return;
          }
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setAvailableTickets(data.filter((t: Ticket) => t.status !== 'deleted'));
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setAvailableTickets([]);
      }
    };

    fetchTickets();
  }, [session]);

  const handleTypeChange = (typeId: string) => {
    setSelectedType(typeId);
  };

  const showAuthWarning = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to use this feature.",
      variant: "destructive",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => signIn('google', { prompt: 'select_account', callbackUrl: window.location.pathname })}
          className="border-white hover:bg-white/20 text-black hover:text-white"
        >
          Sign in
        </Button>
      ),
    });
  };

  const handleSend = async () => {
    if (!session) {
      showAuthWarning();
      return;
    }

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
          userInput: userMessage,
          linkedTickets: selectedTickets.map(ticket => ({
            title: ticket.title,
            type: ticket.ticketType,
            description: ticket.description
          }))
        }),
      });

      const responseText = await aiResponse.text();

      if (!aiResponse.ok) {
        throw new Error(`Failed to process request: ${aiResponse.status} ${responseText}`);
      }
      
      // Parse the response as JSON after logging the text
      const data = JSON.parse(responseText);
      const aiContent = data.generatedText as string;
      
      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);

      // Create the ticket first
      const ticketResponse = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: aiContent,
          ticketType: selectedTemplate?.name,
          status: 'active',
          createdBy: session?.user?.id,
          userInput: userMessage,
        }),
      });

      if (!ticketResponse.ok) throw new Error('Failed to create ticket');
      const newTicket = await ticketResponse.json();

      // Create relationships for each selected context ticket
      await Promise.all(selectedTickets.map(async (contextTicket) => {
        await fetch('/api/ticket-relationships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticket1: newTicket._id,
            ticket2: contextTicket._id,
            relationshipType: 'context',
          }),
        });
      }));

      // Refresh both sidebar and available tickets
      refreshSidebar();
      
      // Fetch updated tickets list
      const updatedTicketsResponse = await fetch('/api/tickets');
      if (updatedTicketsResponse.ok) {
        const data = await updatedTicketsResponse.json();
        setAvailableTickets(data.filter((t: Ticket) => t.status !== 'deleted'));
      }

    } catch (error) {
      
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
    const handleDisplayTicket = async (event: Event) => {
      const customEvent = event as CustomEvent<{
        messages: Message[];
        ticketType: string;
        ticketId: string;
      }>;
      
      const ticketType = ticketTypes.find(t => t.name === customEvent.detail.ticketType);
      if (ticketType) {
        setSelectedType(ticketType._id);
      }
      
      setMessages(customEvent.detail.messages);
      setActiveTicketId(customEvent.detail.ticketId);
      
      if (customEvent.detail.ticketId) {
        await fetchContextTickets(customEvent.detail.ticketId);
      }
      
      setInput('');
      setIsProcessing(false);
    };

    window.addEventListener('displayTicket', handleDisplayTicket);
    return () => window.removeEventListener('displayTicket', handleDisplayTicket);
  }, [ticketTypes]);

  useEffect(() => {
    // Check for pending ticket display
    const pendingTicket = sessionStorage.getItem('pendingTicketDisplay');
    if (pendingTicket) {
      const { messages, ticketType } = JSON.parse(pendingTicket);
      
      // Find the ticket type and set it
      const ticketTypeObj = ticketTypes.find(t => t.name === ticketType);
      if (ticketTypeObj) {
        setSelectedType(ticketTypeObj._id);
      }
      
      // Set the messages
      setMessages(messages);
      
      // Clear the pending ticket
      sessionStorage.removeItem('pendingTicketDisplay');
    }
  }, [ticketTypes]); // Add ticketTypes as dependency

  // Add this new effect to handle workspace clearing
  useEffect(() => {
    const handleClearWorkspace = () => {
      setMessages([]);
      setInput('');
      setIsProcessing(false);
      setActiveTicketId(null);
      if (ticketTypes.length > 0) {
        setSelectedType(ticketTypes[0]._id);
      }
    };

    window.addEventListener('clearWorkspace', handleClearWorkspace);

    return () => {
      window.removeEventListener('clearWorkspace', handleClearWorkspace);
    };
  }, [ticketTypes]);

  const getIcon = (ticketTypeOrName: ITicketType | string) => {
    let iconKey: string;
    let iconConfig;

    if (typeof ticketTypeOrName === 'string') {
      // If it's a string (ticket.ticketType), use it directly as the key
      iconKey = ticketTypeOrName.toLowerCase().replace(/\s+/g, '-');
      iconConfig = defaultTicketTypes[iconKey];
    } else {
      // If it's an ITicketType object, use its icon property
      iconConfig = defaultTicketTypes[ticketTypeOrName.icon];
    }

    if (!iconConfig) return null;
    
    const Icon = iconConfig.icon;
    return <Icon className={cn("h-4 w-4", iconConfig.color)} />;
  };

  const toggleTicketSelection = (ticket: Ticket) => {
    setSelectedTickets(prev => {
      const isSelected = prev.some(t => t._id === ticket._id);
      if (isSelected) {
        return prev.filter(t => t._id !== ticket._id);
      } else {
        return [...prev, ticket];
      }
    });
  };

  const truncateTitle = (title: string, maxLength: number = 85) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  const fetchContextTickets = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/context`);
      if (response.ok) {
        const data = await response.json();
        setContextTickets(data);
      }
    } catch (error) {
      console.error('Error fetching context tickets:', error);
    }
  };

  const handleRecording = useCallback(async () => {
    if (!session) {
      showAuthWarning();
      return;
    }

    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      setRecordingStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setRecordingStream(stream);
        
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        let chunks: Blob[] = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          setIsTranscribing(true);
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          try {
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) throw new Error('Transcription failed');

            const data = await response.json();
            setInput(prev => prev + ' ' + data.text);
          } catch (error) {
            console.error('Error transcribing audio:', error);
          } finally {
            setIsTranscribing(false);
          }

          chunks = [];
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start(1000);
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  }, [isRecording, mediaRecorder]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 60) { // Stop after 1 minute
          handleRecording();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header Section */}
      <div className="p-8 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-row items-center justify-start gap-4">
              <h1 className="text-3xl font-bold">Workspace</h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsTicketDialogOpen(true)}
              >
                <LinkIcon className="h-4 w-4" />
                Add Context
              </Button>
              <Select
                value={selectedType}
                onValueChange={handleTypeChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select template"}>
                    {selectedType && (
                      <div className="flex items-center gap-2">
                        {getIcon(ticketTypes.find(t => t._id === selectedType)!)}
                        <span>{ticketTypes.find(t => t._id === selectedType)?.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      <div className="flex items-center gap-2">
                        {getIcon(type)}
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </div>
      </div>

      {/* Selected Tickets Display */}
      {selectedTickets.length > 0 && (
        <div className="border-b bg-muted/50 p-2">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
            {selectedTickets.map((ticket) => (
              <Badge
                key={ticket._id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getIcon(ticket.ticketType)}
                <span className="truncate max-w-[200px]">
                  {truncateTitle(ticket.title)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toggleTicketSelection(ticket)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Selection Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Link Related Tickets</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Select one or more tickets to provide context for your new ticket. The AI will consider the information from these tickets when generating the new one.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search tickets..."
              className="w-full"
              onChange={(e) => {
                // Add ticket search logic here
              }}
            />
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {availableTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg"
                  >
                    <Checkbox
                      id={ticket._id}
                      checked={selectedTickets.some(t => t._id === ticket._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          toggleTicketSelection(ticket);
                        } else {
                          toggleTicketSelection(ticket);
                        }
                      }}
                    />
                    <label
                      htmlFor={ticket._id}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {getIcon(ticket.ticketType)}
                      <span className="truncate">
                        {truncateTitle(ticket.title)}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsTicketDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsTicketDialogOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Collapsible - Show only when viewing an existing ticket */}
      {contextTickets.length > 0 && (
        <div className="border-b bg-muted/50">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setIsContextExpanded(!isContextExpanded)}
              className="flex items-center gap-2 w-full hover:bg-muted/50 px-4 py-1.5 text-muted-foreground"
            >
              {isContextExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">
                Context Tickets ({contextTickets.length})
              </span>
            </button>
            
            {isContextExpanded && (
              <div className="space-y-1 px-4 py-2">
                {contextTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded-md cursor-pointer text-sm"
                    onClick={() => {
                      // Create and dispatch display event
                      const event = new CustomEvent('displayTicket', {
                        detail: {
                          messages: [
                            { role: 'user', content: ticket.userInput || '' },
                            { role: 'assistant', content: ticket.description }
                          ],
                          ticketType: ticket.ticketType,
                          ticketId: ticket._id
                        }
                      });
                      window.dispatchEvent(event);
                    }}
                  >
                    {getIcon(ticket.ticketType)}
                    <span className="text-xs truncate">
                      {truncateTitle(ticket.title)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
      <div className="flex items-end gap-2 p-4 border-t bg-background">
        <div className="flex-1 flex items-end gap-2">
          {isRecording ? (
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Recording... {recordingDuration}s</span>
              </div>
              <AudioWaveform stream={recordingStream} />
              
            </div>
          ) : isTranscribing ? (
            <div className="flex-1 flex items-center justify-center py-4 bg-muted/10 rounded-md">
              <span className="text-sm text-muted-foreground animate-pulse">
                Transcribing...
              </span>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[60px] max-h-[200px]"
            />
          )}
          
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleRecording}
            className="flex-shrink-0"
          >
            <Mic className={cn("h-4 w-4", isRecording && "animate-pulse")} />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isProcessing || isRecording}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 