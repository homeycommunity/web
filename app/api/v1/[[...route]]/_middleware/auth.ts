import { bearerAuth } from "hono/bearer-auth"

import { validateApiKey } from "@/lib/api-key"

export const auth = bearerAuth({
  verifyToken: async (token, c) => {
    const apiKey = await validateApiKey(token)
    if (!apiKey) {
      return false
    }
    c.set("apiKey", apiKey)
    return true
  },
})
