import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

import { auth } from "@/app/auth"

export const dynamic = "force-dynamic"

export async function DELETE(req: NextRequest) {
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

    await prisma.app.delete({
      where: {
        id: body.id,
      },
      include: {
        versions: true,
      },
    })

    return NextResponse.json(
      {
        status: 200,
        message: "Deleted",
      },
      {
        status: 200,
      }
    )
  } catch (e) {
    console.log(e)
  }
}
