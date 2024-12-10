import { NextResponse } from "next/server"

import { requireScopes } from "@/lib/api-key"
import { prisma } from "@/lib/prisma"

import { requireAuth, type AuthenticatedRequest } from "../../../middleware"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Use Next.js route segment config typing
type RouteContext = {
  params: Promise<{
    identifier: string
  }>
}

export const GET = requireAuth(
  requireScopes<RouteContext>(["read:versions"])(
    async (request: AuthenticatedRequest, { params }: RouteContext) => {
      const apps = await prisma.app.findMany({
        where: {
          identifier: (await params).identifier,
          versions: {
            some: {},
          },
        },
        include: {
          versions: {
            orderBy: {
              publishedAt: "desc",
            },
            take: 1,
          },
        },
      })

      if (apps.length === 0) {
        return NextResponse.json({ error: "App not found" }, { status: 404 })
      }

      return NextResponse.json({
        identifier: apps[0].identifier,
        version: apps[0].versions[0].version,
      })
    }
  )
)
