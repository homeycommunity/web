import { NextResponse } from "next/server"
import axios from "axios"

import { requireScopes } from "@/lib/api-key"
import { prisma } from "@/lib/prisma"
import { AuthenticatedRequest, requireAuth } from "@/app/api/middleware"

export const GET = requireAuth(
  requireScopes<{ params: Promise<{ identifier: string }> }>(["homey:devices"])(
    async (
      req: AuthenticatedRequest,
      { params }: { params: Promise<{ identifier: string }> }
    ) => {
      const homey = await prisma.homey.findFirst({
        where: {
          homeyId: (await params).identifier,
        },
      })

      const devices = await axios.get(
        `${homey?.remoteUrl}/api/manager/devices/device`,
        {
          headers: {
            Authorization: `Bearer ${homey?.sessionToken}`,
          },
        }
      )

      return NextResponse.json(devices.data ?? [])
    }
  )
)
