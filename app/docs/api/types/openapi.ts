export interface OpenAPIParameter {
  name: string
  in: string
  required: boolean
  description?: string
  schema: {
    type: string
    format?: string
  }
}

export interface OpenAPIRequestBody {
  required?: boolean
  content: {
    [key: string]: {
      schema: {
        type: string
        properties?: {
          [key: string]: {
            type: string
            description?: string
          }
        }
        required?: string[]
      }
    }
  }
}

export interface OpenAPIResponse {
  description: string
  content?: {
    "application/json": {
      schema: {
        type: string
        properties?: {
          [key: string]: any
        }
      }
      example?: any
    }
  }
}

export interface OpenAPIOperation {
  summary?: string
  description?: string
  security?: Array<{ [key: string]: string[] }>
  parameters?: OpenAPIParameter[]
  requestBody?: OpenAPIRequestBody
  responses: {
    [statusCode: string]: OpenAPIResponse
  }
}

export interface OpenAPIPath {
  [method: string]: OpenAPIOperation
}

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers: Array<{
    url: string
    description?: string
  }>
  paths: {
    [path: string]: OpenAPIPath
  }
  components?: {
    securitySchemes?: {
      [key: string]: {
        type: string
        scheme?: string
        bearerFormat?: string
        description?: string
      }
    }
  }
}
