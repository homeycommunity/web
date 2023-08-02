import * as z from "zod";
// regex validate identifier (hostname) with dots
// like "com.example.app" or "com.example.app.test"
const identifierRegex = /^([a-z0-9])([a-z0-9-]+\.)*[a-z0-9-]+$/

export const controlAppsNewSchema = z.object({
  name: z.string().min(2, {
    message: "App name must be at least 2 characters.",
  }),
  identifier: z.string().regex(identifierRegex, {
    message: "Identifier must be a valid reversed hostname.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
})
