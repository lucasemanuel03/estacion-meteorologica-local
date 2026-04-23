import { randomBytes, createHmac } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

loadLocalEnvFile(".env.local")

function loadLocalEnvFile(filePath) {
  try {
    const maybeLoadEnvFile = process.loadEnvFile
    if (typeof maybeLoadEnvFile === "function") {
      maybeLoadEnvFile(filePath)
    }
  } catch {
    // Ignorar si Node no soporta process.loadEnvFile
  }
}

function getArg(name) {
  const prefix = `--${name}=`
  const value = process.argv.find((arg) => arg.startsWith(prefix))
  return value ? value.slice(prefix.length) : null
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function getRequiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined)

  if (!value) {
    throw new Error(`Missing environment variable: ${name}${fallbackName ? ` or ${fallbackName}` : ""}`)
  }

  return value
}

function getApiKeyPepper() {
  return getRequiredEnv("API_KEY_PEPPER")
}

function hashApiKey(apiKey) {
  return createHmac("sha256", getApiKeyPepper()).update(apiKey).digest("hex")
}

function generateApiKey() {
  return `wxr_${randomBytes(24).toString("base64url")}`
}

async function main() {
  const name = getArg("name")

  if (!name) {
    throw new Error('Usage: npm run api-key:create -- --name="ESP8266 Patio"')
  }

  const apiKey = getArg("key") || generateApiKey()
  const isActive = !hasFlag("inactive")
  const keyHash = hashApiKey(apiKey)
  const keyPrefix = apiKey.slice(0, 8)

  const supabaseUrl = getRequiredEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      is_active: isActive,
    })
    .select("id,name,key_prefix,is_active,created_at")
    .single()

  if (error) {
    throw error
  }

  console.log("API key creada correctamente.")
  console.log(`id: ${data.id}`)
  console.log(`name: ${data.name}`)
  console.log(`prefix: ${data.key_prefix}`)
  console.log(`is_active: ${data.is_active}`)
  console.log(`created_at: ${data.created_at}`)
  console.log("")
  console.log("Guarda esta API key ahora; no vuelve a mostrarse desde Supabase:")
  console.log(apiKey)
}

main().catch((error) => {
  console.error("No se pudo crear la API key.")
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
