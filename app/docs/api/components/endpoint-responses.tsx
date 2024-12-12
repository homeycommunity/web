import { Badge } from "./badge"
import { CodeBlock } from "./code-block"

interface Response {
  status: number
  description: string
  example: Record<string, any>
}

interface EndpointResponsesProps {
  responses: Response[]
}

export function EndpointResponses({ responses }: EndpointResponsesProps) {
  const getStatusType = (status: number) => {
    if (status >= 200 && status < 300) return "success"
    if (status >= 400) return "error"
    return "warning"
  }

  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-medium mb-3">Response Examples</h3>
      <div className="space-y-4">
        {responses.map((response, index) => (
          <div
            key={index}
            className="rounded-lg border dark:border-gray-800 overflow-hidden bg-card"
          >
            <div className="px-4 py-2 bg-muted/50 border-b dark:border-gray-800 flex items-center gap-3">
              <Badge variant="status" type={getStatusType(response.status)}>
                {response.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {response.description}
              </span>
            </div>
            <div className="p-0">
              <CodeBlock
                language="json"
                value={JSON.stringify(response.example, null, 2)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
