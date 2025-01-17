import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook } from 'lucide-react'
import { MemberLinks } from './MemberLinks'

export function Footer() {
  return (
    <footer className="bg-sky-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo1.jpg"
                alt="iDream Logo"
                width={160}
                height={160}
                className="mr-2"
                priority
              />
            </Link>
            <p className="text-gray-600 mb-2">Elevating your style with premium accessories.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Member Area</h3>
            <MemberLinks />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=new" className="text-gray-600 hover:text-gray-800">New Arrivals</Link></li>
              <li><Link href="/products" className="text-gray-600 hover:text-gray-800">All Products</Link></li>
              <li><Link href="/products?category=clearance" className="text-gray-600 hover:text-gray-800">Clearance</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-800">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-800">Contact</Link></li>
              <li><Link href="/refund-policy" className="text-gray-600 hover:text-gray-800">Refund and Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <p className="text-gray-600 mb-4">Follow us on social media for the latest updates and promotions.</p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com" className="text-gray-600 hover:text-gray-800">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="https://www.facebook.com" className="text-gray-600 hover:text-gray-800">
                <Facebook className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-sky-100 text-center">
          <p className="text-gray-600">&copy; 2025 iDream Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 