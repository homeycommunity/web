"use client"

import { useEffect, useState } from "react"
import { Accordion } from "components/ui/accordion"
import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader } from "components/ui/card"
import { Input } from "components/ui/input"
import { Info, Lock } from "lucide-react"

import { obfuscateApiKey } from "@/lib/utils"

import { EndpointDocs } from "./components/endpoint-docs"
import type { TransformedEndpoint } from "./lib/fetch-openapi"
import {
  fetchOpenAPISpec,
  transformOpenAPIToEndpoints,
} from "./lib/fetch-openapi"

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState("")
  const [expandedEndpoint, setExpandedEndpoint] = useState<string>("")
  const [paramValues, setParamValues] = useState<
    Record<number, Record<string, string>>
  >({})
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
  const [bodyValues, setBodyValues] = useState<
    Record<number, Record<string, string>>
  >({})
  const [endpoints, setEndpoints] = useState<TransformedEndpoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOpenAPISpec() {
      try {
        const spec = await fetchOpenAPISpec()
        const transformedEndpoints = transformOpenAPIToEndpoints(spec)
        setEndpoints(transformedEndpoints)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load API documentation"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadOpenAPISpec()
  }, [])

  const handleParamChange = (
    endpointIndex: number,
    name: string,
    value: string
  ) => {
    setParamValues((prev) => ({
      ...prev,
      [endpointIndex]: {
        ...(prev[endpointIndex] || {}),
        [name]: value,
      },
    }))
  }

  const handleBodyChange = (
    endpointIndex: number,
    name: string,
    value: string
  ) => {
    setBodyValues((prev) => ({
      ...prev,
      [endpointIndex]: {
        ...(prev[endpointIndex] || {}),
        [name]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <main className="container py-6">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading API documentation...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container py-6">
        <div className="flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            API Documentation
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore and test the Homey Store API endpoints directly in your
            browser.
          </p>
        </div>
      </div>

      {/* Authentication Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <h2 className="text-lg font-semibold">Authentication</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="max-w-md font-mono"
                type={isApiKeyVisible ? "text" : "password"}
              />
              <Button
                variant="outline"
                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
              >
                {isApiKeyVisible ? "Hide" : "Show"}
              </Button>
              <Button variant="secondary" onClick={() => setApiKey("")}>
                Clear
              </Button>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Include this header in all API requests:
                </p>
                <code className="text-sm font-mono px-2 py-1 rounded bg-muted">
                  Authorization: Bearer {obfuscateApiKey(apiKey)}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Endpoints</h2>
              <span className="text-sm text-muted-foreground">
                {endpoints.length} available
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={expandedEndpoint}
            onValueChange={(value) => setExpandedEndpoint(value || "")}
          >
            {endpoints.map((endpoint, index) => (
              <EndpointDocs
                key={index}
                endpoint={endpoint}
                index={index}
                apiKey={apiKey}
                paramValues={paramValues[index] || {}}
                bodyValues={bodyValues[index] || {}}
                onParamChange={(name, value) =>
                  handleParamChange(index, name, value)
                }
                onBodyChange={(name, value) =>
                  handleBodyChange(index, name, value)
                }
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  )
}
