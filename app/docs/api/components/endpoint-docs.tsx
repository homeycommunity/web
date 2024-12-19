"use client"

import { useState } from "react"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "components/ui/accordion"
import { Button } from "components/ui/button"
import { cn } from "lib/utils"
import { Loader2, PlayCircle } from "lucide-react"

import { TransformedEndpoint } from "../lib/fetch-openapi"
import { getBaseUrl } from "../lib/get-base-url"
import { Badge } from "./badge"
import { CodeExamples } from "./code-examples"
import { EndpointBody } from "./endpoint-body"
import { EndpointHeaders } from "./endpoint-headers"
import { EndpointParameters } from "./endpoint-parameters"
import { EndpointResponses } from "./endpoint-responses"
import { EndpointScopes } from "./endpoint-scopes"
import { ResponseDisplay } from "./response-display"

interface EndpointDocsProps {
  endpoint: TransformedEndpoint
  index: number
  apiKey: string
  paramValues: Record<string, string>
  bodyValues: Record<string, string>
  onParamChange: (name: string, value: string) => void
  onBodyChange: (name: string, value: string) => void
}

interface ApiResponse {
  status: number
  data: any
  error?: string
  headers?: Record<string, string>
}

export function EndpointDocs({
  endpoint,
  index,
  apiKey,
  paramValues,
  bodyValues,
  onParamChange,
  onBodyChange,
}: EndpointDocsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<ApiResponse | null>(null)

  const generateUrl = () => {
    try {
      let url = endpoint.path
      Object.entries(paramValues).forEach(([key, value]) => {
        if (!value && endpoint.params?.find((p) => p.name === key)?.required) {
          throw new Error(`Required parameter "${key}" is missing`)
        }
        url = url.replace(`{${key}}`, encodeURIComponent(value || `:${key}`))
      })
      return `${getBaseUrl()}${url}`
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to generate URL")
    }
  }

  const validateRequestBody = () => {
    if (!endpoint.body) return true

    const missingFields = endpoint.body.fields
      .filter((field) => field.required && !bodyValues[field.name])
      .map((field) => field.name)

    if (missingFields.length > 0) {
      throw new Error(`Required fields missing: ${missingFields.join(", ")}`)
    }

    return true
  }

  const testEndpoint = async () => {
    if (!apiKey) {
      setTestResponse({
        status: 400,
        data: null,
        error: "API key is required",
      })
      return
    }

    setIsLoading(true)
    setTestResponse(null)

    try {
      // Validate parameters and body before making request
      const url = generateUrl()
      validateRequestBody()

      const requestHeaders: Record<string, string> = endpoint.headers.reduce(
        (acc, header) => ({
          ...acc,
          [header.name]:
            header.name === "Authorization" ? `Bearer ${apiKey}` : header.value,
        }),
        {} as Record<string, string>
      )

      let requestBody: BodyInit | undefined
      if (endpoint.body) {
        if (endpoint.body.type === "json") {
          requestHeaders["Content-Type"] = "application/json"
          requestBody = JSON.stringify(
            endpoint.body.fields.reduce(
              (acc, field) => ({
                ...acc,
                [field.name]: bodyValues[field.name] || "",
              }),
              {}
            )
          )
        } else {
          requestBody = Object.entries(bodyValues).reduce(
            (formData, [key, value]) => {
              formData.append(key, value)
              return formData
            },
            new FormData()
          )
        }
      }

      const response = await fetch(url, {
        method: endpoint.method,
        headers: requestHeaders,
        body: requestBody,
      })

      // Get response headers
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let data: any
      const contentType = response.headers.get("content-type")

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json()
        } catch (error) {
          console.warn("Failed to parse JSON response:", error)
          data = await response.text()
        }
      } else {
        data = await response.text()
      }

      setTestResponse({
        status: response.status,
        data,
        headers: responseHeaders,
      })
    } catch (error) {
      console.error("API test error:", error)
      setTestResponse({
        status: 500,
        data: null,
        error: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AccordionItem
      value={`item-${index}`}
      className={cn(
        "mb-3 overflow-hidden rounded-lg border bg-card transition-shadow",
        testResponse &&
          (testResponse.error
            ? "ring-1 ring-destructive"
            : "ring-1 ring-primary")
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b">
        <div className="flex w-full items-center gap-4">
          <Badge variant="method" type={endpoint.method.toLowerCase() as any}>
            {endpoint.method}
          </Badge>
          <code className="font-mono text-base text-foreground/80">
            {endpoint.path}
          </code>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="divide-y dark:divide-gray-800">
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              {endpoint.description}
            </p>
          </div>

          <EndpointHeaders headers={endpoint.headers} apiKey={apiKey} />

          <EndpointScopes scopes={endpoint.scopes} />

          {endpoint.params && (
            <EndpointParameters
              parameters={endpoint.params}
              values={paramValues}
              onChange={onParamChange}
            />
          )}

          {endpoint.body && (
            <EndpointBody
              type={endpoint.body.type}
              fields={endpoint.body.fields}
              values={bodyValues}
              onChange={onBodyChange}
            />
          )}

          <div className="p-4">
            <Button
              variant={testResponse?.error ? "destructive" : "blue"}
              size="default"
              className={cn(
                "w-full",
                isLoading && "pointer-events-none opacity-50"
              )}
              onClick={() => {
                if (!isLoading) testEndpoint()
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 size-4" />
              )}
              {isLoading ? "Testing..." : "Test Endpoint"}
            </Button>
          </div>

          {testResponse && (
            <div className="bg-muted/50 p-4">
              <ResponseDisplay response={testResponse} />
            </div>
          )}

          {endpoint.responses?.length > 0 && (
            <EndpointResponses responses={endpoint.responses} />
          )}

          <CodeExamples
            endpoint={endpoint}
            apiKey={apiKey}
            paramValues={paramValues}
            bodyValues={bodyValues}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
