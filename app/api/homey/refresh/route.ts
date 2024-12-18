import { NextResponse } from "next/server"
import axios from "axios"

import { prisma } from "@/lib/prisma"
import { getSessionTokenFromAccessToken } from "@/lib/session-token"
import { decryptToken } from "@/lib/token-encryption"

import { AuthenticatedRequest, requireAuth } from "../../middleware"

export const POST = requireAuth<AuthenticatedRequest>(async (req) => {
  try {
    const token = await prisma.homeyToken.findFirst({
      where: { userId: req.auth.user.id },
    })
    const homeysOfUser = await prisma.homey.findMany({
      where: { userId: req.auth.user.id },
    })

    const me = await axios.get(`https://api.athom.com/user/me`, {
      headers: {
        Authorization: `Bearer ${decryptToken(token?.accessToken!, token?.encryptionKey!)}`,
      },
    })

    const homeysWithoutRemoteUrl = homeysOfUser.filter(
      (homey) =>
        homey.remoteUrl === "" ||
        homey.remoteUrl === null ||
        homey.localUrl === "" ||
        homey.localUrl === null ||
        homey.remoteForwardedUrl === "" ||
        homey.remoteForwardedUrl === null
    )

    for (const newHomey of me.data.homeys) {
      const homey = homeysWithoutRemoteUrl.find(
        (homey) => homey.homeyId === newHomey.id
      )

      if (homey) {
        await prisma.homey.update({
          where: {
            id: homey.id,
          },
          data: {
            remoteUrl: newHomey.remoteUrl,
            localUrl: newHomey.localUrlSecure,
            remoteForwardedUrl: newHomey.remoteUrlForwarded,
          },
        })
      } else if (!homeysOfUser.find((homey) => homey.homeyId === newHomey.id)) {
        const sessionToken = await getSessionTokenFromAccessToken(
          decryptToken(token?.accessToken!, token?.encryptionKey!),
          newHomey.remoteUrl
        )
        await prisma.homey.create({
          data: {
            homeyId: newHomey.id,
            userId: req.auth.user.id,
            remoteUrl: newHomey.remoteUrl,
            localUrl: newHomey.localUrlSecure,
            remoteForwardedUrl: newHomey.remoteUrlForwarded,
            sessionToken: sessionToken,
          },
        })
      }
    }

    const homeys = await prisma.homey.findMany({
      where: { userId: req.auth.user.id },
    })

    await Promise.all(
      homeys.map(async (homey) => {
        const listApps = await axios.get(
          `${homey?.remoteUrl}/api/manager/apps/app`,
          {
            headers: {
              Authorization: `Bearer ${decryptToken(
                homey.sessionToken!,
                token?.encryptionKey!
              )}`,
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
              autoUpdate: app.autoupdate,
            }
          }
        )

        await prisma.homey.update({
          where: {
            id: homey.id,
          },
          data: {
            apps: apps,
          },
        })
      })
    )

    return NextResponse.json({ message: "Homeys refreshed" }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 })
  }
})
