import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ArrowRight, Globe } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConnectionStatus } from "@/components/connection-status"

export const metadata: Metadata = {
  title: "My Homeys",
  description: "Manage your connected Homey devices",
}

export default async function HomeysPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  const homeyToken = await prisma.homeyToken.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!homeyToken) {
    redirect("/control/settings/profile")
  }

  const homeys = await prisma.homey.findMany({
    where: {
      userId: session.user.id,
    },
  })

  if (homeys.length === 0) {
    return (
      <div className="container max-w-2xl py-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Homeys</h1>
          <p className="text-muted-foreground">
            No Homeys found. Make sure your Homey account is connected properly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Homeys</h1>
        <p className="text-muted-foreground">
          Manage your connected Homey devices
        </p>
      </div>
      <div className="grid gap-4">
        {homeys.map((homey) => (
          <Card key={homey.homeyId} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Homey {homey.homeyId}</h2>
                <div className="space-y-2">
                  {homey.localUrl && <ConnectionStatus url={homey.localUrl} />}
                  {homey.remoteUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>Remote URL: {homey.remoteUrl}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/control/homeys/${homey.homeyId}`}>
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">View Homey details</span>
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
