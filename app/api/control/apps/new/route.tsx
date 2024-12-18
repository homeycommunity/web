import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { AuthenticatedRequest, requireAuth } from "@/app/api/middleware"
import { controlAppsNewSchema } from "@/app/control/apps/new/schema"

export const dynamic = "force-dynamic"

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const validatedBody = controlAppsNewSchema.parse(body)
    // check if app already exists
    const app = await prisma.app.findUnique({
      where: {
        identifier: validatedBody.identifier,
      },
    })

    if (app) {
      return NextResponse.json(
        {
          status: 409,
          message: "App already exists with this identifier",
        },
        {
          status: 409,
        }
      )
    }

    // check at athom if app already exists
    const response = await fetch(
      `https://homey.app/nl-nl/app/${validatedBody.identifier}`
    )
    if (response.status === 200) {
      return NextResponse.json(
        {
          status: 409,
          message:
            "App already exists in the Homey Official Store, please use a different identifier",
        },
        { status: 409 }
      )
    }

    await prisma.app.create({
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        identifier: validatedBody.identifier,
        author: {
          connect: {
            id: req.auth.user.id,
          },
        },
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
