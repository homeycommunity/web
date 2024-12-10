import { ApiScope } from "config/api-scopes"
import { z } from "zod"

export interface ApiKey {
  id: string
  name: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  scopes?: ApiScope[] | null
}

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scopes: z.array(z.string()).min(1, "At least one scope is required"),
  noExpiry: z.boolean(),
  expiresAt: z.date().nullable(),
  expiryPreset: z.string(),
})

export type FormValues = z.infer<typeof formSchema>
