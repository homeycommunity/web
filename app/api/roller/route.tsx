import { PrismaClient } from "@prisma/client"
import axios from "axios"

import { getSessionTokenFromAccessToken } from "@/lib/session-token"
import {
  decryptToken,
  encryptToken,
  generateEncryptionKey,
} from "@/lib/token-encryption"

export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  if (process.env.ROLLER_KEY === request.headers.get("x-roller-key")) {
    return new Response(JSON.stringify({}))
  }

  const prisma = new PrismaClient()
  const tokens = await prisma.homeyToken.findMany()
  for (const token of tokens) {
    if (
      token.expires.getTime() < Date.now() - 30000 ||
      request.headers.get("x-force-update") === "true"
    ) {
      const decryptedRefreshToken = decryptToken(
        token.refreshToken!,
        token.encryptionKey!
      )
      // refresh token
      // www token
      const a = new URLSearchParams()
      a.set("client_id", process.env.HOMEY_CLIENT_ID!)
      a.set("client_secret", process.env.HOMEY_CLIENT_SECRET!)
      a.set("grant_type", "refresh_token")
      a.set("refresh_token", decryptedRefreshToken!)
      const newEncryptionKey = generateEncryptionKey()
      const data = await axios.post(
        "https://api.athom.com/oauth2/token",
        a.toString()
      )
      const accessToken = data.data.access_token
      await prisma.homeyToken.update({
        where: {
          id: token.id,
        },
        data: {
          accessToken: encryptToken(accessToken, newEncryptionKey!),
          refreshToken: encryptToken(
            data.data.refresh_token,
            newEncryptionKey!
          ),
          encryptionKey: newEncryptionKey,
          expires: new Date(Date.now() + data.data.expires_in * 1000 - 1000),
        },
      })
      const homeysWithoutRemoteUrl = await prisma.homey.findMany({
        where: {
          userId: token.userId,
          remoteUrl: "",
        },
      })

      console.log(homeysWithoutRemoteUrl)

      const me = await axios.get(`https://api.athom.com/user/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

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
            },
          })
        }
      }

      const homeysOfUser = await prisma.homey.findMany({
        where: {
          userId: token.userId,
        },
      })

      await Promise.all(
        homeysOfUser.map(async (homey) => {
          const sessionToken = await getSessionTokenFromAccessToken(
            accessToken,
            homey.remoteUrl!
          )
          await prisma.homey.update({
            where: {
              id: homey.id,
            },
            data: {
              sessionToken: encryptToken(sessionToken, newEncryptionKey!),
            },
          })
        })
      )
    }
  }
  return new Response(JSON.stringify({}))
}
