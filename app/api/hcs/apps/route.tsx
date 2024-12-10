import { NextResponse } from "next/server"

import { requireScopes } from "@/lib/api-key"
import { prisma } from "@/lib/prisma"

import { requireAuth, type AuthenticatedRequest } from "../../middleware"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

// Protect GET with read:apps scope
export const GET = requireAuth(
  requireScopes(["read:apps"])(async (req: AuthenticatedRequest) => {
    const apps = await prisma.app.findMany({
      where: {
        versions: {
          some: {},
        },
      },
      include: {
        versions: true,
      },
    })

    const onlyLastVersion = apps.map((app) => {
      return {
        ...app,
        versions: [app.versions[app.versions.length - 1]],
      }
    })

    return NextResponse.json(onlyLastVersion, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    })
  })
)

// Protect POST with write:apps scope
export const POST = requireAuth(
  requireScopes(["write:apps"])(async (req: AuthenticatedRequest) => {
    try {
      const data = await req.json()
      // Handle app creation logic here
      return NextResponse.json(
        { message: "App created" },
        { headers: corsHeaders }
      )
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create app" },
        { status: 400, headers: corsHeaders }
      )
    }
  })
)
