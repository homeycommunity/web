import { stream2buffer } from "@/lib/stream2buffer";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Client } from "minio";
import { NextRequest, NextResponse } from "next/server";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function OPTIONS (req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST (req: NextRequest, { params }: { params: { identifier: string, version: string } }, res: NextResponse) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return new Response('{}', {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  }
  const data = await axios.get('https://auth.homeycommunity.space/application/o/userinfo/', {
    headers: {
      Authorization: auth
    }
  });

  const user: string = (data.data?.sub);
  if (!user) {
    return new Response('{}', {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  }

  const prisma = new PrismaClient();
  const userFromAccount = await prisma.account.findFirst({
    where: {
      providerAccountId: user
    },
    include: {
      user: true
    }
  })
  if (!userFromAccount) {
    return new Response('{}', {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  }


  const { identifier, version } = params;

  const app = await prisma.app.findFirst({
    where: {
      identifier
    },
    include: {
      versions: {
        where: {
          version
        },
        take: 1
      }
    }
  })

  if (!app || !app.versions?.[0]) {
    return NextResponse.json({
      status: 404,
      message: "Not Found"
    }, {
      status: 404
    });
  }

  var minioClient = new Client({
    endPoint: 'drive.homeycommunity.space',
    port: 443,
    useSSL: true,
    accessKey: process.env.MINIO_TOKEN!,
    secretKey: process.env.MINIO_SECRET!
  });

  const file = await minioClient.getObject('apps', app.versions[0].file);



  return new NextResponse(await stream2buffer(file));
}
