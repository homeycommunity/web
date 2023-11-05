import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { StoreIdentifierView } from "@/app/store/[identifier]/view";
import { Homey, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";



export default async function StorePage ({ params }: { params: { identifier: string } }) {
  const prisma = new PrismaClient();
  const session = await getServerSession(authOptions)
  let homeys: Homey[] = [];
  if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email!
      }
    })
    homeys = await prisma.homey.findMany({
      where: {
        userId: user?.id
      }
    });
  }



  const app = await prisma.app.findFirst({
    where: {
      identifier: params.identifier
    },
    include: {
      versions: {
        orderBy: {
          version: 'desc'
        },
        take: 1
      },
      author: true
    }
  });

  if (!app) {
    return <h1>404 not found</h1>
  }

  return (
    <StoreIdentifierView app={app} homeys={homeys} />
  )
}
