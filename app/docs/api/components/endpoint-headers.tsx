import { obfuscateApiKey } from "lib/utils"

interface Header {
  name: string
  value: string
  required: boolean
  description: string
}

interface EndpointHeadersProps {
  headers: Header[]
  apiKey: string
}

export function EndpointHeaders({ headers, apiKey }: EndpointHeadersProps) {
  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-medium mb-3">Headers</h3>
      <div className="rounded-lg border dark:border-gray-800 overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Value
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Required
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {headers.map((header, index) => (
              <tr key={index} className="bg-card">
                <td className="px-4 py-2 font-mono text-sm">{header.name}</td>
                <td className="px-4 py-2 font-mono text-sm">
                  {header.name === "Authorization"
                    ? `Bearer ${obfuscateApiKey(apiKey)}`
                    : header.value}
                </td>
                <td className="px-4 py-2 text-sm">
                  {header.required ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 text-sm text-muted-foreground">
                  {header.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
