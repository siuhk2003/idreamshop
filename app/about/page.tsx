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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">About idream</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <Image
                src="/TFN.jpg"
                alt="Our Community"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                At iDream, our mission is to inspire confidence and individuality by offering high-quality, stylish
                accessories to our local community. We believe that every accessory tells a story, and the right piece
                can transform an outfit, uplift a mood, and empower self-expression.
              </p>
              <p className="text-gray-600">
                As a proud British Columbia-based brand, we are dedicated to supporting local artisans and
                promoting sustainable fashion practices. With a commitment to quality and care for our
                environment, we aim to bring joy, beauty, and a touch of elegance to everyday life through our
                thoughtfully crafted collections.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-4">Our Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Quality Craftsmanship</h4>
                  <p className="text-gray-600">Deliver exceptional, thoughtfully designed accessories that stand the test of time.</p>
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
                  At iDream, our journey began as immigrants from Hong Kong, bringing with us a rich heritage of
                  experience in fashion and accessories. Having recently made British Columbia our new home, we are
                  inspired by the vibrant local community and its appreciation for individuality and style.
                </p>
                <p className="text-gray-600 mb-4">
                  With years of expertise in curating and designing beautiful accessories, we are excited to share our
                  passion with our new neighbors. Our goal is to contribute to the community by offering thoughtfully
                  selected pieces that enhance everyday moments and celebrate personal expression.
                </p>
                <p className="text-gray-600">
                  We hope our creations bring a little joy, confidence, and elegance into your life—because at iDream,
                  selected pieces that enhance everyday moments and celebrate personal expression.
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/story.webp"
                  alt="Our story"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover"
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

