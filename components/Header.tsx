'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Cart } from '@/components/Cart'
import { MemberMenu } from '@/components/MemberMenu'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMember } from '@/app/contexts/MemberContext'
import { Menu, X } from 'lucide-react'

type HeaderProps = {
  variant?: 'default' | 'home'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const router = useRouter()
  const { member, logout } = useMember()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className={`${
      variant === 'home' ? 'bg-transparent' : 'bg-sky-50'
    } text-gray-800 shadow-sm sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo1.jpg"
              alt="iDream Logo"
              width={120}
              height={120}
              className="mr-2"
              priority
            />
          </Link>

          <div className="flex items-center gap-4 sm:hidden">
            <Cart />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link 
                    href="/products?category=new" 
                    className="relative font-medium text-gray-700 hover:text-gray-900 py-2
                      after:absolute after:left-0 after:bottom-0 after:h-0.5 
                      after:w-full after:bg-blue-500 after:scale-x-0 
                      after:transition-transform after:duration-300
                      hover:after:scale-x-100"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products" 
                    className="relative font-medium text-gray-700 hover:text-gray-900 py-2
                      after:absolute after:left-0 after:bottom-0 after:h-0.5 
                      after:w-full after:bg-blue-500 after:scale-x-0 
                      after:transition-transform after:duration-300
                      hover:after:scale-x-100"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=clearance" 
                    className="relative font-medium text-gray-700 hover:text-gray-900 py-2
                      after:absolute after:left-0 after:bottom-0 after:h-0.5 
                      after:w-full after:bg-red-500 after:scale-x-0 
                      after:transition-transform after:duration-300
                      hover:after:scale-x-100"
                  >
                    Clearance
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="relative font-medium text-gray-700 hover:text-gray-900 py-2
                      after:absolute after:left-0 after:bottom-0 after:h-0.5 
                      after:w-full after:bg-blue-500 after:scale-x-0 
                      after:transition-transform after:duration-300
                      hover:after:scale-x-100"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="relative font-medium text-gray-700 hover:text-gray-900 py-2
                      after:absolute after:left-0 after:bottom-0 after:h-0.5 
                      after:w-full after:bg-blue-500 after:scale-x-0 
                      after:transition-transform after:duration-300
                      hover:after:scale-x-100"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="flex items-center space-x-4">
              <MemberMenu 
                memberName={member?.firstName || null} 
                onLogout={logout}
              />
              <Cart />
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden">
            <nav className="pt-4 pb-3 border-t border-gray-200 mt-4">
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/products?category=new"
                    className="block px-2 py-1 text-base font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products"
                    className="block px-2 py-1 text-base font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=clearance"
                    className="block px-2 py-1 text-base font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Clearance
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about"
                    className="block px-2 py-1 text-base font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact"
                    className="block px-2 py-1 text-base font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <MemberMenu 
                  memberName={member?.firstName || null} 
                  onLogout={logout}
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 