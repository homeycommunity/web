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

  const totalVersions = apps.reduce((sum, app) => sum + app.versions.length, 0)

  return (
    <section className="container relative min-h-screen isolate space-y-12 pb-20 pt-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      </div>

      <div className="flex max-w-[980px] flex-col items-start gap-8">
        <div className="w-full rounded-2xl border bg-card/50 backdrop-blur-sm p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x md:text-5xl">
                My Apps
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage and monitor all your Homey apps in one place
              </p>
            </div>
            <div className="transform transition-all duration-300 hover:scale-110 hover:rotate-6">
              <AppPlus />
            </div>
          </div>

          <div className="mt-8 grid w-full gap-4 md:grid-cols-3">
            <div className="group relative rounded-xl border bg-gradient-to-br from-blue-50/50 to-transparent p-6 dark:from-blue-950/50">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <div className="relative">
                <h3 className="text-sm font-medium text-blue-600/90 dark:text-blue-400/90">
                  Total Apps
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-blue-700 dark:text-blue-300">
                    {apps.length}
                  </span>
                  <span className="text-sm text-blue-600/80 dark:text-blue-400/80">
                    apps
                  </span>
                </div>
              </div>
            </div>

            <div className="group relative rounded-xl border bg-gradient-to-br from-purple-50/50 to-transparent p-6 dark:from-purple-950/50">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <div className="relative">
                <h3 className="text-sm font-medium text-purple-600/90 dark:text-purple-400/90">
                  Total Versions
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-purple-700 dark:text-purple-300">
                    {totalVersions}
                  </span>
                  <span className="text-sm text-purple-600/80 dark:text-purple-400/80">
                    versions
                  </span>
                </div>
              </div>
            </div>

            <div className="group relative rounded-xl border bg-gradient-to-br from-teal-50/50 to-transparent p-6 dark:from-teal-950/50">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-transparent transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <div className="relative">
                <h3 className="text-sm font-medium text-teal-600/90 dark:text-teal-400/90">
                  Average Versions
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-teal-700 dark:text-teal-300">
                    {apps.length
                      ? (totalVersions / apps.length).toFixed(1)
                      : "0"}
                  </span>
                  <span className="text-sm text-teal-600/80 dark:text-teal-400/80">
                    per app
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full rounded-2xl border bg-background/95 p-6 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-11 text-sm font-semibold">
                  Name
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold">
                  Identifier
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold">
                  Version
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold">
                  Push Version
                </TableHead>
                <TableHead className="h-11 text-sm font-semibold">
                  Delete
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.length === 0 ? (
                <TableRow>
                  <TableHead colSpan={5} className="h-[300px] border-none">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                      <div className="group rounded-full bg-gradient-to-br from-primary/5 to-transparent p-8 transition-all duration-300 hover:from-primary/10">
                        <svg
                          className="size-16 text-primary/40 transition-all duration-300 group-hover:scale-110"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">No apps yet</h3>
                        <p className="text-lg text-muted-foreground">
                          Create your first app to get started!
                        </p>
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              ) : (
                apps.map((app) => <AppRow key={app.id} app={app} />)
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
