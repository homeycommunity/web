import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { connect } from "emitter-io";
import { NextRequest, NextResponse } from "next/server";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function OPTIONS (req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST (req: NextRequest) {
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
  const userObj = userFromAccount.user;
  const input = await req.json();

  await Promise.all(input.homey.map(async (homey: any) => {
    const homeyInDB = await prisma.homey.findFirst({
      where: {
        homeyId: homey.id,
        userId: userObj.id
      }
    })


    if (!homeyInDB) {
      await new Promise(resolve => {
        const emitter = connect({
          host: 'wss://events.homeycommunity.space',
          port: 443,
          secure: true
        }).on('keygen', async function call (id) {
          await prisma.homey.create({
            data: {
              name: homey.name,
              homeyId: homey.id,
              userId: userObj.id,
              eventKey: id.key
            }
          });
          emitter.off('keygen', call)
          emitter.disconnect();
          resolve(true);
        }).keygen({
          key: process.env.EMITTER_KEY!,
          channel: 'homey/' + homey.id + '/',
          type: 'r',
          ttl: 0
        });

      })
    } else {
      await prisma.homey.update({
        where: {
          homeyId_userId: {
            homeyId: homey.id,
            userId: userObj.id
          }
        },
        data: {
          name: homey.name,
        }
      });
    }


  }));

  await prisma.homeyToken.upsert({
    where: {
      userId: userObj.id
    },
    update: {
      accessToken: input.token.access_token,
      refreshToken: input.token.refresh_token,
      expires: input.token.expires_at,
    },
    create: {
      accessToken: input.token.access_token,
      refreshToken: input.token.refresh_token,
      expires: input.token.expires_at,
      userId: userObj.id
    }
  })


  return new Response('{}', {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  })

}
