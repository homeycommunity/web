import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { connect } from "emitter-io"

import { prisma } from "@/lib/prisma"
import { getSessionTokenFromAccessToken } from "@/lib/session-token"
import { encryptToken, generateEncryptionKey } from "@/lib/token-encryption"

import { AuthenticatedRequest, requireAuth } from "../../middleware"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  const userObj = req.auth?.user

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
                  remoteUrl: homey.remoteUrl,
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
            remoteUrl: homey.remoteUrl,
            localUrl: homey.localUrl,
            remoteForwardedUrl: homey.remoteUrlForwarded,
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

  const homeys = await prisma.homey.findMany({
    where: {
      userId: userObj.id,
    },
  })

  await Promise.all(
    homeys.map(async (homey) => {
      const sessionToken = await getSessionTokenFromAccessToken(
        input.token.access_token,
        homey.remoteUrl!
      )
      const listApps = await axios.get(
        `${homey?.remoteUrl}/api/manager/apps/app`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )

      const apps = Object.entries(listApps.data).map(
        ([key, app]: [string, any]) => {
          return {
            id: key,
            name: app.name,
            versions: app.version,
          }
        }
      )
      await prisma.homey.update({
        where: {
          id: homey.id,
        },
        data: {
          sessionToken: encryptToken(sessionToken, encryptionKey),
          apps: apps,
        },
      })
    })
  )

  return new Response("{}", {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  })
})
