import { createHmac } from "node:crypto"

function getApiKeyPepper(): string {
  const pepper = process.env.API_KEY_PEPPER

  if (!pepper) {
    throw new Error("Missing API_KEY_PEPPER environment variable")
  }

  return pepper
}

export function hashApiKey(apiKey: string): string {
  return createHmac("sha256", getApiKeyPepper()).update(apiKey).digest("hex")
}
