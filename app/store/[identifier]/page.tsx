import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Homey, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";



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
      }
    }
  });

  if (!app) {
    return <h1>404 not found</h1>
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          {app.name + ' '}

          <small>{app.versions[0].version}</small>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          {app?.description}
        </p>
        {homeys.map((homey) => {
          return <Link href={'/store/' + app.identifier + '/install/' + homey.id}>Install on {homey.name}</Link>
        })}
      </div>
    </section>
  )
}
