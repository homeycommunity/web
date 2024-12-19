type BaseScopeConfig = {
  value: string
  label: string
  description: string
  indent: number
}

type ReadScopeConfig = BaseScopeConfig & {
  requires?: never
}

type WriteScopeConfig = BaseScopeConfig & {
  requires: readonly string[]
}

type ScopeConfig = ReadScopeConfig | WriteScopeConfig

export const API_SCOPES = [
  {
    value: "read:apps",
    label: "Apps - Read",
    description: "View app information and details",
    indent: 0,
  },
  {
    value: "write:apps",
    label: "Apps - Write",
    description: "Create and modify apps",
    indent: 1,
    requires: ["read:apps"] as const,
  },
  {
    value: "read:versions",
    label: "Versions - Read",
    description: "View app version information",
    indent: 0,
  },
  {
    value: "write:versions",
    label: "Versions - Write",
    description: "Create and modify app versions",
    indent: 1,
    requires: ["read:versions"] as const,
  },
  {
    value: "homey:devices",
    label: "Homey Devices",
    description: "Control Homey devices",
    indent: 0,
  },
  {
    value: "homey:apps",
    label: "Homey Apps",
    description: "Manage Homey apps",
    indent: 0,
  },
  {
    value: "homey:flows",
    label: "Homey Flows",
    description: "Trigger Homey flows",
    indent: 0,
  },
] as const

export type ApiScope = (typeof API_SCOPES)[number]["value"]

export function getApiScopeLabel(scope: ApiScope) {
  return API_SCOPES.find((s) => s.value === scope)?.label || scope
}

export function getApiScopeDescription(scope: ApiScope) {
  return API_SCOPES.find((s) => s.value === scope)?.description || ""
}

export function getApiScopeDependencies(scope: ApiScope): ApiScope[] {
  const scopeConfig = API_SCOPES.find((s) => s.value === scope)
  return (
    scopeConfig && "requires" in scopeConfig ? scopeConfig.requires : []
  ) as ApiScope[]
}

export function getAllRequiredScopes(scopes: ApiScope[]): ApiScope[] {
  const allScopes = new Set<ApiScope>(scopes)

  scopes.forEach((scope) => {
    const dependencies = getApiScopeDependencies(scope)
    dependencies.forEach((dep) => allScopes.add(dep))
  })

  return Array.from(allScopes)
}

export function getIndentLevel(scope: ApiScope): number {
  return API_SCOPES.find((s) => s.value === scope)?.indent || 0
}
