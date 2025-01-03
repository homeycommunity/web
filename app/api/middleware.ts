import { type NextRequest } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import axios from "axios"

import { userInfoUrl } from "@/config/user-info"

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
  if (authString && !authString?.startsWith("hcs_")) {
    try {
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
    } catch (error) {
      console.log(error)
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
