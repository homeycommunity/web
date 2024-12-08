import console from "console"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import axios from "axios"

import { decryptToken } from "@/lib/token-encryption"

export const dynamic = "force-dynamic"
export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ identifier: string }> }
) {
  const params = await paramsPromise
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
      { status: 401 }
    )
  }

  const token = await prisma.homeyToken.findFirst({
    where: {
      userId: user.id,
    },
  })
  const homey = await prisma.homey.findFirst({
    where: {
      userId: user.id,
      homeyId: params.identifier,
    },
  })

  const accessToken = decryptToken(token?.accessToken!, token?.encryptionKey!)
  console.log(accessToken)
  const apps = await axios.get(
    `https://${homey?.homeyId}.homey.athom-prod-euwest1-001.homeypro.net/api/manager/apps/app`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return NextResponse.json(apps.data)
}
