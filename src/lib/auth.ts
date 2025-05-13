import NextAuth, { Session } from "next-auth";
import { User as NextAuthUser } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { connectDB } from "./mongodb";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(connectDB),
  callbacks: {
    async session({ session, user }: { session: Session; user: NextAuthUser }) {
      if (session.user && user && "id" in user) {
        (session.user as any).id = (user as any).id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions); 