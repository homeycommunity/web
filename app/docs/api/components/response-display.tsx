import { useState } from "react"
import { Button } from "components/ui/button"
import { cn } from "lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Badge } from "./badge"
import { CodeBlock } from "./code-block"

interface TestResponse {
  status: number
  data: any
  error?: string
  headers?: Record<string, string>
}

interface ResponseDisplayProps {
  response: TestResponse
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
  const [showHeaders, setShowHeaders] = useState(false)

  const getStatusType = (status: number) => {
    if (status >= 200 && status < 300) return "success"
    if (status >= 400) return "error"
    if (status >= 300) return "warning"
    return "warning"
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 200:
        return "OK"
      case 201:
        return "Created"
      case 204:
        return "No Content"
      case 400:
        return "Bad Request"
      case 401:
        return "Unauthorized"
      case 403:
        return "Forbidden"
      case 404:
        return "Not Found"
      case 409:
        return "Conflict"
      case 422:
        return "Unprocessable Entity"
      case 500:
        return "Internal Server Error"
      case 502:
        return "Bad Gateway"
      case 503:
        return "Service Unavailable"
      default:
        return status >= 200 && status < 300
          ? "Success"
          : status >= 300 && status < 400
            ? "Redirect"
            : status >= 400 && status < 500
              ? "Client Error"
              : "Server Error"
    }
  }

  const formatData = (data: any): string => {
    if (data === null || data === undefined) {
      return "null"
    }

    if (typeof data === "string") {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(data)
        return JSON.stringify(parsed, null, 2)
      } catch {
        // If not JSON, return as-is
        return data
      }
    }

    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Badge variant="status" type={getStatusType(response.status)}>
          {response.status} {getStatusText(response.status)}
        </Badge>
        {response.error && (
          <span className="text-sm font-medium text-destructive">
            {response.error}
          </span>
        )}
      </div>

      {response.headers && Object.keys(response.headers).length > 0 && (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowHeaders(!showHeaders)}
          >
            Response Headers
            {showHeaders ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
          {showHeaders && (
            <div className="rounded-md border bg-muted/50 p-4">
              <div className="grid gap-2">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <code className="font-mono text-sm text-muted-foreground">
                      {key}:
                    </code>
                    <code className="col-span-2 break-all font-mono text-sm">
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <CodeBlock
          language={
            typeof response.data === "string" &&
            !response.data.trim().startsWith("{")
              ? "text"
              : "json"
          }
          value={formatData(response.data)}
          title="Response"
          className={cn(
            "[&_pre]:max-h-[400px] [&_pre]:overflow-auto",
            response.error && "border-destructive"
          )}
        />
      </div>
    </div>
  )
}
