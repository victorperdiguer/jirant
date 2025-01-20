import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { getMongoClient } from '../../lib/mongodb';
import TicketType from '../../models/TicketType';
import { defaultTemplates } from '@/config/defaultTemplates';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  adapter: MongoDBAdapter(getMongoClient()),
  events: {
    createUser: async ({ user }) => {
      try {
        await Promise.all(
          defaultTemplates.map(template =>
            TicketType.create({
              ...template,
              createdBy: user.id
            })
          )
        );
      } catch (error) {
        console.error('Error creating default templates:', error);
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 