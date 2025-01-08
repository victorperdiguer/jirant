'use client'
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState, useEffect } from 'react';
import { useAutoResize } from '@/hooks/useAutoResize';
import { ITicketType } from "@/types/ticket-types";

export function WorkspaceMain() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ticketTypes, setTicketTypes] = useState<ITicketType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useAutoResize(textareaRef);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch('/api/ticket-types');
        if (!response.ok) throw new Error('Failed to fetch ticket types');
        const data = await response.json();
        setTicketTypes(data);
        // Set first type as default if available
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
    // Here we can add logic to update the textarea placeholder or content
    // based on the selected template
  };

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

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Add your main content here */}
      </div>

      {/* Input Section */}
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto relative p-4">
          <Textarea 
            ref={textareaRef}
            placeholder={
              isLoading 
                ? "Loading templates..." 
                : selectedType 
                  ? ticketTypes.find(t => t._id === selectedType)?.details || "Define un nuevo ticket"
                  : "Select a template"
            }
            className="min-h-[100px] max-h-[33vh] overflow-y-auto pr-12 resize-none"
            disabled={!selectedType}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 text-muted-foreground hover:text-foreground"
            disabled={!selectedType}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 