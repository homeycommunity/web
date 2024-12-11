import { NextResponse } from "next/server"
import axios from "axios"

import { requireScopes } from "@/lib/api-key"
import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/token-encryption"
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

      const token = await prisma.homeyToken.findFirst({
        where: {
          userId: req.auth.user.id,
        },
      })

      if (!token) {
        return NextResponse.json({ error: "No token found" }, { status: 401 })
      }

      const decryptSessionToken = decryptToken(
        homey?.sessionToken!,
        token.encryptionKey!
      )

      console.log("awa", decryptSessionToken)

      const devices = await axios.get(
        `${homey?.remoteUrl}/api/manager/devices/device`,
        {
          headers: {
            Authorization: `Bearer ${decryptSessionToken}`,
          },
        }
      )

      return NextResponse.json(devices.data ?? [])
    }
  )
)
