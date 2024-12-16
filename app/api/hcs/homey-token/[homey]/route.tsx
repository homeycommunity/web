import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/token-encryption"
import { AuthenticatedRequest, requireAuth } from "@/app/api/middleware"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

export const GET = requireAuth(
  async (
    req: AuthenticatedRequest,
    { params: paramsPromise }: { params: Promise<{ homey: string }> }
  ) => {
    const params = await paramsPromise

    const token = await prisma.homeyToken.findFirst({
      where: {
        userId: req.auth?.user?.id,
      },
    })
    const homey = await prisma.homey.findFirst({
      where: {
        userId: req.auth?.user?.id,
        homeyId: params.homey,
      },
    })
    if (!token || !token.encryptionKey) {
      return new Response("{}", {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      })
    }

    try {
      const decryptedAccessToken = decryptToken(
        token.accessToken,
        token.encryptionKey
      )

      return new Response(
        JSON.stringify({
          token: decryptedAccessToken,
          localUrl: homey?.localUrl,
          remoteUrl: homey?.remoteUrl,
          remoteForwardedUrl: homey?.remoteForwardedUrl,
          sessionToken: decryptToken(homey?.sessionToken!, token.encryptionKey),
          expiresAt: token?.expires.getTime(),
          eventKey: homey?.eventKey,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    } catch (error) {
      console.error("Failed to decrypt token:", error)
      return new Response("{}", {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      })
    }
  }
)
