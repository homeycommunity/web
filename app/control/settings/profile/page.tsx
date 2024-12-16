import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import HomeyConnectionForm from "@/app/control/settings/homey/homey-connection-form"

import { ProfileForm } from "./profile-form"

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your profile settings and connect your Homey",
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  const homeyToken = await prisma.homeyToken.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  return (
    <div className="container max-w-xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and connected accounts
        </p>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <ProfileForm user={session.user} />
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Homey Connection</h2>
        {homeyToken ? (
          <p className="text-muted-foreground mb-6">
            Manage your Homey account connection
          </p>
        ) : (
          <p className="text-muted-foreground mb-6">
            Connect your Homey account to access your devices and apps
          </p>
        )}
        <HomeyConnectionForm isConnected={!!homeyToken} />
      </Card>
    </div>
  )
}
