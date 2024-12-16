"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface InstallHCSProps {
  homeyId: string
}

export function InstallHCS({ homeyId }: InstallHCSProps) {
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    try {
      setIsInstalling(true)
      // Get Homey
      const homeyResponse = await fetch(`/api/hcs/homey-token/${homeyId}`, {
        method: "GET",
        credentials: "include",
      })
      const homey = await homeyResponse.json()

      // Download the store
      const storeResponse = await fetch(`/api/hcs/download-store`, {
        method: "GET",
        credentials: "include",
      })

      const blob = await storeResponse.blob()

      console.log(blob.size)
      const formData = new FormData()
      formData.append("app", blob, "homey-community-store.tar.gz")
      formData.append(
        "env",
        `{
    "CLIENT_ID": "kogi8t1uwtmo365jop5vi",
    "CLIENT_SECRET": "0siXwzdMqlBdKGbrzbURozLLscI3YAwq",
    "MINIO_SECRET": "4KQSOEf8i3qQduu5pM2EIgvpFWpWGGOly1a1OmCn",
    "MINIO_ACCESS": "IVdvDHVncNOLg2JtEz9v"
      }`
      )
      formData.append("purgeSettings", "false")
      formData.append("debug", "false")
      // Use the store install endpoint to trigger installation
      const response = await fetch(`${homey.localUrl}/api/manager/devkit`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${homey.sessionToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to install Homey Community Store")
      }

      toast.success("Successfully installed Homey Community Store")
    } catch (error) {
      console.error("Installation error:", error)
      toast.error("Failed to install Homey Community Store")
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Homey Community Store</h3>
          <p className="text-sm text-muted-foreground">
            Install the Homey Community Store app to access community apps
          </p>
        </div>
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className="ml-4"
        >
          {isInstalling ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Icons.download className="mr-2 h-4 w-4" />
              Install
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
