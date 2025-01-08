import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function Sidebar() {
  return (
    <div className="w-80 h-full border-r flex flex-col bg-muted/50">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-2 border-b">
        <img src="/logo.svg" alt="Jira'nt" className="h-8 w-8" />
        <span className="font-semibold text-xl">Jira'nt</span>
      </div>

      {/* Templates Button */}
      <div className="p-4">
        <Link href="/templates">
          <Button variant="outline" className="w-full justify-start gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Templates
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-auto px-4">
        {/* We'll add tickets here later */}
      </div>
    </div>
  );
} 