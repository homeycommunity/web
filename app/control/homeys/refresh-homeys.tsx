"use client"

import { useState } from "react"
import axios from "axios"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function RefreshHomeys() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = async () => {
    try {
      setIsRefreshing(true)
      await axios.post("/api/homey/refresh")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to refresh Homeys")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={refresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  )
}
