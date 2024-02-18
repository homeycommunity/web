"use client"

import { App, AppVersion, Homey, User } from "@prisma/client"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function StoreIdentifierView({
  app,
  homeys,
}: {
  app: App & { versions: AppVersion[]; author: User }
  homeys: Homey[]
}) {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          {app.name + " "}
          <Badge>{app.versions[0].version}</Badge>{" "}
          {app.versions[0].experimental ? (
            <Badge variant="destructive">experimental</Badge>
          ) : null}
        </h1>
        <h2>{app.author.name}</h2>
        <p className="mb-4 max-w-[700px] text-lg text-muted-foreground">
          {app?.description}
        </p>
        {homeys.map((homey) => {
          return (
            <Button
              variant="blue"
              onClick={(e) => {
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
                    description: "The app has been installed on your Homey",
                  })
                })
              }}
            >
              Install on {homey.name}
            </Button>
          )
        })}
      </div>
    </section>
  )
}
