export const API_SCOPES = [
  {
    value: "read:apps",
    label: "Read Apps",
    description: "View app information and details",
    dependencies: [] as string[],
  },
  {
    value: "write:apps",
    label: "Write Apps",
    description: "Create and modify apps",
    dependencies: ["read:apps"] as const,
  },
  {
    value: "read:versions",
    label: "Read Versions",
    description: "View app version information",
    dependencies: [] as string[],
  },
  {
    value: "write:versions",
    label: "Write Versions",
    description: "Create and modify app versions",
    dependencies: ["read:versions"] as const,
  },
  {
    value: "homey:devices",
    label: "Homey Devices",
    description: "Control Homey devices",
    dependencies: [] as string[],
  },
  {
    value: "homey:flows",
    label: "Homey Flows",
    description: "Trigger Homey flows",
    dependencies: [] as string[],
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
  return (API_SCOPES.find((s) => s.value === scope)?.dependencies ||
    []) as ApiScope[]
}

// Checks if scopes array includes the required scope and its dependencies
export function hasScopeWithDependencies(
  scopes: ApiScope[],
  requiredScope: ApiScope
): boolean {
  if (!scopes.includes(requiredScope)) {
    return false
  }

  const dependencies = getApiScopeDependencies(requiredScope)
  return dependencies.every((dep) => scopes.includes(dep))
}

// Gets all required scopes including dependencies
export function getAllRequiredScopes(scopes: ApiScope[]): ApiScope[] {
  const allScopes = new Set<ApiScope>(scopes)

  scopes.forEach((scope) => {
    const dependencies = getApiScopeDependencies(scope)
    dependencies.forEach((dep) => allScopes.add(dep))
  })

  return Array.from(allScopes)
}
