'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState(() => {
    // Try to get the saved search query from localStorage during initialization
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarSearchQuery') || '';
    }
    return '';
  });

  // Save search query to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarSearchQuery', searchQuery);
  }, [searchQuery]);

  return (
    <SidebarContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 