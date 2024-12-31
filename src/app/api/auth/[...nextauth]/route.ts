import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { getMongoClient } from '../../../../../lib/mongodb';


// Define NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  adapter: MongoDBAdapter(getMongoClient()),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach user ID to token
      if (user) {
        token.id = user.id
      }
      return token;
    },
    async session({ session, token }) {
      // Attach token ID to session.user
      session.user = {
        ...session.user,
        id: token.id as string, // Ensure token.id is cast to string
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure NEXTAUTH_SECRET is set in .env.local
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };