import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { PageForm as Form } from "./form";

export const dynamic = 'force-dynamic';
export default async function ControlAppsManagePage ({ params }: { params: { identifier: string } }) {
  const { identifier } = params;

  const prisma = new PrismaClient();
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email!
    }
  })

  const app = await prisma.app.findFirst({
    where: {
      author: {
        id: user?.id
      },
      identifier
    },
    include: {
      versions: true
    }
  });

  if (!app) {
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            App not found
          </h1>
        </div>
      </section>
    )
  }

  return <Form app={app} />
}
