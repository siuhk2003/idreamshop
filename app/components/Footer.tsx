import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/">
              <a>
                <Image
                  src="/logo1.jpg"
                  alt="iDream Logo"
                  width={160}
                  height={160}
                  className="mr-2"
                  priority
                />
              </a>
            </Link>
            <p className="text-gray-400 mb-2">Elevating your style with premium hair accessories.</p>
            <Link href="/login" className="text-gray-400 hover:text-white">Member Login</Link>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=new" className="text-gray-400 hover:text-white">New Arrivals</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">All Products</Link></li>
              <li><Link href="/products?category=clearance" className="text-gray-400 hover:text-white">Clearance</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <p className="text-gray-400">Follow us on social media for the latest updates and promotions.</p>
            {/* Add social media icons here */}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">&copy; 2023 BC Accessories. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 