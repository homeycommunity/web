import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"

const prisma = new PrismaClient()

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "zitadel",
      name: "zitadel",
      type: "oidc",

      allowDangerousEmailAccountLinking: true,
      issuer: process.env.ZITADEL_ISSUER,
      authorization: {
        params: {
          scope: `openid email profile offline_access urn:zitadel:iam:org:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/zitadel`,
        },
      },
      token: true,

      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      // profile method and other stuff
      clientId: process.env.ZITADEL_CLIENT_ID,
    } satisfies Provider,
  ],
})
