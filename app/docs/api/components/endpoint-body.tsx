import { Input } from "@/components/ui/input"

import { Badge } from "./badge"

interface BodyField {
  name: string
  type: string
  description: string
  required: boolean
}

interface EndpointBodyProps {
  type: "json" | "formData"
  fields: BodyField[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
}

export function EndpointBody({
  type,
  fields,
  values,
  onChange,
}: EndpointBodyProps) {
  if (!fields?.length) return null

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-medium">Request Body</h3>
        <Badge
          variant="method"
          type="post"
          className="!bg-opacity-30 dark:!bg-opacity-10"
        >
          {type === "json" ? "application/json" : "multipart/form-data"}
        </Badge>
      </div>
      <div className="rounded-lg border dark:border-gray-800 overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                Field
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
            {fields.map((field, index) => (
              <tr key={index} className="bg-card">
                <td className="px-4 py-2 font-mono text-sm">{field.name}</td>
                <td className="px-4 py-2 text-sm">{field.type}</td>
                <td className="px-4 py-2 text-sm">
                  {field.required ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2">
                  <Input
                    placeholder={field.description}
                    value={values[field.name] || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className="h-8"
                    type={field.type.toLowerCase() === "file" ? "file" : "text"}
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
