import { useEffect, useState } from "react"
import { Homey } from "@prisma/client"

export function useConnectionMultiple(homeys: Homey[]) {
  const [homeysConnected, setHomeysConnected] = useState<
    {
      homeyId: string
      isConnected: boolean
      workingUrl: string | null
    }[]
  >([])

  useEffect(() => {
    const checkConnections = async () => {
      const newHomeysConnected = await Promise.all(
        homeys.map(async (homey) => {
          const urls = [homey.localUrl, homey.remoteForwardedUrl].filter(
            Boolean
          )
          let isConnected = false
          let workingUrl = null
          if (urls.length === 0) {
            return {
              homeyId: homey.homeyId,
              isConnected: false,
              workingUrl: null,
            }
          }
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout

            // Try each URL until one succeeds
            for (const url of urls) {
              try {
                const response = await fetch(url!, {
                  signal: controller.signal,
                  mode: "no-cors", // Since we just want to check if it's reachable
                })
                clearTimeout(timeoutId)
                isConnected = true
                workingUrl = url
                break // Exit once we find a working connection
              } catch {
                continue // Try next URL if this one fails
              }
            }
          } catch (error) {
            isConnected = false
            workingUrl = null
          }

          return {
            homeyId: homey.homeyId,
            isConnected,
            workingUrl,
          }
        })
      )

      setHomeysConnected(newHomeysConnected)
    }

    if (homeys.length > 0) {
      checkConnections()
      // Check connections every 30 seconds
      const interval = setInterval(checkConnections, 30000)
      return () => clearInterval(interval)
    }
  }, [homeys])

  return homeysConnected
}
