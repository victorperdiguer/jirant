'use client'
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/workspace';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <img src="/logo.svg" alt="Logo" className="h-12 mx-auto" />
          <h2 className="mt-6 text-3xl font-bold">Welcome to Jirant</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to the workspace
          </p>
        </div>

        <Button
          className="w-full"
          onClick={() => signIn('google', { callbackUrl })}
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
} 