import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import axios from "axios"

import { userInfoUrl } from "@/config/user-info"
import { decryptToken } from "@/lib/token-encryption"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ homey: string }> }
) {
  const params = await paramsPromise
  const auth = req.headers.get("authorization")
  if (!auth) {
    return new Response("{}", {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  }
  const data = await axios.get(userInfoUrl(), {
    headers: {
      Authorization: auth,
    },
  })

  const user: string = data.data?.sub
  if (!user) {
    return new Response("{}", {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  }
  const prisma = new PrismaClient()
  const userFromAccount = await prisma.account.findFirst({
    where: {
      providerAccountId: user,
    },
    include: {
      user: true,
    },
  })
  if (!userFromAccount) {
    return new Response("{}", {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  }
  const userObj = userFromAccount.user
  const token = await prisma.homeyToken.findFirst({
    where: {
      userId: userObj.id,
    },
  })
  const homey = await prisma.homey.findFirst({
    where: {
      userId: userObj.id,
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
