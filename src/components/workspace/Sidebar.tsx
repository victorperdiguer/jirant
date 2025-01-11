'use client'
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bug, FileText, Zap, Lightbulb, Plus, MoreVertical, Search, Trash2, CheckCircle2, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSidebar } from '@/context/SidebarContext';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Message } from "@/types/message";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { defaultTicketTypes } from "@/config/ticketTypeIcons";
import { useRouter } from "next/navigation";

interface Ticket {
  _id: string;
  title: string;
  ticketType: string;
  createdAt: string;
  status: string;
  description: string;
  userInput?: string;
}

interface GroupedTickets {
  [key: string]: Ticket[];
}

export function Sidebar() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<GroupedTickets>({});
  const [isLoading, setIsLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const { searchQuery, setSearchQuery, lastRefresh, refreshSidebar } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const data = await response.json();

        // Filter out deleted tickets
        const activeTickets = data.filter((ticket: Ticket) => ticket.status !== 'deleted');
        setAllTickets(activeTickets);

        // Group tickets if no search query
        const grouped = groupTicketsByMonth(activeTickets);
        setTickets(grouped);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [lastRefresh]);

  // Update grouped tickets when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      const grouped = groupTicketsByMonth(allTickets);
      setTickets(grouped);
      return;
    }

    const filteredTickets = allTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const grouped = groupTicketsByMonth(filteredTickets);
    setTickets(grouped);
  }, [searchQuery, allTickets]);

  const groupTicketsByMonth = (tickets: Ticket[]): GroupedTickets => {
    return tickets.reduce((groups: GroupedTickets, ticket) => {
      const date = new Date(ticket.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(ticket);
      
      // Sort tickets within each group by date (newest first)
      groups[monthYear].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return groups;
    }, {});
  };

  const getIcon = (ticketType: string) => {
    const type = ticketType.toLowerCase().replace(/\s+/g, '-');
    const iconConfig = defaultTicketTypes[type];
    if (!iconConfig) return <CheckSquare className="h-4 w-4" />;
    
    const Icon = iconConfig.icon;
    return <Icon className={cn("h-4 w-4", iconConfig.color)} />;
  };

  const handleTicketClick = (ticket: Ticket) => {
    // If we're not in the workspace page, navigate to it
    if (window.location.pathname !== '/workspace') {
      // Create the messages before navigation
      const messages: Message[] = [];
      if (ticket.userInput) {
        messages.push({
          role: 'user',
          content: ticket.userInput
        });
      }
      messages.push({
        role: 'assistant',
        content: ticket.description
      });

      // Store the messages and ticket type in sessionStorage
      sessionStorage.setItem('pendingTicketDisplay', JSON.stringify({
        messages,
        ticketType: ticket.ticketType
      }));

      // Navigate to workspace
      router.push('/workspace');
      return;
    }

    // If already in workspace, just display the ticket
    const messages: Message[] = [];
    if (ticket.userInput) {
      messages.push({
        role: 'user',
        content: ticket.userInput
      });
    }
    messages.push({
      role: 'assistant',
      content: ticket.description
    });

    const event = new CustomEvent('displayTicket', {
      detail: {
        messages,
        ticketType: ticket.ticketType
      }
    });
    window.dispatchEvent(event);
  };

  const handleDeleteTicket = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'deleted'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }

      refreshSidebar();
      toast({
        title: "Ticket deleted",
        description: (
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span>The ticket has been deleted.</span>
          </div>
        ),
        action: (
          <ToastAction altText="Undo" onClick={async () => {
            try {
              const undoResponse = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  status: 'active'
                }),
              });

              if (!undoResponse.ok) throw new Error('Failed to undo');
              
              refreshSidebar();
              toast({
                title: "Action undone",
                description: (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>The ticket has been restored.</span>
                  </div>
                ),
              });
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to restore ticket.",
              });
            }
          }}>
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete ticket. Please try again.",
      });
    }
  };

  return (
    <div className="w-64 border-r bg-muted/50 h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Jira'nt" className="h-6" />
            <span className="font-semibold">Jira'nt</span>
          </Link>
          <Button size="icon" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Link href="/templates">
          <Button variant="outline" className="w-full justify-start gap-2 mb-4">
            <FileText className="h-4 w-4" />
            Plantillas
          </Button>
        </Link>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 pb-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground p-2">Loading tickets...</div>
          ) : Object.keys(tickets).length === 0 ? (
            <div className="text-sm text-muted-foreground p-2">
              {searchQuery ? 'No tickets found' : 'No tickets available'}
            </div>
          ) : (
            Object.entries(tickets).map(([monthYear, monthTickets]) => (
              <div key={monthYear}>
                <h3 className="text-sm font-medium mb-2 px-2">{monthYear}</h3>
                <div className="space-y-1">
                  {monthTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className={cn(
                        "group flex items-center gap-2 w-full rounded-md",
                        "px-2 py-2 hover:bg-accent hover:text-accent-foreground",
                        "cursor-pointer",
                        activeTicketId === ticket._id && "bg-accent text-accent-foreground shadow-sm"
                      )}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      {getIcon(ticket.ticketType)}
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <span className="text-sm truncate flex-1 max-w-[160px]">
                            {ticket.title}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent 
                          side="right" 
                          align="start"
                          alignOffset={-8}
                          sideOffset={32}
                          className="w-[300px] p-2"
                        >
                          <p className="text-sm font-medium">{ticket.title}</p>
                        </HoverCardContent>
                      </HoverCard>
                      <DropdownMenu onOpenChange={(open) => {
                        if (open) {
                          setActiveTicketId(ticket._id);
                        } else {
                          setActiveTicketId(null);
                        }
                      }}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()} // Prevent ticket click when opening menu
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={(e) => handleDeleteTicket(ticket._id, e)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 