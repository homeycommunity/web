import { Input } from "@/components/ui/input"

interface Parameter {
  name: string
  type: string
  description: string
  required: boolean
}

interface EndpointParametersProps {
  parameters: Parameter[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
}

export function EndpointParameters({
  parameters,
  values,
  onChange,
}: EndpointParametersProps) {
  if (!parameters?.length) return null

  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-medium mb-3">URL Parameters</h3>
      <div className="rounded-lg border dark:border-gray-800 overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Required
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {parameters.map((param, index) => (
              <tr key={index} className="bg-card">
                <td className="px-4 py-2 font-mono text-sm">{param.name}</td>
                <td className="px-4 py-2 text-sm">{param.type}</td>
                <td className="px-4 py-2 text-sm">
                  {param.required ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2">
                  <Input
                    placeholder={param.description}
                    value={values[param.name] || ""}
                    onChange={(e) => onChange(param.name, e.target.value)}
                    className="h-8"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
