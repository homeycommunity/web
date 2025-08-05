import { useEffect, useRef, useState } from "react"

export function useConnection(urls: string | string[]) {
  const [isConnected, setIsConnected] = useState(false)
  const [workingUrl, setWorkingUrl] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Clear any existing timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }

      try {
        const urlsToCheck = Array.isArray(urls) ? urls : [urls]

        if (urlsToCheck.length === 0) {
          setIsConnected(false)
          setWorkingUrl(null)
          return
        }

        const controller = new AbortController()
        abortControllerRef.current = controller

        // Set timeout for the entire connection attempt
        timeoutIdRef.current = setTimeout(() => {
          controller.abort()
        }, 2000) // 2s timeout

        // Try each URL until one succeeds
        for (const url of urlsToCheck) {
          try {
            const response = await fetch(url, {
              signal: controller.signal,
              mode: "no-cors", // Since we just want to check if it's reachable
            })

            // Clear timeout on success
            if (timeoutIdRef.current) {
              clearTimeout(timeoutIdRef.current)
              timeoutIdRef.current = null
            }

            setIsConnected(true)
            setWorkingUrl(url)
            return // Exit once we find a working connection
          } catch (error) {
            // Continue to next URL if this one fails
            continue
          }
        }

        // If we get here, all URLs failed
        setIsConnected(false)
        setWorkingUrl(null)
      } catch (error) {
        setIsConnected(false)
        setWorkingUrl(null)
      } finally {
        // Clean up
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = null
        }
        abortControllerRef.current = null
      }
    }

    // Initial connection check
    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    // Cleanup function
    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [urls])

  return { isConnected, workingUrl }
}
