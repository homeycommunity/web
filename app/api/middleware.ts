import { type NextRequest } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import axios from "axios"

import { userInfoUrl } from "@/config/user-info"
import { parseApiKey, validateApiKey } from "@/lib/api-key"

export type AuthenticatedRequest = NextRequest & {
  auth: {
    user: {
      id: string
      email?: string | null
      name?: string | null
    }
    apiKey?: {
      id: string
      name: string
    }
  }
}

export async function withAuth<T>(
  request: NextRequest,
  handler: (req: AuthenticatedRequest, context: T) => Promise<Response>,
  context?: T
): Promise<Response> {
  // Try to get session from next-auth
  const session = await auth()
  if (session?.user?.id) {
    const req = request as AuthenticatedRequest
    req.auth = {
      user: {
        id: session.user.id,
        email: session.user.email || null,
        name: session.user.name || null,
      },
    }
    return handler(req, context as T)
  }

  const authString = request.headers.get("authorization")
  if (authString) {
    const data = await axios.get(userInfoUrl(), {
      headers: {
        Authorization: authString,
      },
    })
    const user: string = data.data?.sub
    if (user) {
      const prisma = new PrismaClient()
      const userFromAccount = await prisma.account.findFirst({
        where: {
          providerAccountId: user,
        },
        include: {
          user: true,
        },
      })
      if (userFromAccount) {
        const req = request as AuthenticatedRequest

        req.auth = {
          user: {
            id: userFromAccount.user.id,
            email: userFromAccount.user.email,
            name: userFromAccount.user.name,
          },
        }
        return handler(req, context as T)
      }
    }
  }

  // Try API key authentication
  const apiKeyStr = parseApiKey(authString)
  if (apiKeyStr) {
    const apiKey = await validateApiKey(apiKeyStr)
    if (apiKey?.user) {
      const req = request as AuthenticatedRequest
      req.auth = {
        user: {
          id: apiKey.user.id,
          email: apiKey.user.email,
          name: apiKey.user.name,
        },
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
        },
      }
      return handler(req, context as T)
    }
  }

  return new Response("Unauthorized", { status: 401 })
}

export function requireAuth<T>(
  handler: (req: AuthenticatedRequest, context: T) => Promise<Response>
) {
  return (request: NextRequest, context: T) =>
    withAuth(request, handler, context)
}
