import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { type NextAuthOptions } from "next-auth"
import type { Provider } from "next-auth/providers"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "zitadel",
      name: "zitadel",
      type: "oauth",
      version: "2",

      allowDangerousEmailAccountLinking: true,
      wellKnown:
        process.env.ZITADEL_ISSUER + "/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: `openid email profile offline_access urn:zitadel:iam:org:project:id:${process.env.ZITADEL_PROJECT_ID}:aud`,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/zitadel/callback`,
        },
      },
      profile: (profile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
      idToken: true,

      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      // profile method and other stuff
      clientId: process.env.ZITADEL_CLIENT_ID,
    } satisfies Provider,
  ],
}
