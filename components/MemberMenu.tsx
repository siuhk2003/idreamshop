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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Add a small delay to prevent flash of wrong content
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return null

  return (
    <div className="relative">
      {memberName ? (
        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-700">Welcome, {memberName}</span>
        </Button>
      ) : (
        <Link href="/login">
          <Button variant="ghost" className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Login</span>
          </Button>
        </Link>
      )}

      {isOpen && memberName && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </Link>
          <Link 
            href="/orders" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Orders
          </Link>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
} 