"use client"

import { useState } from "react"
import { Button } from "components/ui/button"
import { cn, obfuscateApiKey } from "lib/utils"

import { TransformedEndpoint } from "../lib/fetch-openapi"
import { getBaseUrl } from "../lib/get-base-url"
import { CodeBlock } from "./code-block"

type Language = "curl" | "javascript" | "php" | "typescript"

interface CodeExamplesProps {
  endpoint: TransformedEndpoint
  apiKey: string
  paramValues: Record<string, string>
  bodyValues: Record<string, string>
}

export function CodeExamples({
  endpoint,
  apiKey,
  paramValues,
  bodyValues,
}: CodeExamplesProps) {
  const [language, setLanguage] = useState<Language>("javascript")

  const generateUrl = () => {
    let url = endpoint.path
    Object.entries(paramValues).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value || `example_${key}`)
    })
    return `${getBaseUrl()}${url}`
  }

  const getHeaders = () => {
    return endpoint.headers.reduce(
      (acc, header) => ({
        ...acc,
        [header.name]:
          header.name === "Authorization"
            ? `Bearer ${obfuscateApiKey(apiKey)}`
            : header.value,
      }),
      {} as Record<string, string>
    )
  }

  const getBody = () => {
    if (!endpoint.body) return null

    if (endpoint.body.type === "json") {
      return endpoint.body.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: bodyValues[field.name] || `example_${field.name}`,
        }),
        {} as Record<string, string>
      )
    }

    const formData = new FormData()
    endpoint.body.fields.forEach((field) => {
      formData.append(
        field.name,
        bodyValues[field.name] || `example_${field.name}`
      )
    })
    return formData
  }

  const formatTypeValue = (value: any, indent = 0): string => {
    const spaces = "  ".repeat(indent)

    if (Array.isArray(value)) {
      if (value.length === 0) return "Array<any>"
      const itemType =
        typeof value[0] === "object"
          ? `{\n${Object.entries(value[0])
              .map(([k, v]) => `${spaces}    ${k}: ${typeof v}`)
              .join(",\n")}\n${spaces}  }`
          : typeof value[0]
      return `Array<${itemType}>`
    }

    if (typeof value === "object" && value !== null) {
      return `{\n${Object.entries(value)
        .map(([k, v]) => `${spaces}  ${k}: ${formatTypeValue(v, indent + 1)}`)
        .join(",\n")}\n${spaces}}`
    }

    return typeof value
  }

  const generateTypeScript = () => {
    const headers = getHeaders()
    const body = getBody()
    const firstOkResponse =
      endpoint.responses.find((r) => r.status >= 200 && r.status < 300) ||
      endpoint.responses[0]
    const example = firstOkResponse?.example || {}

    return `interface Response ${formatTypeValue(example, 0)}

async function call${endpoint.method.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}${endpoint.path
      .split("/")
      .map((part) =>
        part.startsWith(":")
          ? part.slice(1).replace(/^\w/, (c) => c.toUpperCase())
          : ""
      )
      .join(
        ""
      )}(${endpoint.params?.map((param) => `${param.name}: string`).join(", ") || ""}${
      endpoint.params && endpoint.body ? ", " : ""
    }${
      endpoint.body?.fields
        .map(
          (field) =>
            `${field.name}: ${field.type.toLowerCase() === "file" ? "File" : "string"}`
        )
        .join(", ") || ""
    }): Promise<Response> {
  const response = await fetch("${generateUrl()}", {
    method: "${endpoint.method}",
    headers: ${JSON.stringify(headers, null, 2)},${
      body
        ? `
    ${
      endpoint.body?.type === "json"
        ? `body: JSON.stringify(${JSON.stringify(body, null, 2)}),`
        : `body: formData, // FormData with: ${endpoint.body?.fields.map((f) => f.name).join(", ")}`
    }`
        : ""
    }
  })

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`)
  }

  return response.json()
}`
  }

  const generateJavaScript = () => {
    const headers = getHeaders()
    const body = getBody()

    return `// Using async/await
async function callApi() {
  try {
    const response = await fetch("${generateUrl()}", {
      method: "${endpoint.method}",
      headers: ${JSON.stringify(headers, null, 2)},${
        body
          ? `
      ${
        endpoint.body?.type === "json"
          ? `body: JSON.stringify(${JSON.stringify(body, null, 2)}),`
          : `body: formData, // FormData with: ${endpoint.body?.fields.map((f) => f.name).join(", ")}`
      }`
          : ""
      }
    })

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }

    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error('Error:', error)
  }
}`
  }

  const generatePHP = () => {
    const headers = getHeaders()
    const body = getBody()

    return `<?php

use GuzzleHttp\\Client;

$client = new Client([
    'base_uri' => '${getBaseUrl()}',
    'headers' => ${JSON.stringify(headers, null, 2).replace(/"/g, "'")}
]);

try {
    $response = $client->request('${endpoint.method}', '${endpoint.path}',${
      body && endpoint.body
        ? ` [
        ${
          endpoint.body.type === "json"
            ? `'json' => ${JSON.stringify(body, null, 2).replace(/"/g, "'")}`
            : `'multipart' => [
            ${endpoint.body.fields
              .map(
                (field) =>
                  `['name' => '${field.name}', 'contents' => '${bodyValues[field.name] || `example_${field.name}`}']`
              )
              .join(",\n            ")}
        ]`
        }
    ]`
        : ""
    });

    $data = json_decode($response->getBody(), true);
    print_r($data);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}`
  }

  const generateCurl = () => {
    const headers = getHeaders()
    const body = getBody()

    let curl = `curl -X ${endpoint.method} '${generateUrl()}'`

    // Add headers
    Object.entries(headers).forEach(([name, value]) => {
      curl += `\n  -H '${name}: ${value}'`
    })

    // Add body if needed
    if (body) {
      if (endpoint.body?.type === "json") {
        curl += `\n  -d '${JSON.stringify(body, null, 2)}'`
      } else if (endpoint.body?.type === "formData") {
        endpoint.body.fields.forEach((field) => {
          const value = bodyValues[field.name] || `example_${field.name}`
          curl += `\n  -F '${field.name}=${value}'`
        })
      }
    }

    return curl
  }

  const codeExamples = {
    typescript: {
      label: "TypeScript",
      language: "typescript",
      code: generateTypeScript(),
    },
    javascript: {
      label: "JavaScript",
      language: "javascript",
      code: generateJavaScript(),
    },
    php: {
      label: "PHP",
      language: "php",
      code: generatePHP(),
    },
    curl: {
      label: "cURL",
      language: "bash",
      code: generateCurl(),
    },
  }

  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-medium mb-3">Code Examples</h3>
      <div className="space-y-4">
        <div className="inline-flex p-1 bg-muted rounded-lg">
          {(Object.keys(codeExamples) as Language[]).map((lang) => (
            <Button
              key={lang}
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(lang)}
              className={cn(
                "relative rounded-md text-sm font-medium transition-colors hover:text-primary",
                language === lang && "bg-background shadow-sm text-foreground"
              )}
            >
              {codeExamples[lang].label}
            </Button>
          ))}
        </div>
        <CodeBlock
          language={codeExamples[language].language}
          value={codeExamples[language].code}
          className="[&_pre]:max-h-[350px]"
        />
      </div>
    </div>
  )
}
