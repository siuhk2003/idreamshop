import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductDetails } from '@/components/ProductDetails'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Product } from '@/types/product'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id

  if (!id) {
    notFound()
  }

  const product = await prisma.product.findUnique({
    where: { id }
  }) as Product | null

  if (!product) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ProductDetails product={product} />
        </div>
      </main>
      <Footer />
    </div>
  )
} 