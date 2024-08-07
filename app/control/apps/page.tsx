import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AppPlus } from "@/app/control/apps/app-plus"
import { AppRow } from "@/app/control/apps/app-row"

export default async function Page() {
  const prisma = new PrismaClient()
  const session = await auth()
  console.log("session", session)
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email!,
    },
  })

  const apps = await prisma.app.findMany({
    where: {
      author: {
        id: user?.id,
      },
    },
    include: {
      versions: true,
    },
  })

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          My Apps <AppPlus />
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Here you can find all your apps.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Push Version</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <AppRow key={app.id} app={app} />
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
