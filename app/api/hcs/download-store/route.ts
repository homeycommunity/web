import { NextRequest, NextResponse } from "next/server"
import { Client } from "minio"

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

export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const minioClient = new Client({
      endPoint: "storage.homeycommunity.space",
      port: 443,
      useSSL: true,
      accessKey: process.env.MINIO_TOKEN!,
      secretKey: process.env.MINIO_SECRET!,
    })

    // Get latest store version from store bucket
    const file = await minioClient.getObject(
      "apps",
      "homeycommunityspace.tar.gz"
    )

    return new NextResponse(await stream2buffer(file), {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition":
          'attachment; filename="homey-community-space.tar.gz"',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error("Error downloading store:", error)
    return NextResponse.json(
      {
        status: 500,
        message: "Failed to download store",
      },
      { status: 500 }
    )
  }
})
