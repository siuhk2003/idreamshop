import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, User, Instagram, Facebook } from 'lucide-react'
import { Cart } from '@/components/Cart'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Footer } from '@/components/Footer'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types/product'
import { Header } from '@/components/Header'

// Make the component async
export default async function Home() {
  // Fetch products from database
  const newArrivals = await prisma.product.findMany({
    where: { category: 'new' },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  const featuredProducts = await prisma.product.findMany({
    where: { category: 'regular' },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  const clearanceProducts = await prisma.product.findMany({
    where: { category: 'clearance' },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Elevate Your Style with Premium Accessories
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Discover our collection of high-quality hair accessories, perfect for any occasion.
            </p>
            <div className="mt-10">
              <Link href="/products">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* New Arrivals Section */}
          <section id="new" className="mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  stock={product.stock}
                />
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section id="products" className="mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  stock={product.stock}
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  View All Products
                </Button>
              </Link>
            </div>
          </section>

          {/* Clearance Section */}
          <section id="clearance">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Clearance Sale</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {clearanceProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  imageUrl={product.imageUrl}
                  isClearance={true}
                  stock={product.stock}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Benefits Section */}
        <section className="bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-gray-600">Our accessories are made with the finest materials for lasting beauty.</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Local BC Business</h3>
                <p className="text-gray-600">Support your local community by shopping with us.</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Unique Designs</h3>
                <p className="text-gray-600">Stand out with our exclusive and trendy accessories.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"I love the quality of these hair accessories! They're perfect for both casual and formal occasions."</p>
                <p className="font-semibold">- Sarah from Vancouver</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"The customer service is amazing, and the products are even better. Highly recommend!"</p>
                <p className="font-semibold">- Emily from Victoria</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Ready to Elevate Your Style?</h2>
            <p className="text-xl mb-8">Join our community of satisfied customers and discover the perfect accessories for you.</p>
            <Link href="/products">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

