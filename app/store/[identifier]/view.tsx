"use client"

import { useState } from "react"
import { App, AppVersion, Homey, User } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card"
import {
  AlertCircle,
  BellRing,
  Download,
  Package,
  Play,
  Settings2,
  Tag,
  User as UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AppInfo } from "@/types/app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function StoreIdentifierView({
  app,
  homeys,
}: {
  app: App & { versions: AppVersion[]; author: User }
  homeys: Homey[]
}) {
  const currentVersion = app.versions[0]
  const appInfo = currentVersion.appinfo as unknown as AppInfo
  const [currentDriver, setCurrentDriver] = useState<
    AppInfo["drivers"][0] | null
  >(null)
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
              <Tag className="h-3.5 w-3.5" />v{currentVersion.version}
            </Badge>
            {currentVersion.experimental && (
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
                    Install on {homey.name} via HCS App
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {homeys.length === 0 && (
          <Card className="bg-gradient-to-b from-background to-background/80 border-blue-500/30">
            <CardHeader>
              <CardTitle>No Homeys Connected</CardTitle>
              <CardDescription>
                Connect your Homey to install apps
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {appInfo?.drivers?.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {appInfo?.drivers.map((driver) => (
                <Card
                  key={driver.id}
                  className={
                    "bg-gradient-to-b from-background to-background/80 hover:border-blue-500/30 transition-colors " +
                    (currentDriver?.id === driver.id
                      ? "border-blue-500/30"
                      : "border-primary/10")
                  }
                  onClick={() => {
                    if (currentDriver?.id === driver.id) {
                      setCurrentDriver(null)
                    } else {
                      setCurrentDriver(driver)
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle>{driver.name.en}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(appInfo?.flow?.triggers.length > 0 ||
          appInfo?.flow?.conditions.length > 0 ||
          appInfo?.flow?.actions.length > 0) && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Flows</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {appInfo?.flow?.triggers.length > 0 && (
                <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-orange-500" />
                      <CardTitle>Triggers</CardTitle>
                    </div>
                    <CardDescription>Events that start a flow</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-background scrollbar-thumb-accent">
                      {appInfo.flow.triggers
                        .filter((trigger) =>
                          currentDriver?.id
                            ? trigger.args.find((arg) => arg.name === "device")
                                ?.filter ===
                              "driver_id=" + currentDriver?.id
                            : true
                        )
                        .map((trigger) => (
                          <div
                            key={trigger.id}
                            className="group rounded-lg border p-4 space-y-2 hover:border-orange-500/30 transition-colors"
                          >
                            <h3 className="font-semibold">
                              {trigger.title?.en}
                            </h3>
                            {trigger.hint?.en && (
                              <p className="text-sm text-muted-foreground">
                                {trigger.hint.en}
                              </p>
                            )}
                            {trigger.args?.length > 0 && (
                              <div className="pt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Arguments:
                                </p>
                                <div className="space-y-1">
                                  {trigger.args.map((arg) => (
                                    <div key={arg.name} className="text-xs">
                                      <span className="font-medium">
                                        {arg.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        -{" "}
                                        {arg.type === "device"
                                          ? appInfo.drivers.find(
                                              (e) =>
                                                e.id ===
                                                arg.filter?.split("=")[1]
                                            )?.name.en
                                          : arg.type}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {appInfo?.flow?.conditions.length > 0 && (
                <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-blue-500" />
                      <CardTitle>Conditions</CardTitle>
                    </div>
                    <CardDescription>
                      Rules that control flow execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-background scrollbar-thumb-accent">
                      {appInfo.flow.conditions
                        .filter((condition) =>
                          currentDriver?.id
                            ? condition.args.find(
                                (arg) => arg.name === "device"
                              )?.filter ===
                              "driver_id=" + currentDriver?.id
                            : true
                        )
                        .map((condition) => (
                          <div
                            key={condition.id}
                            className="group rounded-lg border p-4 space-y-2 hover:border-blue-500/30 transition-colors"
                          >
                            <h3 className="font-semibold">
                              {condition.title?.en}
                            </h3>
                            {condition.hint?.en && (
                              <p className="text-sm text-muted-foreground">
                                {condition.hint.en}
                              </p>
                            )}
                            {condition.args?.length > 0 && (
                              <div className="pt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Arguments:
                                </p>
                                <div className="space-y-1">
                                  {condition.args.map((arg) => (
                                    <div key={arg.name} className="text-xs">
                                      <span className="font-medium">
                                        {arg.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        -{" "}
                                        {arg.type === "device"
                                          ? appInfo.drivers.find(
                                              (e) =>
                                                e.id ===
                                                arg.filter?.split("=")[1]
                                            )?.name.en
                                          : arg.type}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {appInfo?.flow?.actions.length > 0 && (
                <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-green-500" />
                      <CardTitle>Actions</CardTitle>
                    </div>
                    <CardDescription>
                      Tasks that can be executed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-track-background scrollbar-thumb-accent">
                      {appInfo.flow.actions
                        .filter((action) =>
                          currentDriver?.id
                            ? action.args.find((arg) => arg.name === "device")
                                ?.filter ===
                              "driver_id=" + currentDriver?.id
                            : true
                        )
                        .map((action) => (
                          <div
                            key={action.id}
                            className="group rounded-lg border p-4 space-y-2 hover:border-green-500/30 transition-colors"
                          >
                            <h3 className="font-semibold">
                              {action.title?.en}
                            </h3>
                            {action.hint?.en && (
                              <p className="text-sm text-muted-foreground">
                                {action.hint.en}
                              </p>
                            )}
                            {action.args?.length > 0 && (
                              <div className="pt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Arguments:
                                </p>
                                <div className="space-y-1">
                                  {action.args.map((arg) => (
                                    <div key={arg.name} className="text-xs">
                                      <span className="font-medium">
                                        {arg.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        -{" "}
                                        {arg.type === "device"
                                          ? appInfo.drivers.find(
                                              (e) =>
                                                e.id ===
                                                arg.filter?.split("=")[1]
                                            )?.name.en
                                          : arg.type}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
