'use client'
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated' && pathname) {
      router.refresh();
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <svg width="40" height="54" viewBox="0 0 50 67" className="text-primary">
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
          </div>
          <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Jira&apos;nt
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 