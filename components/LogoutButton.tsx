'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Redirect to home page after successful logout
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      Logout
    </Button>
  )
} 