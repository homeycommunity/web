import { NextRequest, NextResponse } from "next/server"
import { Client } from "minio"

import { prisma } from "@/lib/prisma"
import { stream2buffer } from "@/lib/stream2buffer"
import { AuthenticatedRequest, requireAuth } from "@/app/api/middleware"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export const dynamic = "force-dynamic"

export const GET = requireAuth(
  async (
    req: AuthenticatedRequest,
    {
      params: paramsPromise,
    }: { params: Promise<{ identifier: string; version: string }> }
  ) => {
    const params = await paramsPromise

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

    return new NextResponse(await stream2buffer(file), {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${app.identifier}.tar.gz"`,

        ...corsHeaders,
      },
    })
  }
)
