import { API_SCOPES } from "@/config/api-scopes"
import { generateApiKey, hashApiKey } from "@/lib/api-key"
import { prisma } from "@/lib/prisma"

import { requireAuth, type AuthenticatedRequest } from "../middleware"

// List API keys
export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: req.auth.user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      scopes: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const responseData = apiKeys.map((apiKey) => ({
    ...apiKey,
    scopes: apiKey.scopes ? apiKey.scopes.split(",") : [],
  }))

  return Response.json(responseData)
})

// Create new API key
export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  const body = await req.json()
  const { name, scopes, noExpiry, expiresAt } = body

  if (!name) {
    return new Response("Name is required", { status: 400 })
  }

  if (!Array.isArray(scopes) || scopes.length === 0) {
    return new Response("At least one scope is required", { status: 400 })
  }

  const validScopes = API_SCOPES.map((scope) => scope.value)
  const invalidScopes = scopes.filter((scope) => !validScopes.includes(scope))
  if (invalidScopes.length > 0) {
    return new Response(`Invalid scopes: ${invalidScopes.join(", ")}`, {
      status: 400,
    })
  }

  // Generate a new API key
  const key = generateApiKey()
  const hashedKey = hashApiKey(key)

  // Store the hashed key
  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key: hashedKey,
      userId: req.auth.user.id,
      scopes: scopes.join(","),
      expiresAt: noExpiry ? null : expiresAt,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      scopes: true,
    },
  })

  // Parse scopes back to array for response
  const responseData = {
    ...apiKey,
    scopes: apiKey.scopes ? apiKey.scopes.split(",") : [],
    key,
  }

  // Return the API key - this is the only time the raw key will be shown
  return Response.json(responseData)
})

// Delete API key
export const DELETE = requireAuth(async (req: AuthenticatedRequest) => {
  const searchParams = new URL(req.url).searchParams
  const id = searchParams.get("id")

  if (!id) {
    return new Response("API key ID is required", { status: 400 })
  }

  // Verify ownership and delete
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id,
      userId: req.auth.user.id,
    },
  })

  if (!apiKey) {
    return new Response("API key not found", { status: 404 })
  }

  await prisma.apiKey.delete({
    where: { id },
  })

  return new Response(null, { status: 204 })
})
