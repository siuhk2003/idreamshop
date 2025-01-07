import { jwtVerify, SignJWT } from 'jose'

if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is not set')
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

export function getJwtSecretKey() {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not set')
  }
  return new TextEncoder().encode(process.env.JWT_SECRET_KEY)
}

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret)
    
    if (!verified.payload || !verified.payload.email) {
      throw new Error('Invalid token payload')
    }
    
    return verified.payload
  } catch (err) {
    throw new Error('Invalid token')
  }
}

export async function signAuth(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export { secret } 