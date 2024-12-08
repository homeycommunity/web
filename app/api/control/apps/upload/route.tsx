import { Readable } from "stream"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
// unzip
import { Client } from "minio"
import { tarGzGlob } from "targz-glob"

// with file

export const dynamic = "force-dynamic"
export async function POST(req: Request) {
  try {
    const session = await auth()
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

    const body = await req.formData()

    // blob to zip

    const app = body.get("id") as string
    const bodyFile = body.get("file") as File
    const fileBlob = Buffer.from(await bodyFile.arrayBuffer())
    const archive = Readable.from(fileBlob)
    const tarFile = bodyFile.name.replace(/\.tar\.gz$/, "")
    const z = await tarGzGlob(archive, [
      "./app.json",
      "app.json",
      "./env.json",
      "env.json",
    ])
    const appInfo = JSON.parse(
      z.get("app.json")! || z.get("./app.json")! || "{}"
    )
    const envInfo = JSON.parse(
      z.get("env.json")! || z.get("./env.json")! || "{}"
    )
    if (!appInfo?.id || !appInfo?.version) {
      return NextResponse.json(
        {
          message: "Not a valid app.json",
          status: 409,
        },
        {
          status: 409,
        }
      )
    }
    const filename = appInfo.id + "@" + appInfo.version + ".tar.gz"
    const appDb = await prisma.app.findFirst({
      where: {
        id: app,
      },
    })

    if (appInfo.id !== appDb?.identifier) {
      return NextResponse.json(
        {
          message: "Not the same identifier",
          status: 409,
        },
        {
          status: 409,
        }
      )
    }

    var minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: 443,
      useSSL: true,
      accessKey: process.env.MINIO_TOKEN!,
      secretKey: process.env.MINIO_SECRET!,
    })

    await minioClient.putObject("apps", filename, fileBlob)

    const appVersion = await prisma.appVersion.create({
      data: {
        version: appInfo.version,
        file: filename,
        available: true,
        experimental: true,
        env: envInfo,
        appinfo: appInfo,
        appId: app,
        approved: false,
        publishedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        message: "Uploaded",
        status: 200,
      },
      {
        status: 200,
      }
    )
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      {
        message: (e as Error).message,
        status: 500,
      },
      { status: 500 }
    )
  }
}
