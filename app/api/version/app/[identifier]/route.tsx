import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export async function GET(
  request: Request,
  {
    params: paramsPromise,
  }: {
    params: Promise<{
      identifier: string
    }>
  }
) {
  const params = await paramsPromise
  const prisma = new PrismaClient()
  const apps = await prisma.app.findMany({
    where: {
      identifier: params.identifier,
      versions: {
        some: {},
      },
    },
    include: {
      versions: true,
    },
  })

  if (apps.length === 0) {
    return NextResponse.json({ error: "App not found" }, { status: 404 })
  }

  return NextResponse.json({
    identifier: apps[0].identifier,
    version: apps[0].versions[0].version,
  })
}
