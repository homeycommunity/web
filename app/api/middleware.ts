import { type NextRequest } from "next/server"
import { auth } from "@/auth"

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

  // Try API key authentication
  const apiKeyStr = parseApiKey(request.headers.get("authorization"))
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
