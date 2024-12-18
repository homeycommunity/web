import { prisma } from "@/lib/prisma"

import { requireAuth } from "../../middleware"

export const GET = requireAuth(
  async (
    request: Request,
    { params }: { params: Promise<{ identifier: string }> }
  ) => {
    const { identifier } = await params

    const homey = await prisma.homey.findFirst({
      where: { homeyId: identifier },
    })
    if (!homey) {
      return Response.json({ error: "Homey not found" }, { status: 404 })
    }
    const { sessionToken, eventKey, ...homeyWithoutSensitiveData } = homey

    return Response.json({ homey: homeyWithoutSensitiveData })
  }
)
