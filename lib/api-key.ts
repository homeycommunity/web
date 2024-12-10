import { createHash, randomBytes } from "crypto"

import { prisma } from "@/lib/prisma"
import { AuthenticatedRequest } from "@/app/api/middleware"

// Generate a new API key
export function generateApiKey(): string {
  // Generate 32 random bytes and convert to hex
  const key = randomBytes(32).toString("hex")
  // Add a prefix to make it easily identifiable
  return `hcs_${key}`
}

// Hash an API key for storage
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

// Validate an API key
export async function validateApiKey(key: string) {
  if (!key) return null

  // Hash the provided key
  const hashedKey = hashApiKey(key)

  // Find the API key in the database
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: { user: true },
  })

  if (!apiKey) return null

  // Check if the key has expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    ...apiKey,
    scopes: apiKey.scopes ? apiKey.scopes.split(",") : [],
  }
}

// Parse API key from authorization header
export function parseApiKey(authHeader: string | null): string | null {
  if (!authHeader) return null

  // Check for Bearer token format
  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") return null

  return parts[1]
}

// Helper to check if an API key has required scopes
export function hasRequiredScopes(
  keyScopes: string[] | undefined,
  requiredScopes: string[]
): boolean {
  if (!keyScopes || keyScopes.length === 0) return false
  return requiredScopes.every((scope) => keyScopes.includes(scope))
}

// Create middleware to require specific scopes
export function requireScopes<T extends { params: Promise<unknown> }>(
  scopes: string[]
) {
  return (
    handler: (req: AuthenticatedRequest, context: T) => Promise<Response>
  ) => {
    return async (req: AuthenticatedRequest, context: T) => {
      // Skip scope check for session-based auth
      if (!req.auth.apiKey) {
        return handler(req, context)
      }

      const apiKey = await prisma.apiKey.findUnique({
        where: { id: req.auth.apiKey.id },
        select: { scopes: true },
      })

      const keyScopes = apiKey?.scopes ? apiKey.scopes.split(",") : []

      if (!hasRequiredScopes(keyScopes, scopes)) {
        return new Response(`Missing required scopes: ${scopes.join(", ")}`, {
          status: 403,
        })
      }

      return handler(req, context)
    }
  }
}
