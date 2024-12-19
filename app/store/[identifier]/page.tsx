import { auth } from "@/auth"
import { Homey, HomeyApp, PrismaClient } from "@prisma/client"

import { StoreIdentifierView } from "@/app/store/[identifier]/view"

export const dynamic = "force-dynamic"

export default async function StorePage({
  params: paramsPromise,
}: {
  params: Promise<{ identifier: string }>
}) {
  const params = await paramsPromise
  const prisma = new PrismaClient()
  const session = await auth()
  let homeys: (Homey & { HomeyApp: HomeyApp[] })[] = []
  if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email!,
      },
    })
    homeys = await prisma.homey.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        HomeyApp: true,
      },
    })
  }

  const app = await prisma.app.findFirst({
    where: {
      identifier: params.identifier,
    },
    include: {
      versions: {
        orderBy: {
          version: "desc",
        },
        take: 1,
      },
      author: true,
    },
  })

  if (!app) {
    return <h1>404 not found</h1>
  }

  return <StoreIdentifierView app={app} homeys={homeys} />
}
