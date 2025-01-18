'use client'
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bug, FileText, Zap, Lightbulb, Plus, MoreVertical, Search, Trash2, CheckCircle2, CheckSquare, LinkIcon, BookDashed, SquarePen } from "lucide-react";
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
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  const { searchQuery, setSearchQuery, lastRefresh, refreshSidebar, activeTicketId, setActiveTicketId } = useSidebar();
  const router = useRouter();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined);
  const [relationshipType, setRelationshipType] = useState<string>('');
  const [linkableTicketId, setLinkableTicketId] = useState<string | null>(null);
  const pathname = usePathname();
  const isTemplatesPage = pathname === '/templates';
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!session) {
        setIsLoading(false);
        setTickets({});
        setAllTickets([]);
        return;
      }

      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
          if (response.status === 401) {
            setTickets({});
            setAllTickets([]);
            return;
          }
          throw new Error('Failed to fetch tickets');
        }
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
  }, [lastRefresh, session]);

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
      const monthYear = `${date.toLocaleString('en', { month: 'long' })} ${date.getFullYear()}`;
      
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
        messages: [
          { role: 'user', content: ticket.userInput || '' },
          { role: 'assistant', content: ticket.description }
        ],
        ticketType: ticket.ticketType,
        ticketId: ticket._id
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

  const handleNewTicket = () => {
    // Clear any pending ticket from sessionStorage
    sessionStorage.removeItem('pendingTicketDisplay');
    
    // If we're already in workspace, dispatch a clear event
    if (window.location.pathname === '/workspace') {
      const event = new CustomEvent('clearWorkspace');
      window.dispatchEvent(event);
    } else {
      // Navigate to workspace
      router.push('/workspace');
    }
  };

  const handleLinkTickets = async (ticketId: string) => {
    try {
      const response = await fetch('/api/ticket-relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket1: linkableTicketId,
          ticket2: ticketId,
          relationshipType,
        }),
      });
      if (!response.ok) throw new Error('Failed to link tickets');
      

      toast({
        title: "Tickets linked",
        description: "The tickets have been linked successfully.",
      });
    } catch (error) {
      console.error('Error linking tickets:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to link tickets. Please try again.",
      });
    } finally {
      setIsLinkDialogOpen(false);
      
    }
  };

  return (
    <div className="w-64 border-r bg-muted/50 h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center space-x-2">
            {logo}
            <span className="font-semibold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 leading pt-1">Jira'nt</span>
          </Link>
          <Button
            className="pt-1"
            size="icon" 
            variant="ghost"
            onClick={handleNewTicket}
          >
            <SquarePen className="!size-6"/>
          </Button>
        </div>

        <Link href={isTemplatesPage ? "/workspace" : "/templates"}>
          <Button variant="outline" className="w-full justify-start gap-2 mb-4">
            {isTemplatesPage ?  <FileText className="h-4 w-4" /> : <BookDashed className="h-4 w-4" />}
            {isTemplatesPage ? "Tickets" : "Templates"}
          </Button>
        </Link>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
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
                          setLinkableTicketId(ticket._id);
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
                            onClick={() => setIsLinkDialogOpen(true)}
                          >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            <span>Link</span>
                          </DropdownMenuItem>
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

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Tickets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Show selected ticket info */}
            {linkableTicketId && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 font-medium">
                  <span className="font-large">
                  {getIcon(allTickets.find(t => t._id === linkableTicketId)?.ticketType || '')}
                  </span>
                  <span className="font-small">
                    {allTickets.find(t => t._id === linkableTicketId)?.title}
                  </span>
                </div>
              </div>
            )}

            {/* Rest of the dialog content */}
            <Select
              value={selectedTicketId}
              onValueChange={setSelectedTicketId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a ticket to link" />
              </SelectTrigger>
              <SelectContent>
                {allTickets
                  .filter(ticket => ticket._id !== linkableTicketId) // Exclude current ticket
                  .map((ticket) => (
                    <SelectItem 
                      key={ticket._id} 
                      value={ticket._id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        {getIcon(ticket.ticketType)}
                        <span className="truncate">{ticket.title}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Relationship type, e.g. 'is implemented by'"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
            />
            <Button
              onClick={() => selectedTicketId && handleLinkTickets(selectedTicketId)}
              disabled={!selectedTicketId || !relationshipType}
            >
              Link Tickets
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const logo =            <svg 
width="24" 
height="32" 
viewBox="0 0 50 67" 
className="text-foreground"
>
<path 
  d="M30 39V43C30 46.713 28.525 50.274 25.8995 52.8995C23.274 55.525 19.713 57 16 57M16 57C12.287 57 8.72601 55.525 6.1005 52.8995C3.475 50.274 2 46.713 2 43V39M16 57V65M8 65H24M16 21C14.4087 21 12.8826 21.6321 11.7574 22.7574C10.6321 23.8826 10 25.4087 10 27V43C10 44.5913 10.6321 46.1174 11.7574 47.2426C12.8826 48.3679 14.4087 49 16 49C17.5913 49 19.1174 48.3679 20.2426 47.2426C21.3679 46.1174 22 44.5913 22 43V27C22 25.4087 21.3679 23.8826 20.2426 22.7574C19.1174 21.6321 17.5913 21 16 21Z" 
  className="stroke-current"
  strokeWidth="4" 
  strokeLinecap="round" 
  strokeLinejoin="round"
/>
<path 
  d="M48.7569 2.57091L34.5159 0.0824919C33.8974 3.62218 36.2751 7.00676 39.8148 7.62527L42.4489 8.08556L42.0102 10.5963C41.3917 14.136 43.7694 17.5205 47.3091 18.139L49.776 4.02145C49.8982 3.32174 49.4155 2.68599 48.7569 2.57091Z" 
  className="fill-current"
/>
<path 
  d="M40.4818 8.42051L26.2407 5.93208C25.6222 9.47177 27.9999 12.8564 31.5396 13.4749L34.1738 13.9351L33.7279 16.487C33.1094 20.0267 35.4871 23.4113 39.0268 24.0298L41.4936 9.9122C41.6159 9.21249 41.1403 8.53558 40.4818 8.42051Z" 
  className="fill-current opacity-80"
/>
<path 
  d="M32.2064 14.27L17.9653 11.7816C17.3468 15.3213 19.7245 18.7059 23.2642 19.3244L25.8572 19.7775L25.4185 22.2882C24.8 25.8279 27.1777 29.2125 30.7174 29.831L33.1915 15.6722C33.3405 15.062 32.8649 14.3851 32.2064 14.27Z" 
  className="fill-current opacity-60"
/>
</svg>