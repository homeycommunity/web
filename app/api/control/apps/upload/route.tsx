import { File } from "buffer"
import { Readable } from "stream"
import { NextResponse } from "next/server"
import { Client } from "minio"
import { tarGzGlob } from "targz-glob"

import { prisma } from "@/lib/prisma"
import { triggerAutoUpdate } from "@/lib/trigger-auto-update"
import { requireAuth, type AuthenticatedRequest } from "@/app/api/middleware"

export const dynamic = "force-dynamic"

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.formData()

    const app = body.get("id")
    const bodyFile = body.get("file")

    if (!app || !bodyFile || !(bodyFile instanceof File)) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          status: 400,
        },
        { status: 400 }
      )
    }

    const fileBlob = Buffer.from(await bodyFile.arrayBuffer())
    const archive = Readable.from(fileBlob)
    // Extract and parse app.json and env.json from the archive
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
          message: "Invalid app.json: missing id or version",
          status: 409,
        },
        { status: 409 }
      )
    }

    // Verify app ownership and existence
    const appDb = await prisma.app.findFirst({
      where: {
        id: app as string,
        authorId: req.auth.user.id, // Ensure user owns the app
      },
    })

    if (!appDb) {
      return NextResponse.json(
        {
          message: "App not found or unauthorized",
          status: 404,
        },
        { status: 404 }
      )
    }

    if (appInfo.id !== appDb.identifier) {
      return NextResponse.json(
        {
          message: "App identifier mismatch",
          status: 409,
        },
        { status: 409 }
      )
    }

    // Check if version already exists
    const existingVersion = await prisma.appVersion.findFirst({
      where: {
        appId: app as string,
        version: appInfo.version,
      },
    })

    if (existingVersion) {
      return NextResponse.json(
        {
          message: "Version already exists",
          status: 409,
        },
        { status: 409 }
      )
    }

    const filename = `${appInfo.id}@${appInfo.version}.tar.gz`

    // Upload to MinIO
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: 443,
      useSSL: true,
      accessKey: process.env.MINIO_TOKEN!,
      secretKey: process.env.MINIO_SECRET!,
    })

    await minioClient.putObject("apps", filename, fileBlob)

    // Create app version in database
    const appVersion = await prisma.appVersion.create({
      data: {
        version: appInfo.version,
        file: filename,
        available: true,
        experimental: true,
        env: JSON.stringify(envInfo),
        appinfo: appInfo,
        appId: app as string,
        approved: false,
        publishedAt: new Date(),
      },
    })

    triggerAutoUpdate(
      appDb.identifier,
      appVersion.version,
      fileBlob,
      envInfo
    ).catch((e) => {
      console.error("Error triggering auto update:", e)
    })

    return NextResponse.json(
      {
        message: "Version uploaded successfully",
        status: 200,
        data: {
          version: appVersion.version,
          file: appVersion.file,
        },
      },
      { status: 200 }
    )
  } catch (e) {
    console.error("Error uploading version:", e)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: (e as Error).message,
        status: 500,
      },
      { status: 500 }
    )
  }
})
