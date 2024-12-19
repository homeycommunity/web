import { url } from "inspector"
import axios from "axios"
import { connect } from "emitter-io"

import { prisma } from "./prisma"

export const triggerAutoUpdate = async (
  identifier: string,
  version: string,
  blob: Buffer<ArrayBufferLike>,
  env: string
) => {
  const homeyApps = await prisma.homeyApp.findMany({
    where: {
      appId: identifier,
      autoUpdate: true,
    },
    include: {
      homey: true,
    },
  })
  const emitter = connect({
    host: "wss://events.homeycommunity.space",
    port: 443,
    secure: true,
  })
  await new Promise((resolve) => {
    emitter
      .on("error", (e) => {
        console.log(e)
      })
      .on("connect", () => {
        console.log("connected")
        resolve(true)
      })
  })

  for (const homeyApp of homeyApps) {
    const homey = homeyApp.homey
    if (homey.sessionToken) {
      const checkifHomeyHasApp = await prisma.homeyApp.findFirst({
        where: {
          homeyId: homey.id,
          appId: "space.homeycommunity.app",
        },
      })
      if (checkifHomeyHasApp) {
        emitter.publish({
          key: process.env.EMITTER_KEY!,
          channel: "homey/" + homey!.homeyId,
          message: JSON.stringify({
            type: "install",
            app: identifier,
            version,
          }),
        })
      } else if (homey.remoteForwardedUrl) {
        const response = await fetch(homey.remoteForwardedUrl)
        if (response.ok) {
          const formData = new FormData()
          formData.append("app", new Blob([blob]), "app.tar.gz")
          formData.append("env", env)
          formData.append("purgeSettings", "false")
          formData.append("debug", "false")
          // Use the store install endpoint to trigger installation
          const installResponse = await fetch(`${url}/api/manager/devkit`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${homey.sessionToken}`,
            },
          })

          const updateApp = await axios.put(
            `${homey.remoteForwardedUrl}/api/manager/apps/app/${identifier}`,
            {
              origin: "devkit_install",
              channel: "test",
            },
            { headers: { Authorization: `Bearer ${homey.sessionToken}` } }
          )

          if (!installResponse.ok) {
            throw new Error("Failed to install Homey Community Store")
          }
        }
      }
    }
  }
}
