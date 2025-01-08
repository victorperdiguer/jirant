'use client'
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef } from 'react';
import { useAutoResize } from '@/hooks/useAutoResize';

export function WorkspaceMain() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResize(textareaRef);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Template Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Plantilla:</span>
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Historia de usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user-story">Historia de usuario</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="spike">Spike</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Area */}
        <div className="relative">
          <Textarea 
            ref={textareaRef}
            placeholder="Define un nuevo ticket"
            className="min-h-[100px] pr-12 resize-none"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 