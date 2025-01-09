'use client'
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  "Processing...",
  "Analyzing...",
  "Creating ticket..."
];

export function LoadingMessage() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) => {
        // Only increment if we haven't reached the last message
        if (current < messages.length - 1) {
          return current + 1;
        }
        // Clear the interval when we reach the last message
        clearInterval(interval);
        return current;
      });
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <p>{messages[messageIndex]}</p>
    </div>
  );
} 