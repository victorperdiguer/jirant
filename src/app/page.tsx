'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <h1>Not Signed In</h1>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name || 'User'}!</h1>
      <p>Email: {session.user?.email}</p>
      <img src={session.user?.image || ''} alt="Profile" width="50" height="50" />
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}