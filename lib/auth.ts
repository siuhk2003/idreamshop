const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-default-secret-key'

export function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET_KEY)
} 