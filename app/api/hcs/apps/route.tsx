import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function OPTIONS (req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}
export const dynamic = 'force-dynamic';
export async function GET () {
  const prisma = new PrismaClient();

  const apps = await prisma.app.findMany({
    where: {

      versions: {
        some: {}
      }
    },
    include: {
      versions: true
    }
  });

  const onlyLastVersion = apps.map(app => {
    return {
      ...app,
      versions: [app.versions[app.versions.length - 1]]
    }
  });


  return NextResponse.json(onlyLastVersion, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
}
