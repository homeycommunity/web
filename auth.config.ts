import { NextAuthConfig } from "next-auth"

export default {
  providers: [
    {
      id: "logto",
      name: "Logto",
      type: "oidc",
      issuer: process.env.AUTH_ISSUER + "/oidc",
      // You can get the well-known URL from the Logto Application Details page,
      // in the field "OpenID Provider configuration endpoint"
      authorization: {
        params: { scope: "openid offline_access profile email" },
      },
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile: any) {
        // You can customize the user profile mapping here
        return {
          id: profile.sub,
          name: profile.name ?? profile.username,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
} satisfies NextAuthConfig
