import { ApiKey } from "@prisma/client"
import axios from "axios"
import { Context } from "hono"
import { describeRoute } from "hono-openapi"

import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/token-encryption"

export const homeyApps = {
  url: "/homey/:homeyId/apps",
  method: "GET",
  description: describeRoute({
    tags: ["homey"],
    summary: "Get apps for a homey",
    security: [{ bearerAuth: ["homey:apps"] }],
  }),
  handler: async (c: Context) => {
    const apiKey = c.get("apiKey") as ApiKey
    const homey = await prisma.homey.findFirst({
      where: {
        userId: apiKey.userId,
        homeyId: c.req.param("homeyId"),
      },
    })

    console.log("homey", homey)

    const token = await prisma.homeyToken.findFirst({
      where: {
        userId: apiKey.userId,
      },
    })
    console.log("token", token)
    const sessionToken = decryptToken(
      homey?.sessionToken!,
      token?.encryptionKey!
    )

    const apps = await axios.get(`${homey?.remoteUrl}/api/manager/apps/app`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
    return c.json(apps.data)
  },
}
