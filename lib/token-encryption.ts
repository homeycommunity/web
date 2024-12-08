import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

class TokenEncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TokenEncryptionError"
  }
}

function getEnvironmentKey(): string {
  const envKey = process.env.ENCRYPTION_SECRET
  if (!envKey) {
    throw new TokenEncryptionError(
      "ENCRYPTION_SECRET environment variable is not set"
    )
  }
  return envKey
}

function combineKeys(userKey: string, envKey: string): Buffer {
  // Create a deterministic combination of the two keys
  const combined = userKey + envKey
  return Buffer.from(combined.slice(0, 64), "hex")
}

/**
 * Generates a secure random encryption key
 * @returns A 32-byte (64 character) hex string
 */
export function generateEncryptionKey(): string {
  return randomBytes(16).toString("hex")
}

/**
 * Encrypts a token using AES-256-GCM with combined user and environment keys
 * @param token - The token to encrypt
 * @param userKey - A 32-byte hex string encryption key
 * @returns Encrypted token string in format 'iv:encrypted:authTag'
 * @throws {TokenEncryptionError} If encryption fails or key is invalid
 */
export function encryptToken(token: string, userKey: string): string {
  try {
    if (!token || !userKey) {
      throw new Error("Token and encryption key are required")
    }

    if (userKey.length !== 64) {
      throw new Error("Invalid encryption key length")
    }

    const envKey = getEnvironmentKey()
    const key = combineKeys(userKey, envKey)
    const iv = randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(token, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`
  } catch (error) {
    throw new TokenEncryptionError(
      `Failed to encrypt token: ${(error as Error).message}`
    )
  }
}

/**
 * Decrypts an encrypted token using combined user and environment keys
 * @param encryptedData - The encrypted token string in format 'iv:encrypted:authTag'
 * @param userKey - The 32-byte hex string encryption key used for encryption
 * @returns The decrypted token string
 * @throws {TokenEncryptionError} If decryption fails or inputs are invalid
 */
export function decryptToken(encryptedData: string, userKey: string): string {
  try {
    if (!encryptedData || !userKey) {
      throw new Error("Encrypted data and encryption key are required")
    }

    if (userKey.length !== 64) {
      throw new Error("Invalid encryption key length")
    }

    const [ivHex, encrypted, authTagHex] = encryptedData.split(":")

    if (!ivHex || !encrypted || !authTagHex) {
      throw new Error("Invalid encrypted data format")
    }

    const envKey = getEnvironmentKey()
    const key = combineKeys(userKey, envKey)
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    throw new TokenEncryptionError(
      `Failed to decrypt token: ${(error as Error).message}`
    )
  }
}
