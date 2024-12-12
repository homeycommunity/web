"use client"

import { useState } from "react"

import { apiEndpoints } from "@/config/api-endpoints"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { CodeBlock } from "./code-block"

type Language = "curl" | "javascript" | "php" | "typescript"

interface CodeExamplesProps {
  endpoint: (typeof apiEndpoints)[0]
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
      url = url.replace(`:${key}`, value || `:${key}`)
    })
    return `https://store.homey.community${url}`
  }

  const getHeaders = () => {
    return endpoint.headers.reduce(
      (acc, header) => ({
        ...acc,
        [header.name]:
          header.name === "Authorization"
            ? `Bearer ${apiKey || "<api_key>"}`
            : header.value,
      }),
      {}
    )
  }

  const getBody = () => {
    if (!endpoint.body) return null

    if (endpoint.body.type === "json") {
      return endpoint.body.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: bodyValues[field.name] || "",
        }),
        {}
      )
    }

    const formData = new FormData()
    endpoint.body.fields.forEach((field) => {
      formData.append(field.name, bodyValues[field.name] || "")
    })
    return formData
  }

  const generateTypeScript = () => {
    const headers = getHeaders()
    const body = getBody()

    return `interface Response {
  ${Object.entries(endpoint.responses[0].example)
    .map(
      ([key, value]) =>
        `${key}: ${
          typeof value === "object"
            ? Array.isArray(value)
              ? `Array<${
                  typeof value[0] === "object"
                    ? `{\n    ${Object.entries(value[0])
                        .map(([k, v]) => `${k}: ${typeof v}`)
                        .join(",\n    ")}\n  }`
                    : typeof value[0]
                }>`
              : `{\n    ${Object.entries(value)
                  .map(([k, v]) => `${k}: ${typeof v}`)
                  .join(",\n    ")}\n  }`
            : typeof value
        }`
    )
    .join(",\n  ")}
}

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
    headers: ${JSON.stringify(headers, null, 4)},${
      body
        ? `
    ${
      endpoint.body?.type === "json"
        ? `body: JSON.stringify(${JSON.stringify(body, null, 4)}),`
        : `body: formData, // FormData with: ${Object.keys(body as FormData).join(", ")}`
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
async function call${endpoint.method.toLowerCase()}() {
  try {
    const response = await fetch("${generateUrl()}", {
      method: "${endpoint.method}",
      headers: ${JSON.stringify(headers, null, 4)},${
        body
          ? `
      ${
        endpoint.body?.type === "json"
          ? `body: JSON.stringify(${JSON.stringify(body, null, 4)}),`
          : `body: formData, // FormData with: ${Object.keys(body as FormData).join(", ")}`
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
}

// Using Promises
fetch("${generateUrl()}", {
  method: "${endpoint.method}",
  headers: ${JSON.stringify(headers, null, 4)},${
    body
      ? `
  ${
    endpoint.body?.type === "json"
      ? `body: JSON.stringify(${JSON.stringify(body, null, 4)}),`
      : `body: formData, // FormData with: ${Object.keys(body as FormData).join(", ")}`
  }`
      : ""
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }
    return response.json()
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error))`
  }

  const generatePHP = () => {
    const headers = getHeaders()
    const body = getBody()

    return `<?php

use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\GuzzleException;

class ApiClient {
    private $client;
    private $apiKey;

    public function __construct(string $apiKey) {
        $this->client = new Client([
            'base_uri' => 'https://store.homey.community',
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey
            ]
        ]);
        $this->apiKey = $apiKey;
    }

    public function ${endpoint.method.toLowerCase()}${endpoint.path
      .split("/")
      .map((part) =>
        part.startsWith(":")
          ? part.slice(1).replace(/^\w/, (c) => c.toUpperCase())
          : ""
      )
      .join(
        ""
      )}(${endpoint.params?.map((param) => `string $${param.name}`).join(", ") || ""}${
      endpoint.params && endpoint.body ? ", " : ""
    }${
      endpoint.body?.fields
        .map(
          (field) =>
            `${field.type.toLowerCase() === "file" ? "string" : "string"} $${field.name}`
        )
        .join(", ") || ""
    }) {
        try {
            $response = $this->client->request("${endpoint.method}", "${endpoint.path}", [
                "headers" => ${JSON.stringify(headers, null, 4).replace(/"/g, "'")},${
                  body
                    ? `
                ${
                  endpoint.body?.type === "json"
                    ? `"json" => ${JSON.stringify(body, null, 4).replace(/"/g, "'")},`
                    : `"multipart" => [
                    ${Object.entries(body as FormData)
                      .map(
                        ([key]) => `["name" => "${key}", "contents" => $${key}]`
                      )
                      .join(",\n                    ")}
                ],`
                }`
                    : ""
                }
            ]);

            return json_decode($response->getBody(), true);
        } catch (GuzzleException $e) {
            throw new Exception("API request failed: " . $e->getMessage());
        }
    }
}

// Usage example
try {
    $client = new ApiClient("<your_api_key>");
    $result = $client->${endpoint.method.toLowerCase()}${endpoint.path
      .split("/")
      .map((part) =>
        part.startsWith(":")
          ? part.slice(1).replace(/^\w/, (c) => c.toUpperCase())
          : ""
      )
      .join(
        ""
      )}(${endpoint.params?.map((param) => `"example_${param.name}"`).join(", ") || ""}${
      endpoint.params && endpoint.body ? ", " : ""
    }${
      endpoint.body?.fields
        .map((field) => `"example_${field.name}"`)
        .join(", ") || ""
    });
    print_r($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}`
  }

  const generateCurl = () => {
    let curl = `curl -X ${endpoint.method} '${generateUrl()}'`

    // Add headers
    endpoint.headers.forEach((header) => {
      const value =
        header.name === "Authorization"
          ? `Bearer ${apiKey || "<api_key>"}`
          : header.value
      curl += `\n  -H '${header.name}: ${value}'`
    })

    // Add body if needed
    if (endpoint.body) {
      if (endpoint.body.type === "json") {
        const jsonBody = endpoint.body.fields.reduce(
          (acc, field) => {
            acc[field.name] = bodyValues[field.name] || ""
            return acc
          },
          {} as Record<string, string>
        )
        curl += `\n  -d '${JSON.stringify(jsonBody, null, 2)}'`
      } else if (endpoint.body.type === "formData") {
        endpoint.body.fields.forEach((field) => {
          curl += `\n  -F '${field.name}=${bodyValues[field.name] || ""}'`
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
