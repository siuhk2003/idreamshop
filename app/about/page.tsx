import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">About BC Accessories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <Image
                src="/placeholder.svg?height=400&width=600&text=Our+Team"
                alt="Our Team"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                At BC Accessories, our mission is to empower individuals to express their unique style through high-quality,
                locally-crafted hair accessories. We believe that the right accessory can elevate any outfit and boost confidence,
                allowing our customers to shine in their everyday lives.
              </p>
              <p className="text-gray-600">
                As a proud British Columbia-based business, we are committed to supporting local artisans and promoting
                sustainable fashion practices that respect our beautiful environment.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-4">Our Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Quality Craftsmanship</h4>
                  <p className="text-gray-600">Deliver exceptional, handcrafted accessories that stand the test of time.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Community Support</h4>
                  <p className="text-gray-600">Foster growth in the local artisan community and contribute to BC's economy.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Sustainable Practices</h4>
                  <p className="text-gray-600">Minimize our environmental impact through eco-friendly materials and processes.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-600 mb-4">
                  Founded in 2015 by Jane Doe, BC Accessories began as a small passion project in a cozy Vancouver apartment.
                  Inspired by the natural beauty of British Columbia and the vibrant local fashion scene, Jane set out to create
                  hair accessories that were both stylish and meaningful.
                </p>
                <p className="text-gray-600">
                  Today, BC Accessories has grown into a thriving business, collaborating with talented local artisans and
                  serving customers across the province and beyond. We remain committed to our roots, focusing on quality,
                  creativity, and community in everything we do.
                </p>
              </div>
              <div>
                <Image
                  src="/placeholder.svg?height=400&width=600&text=Our+Workshop"
                  alt="Our Workshop"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Acknowledgments</h3>
            <p className="text-gray-600 mb-4">
              We would like to express our heartfelt gratitude to our amazing customers, dedicated team members, and the
              talented artisans who bring our vision to life. Your support and creativity drive us forward every day.
            </p>
            <p className="text-gray-600">
              We also acknowledge that our business operates on the traditional, ancestral, and unceded territories of the
              Coast Salish peoples. We are committed to supporting Indigenous communities and fostering reconciliation
              through our business practices and community engagement.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

