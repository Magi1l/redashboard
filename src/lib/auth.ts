import NextAuth, { Session } from "next-auth";
import { User as NextAuthUser } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./mongodbClient";
import type { CustomSession } from "@/api/auth/[...nextauth]/route";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(client),
  callbacks: {
    async session({ session, user }: { session: Session; user: NextAuthUser }) {
      if (session.user && user && "id" in user) {
        (session as CustomSession).user.id = (user as { id: string }).id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions); 