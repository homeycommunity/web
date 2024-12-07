import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Package, Upload } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { PageForm as Form } from "./form"

export const dynamic = "force-dynamic"
export default async function ControlAppsCreateVersionPage({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params

  const prisma = new PrismaClient()
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email!,
    },
  })

  const app = await prisma.app.findFirst({
    where: {
      author: {
        id: user?.id,
      },
      identifier,
    },
    include: {
      versions: true,
    },
  })

  if (!app) {
    return (
      <section className="container max-w-3xl mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">App Not Found</CardTitle>
            <CardDescription>
              The app with identifier &quot;{identifier}&quot; could not be
              found or you don&apos;t have access to it.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    )
  }

  return (
    <section className="container relative min-h-screen">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      </div>
      <div className="relative grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 [background-size:200%_auto] animate-text">
              New Version
            </h1>
          </div>
          <p className="max-w-[700px] text-xl text-muted-foreground leading-relaxed">
            Create a new version for {app.name}
          </p>
        </div>

        <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-blue-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <CardTitle>Upload New Version</CardTitle>
            </div>
            <CardDescription>
              Upload a new version of your app package (.tar.gz)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form app={app} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
