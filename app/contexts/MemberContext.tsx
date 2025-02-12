'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface MemberContextType {
  member: Member | null
  isLoading: boolean
  login: (data: Member) => void
  logout: () => Promise<void>
}

const MemberContext = createContext<MemberContextType | undefined>(undefined)

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/member/session')
        if (response.ok) {
          const data = await response.json()
          if (data.member) {
            setMember(data.member)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = (data: Member) => {
    setMember(data)
    setIsLoading(false)
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/member/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setMember(null)
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <MemberContext.Provider value={{ member, isLoading, login, logout }}>
      {children}
    </MemberContext.Provider>
  )
}

export function useMember() {
  const context = useContext(MemberContext)
  if (!context) {
    throw new Error('useMember must be used within MemberProvider')
  }
  return context
} 