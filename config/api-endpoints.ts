import { ApiScope } from "./api-scopes"

interface EndpointHeader {
  name: string
  value: string
  required: boolean
  description: string
}

interface EndpointParam {
  name: string
  type: string
  required: boolean
  description: string
}

interface EndpointBodyField {
  name: string
  type: string
  required: boolean
  description: string
}

interface EndpointBody {
  type: "json" | "formData"
  fields: EndpointBodyField[]
}

interface EndpointResponse {
  status: number
  description: string
  example: Record<string, any>
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
  scopes: ApiScope[]
  headers: EndpointHeader[]
  params?: EndpointParam[]
  body?: EndpointBody
  responses: EndpointResponse[]
}

export const apiEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/version/app/:identifier",
    description: "Get app versions for a specific app",
    scopes: ["read:apps"],
    headers: [
      {
        name: "Authorization",
        value: "Bearer <api_key>",
        required: true,
        description: "API key for authentication",
      },
    ],
    params: [
      {
        name: "identifier",
        type: "string",
        required: true,
        description: "The app identifier",
      },
    ],
    responses: [
      {
        status: 200,
        description: "List of app versions",
        example: {
          versions: [
            {
              id: "1234",
              version: "1.0.0",
              changelog: "Initial release",
              createdAt: "2024-03-19T12:00:00Z",
              downloads: 150,
            },
            {
              id: "1235",
              version: "1.1.0",
              changelog: "Added new features",
              createdAt: "2024-03-20T12:00:00Z",
              downloads: 50,
            },
          ],
        },
      },
      {
        status: 404,
        description: "App not found",
        example: {
          error: "App not found",
          code: "APP_NOT_FOUND",
        },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/version/app",
    description: "Create a new app version",
    scopes: ["write:apps", "write:versions"],
    headers: [
      {
        name: "Authorization",
        value: "Bearer <api_key>",
        required: true,
        description: "API key for authentication",
      },
      {
        name: "Content-Type",
        value: "multipart/form-data",
        required: true,
        description: "Must be multipart/form-data",
      },
    ],
    body: {
      type: "formData",
      fields: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "The app package file (.hapk)",
        },
        {
          name: "version",
          type: "string",
          required: true,
          description: "Version number (semver)",
        },
        {
          name: "changelog",
          type: "string",
          required: true,
          description: "Version changelog",
        },
      ],
    },
    responses: [
      {
        status: 201,
        description: "Version created successfully",
        example: {
          id: "1234",
          version: "1.0.0",
          changelog: "Initial release",
          createdAt: "2024-03-19T12:00:00Z",
          fileUrl: "https://store.homey.community/versions/1234/download",
        },
      },
      {
        status: 400,
        description: "Invalid request",
        example: {
          error: "Invalid version number",
          code: "INVALID_VERSION",
        },
      },
    ],
  },
  {
    method: "GET",
    path: "/api/homey/:identifier/devices",
    description: "Get devices for a specific Homey",
    scopes: ["homey:devices"],
    headers: [
      {
        name: "Authorization",
        value: "Bearer <api_key>",
        required: true,
        description: "API key for authentication",
      },
    ],
    params: [
      {
        name: "identifier",
        type: "string",
        required: true,
        description: "The Homey identifier",
      },
    ],
    responses: [
      {
        status: 200,
        description: "List of devices",
        example: {
          devices: [
            {
              id: "device1",
              name: "Living Room Light",
              class: "light",
              capabilities: ["onoff", "dim"],
              zone: {
                id: "zone1",
                name: "Living Room",
              },
            },
            {
              id: "device2",
              name: "Front Door",
              class: "doorbell",
              capabilities: ["alarm_generic"],
              zone: {
                id: "zone2",
                name: "Entrance",
              },
            },
          ],
        },
      },
      {
        status: 404,
        description: "Homey not found",
        example: {
          error: "Homey not found",
          code: "HOMEY_NOT_FOUND",
        },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/hcs/apps/:identifier/install/:homey/:version",
    description: "Install an app version on a Homey",
    scopes: ["homey:flows", "write:apps"],
    headers: [
      {
        name: "Authorization",
        value: "Bearer <api_key>",
        required: true,
        description: "API key for authentication",
      },
    ],
    params: [
      {
        name: "identifier",
        type: "string",
        required: true,
        description: "The app identifier",
      },
      {
        name: "homey",
        type: "string",
        required: true,
        description: "The Homey identifier",
      },
      {
        name: "version",
        type: "string",
        required: true,
        description: "Version number to install",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Installation started",
        example: {
          status: "installing",
          installId: "install123",
          progress: {
            step: "downloading",
            percentage: 0,
          },
        },
      },
      {
        status: 400,
        description: "Invalid request",
        example: {
          error: "Version not found",
          code: "VERSION_NOT_FOUND",
        },
      },
    ],
  },
]
