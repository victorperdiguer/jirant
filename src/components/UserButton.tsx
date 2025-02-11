'use client'
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, LogIn, User2, UserPlus } from 'lucide-react';
import Image from 'next/image';

export function UserButton() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '';

  const handleNewLogin = async () => {
    // Sign out from NextAuth only
    await signOut({ redirect: false });
    
    // Trigger new sign in with forced account selection
    await signIn('google', {
      prompt: 'select_account',
      callbackUrl: window.location.pathname,
    });
  };

  return (
    <div className="absolute top-8 right-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-full bg-primary p-0 overflow-hidden"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User avatar'}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : initials ? (
              <span className="text-xs font-medium text-primary-foreground">
                {initials}
              </span>
            ) : (
              <User2 className="h-4 w-4 text-primary-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {session ? (
            <>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={handleNewLogin}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Sign in with another account</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => signIn('google', { prompt: 'select_account' })}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Sign in</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 