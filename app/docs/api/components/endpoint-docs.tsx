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
  const [testResponse, setTestResponse] = useState<{
    status: number
    data: any
    error?: string
  } | null>(null)

  const generateUrl = () => {
    let url = endpoint.path
    Object.entries(paramValues).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value || `:${key}`)
    })
    return `${getBaseUrl()}${url}`
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
      const response = await fetch(generateUrl(), {
        method: endpoint.method,
        headers: endpoint.headers.reduce(
          (acc, header) => ({
            ...acc,
            [header.name]:
              header.name === "Authorization"
                ? `Bearer ${apiKey}` // Use real API key for actual request
                : header.value,
          }),
          {}
        ),
        body: endpoint.body
          ? endpoint.body.type === "json"
            ? JSON.stringify(
                endpoint.body.fields.reduce(
                  (acc, field) => ({
                    ...acc,
                    [field.name]: bodyValues[field.name] || "",
                  }),
                  {}
                )
              )
            : Object.entries(bodyValues).reduce((formData, [key, value]) => {
                formData.append(key, value)
                return formData
              }, new FormData())
          : undefined,
      })

      const data = await response.json()

      setTestResponse({
        status: response.status,
        data,
      })
    } catch (error) {
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
        "mb-3 border rounded-lg overflow-hidden bg-card transition-shadow",
        testResponse && "ring-1 ring-primary"
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b">
        <div className="flex items-center gap-4 w-full">
          <Badge variant="method" type={endpoint.method.toLowerCase() as any}>
            {endpoint.method}
          </Badge>
          <code className="text-base font-mono text-foreground/80">
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
              variant="blue"
              size="default"
              className={cn(
                "w-full",
                isLoading && "opacity-50 pointer-events-none"
              )}
              onClick={() => {
                if (!isLoading) testEndpoint()
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Test Endpoint
            </Button>
          </div>
          {testResponse && (
            <div className="p-4 bg-muted/50">
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
