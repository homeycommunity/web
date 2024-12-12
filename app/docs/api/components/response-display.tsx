import { Badge } from "./badge"
import { CodeBlock } from "./code-block"

interface TestResponse {
  status: number
  data: any
  error?: string
}

interface ResponseDisplayProps {
  response: TestResponse
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
  const getStatusType = (status: number) => {
    if (status === 200) return "success"
    if (status >= 400) return "error"
    return "warning"
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 200:
        return "OK"
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
      case 500:
        return "Internal Server Error"
      default:
        return "Unknown Status"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="status" type={getStatusType(response.status)}>
          {response.status} {getStatusText(response.status)}
        </Badge>
        {response.error && (
          <span className="text-sm text-red-500">{response.error}</span>
        )}
      </div>
      <div className="relative">
        <CodeBlock
          language="json"
          value={JSON.stringify(response.data, null, 2)}
          title="Response"
          className="[&_pre]:max-h-[400px] [&_pre]:overflow-auto"
        />
      </div>
    </div>
  )
}
