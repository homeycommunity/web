import { useEffect, useRef, useState } from "react"
import { Homey } from "@prisma/client"

export function useConnectionMultiple(homeys: Homey[]) {
  const [homeysConnected, setHomeysConnected] = useState<
    {
      homeyId: string
      isConnected: boolean
      workingUrl: string | null
    }[]
  >([])

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())
  const timeoutIdsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    const checkConnections = async () => {
      // Cancel any ongoing requests
      abortControllersRef.current.forEach((controller) => controller.abort())
      abortControllersRef.current.clear()

      // Clear any existing timeouts
      timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutIdsRef.current.clear()

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
            abortControllersRef.current.set(homey.homeyId, controller)

            const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout
            timeoutIdsRef.current.set(homey.homeyId, timeoutId)

            // Create promises for all URLs to check them simultaneously
            const connectionPromises = urls.map(async (url) => {
              try {
                const response = await fetch(url!, {
                  signal: controller.signal,
                  mode: "no-cors", // Since we just want to check if it's reachable
                })
                return { success: true, url }
              } catch (error) {
                return { success: false, url, error }
              }
            })

            // Race all promises - first successful one wins
            const result = await Promise.race(connectionPromises)

            if (result.success) {
              // Clear timeout on success
              const currentTimeoutId = timeoutIdsRef.current.get(homey.homeyId)
              if (currentTimeoutId) {
                clearTimeout(currentTimeoutId)
                timeoutIdsRef.current.delete(homey.homeyId)
              }

              isConnected = true
              workingUrl = result.url
            } else {
              // If the first result was a failure, wait for all to complete
              const allResults = await Promise.allSettled(connectionPromises)
              const successfulResult = allResults.find(
                (result) =>
                  result.status === "fulfilled" && result.value.success
              )

              if (successfulResult && successfulResult.status === "fulfilled") {
                // Clear timeout on success
                const currentTimeoutId = timeoutIdsRef.current.get(
                  homey.homeyId
                )
                if (currentTimeoutId) {
                  clearTimeout(currentTimeoutId)
                  timeoutIdsRef.current.delete(homey.homeyId)
                }

                isConnected = true
                workingUrl = successfulResult.value.url
              }
            }
          } catch (error) {
            isConnected = false
            workingUrl = null
          } finally {
            // Clean up for this homey
            const currentTimeoutId = timeoutIdsRef.current.get(homey.homeyId)
            if (currentTimeoutId) {
              clearTimeout(currentTimeoutId)
              timeoutIdsRef.current.delete(homey.homeyId)
            }
            abortControllersRef.current.delete(homey.homeyId)
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
      return () => {
        clearInterval(interval)
        // Clean up all ongoing requests and timeouts
        abortControllersRef.current.forEach((controller) => controller.abort())
        abortControllersRef.current.clear()
        timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
        timeoutIdsRef.current.clear()
      }
    } else {
      // If no homeys, clear the state
      setHomeysConnected([])
    }
  }, [homeys])

  return homeysConnected
}
