import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import { requireAuth, type AuthenticatedRequest } from "../../../middleware"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

interface RouteContext {
  params: Promise<{
    identifier: string
  }>
}

export const GET = requireAuth(async (request, { params }: RouteContext) => {
  const { identifier } = await params

  const app = await prisma.app.findFirst({
    where: {
      identifier,
    },
    include: {
      versions: true,
    },
  })

  if (!app) {
    return NextResponse.json(
      {
        status: 404,
        message: "Not Found",
      },
      {
        status: 404,
        headers: corsHeaders,
      }
    )
  }

  return NextResponse.json(
    {
      status: 200,
      data: app,
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  )
})

// Add PUT handler for updating apps with write:apps scope
export const PUT = requireAuth(async (request, { params }: RouteContext) => {
  const { identifier } = await params
  const data = await request.json()

  try {
    const app = await prisma.app.update({
      where: {
        identifier,
        authorId: request.auth.user.id, // Ensure user owns the app
      },
      data,
    })

    return NextResponse.json(
      {
        status: 200,
        data: app,
      },
      {
        headers: corsHeaders,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 404,
        message: "App not found or unauthorized",
      },
      {
        status: 404,
        headers: corsHeaders,
      }
    )
  }
})

// Add DELETE handler with write:apps scope
export const DELETE = requireAuth(
  async (request: AuthenticatedRequest, { params }: RouteContext) => {
    const { identifier } = await params

    try {
      await prisma.app.delete({
        where: {
          identifier,
          authorId: request.auth.user.id, // Ensure user owns the app
        },
      })

      return NextResponse.json(
        {
          status: 200,
          message: "App deleted successfully",
        },
        {
          headers: corsHeaders,
        }
      )
    } catch (error) {
      return NextResponse.json(
        {
          status: 404,
          message: "App not found or unauthorized",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      )
    }
  }
)
