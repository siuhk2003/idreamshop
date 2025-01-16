import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductDetails } from '@/components/ProductDetails'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Product } from '@/types/product'

interface PageProps {
  params: Promise<{
    styleCode: string
  }> | {
    styleCode: string
  }
}

export default async function ProductPage({ params }: PageProps) {
  try {
    const resolvedParams = await params
    const products = await prisma.product.findMany({
      where: { 
        styleCode: decodeURIComponent(resolvedParams.styleCode)
      }
    }) as Product[]

    if (!products || products.length === 0) {
      notFound()
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <ProductDetails products={products} />
          </div>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Error loading product:', error)
    notFound()
  }
} 