"use client"

import { App, AppVersion, Homey, User } from "@prisma/client"
import {
  AlertCircle,
  Download,
  Package,
  Tag,
  User as UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StoreIdentifierView({
  app,
  homeys,
}: {
  app: App & { versions: AppVersion[]; author: User }
  homeys: Homey[]
}) {
  return (
    <section className="container relative min-h-screen">
      <div className="relative grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 [background-size:200%_auto] animate-text">
              {app.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />v{app.versions[0].version}
            </Badge>
            {app.versions[0].experimental && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                experimental
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              {app.author.name}
            </Badge>
          </div>

          <p className="max-w-[700px] text-xl text-muted-foreground leading-relaxed">
            {app?.description}
          </p>
        </div>

        {homeys.length > 0 && (
          <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-blue-500/30 transition-colors">
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>
                Select a Homey to install this app on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {homeys.map((homey) => (
                  <Button
                    key={homey.id}
                    variant="blue"
                    onClick={() => {
                      fetch(
                        "/store/" +
                          app.identifier +
                          "/install/" +
                          homey.id +
                          "?version=" +
                          app.versions[0].version,
                        {
                          method: "POST",
                        }
                      ).then(() => {
                        toast.info("App installed", {
                          description:
                            "The app has been installed on your Homey",
                        })
                      })
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Install on {homey.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {homeys.length === 0 && (
          <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 border-blue-500/30">
            <CardHeader>
              <CardTitle>No Homeys Connected</CardTitle>
              <CardDescription>
                Connect your Homey to install apps
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </section>
  )
}
