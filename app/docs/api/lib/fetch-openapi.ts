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
  try {
    const response = await fetch("/api/v1/openapi")
    if (!response.ok) {
      const error = await response.text()
      throw new Error(
        `Failed to fetch OpenAPI specification: ${
          response.status
        } - ${error || response.statusText}`
      )
    }

    const data = await response.json()
    if (!data || typeof data !== "object") {
      throw new Error("Invalid OpenAPI specification format")
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to fetch OpenAPI specification")
  }
}

export function transformOpenAPIToEndpoints(
  spec: OpenAPISpec
): TransformedEndpoint[] {
  if (!spec.paths || typeof spec.paths !== "object") {
    throw new Error("Invalid OpenAPI specification: missing or invalid paths")
  }

  const endpoints: TransformedEndpoint[] = []

  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    if (!pathItem || typeof pathItem !== "object") {
      console.warn(`Invalid path item for ${path}, skipping...`)
      return
    }

    Object.entries(pathItem).forEach(([method, operation]) => {
      if (!operation || typeof operation !== "object") {
        console.warn(`Invalid operation for ${method} ${path}, skipping...`)
        return
      }

      const upperMethod = method.toUpperCase() as TransformedEndpoint["method"]

      // Skip if not a supported method
      if (!["GET", "POST", "PUT", "DELETE"].includes(upperMethod)) {
        return
      }

      try {
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
              description: response.description || "",
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
            type: p.schema?.type || "string",
            required: p.required || false,
            description: p.description || "",
          }))
        }

        // Add request body if present
        if (operation.requestBody?.content) {
          const contentType = Object.keys(operation.requestBody.content)[0]
          const schema = operation.requestBody.content[contentType]?.schema

          if (schema?.properties) {
            endpoint.body = {
              type: contentType.includes("json") ? "json" : "formData",
              fields: Object.entries(schema.properties).map(
                ([name, prop]: [string, any]) => ({
                  name,
                  type: prop.type || "string",
                  required: schema.required?.includes(name) || false,
                  description: prop.description || "",
                })
              ),
            }
          }
        }

        endpoints.push(endpoint)
      } catch (error) {
        console.error(`Error transforming endpoint ${method} ${path}:`, error)
        // Continue with next endpoint
      }
    })
  })

  return endpoints
}
