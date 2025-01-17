import { create } from 'zustand'

interface MemberState {
  name: string | null
  setName: (name: string | null) => void
}

export const useMemberStore = create<MemberState>((set) => ({
  name: null,
  setName: (name) => set({ name })
}))

export function useMember() {
  const { name, setName } = useMemberStore()

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/member/profile', {
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok && data.firstName) {
        setName(data.firstName)
      } else {
        setName(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setName(null)
    }
  }

  return { name, fetchProfile, setName }
} 