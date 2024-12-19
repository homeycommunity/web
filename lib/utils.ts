import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function obfuscateApiKey(apiKey: string): string {
  if (!apiKey) return "<api_key>"
  if (apiKey.length < 8) return apiKey
  const firstFour = apiKey.slice(0, 4)
  const lastFour = apiKey.slice(-4)
  return `${firstFour}${"*".repeat(apiKey.length - 8)}${lastFour}`
}
