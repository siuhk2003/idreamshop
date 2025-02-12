'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface MemberMenuProps {
  memberName: string | null;
  onLogout: () => Promise<void>;
}

export function MemberMenu({ memberName, onLogout }: MemberMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on server-side
  if (!mounted) {
    return (
      <div className="w-[120px] flex items-center justify-center">
        <User className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="relative">
      {memberName ? (
        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <User className="h-5 w-5" />
          <span>{memberName}</span>
        </Button>
      ) : (
        <Button variant="ghost" asChild>
          <Link href="/login" className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Login</span>
          </Link>
        </Button>
      )}

      {isOpen && memberName && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link 
            href="/orders" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Orders
          </Link>
          <button
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
} 