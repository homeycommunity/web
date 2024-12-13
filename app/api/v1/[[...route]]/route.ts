import { Hono } from "hono"
import { openAPISpecs } from "hono-openapi"
import { handle } from "hono/vercel"

import versionRoute from "./_endpoints/app/version"
import { homeyApps } from "./_endpoints/homey/[homeyId]/apps"
import { auth } from "./_middleware/auth"

export const runtime = "nodejs"

export const app = new Hono().basePath("/api/v1")

app.get(homeyApps.url, homeyApps.description, auth, homeyApps.handler)
app.route("/app", versionRoute)

app.get(
  "/openapi",
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
    },
  })
)

export const GET = handle(app)
export const POST = handle(app)
