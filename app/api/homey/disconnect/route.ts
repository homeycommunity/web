import { prisma } from "@/lib/prisma"

import { AuthenticatedRequest, requireAuth } from "../../middleware"

export const dynamic = "force-dynamic"

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    // Delete the homey token
    await prisma.homeyToken.delete({
      where: {
        userId: req.auth?.user.id,
      },
    })

    // Delete associated homeys
    await prisma.homey.deleteMany({
      where: {
        userId: req.auth?.user.id,
      },
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Failed to disconnect Homey account:", error)
    return new Response(
      JSON.stringify({ error: "Failed to disconnect Homey account" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})
