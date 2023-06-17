import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import AuthentikProvider from "next-auth/providers/authentik";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth authentication providers...
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_ID!,
      clientSecret: process.env.AUTHENTIK_SECRET!,
      issuer: process.env.AUTHENTIK_ISSUER!,
      name: "Homey Community Space Authentication",
    })
  ]
})

export { handler as GET, handler as POST };

