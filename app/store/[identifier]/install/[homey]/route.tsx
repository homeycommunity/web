import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "auth"
import { connect } from "emitter-io"

export const dynamic = "force-dynamic"
export async function POST(
  request: Request,
  {
    params: paramsPromise,
  }: { params: Promise<{ identifier: string; homey: string }> }
) {
  const params = await paramsPromise
  const session = await auth()
  const url = new URL(request.url)
  const version = url.searchParams.get("version")
  if (!session || !session.user) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const prisma = new PrismaClient()
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email!,
    },
  })

  if (!user) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const homey = await prisma.homey.findFirst({
    where: {
      userId: user.id,
      id: params.homey,
    },
  })

  const emitter = connect({
    host: "wss://events.homeycommunity.space",
    port: 443,
    secure: true,
  })
    .on("error", (e) => {
      console.log(e)
    })
    .on("connect", () => {
      console.log("connected")
      emitter.publish({
        key: process.env.EMITTER_KEY!,
        channel: "homey/" + homey!.homeyId,
        message: JSON.stringify({
          type: "install",
          app: params.identifier,
          version,
        }),
        ttl: 300,
      })
      console.log(`published ${"homey/" + homey!.homeyId}`)
    })

  //emitter.disconnect();

  return NextResponse.json({
    status: 200,
    message: "Installed",
  })
}
