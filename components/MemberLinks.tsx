'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function MemberLinks() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/member/profile')
        setIsLoggedIn(response.ok)
      } catch (error) {
        setIsLoggedIn(false)
      }
    }

    checkLoginStatus()
  }, [refreshTrigger])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/member/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setIsLoggedIn(false)
        setRefreshTrigger(prev => prev + 1)
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoggedIn) {
    return (
      <ul className="space-y-2">
        <li><Link href="/profile" className="text-gray-400 hover:text-white">My Profile</Link></li>
        <li><Link href="/orders/history" className="text-gray-400 hover:text-white">Order History</Link></li>
        <li>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </li>
      </ul>
    )
  }

  return (
    <ul className="space-y-2">
      <li><Link href="/login" className="text-gray-400 hover:text-white">Member Login</Link></li>
      <li><Link href="/register" className="text-gray-400 hover:text-white">Register</Link></li>
      <li><Link href="/profile" className="text-gray-400 hover:text-white">My Profile</Link></li>
      <li><Link href="/orders/history" className="text-gray-400 hover:text-white">Order History</Link></li>
    </ul>
  )
} 