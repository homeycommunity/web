import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { AuthenticatedRequest, requireAuth } from "@/app/api/middleware"

export const dynamic = "force-dynamic"

export const DELETE = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()

    await prisma.app.delete({
      where: {
        id: body.id,
        authorId: req.auth.user.id,
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
    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    )
  }
})
