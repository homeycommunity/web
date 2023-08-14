import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function OPTIONS (req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET (req: NextRequest, { params }: { params: { identifier: string } }) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return new Response('{}', {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  }
  const data = await axios.get('https://auth.homeycommunity.space/application/o/userinfo', {
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

  const { identifier } = params;

  const app = await prisma.app.findFirst({
    where: {
      identifier
    },
    include: {
      versions: true
    }
  })

  if (!app) {
    return NextResponse.json({
      status: 404,
      message: "Not Found"
    }, {
      status: 404
    });
  }

  return NextResponse.json({
    status: 200,
    data: app
  }, {
    status: 200
  });
}
