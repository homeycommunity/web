import { useEffect, useState } from "react"

export function useConnection(urls: string | string[]) {
  const [isConnected, setIsConnected] = useState(false)
  const [workingUrl, setWorkingUrl] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const urlsToCheck = Array.isArray(urls) ? urls : [urls]

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout

        // Try each URL until one succeeds
        for (const url of urlsToCheck) {
          try {
            const response = await fetch(url, {
              signal: controller.signal,
              mode: "no-cors", // Since we just want to check if it's reachable
            })
            clearTimeout(timeoutId)
            setIsConnected(true)
            setWorkingUrl(url)
            return // Exit once we find a working connection
          } catch {
            continue // Try next URL if this one fails
          }
        }

        // If we get here, all URLs failed
        setIsConnected(false)
        setWorkingUrl(null)
      } catch (error) {
        setIsConnected(false)
        setWorkingUrl(null)
      }
    }

    if (urls && (Array.isArray(urls) ? urls.length > 0 : true)) {
      checkConnection()
      // Check connection every 30 seconds
      const interval = setInterval(checkConnection, 30000)
      return () => clearInterval(interval)
    }
  }, [urls])

  return { isConnected, workingUrl }
}
