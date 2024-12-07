import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { AlertCircle, ExternalLink, Package, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  const prisma = new PrismaClient()

  const apps = await prisma.app.findMany({
    where: {
      versions: {
        some: {},
      },
    },
    include: {
      versions: true,
    },
  })

  return (
    <section className="container relative min-h-screen">
      <div className="relative grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 [background-size:200%_auto] animate-text">
            Homey Community Store
          </h1>
          <p className="max-w-[700px] text-xl text-muted-foreground leading-relaxed">
            The Homey Community Store is a place where you can find third-party
            apps for Homey. Explore our growing collection of community-created
            applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card
              key={app.identifier}
              className="group bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-xl">{app.name}</CardTitle>
                  </div>
                  {app.versions[app.versions.length - 1]?.experimental && (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      experimental
                    </Badge>
                  )}
                </div>
                {app.versions.length > 0 && (
                  <Badge variant="secondary" className="w-fit">
                    <Tag className="w-3 h-3 mr-1" />v
                    {app.versions[app.versions.length - 1].version}
                  </Badge>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {app.description}
                </p>
              </CardContent>

              <CardFooter>
                <Link href={"/store/" + app.identifier} className="w-full">
                  <Button
                    variant="blue"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
