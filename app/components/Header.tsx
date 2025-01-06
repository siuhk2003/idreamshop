import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { User } from 'lucide-react'
import { Cart } from '@/components/Cart'

type HeaderProps = {
  variant?: 'default' | 'home'
}

export function Header({ variant = 'default' }: HeaderProps) {
  return (
    <header className={`${variant === 'home' ? 'bg-transparent' : 'bg-gray-900'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo1.jpg"
              alt="iDream Logo"
              width={160}
              height={160}
              className="mr-2"
              priority
            />
            <span className="text-lg font-semibold">iDream</span>
          </Link>

          <div className="flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link 
                    href="/products?category=new" 
                    className="hover:text-gray-300"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products" 
                    className="hover:text-gray-300"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/products?category=clearance" 
                    className="hover:text-gray-300"
                  >
                    Clearance
                  </Link>
                </li>
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
              </ul>
            </nav>
            <Link href="/login" passHref>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Member Area</span>
              </Button>
            </Link>
            <Cart />
          </div>
        </div>
      </div>
    </header>
  )
}