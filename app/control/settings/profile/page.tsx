import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

import { Card } from "@/components/ui/card"

import { ProfileForm } from "./profile-form"

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your profile settings",
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="container max-w-xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>
      <Card className="p-6">
        <ProfileForm user={session.user} />
      </Card>
    </div>
  )
}
