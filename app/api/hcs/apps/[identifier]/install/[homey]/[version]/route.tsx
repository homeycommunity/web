import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Client } from "minio"

import { stream2buffer } from "@/lib/stream2buffer"
import { decryptToken } from "@/lib/token-encryption"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  {
    params: paramsPromise,
  }: {
    params: Promise<{ identifier: string; version: string; homey: string }>
  },
  res: NextResponse
) {
  const params = await paramsPromise
  const session = await auth()
  if (!session || !session.user) {
    return new Response("{}", {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
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

  const token = await prisma.homeyToken.findFirst({
    where: {
      userId: user.id,
    },
  })

  if (!token) {
    return new Response("{}", {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  }

  const { identifier, version } = params

  const app = await prisma.app.findFirst({
    where: {
      identifier,
    },
    include: {
      versions: {
        where: {
          version,
        },
        take: 1,
      },
    },
  })

  const homey = await prisma.homey.findFirst({
    where: {
      id: params.homey,
    },
  })

  if (!app || !app.versions?.[0]) {
    return NextResponse.json(
      {
        status: 404,
        message: "Not Found",
      },
      {
        status: 404,
      }
    )
  }

  var minioClient = new Client({
    endPoint: "storage.homeycommunity.space",
    port: 443,
    useSSL: true,
    accessKey: process.env.MINIO_TOKEN!,
    secretKey: process.env.MINIO_SECRET!,
  })

  const file = await minioClient.getObject("apps", app.versions[0].file)
  const buffer = await stream2buffer(file)
  //const env = await getEnv(Readable.from(buffer))
  const form = new FormData()
  form.append("app", new Blob([buffer]), identifier + "-" + version + ".tar.gz")
  form.append("debug", "false")

  form.append("env", "{}")

  form.append("purgeSettings", "false")

  const bearerToken = await decryptToken(
    token.accessToken,
    token.encryptionKey!
  )
  const postResponse = await fetch(`${homey?.remoteUrl}/api/manager/devkit`, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((e) => {
      return e.text()
    })
    .catch((err) => {
      console.log(err)
    })

  return new Response(postResponse as string)
}
