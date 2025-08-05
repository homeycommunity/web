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

        // Create promises for all URLs to check them simultaneously
        const connectionPromises = urlsToCheck.map(async (url) => {
          try {
            const response = await fetch(url, {
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
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
            timeoutIdRef.current = null
          }

          setIsConnected(true)
          setWorkingUrl(result.url)
        } else {
          // If the first result was a failure, wait for all to complete
          const allResults = await Promise.allSettled(connectionPromises)
          const successfulResult = allResults.find(
            (result) => result.status === "fulfilled" && result.value.success
          )

          if (successfulResult && successfulResult.status === "fulfilled") {
            // Clear timeout on success
            if (timeoutIdRef.current) {
              clearTimeout(timeoutIdRef.current)
              timeoutIdRef.current = null
            }

            setIsConnected(true)
            setWorkingUrl(successfulResult.value.url)
          } else {
            // All URLs failed
            setIsConnected(false)
            setWorkingUrl(null)
          }
        }
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
