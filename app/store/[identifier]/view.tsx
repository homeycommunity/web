"use client"

import { Fragment, useState } from "react"
import { useConnectionMultiple } from "@/effects/useConnectionMultiple"
import { App, AppVersion, Homey, User } from "@prisma/client"
import axios from "axios"
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
  const homeysConnected = useConnectionMultiple(homeys)
  const [isInstalling, setIsInstalling] = useState(false)
  const downloadApp = async (url: string, homeyId: string) => {
    try {
      setIsInstalling(true)
      toast.info(`Installing ${app.name} app on Homey`)
      // Get Homey
      const homeyResponse = await fetch(`/api/hcs/homey-token/${homeyId}`, {
        method: "GET",
        credentials: "include",
      })
      const homey = await homeyResponse.json()

      // Download the store
      const storeResponse = await fetch(
        `/api/hcs/apps/${app.identifier}/download/${app.versions[0].version}`,
        {
          method: "GET",
          credentials: "include",
        }
      )

      const blob = await storeResponse.blob()

      console.log(blob.size)
      const formData = new FormData()
      formData.append("app", blob, "app.tar.gz")
      formData.append("env", (app.versions[0].env as string) || "{}")
      formData.append("purgeSettings", "false")
      formData.append("debug", "false")
      // Use the store install endpoint to trigger installation
      const response = await fetch(`${url}/api/manager/devkit`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${homey.sessionToken}`,
        },
      })

      const updateApp = await axios.put(
        `${url}/api/manager/apps/app/${app.identifier}`,
        {
          app: {
            origin: "homey_community_space",
            channel: "test",
          },
        },
        { headers: { Authorization: `Bearer ${homey.sessionToken}` } }
      )

      if (!response.ok) {
        throw new Error("Failed to install " + app.name)
      }

      toast.success("Successfully installed " + app.name)
    } catch (error) {
      console.error("Installation error:", error)
      toast.error("Failed to install " + app.name)
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <section className="container relative min-h-screen">
      <div className="relative grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <Package className="size-10 text-blue-500" />
            <h1 className="animate-text bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 bg-clip-text text-4xl font-extrabold leading-tight tracking-tighter text-transparent [background-size:200%_auto] md:text-5xl">
              {app.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Tag className="size-3.5" />v{currentVersion.version}
            </Badge>
            {currentVersion.experimental && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1.5"
              >
                <AlertCircle className="size-3.5" />
                experimental
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1.5">
              <UserIcon className="size-3.5" />
              {app.author.name}
            </Badge>
          </div>

          <p className="max-w-[700px] text-xl leading-relaxed text-muted-foreground">
            {app?.description}
          </p>
        </div>

        {homeys.length > 0 && (
          <Card className="border-primary/10 bg-gradient-to-b from-background to-background/80 transition-colors hover:border-blue-500/30">
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>
                Select a Homey to install this app on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {homeys.map((homey) => (
                  <Fragment key={homey.id}>
                    {(homey.apps as { id: string }[])?.find(
                      (app: { id: string }) =>
                        app.id === "space.homeycommunity.app"
                    ) ? (
                      <Button
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
                        className="bg-gradient-to-r from-blue-600 to-blue-500 transition-all hover:from-blue-500 hover:to-blue-600"
                      >
                        <Download className="mr-2 size-4" />
                        Install on {homey.name} via HCS Companion App
                      </Button>
                    ) : (
                      <></>
                    )}
                  </Fragment>
                ))}
                {homeysConnected
                  .filter((homey) => homey.isConnected)
                  .map((homey) => (
                    <Button
                      key={"direct-" + homey.homeyId}
                      onClick={() =>
                        downloadApp(homey.workingUrl!, homey.homeyId)
                      }
                      variant="blue"
                    >
                      <Download className="mr-2 size-4" />
                      Install on{" "}
                      {
                        homeys.find((h) => h.homeyId === homey.homeyId)?.name
                      }{" "}
                      via Direct Connection (beta)
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {homeys.length === 0 && (
          <Card className="border-blue-500/30 bg-gradient-to-b from-background to-background/80">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {appInfo?.drivers?.map((driver) => (
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

        {(appInfo?.flow?.triggers?.length > 0 ||
          appInfo?.flow?.conditions?.length > 0 ||
          appInfo?.flow?.actions?.length > 0) && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Flows</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {appInfo?.flow?.triggers?.length > 0 && (
                <Card className="border-primary/10 bg-gradient-to-b from-background to-background/80">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BellRing className="size-5 text-orange-500" />
                      <CardTitle>Triggers</CardTitle>
                    </div>
                    <CardDescription>Events that start a flow</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-4">
                      {appInfo?.flow?.triggers
                        ?.filter((trigger) =>
                          currentDriver?.id
                            ? trigger.args?.find((arg) => arg.name === "device")
                                ?.filter ===
                              "driver_id=" + currentDriver?.id
                            : true
                        )
                        ?.map((trigger) => (
                          <div
                            key={trigger.id}
                            className="group space-y-2 rounded-lg border p-4 transition-colors hover:border-orange-500/30"
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
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                  Arguments:
                                </p>
                                <div className="space-y-1">
                                  {trigger.args?.map((arg) => (
                                    <div key={arg.name} className="text-xs">
                                      <span className="font-medium">
                                        {arg.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        -{" "}
                                        {arg.type === "device"
                                          ? appInfo.drivers?.find(
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

              {appInfo?.flow?.conditions?.length > 0 && (
                <Card className="border-primary/10 bg-gradient-to-b from-background to-background/80">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings2 className="size-5 text-blue-500" />
                      <CardTitle>Conditions</CardTitle>
                    </div>
                    <CardDescription>
                      Rules that control flow execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-4">
                      {appInfo?.flow?.conditions
                        ?.filter((condition) =>
                          currentDriver?.id
                            ? condition.args?.find(
                                (arg) => arg.name === "device"
                              )?.filter ===
                              "driver_id=" + currentDriver?.id
                            : true
                        )
                        ?.map((condition) => (
                          <div
                            key={condition.id}
                            className="group space-y-2 rounded-lg border p-4 transition-colors hover:border-blue-500/30"
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
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
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
                                          ? appInfo.drivers?.find(
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

              {appInfo?.flow?.actions?.length > 0 && (
                <Card className="border-primary/10 bg-gradient-to-b from-background to-background/80">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Play className="size-5 text-green-500" />
                      <CardTitle>Actions</CardTitle>
                    </div>
                    <CardDescription>
                      Tasks that can be executed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-4">
                      {appInfo?.flow?.actions
                        ?.filter((action) =>
                          currentDriver?.id
                            ? action.args?.find((arg) => arg.name === "device")
                                ?.filter ===
                              "driver_id=" + currentDriver?.id
                            : true
                        )
                        ?.map((action) => (
                          <div
                            key={action.id}
                            className="group space-y-2 rounded-lg border p-4 transition-colors hover:border-green-500/30"
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
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                  Arguments:
                                </p>
                                <div className="space-y-1">
                                  {action.args?.map((arg) => (
                                    <div key={arg.name} className="text-xs">
                                      <span className="font-medium">
                                        {arg.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        -{" "}
                                        {arg.type === "device"
                                          ? appInfo.drivers?.find(
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
