'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                href="/admin/orders" 
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/admin/orders' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                Orders
              </Link>
              <Link 
                href="/admin/products" 
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/admin/products' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                Products
              </Link>
              <Link 
                href="/admin/shipping" 
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/admin/shipping' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                Shipping Rates
              </Link>
              <Link 
                href="/admin/discount-codes" 
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/admin/discount-codes' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                Discount Codes
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/profile" 
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/admin/profile' ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                Profile
              </Link>
              <Link href="/" className="inline-flex items-center px-4 py-2">
                Back to Shop
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 