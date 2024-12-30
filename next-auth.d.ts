import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Add the id field
      name?: string;
      email?: string;
      image?: string;
    };
  }

  interface JWT {
    id: string; // Add the id field
  }
}