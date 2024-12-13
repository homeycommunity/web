import { ApiScope } from "config/api-scopes"

import { OpenAPISpec } from "../types/openapi"

export interface TransformedEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
  scopes: ApiScope[]
  headers: Array<{
    name: string
    value: string
    required: boolean
    description: string
  }>
  params?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  body?: {
    type: "json" | "formData"
    fields: Array<{
      name: string
      type: string
      required: boolean
      description: string
    }>
  }
  responses: Array<{
    status: number
    description: string
    example: any
  }>
}

export async function fetchOpenAPISpec(): Promise<OpenAPISpec> {
  const response = await fetch("/api/v1/openapi")
  if (!response.ok) {
    throw new Error("Failed to fetch OpenAPI specification")
  }
  return response.json()
}

export function transformOpenAPIToEndpoints(
  spec: OpenAPISpec
): TransformedEndpoint[] {
  const endpoints: TransformedEndpoint[] = []

  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      const upperMethod = method.toUpperCase() as TransformedEndpoint["method"]

      // Skip if not a supported method
      if (!["GET", "POST", "PUT", "DELETE"].includes(upperMethod)) {
        return
      }

      // Extract security requirements
      const scopes =
        operation.security?.flatMap((sec) =>
          Object.entries(sec).flatMap(([scheme, scopes]) =>
            scheme === "bearerAuth" ? scopes : []
          )
        ) || []

      const endpoint: TransformedEndpoint = {
        method: upperMethod,
        path,
        description: operation.summary || operation.description || "",
        scopes: scopes as ApiScope[],
        headers: [
          {
            name: "Authorization",
            value: "Bearer <api_key>",
            required: true,
            description:
              spec.components?.securitySchemes?.bearerAuth?.description ||
              "API key for authentication",
          },
          ...(operation.parameters
            ?.filter((p) => p.in === "header")
            .map((p) => ({
              name: p.name,
              value: `<${p.name}>`,
              required: p.required || false,
              description: p.description || "",
            })) || []),
        ],
        responses: Object.entries(operation.responses).map(
          ([status, response]) => ({
            status: parseInt(status),
            description: response.description,
            example: response.content?.["application/json"]?.example || {},
          })
        ),
      }

      // Add path and query parameters
      const params = operation.parameters?.filter((p) =>
        ["path", "query"].includes(p.in)
      )
      if (params?.length) {
        endpoint.params = params.map((p) => ({
          name: p.name,
          type: p.schema.type,
          required: p.required || false,
          description: p.description || "",
        }))
      }

      // Add request body if present
      if (operation.requestBody) {
        const contentType = Object.keys(operation.requestBody.content)[0]
        const schema = operation.requestBody.content[contentType].schema

        endpoint.body = {
          type: contentType.includes("json") ? "json" : "formData",
          fields: Object.entries(schema.properties || {}).map(
            ([name, prop]: [string, any]) => ({
              name,
              type: prop.type,
              required: schema.required?.includes(name) || false,
              description: prop.description || "",
            })
          ),
        }
      }

      endpoints.push(endpoint)
    })
  })

  return endpoints
}
