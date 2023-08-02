import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { connect } from "emitter-io";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET (request: Request, { params }: { params: { identifier: string, homey: string } }) {
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

  const homey = await prisma.homey.findFirst({
    where: {
      userId: user.id,
      id: params.homey
    }
  })

  console.log(homey?.homeyId, params);

  const emitter = connect({
    host: 'wss://events.homeycommunity.space',
    port: 443,
    secure: true
  }).on('error', (e) => {
    console.log(e)
  });

  emitter.publish({
    key: process.env.EMITTER_KEY!,
    channel: 'homey/' + homey!.homeyId + '/',
    message: JSON.stringify({
      type: 'install',
      app: params.identifier
    }),
    ttl: 300
  });


  //emitter.disconnect();

  return NextResponse.json({
    status: 200,
    message: 'Installed'
  })
}
