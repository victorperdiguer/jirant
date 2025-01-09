'use client'
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bug, FileText, Zap, Lightbulb, Plus, MoreVertical, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSidebar } from '@/context/SidebarContext';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Ticket {
  _id: string;
  title: string;
  ticketType: string;
  createdAt: string;
  status: string;
}

interface GroupedTickets {
  [key: string]: Ticket[];
}

const iconMap = {
  'task': FileText,
  'user-story': FileText,
  'bug': Bug,
  'epic': Lightbulb,
  'spike': Zap,
};

export function Sidebar() {
  const [tickets, setTickets] = useState<GroupedTickets>({});
  const [isLoading, setIsLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const { searchQuery, setSearchQuery, lastRefresh } = useSidebar();

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
    const key = ticketType.toLowerCase().replace(/\s+/g, '-') as keyof typeof iconMap;
    const Icon = iconMap[key] || FileText;
    return <Icon className="h-4 w-4" />;
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
                        "cursor-pointer"
                      )}
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
                          className="w-[300px] p-2"
                        >
                          <p className="text-sm font-medium">{ticket.title}</p>
                        </HoverCardContent>
                      </HoverCard>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
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