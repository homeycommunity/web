import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
// unzip
import AdmZip from "adm-zip";
import { Client } from 'minio';
// with file

export async function POST (req: Request) {

  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({
        status: 401,
        message: "Unauthorized"
      }, {
        status: 401
      });
    }

    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!
      }
    })

    if (!user) {
      return NextResponse.json({
        status: 401,
        message: "Unauthorized"
      }, {
        status: 401
      });
    }

    const body = await req.formData();

    // blob to zip

    const app = body.get('id') as string;
    const fileBlob = Buffer.from(await (body.get('file') as Blob).arrayBuffer());
    const z = new AdmZip(fileBlob);

    const appInfo = JSON.parse(z.getEntry('app.json')?.getData().toString('utf8')!);
    const filename = appInfo.id + '@' + appInfo.version + '.zip'
    const appDb = await prisma.app.findFirst({
      where: {
        id: app
      }
    });

    if (appInfo.id !== appDb?.identifier) {
      return NextResponse.json({
        'message': 'Not the same identifier',
        status: 409
      }, {
        status: 409
      })
    }

    var minioClient = new Client({
      endPoint: 'drive.homeycommunity.space',
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_TOKEN!,
      secretKey: process.env.MINIO_SECRET!
    });

    await minioClient.putObject('apps', filename, fileBlob);

    const appVersion = await prisma.appVersion.create({
      data: {
        version: appInfo.version,
        file: filename,
        available: true,
        experimental: true,
        appId: app,
        approved: false,
        publishedAt: new Date()
      }
    })

  }
  catch (e) {
    console.log(e);
  }
}
