"use client"

import { useEffect, useState } from "react"
import { Wifi } from "lucide-react"

import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  url: string
  className?: string
}

export function ConnectionStatus({ url, className }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout

        const response = await fetch(url, {
          signal: controller.signal,
          mode: "no-cors", // Since we just want to check if it's reachable
        })

        clearTimeout(timeoutId)
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
      }
    }

    if (url) {
      checkConnection()
      // Check connection every 30 seconds
      const interval = setInterval(checkConnection, 60000)
      return () => clearInterval(interval)
    }
  }, [url])

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <Wifi
        className={cn(
          "h-4 w-4",
          isConnected ? "text-green-500" : "text-muted-foreground"
        )}
      />
      <span>Local URL: {url}</span>
      {isConnected && (
        <span className="text-green-500 text-xs">(Connected)</span>
      )}
    </div>
  )
}
