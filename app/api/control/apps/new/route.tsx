import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

import { controlAppsNewSchema } from "@/app/control/apps/new/schema"

export const dynamic = "force-dynamic"

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }
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
    await prisma.app.create({
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        identifier: validatedBody.identifier,
        author: {
          connect: {
            id: user.id,
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
}
