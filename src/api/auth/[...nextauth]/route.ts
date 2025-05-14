import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/mongodbClient";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

// 커스텀 Session 타입 확장
export interface CustomSession extends Session {
  user: Session["user"] & { id?: string; accessToken?: string };
}

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(client),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      (session as CustomSession).user.id = token.sub;
      (session as CustomSession).user.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 