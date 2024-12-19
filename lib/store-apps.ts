import { prisma } from "./prisma"

export const storeApps = async (
  apps: {
    id: string
    name: string
    version: string
    origin: string
    channel: string
    autoupdate: boolean
  }[],
  homeyId: string
) => {
  const currentApps = await prisma.homeyApp.findMany({
    where: {
      homeyId: homeyId,
    },
  })

  const currentAppIds = currentApps.map((app) => app.appId)

  const newApps = apps.filter((app) => !currentAppIds.includes(app.id))
  const deletedApps = currentApps.filter(
    (app) => !apps.find((a) => a.id === app.appId)
  )

  const updatedApps = currentApps
    .filter((app) => apps.find((a) => a.id === app.appId))
    .map((app) => {
      const newApp = apps.find((a) => a.id === app.appId)
      return {
        ...app,
        version: newApp?.version,
        origin: newApp?.origin,
        channel: newApp?.channel,
        autoUpdate: newApp?.autoupdate,
      }
    })

  await prisma.homeyApp.deleteMany({
    where: {
      id: {
        in: deletedApps.map((app) => app.id),
      },
    },
  })

  await prisma.homeyApp.createMany({
    data: newApps.map((app) => ({
      homeyId: homeyId,
      appId: app.id,
      name: app.name,
      version: app.version,
      origin: app.origin,
      channel: app.channel,
      autoUpdate: app.autoupdate,
    })),
  })

  for (const app of updatedApps) {
    await prisma.homeyApp.update({
      where: { id: app.id },
      data: {
        name: app.name,
        appId: app.appId,
        version: app.version,
        origin: app.origin,
        channel: app.channel,
        autoUpdate: app.autoUpdate,
      },
    })
  }
}
