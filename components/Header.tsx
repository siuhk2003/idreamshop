import Link from 'next/link'
import Image from 'next/image'
import { Cart } from '@/components/Cart'
import { MemberMenu } from '@/components/MemberMenu'

type HeaderProps = {
  variant?: 'default' | 'home'
}

export function Header({ variant = 'default' }: HeaderProps) {
  return (
    <header className={`${variant === 'home' ? 'bg-transparent' : 'bg-gray-800'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/i.png"
              alt="iDream Logo"
              width={40}
              height={40}
              className="mr-2"
              priority
            />
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
                <li>
                  <Link href="/about" className="hover:text-gray-300">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <MemberMenu />
            <Cart />
          </div>
        </div>
      </div>
    </header>
  )
} 