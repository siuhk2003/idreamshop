import Link from 'next/link'
import Image from 'next/image'
import { Instagram as InstagramIcon, Facebook as FacebookIcon } from 'lucide-react'
import { MemberLinks } from './MemberLinks'

export function Footer() {
  return (
    <footer className="bg-sky-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-block">
              <Image
                src="/logo1.jpg"
                alt="iDream Logo"
                width={120}
                height={120}
                className="mx-auto md:mx-0"
                priority
              />
            </Link>
            <p className="text-gray-600 mt-2">
              Elevating your style with premium accessories.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Member Area</h3>
            <MemberLinks />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=new" className="text-gray-600 hover:text-gray-800">
                  New Arrivals
                </Link>
              </li>
              <li><Link href="/products" className="text-gray-600 hover:text-gray-800">All Products</Link></li>
              <li><Link href="/products?category=clearance" className="text-gray-600 hover:text-gray-800">Clearance</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-800">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-800">Contact</Link></li>
              <li><Link href="/refund-policy" className="text-gray-600 hover:text-gray-800">Refund and Return Policy</Link></li>
              <li><Link href="/order-lookup" className="text-gray-600 hover:text-gray-800">Order Lookup</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <p className="text-gray-600 mb-4">
              Follow us on social media for the latest updates and promotions.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link 
                href="https://www.instagram.com/idreamshop.ca/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-gray-800"
              >
                <InstagramIcon className="w-6 h-6" />
              </Link>
              <Link 
                href="https://www.facebook.com/irischeng926" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-gray-800"
              >
                <FacebookIcon className="w-6 h-6" />
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