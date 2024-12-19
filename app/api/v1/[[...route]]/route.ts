import { Hono } from "hono"
import { openAPISpecs } from "hono-openapi"
import { handle } from "hono/vercel"

import versionRoute from "./_endpoints/app/version"
import { homeyApps } from "./_endpoints/homey/[homeyId]/apps"
import { auth } from "./_middleware/auth"

export const runtime = "nodejs"

const app = new Hono().basePath("/api/v1")

// Register all routes
app.get(homeyApps.url, homeyApps.description, auth, homeyApps.handler)
app.route("/app", versionRoute)

// Add better error handling for OpenAPI spec
app.get(
  "/openapi",
  async (c, next) => {
    try {
      await next()
    } catch (error) {
      console.error("OpenAPI spec generation error:", error)
      return c.json(
        {
          error: "Failed to generate API documentation",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      )
    }
  },
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Homey Community Space API",
        version: "1.0.0",
        description: "API for the Homey Community Space",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "apikey",
            description: "API key must be provided as a Bearer token",
          },
        },
      },
      security: [{ bearerAuth: [] }],
      servers: [
        {
          url: process.env.AUTH_URL || "http://localhost:3000",
          description: "API Server",
        },
      ],
      tags: [
        {
          name: "version",
          description: "App version related operations",
        },
        {
          name: "homey",
          description: "Homey device related operations",
        },
      ],
    },
  })
)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
export const OPTIONS = handle(app)
