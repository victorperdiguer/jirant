import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { getMongoClient } from '../../../../../lib/mongodb';
import TicketType from '../../../../../models/TicketType';
import User from '../../../../../models/User';
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
        // This event is triggered after the user is created in MongoDB
        // user._id will be the MongoDB ObjectId
        const createdTemplates = await Promise.all(
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };