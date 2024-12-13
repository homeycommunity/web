import { API_SCOPES, ApiScope, getAllRequiredScopes } from "@/config/api-scopes"

import { Badge } from "./badge"

interface EndpointScopesProps {
  scopes: ApiScope[]
}

export function EndpointScopes({ scopes }: EndpointScopesProps) {
  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-medium mb-3">Required Scopes</h3>
      <div className="flex flex-wrap gap-2">
        {getAllRequiredScopes(scopes).map((scope, index) => {
          const scopeConfig = API_SCOPES.find((s) => s.value === scope)
          const type = scope.startsWith("read:") ? "read" : "write"

          return (
            <Badge
              key={index}
              variant="scope"
              type={type}
              className={scopeConfig?.indent ? "ml-4" : ""}
            >
              {scope}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
