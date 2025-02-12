import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  member?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'member_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
} 