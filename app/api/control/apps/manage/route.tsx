import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { AuthenticatedRequest, requireAuth } from "@/app/api/middleware"

import { controlAppsManageSchema } from "../../../../control/apps/manage/[identifier]/schema"

export const dynamic = "force-dynamic"
export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const validatedBody = controlAppsManageSchema.parse(body)

    // check if app already exists
    const app = await prisma.app.findUnique({
      where: {
        id: validatedBody.id,
        authorId: req.auth.user.id,
      },
    })
    if (!app) {
      return NextResponse.json(
        {
          status: 404,
          message: "App not found",
        },
        {
          status: 401,
        }
      )
    }
    await prisma.app.update({
      where: {
        id: validatedBody.id,
        authorId: req.auth.user.id,
      },
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
      },
    })
    return NextResponse.json(
      {
        status: 200,
        message: "OK",
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid request",
      },
      {
        status: 400,
      }
    )
  }
})
