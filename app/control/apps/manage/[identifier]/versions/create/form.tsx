"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { App } from "@prisma/client"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const dynamic = "force-dynamic"
export function PageForm({ app }: { app: App }) {
  const [tarGz, setTarGz] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const uploadToClient = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (!file.name.endsWith(".tar.gz")) {
        setError("Please select a valid .tar.gz file")
        return
      }
      setTarGz(file)
    } else {
      setTarGz(null)
    }
  }

  const uploadToServer = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!tarGz) return

    setIsUploading(true)
    setError(null)

    try {
      const body = new FormData()
      body.append("id", app.id)
      body.append("file", tarGz)

      const response = await fetch("/api/control/apps/upload", {
        method: "POST",
        body,
      })

      const data = await response.json()

      if (data.status === 200) {
        router.push("/control/apps")
      } else {
        setError(data.message || "Upload failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred while uploading. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="app-file">App Package (.tar.gz)</Label>
        <div className="flex flex-col gap-4">
          <Input
            id="app-file"
            type="file"
            name="appPackage"
            accept=".tar.gz"
            onChange={uploadToClient}
            className="cursor-pointer"
          />
          {tarGz && (
            <p className="text-sm text-muted-foreground">
              Selected file: {tarGz.name}
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      <Button
        disabled={!tarGz || isUploading}
        type="submit"
        onClick={uploadToServer}
        variant="blue"
        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Package"
        )}
      </Button>
    </form>
  )
}
