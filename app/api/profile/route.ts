import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    // Validate that email isn't already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: session.user.id,
          },
        },
      })

      if (existingUser) {
        return Response.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        email,
      },
    })

    return Response.json({
      name: updatedUser.name,
      email: updatedUser.email,
    })
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
