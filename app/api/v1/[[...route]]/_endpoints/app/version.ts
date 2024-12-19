import { File } from "buffer"
import { zValidator } from "@hono/zod-validator"
import { ApiKey } from "@prisma/client"
import { Context, Hono } from "hono"
import { describeRoute } from "hono-openapi"
import { prisma } from "lib/prisma"
import { z } from "zod"

import { auth } from "../../_middleware/auth"

const app = new Hono()

app.get(
  "/:identifier",
  describeRoute({
    tags: ["version"],
    summary: "Get app versions for a specific app",
    security: [{ bearerAuth: ["read:apps"] }],
  }),
  auth,
  async (c: Context) => {
    const apiKey = c.get("apiKey") as ApiKey
    const identifier = c.req.param("identifier")

    const app = await prisma.app.findUnique({
      where: {
        identifier,
      },
      include: {
        versions: {
          where: {
            OR: [
              {
                available: true,
                approved: true,
              },
              { experimental: true },
            ],
          },
          select: {
            id: true,
            version: true,
            changelog: true,
            publishedAt: true,
            experimental: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        },
      },
    })

    if (!app) {
      return c.json({ error: "App not found", code: "APP_NOT_FOUND" }, 404)
    }

    return c.json({ versions: app.versions })
  }
)

app.post(
  "/version",
  describeRoute({
    tags: ["version"],
    summary: "Create a new app version",
    security: [{ bearerAuth: ["write:apps", "write:versions"] }],
  }),
  zValidator(
    "form",
    z.object({
      app: z.instanceof(File),
    })
  ),
  auth,
  async (c) => {
    const app = c.req.valid("form").app

    return c.json({ error: "Not implemented" }, 501)
  }
)

export default app
