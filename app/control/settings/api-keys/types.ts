import { z } from "zod"

import { ApiScope } from "@/config/api-scopes"

export interface ApiKey {
  id: string
  name: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  scopes?: ApiScope[] | null
}

const apiScopeSchema = z.enum([
  "read:apps",
  "write:apps",
  "read:versions",
  "write:versions",
  "homey:apps",
  "homey:devices",
  "homey:flows",
]) satisfies z.ZodType<ApiScope>

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scopes: z.array(apiScopeSchema).min(1, "At least one scope is required"),
  noExpiry: z.boolean(),
  expiresAt: z.date().nullable(),
  expiryPreset: z.string(),
})

export type FormValues = z.infer<typeof formSchema>
