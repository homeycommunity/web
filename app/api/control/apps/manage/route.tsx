import { getServerSession } from "next-auth"
import {
  NextRequest,
  NextResponse,
} from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

import {
  controlAppsManageSchema,
} from "../../../../control/apps/manage/[identifier]/schema"

export const POST = async (req: NextRequest) => {

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
    const body = await req.json()
    const validatedBody = controlAppsManageSchema.parse(body)
    // check if app already exists
    const app = await prisma.app.findUnique({
      where: {
        id: validatedBody.id,
      }
    })
    if (app?.authorId !== user.id) {
      return NextResponse.json({
        status: 401,
        message: "Unauthorized"
      }, {
        status: 401
      });
    }
    if (!app) {
      return NextResponse.json({
        status: 400,
        message: 'Invalid request'
      }, {
        status: 400
      });
    }
    await prisma.app.update({
      where: {
        id: validatedBody.id
      },
      data: {
        name: validatedBody.name,
        description: validatedBody.description
      }
    })
    return NextResponse.json({
      status: 200,
      message: "OK"
    }, {
      status: 200
    });
  } catch (error) {
    return NextResponse.json({
      status: 400,
      message: 'Invalid request'
    }, {
      status: 400
    });
  }
}
