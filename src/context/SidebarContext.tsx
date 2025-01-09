'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshSidebar: () => void;
  lastRefresh: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarSearchQuery') || '';
    }
    return '';
  });
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('sidebarSearchQuery', searchQuery);
  }, [searchQuery]);

  const refreshSidebar = () => {
    setLastRefresh(Date.now());
  };

  return (
    <SidebarContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      refreshSidebar,
      lastRefresh 
    }}>
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