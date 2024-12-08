import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import axios from "axios"
import { connect } from "emitter-io"

import { userInfoUrl } from "@/config/user-info"
import { encryptToken, generateEncryptionKey } from "@/lib/token-encryption"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
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
  console.log(data)
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
  const input = await req.json()

  await Promise.all(
    input.homey.map(async (homey: any) => {
      const homeyInDB = await prisma.homey.findFirst({
        where: {
          homeyId: homey.id,
          userId: userObj.id,
        },
      })

      if (!homeyInDB) {
        await new Promise((resolve) => {
          const emitter = connect({
            host: "wss://events.homeycommunity.space",
            port: 443,
            secure: true,
          })
            .on("keygen", async function call(id) {
              await prisma.homey.create({
                data: {
                  name: homey.name,
                  homeyId: homey.id,
                  userId: userObj.id,
                  eventKey: id.key,
                },
              })
              emitter.off("keygen", call)
              emitter.disconnect()
              resolve(true)
            })
            .keygen({
              key: process.env.EMITTER_KEYGEN!,
              channel: "homey/" + homey.id + "/",
              type: "r",
              ttl: 0,
            })
        })
      } else {
        await prisma.homey.update({
          where: {
            homeyId_userId: {
              homeyId: homey.id,
              userId: userObj.id,
            },
          },
          data: {
            name: homey.name,
          },
        })
      }
    })
  )

  // Generate or get existing encryption key
  const existingToken = await prisma.homeyToken.findUnique({
    where: {
      userId: userObj.id,
    },
    select: {
      encryptionKey: true,
    },
  })

  const encryptionKey = existingToken?.encryptionKey || generateEncryptionKey()

  // Encrypt tokens
  const encryptedAccessToken = encryptToken(
    input.token.access_token,
    encryptionKey
  )
  const encryptedRefreshToken = input.token.refresh_token
    ? encryptToken(input.token.refresh_token, encryptionKey)
    : null

  await prisma.homeyToken.upsert({
    where: {
      userId: userObj.id,
    },
    update: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expires: input.token.expires_at,
      encryptionKey: encryptionKey,
    },
    create: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expires: input.token.expires_at,
      userId: userObj.id,
      encryptionKey: encryptionKey,
    },
  })

  console.log("done")

  return new Response("{}", {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  })
}
