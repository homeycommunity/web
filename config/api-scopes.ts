export const API_SCOPES = [
  {
    value: "read:apps",
    label: "Read Apps",
    description: "View app information and details",
  },
  {
    value: "write:apps",
    label: "Write Apps",
    description: "Create and modify apps",
  },
  {
    value: "read:versions",
    label: "Read Versions",
    description: "View app version information",
  },
  {
    value: "write:versions",
    label: "Write Versions",
    description: "Create and modify app versions",
  },
  {
    value: "homey:devices",
    label: "Homey Devices",
    description: "Control Homey devices",
  },
  {
    value: "homey:flows",
    label: "Homey Flows",
    description: "Trigger Homey flows",
  },
] as const

export type ApiScope = (typeof API_SCOPES)[number]["value"]

export function getApiScopeLabel(scope: ApiScope) {
  return API_SCOPES.find((s) => s.value === scope)?.label || scope
}

export function getApiScopeDescription(scope: ApiScope) {
  return API_SCOPES.find((s) => s.value === scope)?.description || ""
}
