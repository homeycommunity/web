import { athomLogin } from "@homeycommunity/homey-auth"
import axios from "axios"
import { connect } from "emitter-io"

import { prisma } from "@/lib/prisma"
import { getSessionTokenFromAccessToken } from "@/lib/session-token"
import { storeApps } from "@/lib/store-apps"
import { encryptToken, generateEncryptionKey } from "@/lib/token-encryption"

import { AuthenticatedRequest, requireAuth } from "../../middleware"

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  const { email, password, twoFactor } = await req.json()

  const responseBody = await athomLogin(
    process.env.BROWSERLESS_URI!,
    process.env.ATHOM_CLIENT_ID!,
    process.env.ATHOM_CLIENT_SECRET!,
    email,
    password,
    twoFactor
  )

  const accessToken = responseBody.access_token
  const newEncryptionKey = generateEncryptionKey()
  await prisma.homeyToken.upsert({
    where: {
      userId: req.auth?.user.id,
    },
    create: {
      userId: req.auth?.user.id,
      accessToken: encryptToken(accessToken, newEncryptionKey!),
      refreshToken: encryptToken(responseBody.refresh_token, newEncryptionKey!),
      encryptionKey: newEncryptionKey,
      expires: new Date(Date.now() + responseBody.expires_in * 1000 - 1000),
    },
    update: {
      accessToken: encryptToken(accessToken, newEncryptionKey!),
      refreshToken: encryptToken(responseBody.refresh_token, newEncryptionKey!),
      encryptionKey: newEncryptionKey,
      expires: new Date(Date.now() + responseBody.expires_in * 1000 - 1000),
    },
  })

  const me = await axios.get(`https://api.athom.com/user/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  let homeys = me.data.homeys

  for (const newHomey of homeys) {
    await prisma.homey.upsert({
      where: {
        homeyId_userId: {
          homeyId: newHomey.id,
          userId: req.auth?.user.id,
        },
      },
      create: {
        homeyId: newHomey.id,
        name: newHomey.name,
        userId: req.auth?.user.id,
        remoteUrl: newHomey.remoteUrl,
        localUrl: newHomey.localUrlSecure,
        remoteForwardedUrl: newHomey.remoteUrlForwarded,
      },
      update: {
        name: newHomey.name,
        remoteUrl: newHomey.remoteUrl,
        localUrl: newHomey.localUrlSecure,
        remoteForwardedUrl: newHomey.remoteUrlForwarded,
      },
    })
  }

  const homeysInDB = await prisma.homey.findMany({
    where: {
      userId: req.auth?.user.id,
    },
  })

  for (const homey of homeysInDB) {
    const sessionToken = await getSessionTokenFromAccessToken(
      accessToken,
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
          version: app.version,
          origin: app.origin,
          channel: app.channel,
          autoupdate: app.autoupdate,
        }
      }
    )
    if (!homey.eventKey) {
      await new Promise((resolve) => {
        const emitter = connect({
          host: "wss://events.homeycommunity.space",
          port: 443,
          secure: true,
        })
          .on("keygen", async function call(id) {
            await prisma.homey.update({
              where: {
                id: homey.id,
              },
              data: {
                sessionToken: encryptToken(sessionToken, newEncryptionKey!),
                eventKey: id.key,
              },
            })
            await storeApps(apps, homey.id)
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
          id: homey.id,
        },
        data: {
          sessionToken: encryptToken(sessionToken, newEncryptionKey!),
        },
      })
      await storeApps(apps, homey.id)
    }
  }
  return new Response(JSON.stringify(me.data), {
    headers: { "Content-Type": "application/json" },
  })
})
