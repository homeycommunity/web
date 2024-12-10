import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    // Update only the name
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
      },
    })

    return Response.json({
      name: updatedUser.name,
    })
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
