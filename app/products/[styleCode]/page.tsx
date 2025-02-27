import { prisma } from '@/lib/prisma'
import { ProductDetails } from '@/components/ProductDetails'
import { notFound } from 'next/navigation'
import { Product } from '@/types/product'
import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ styleCode: string }>
  searchParams: Promise<{ sku?: string }>
}

// Generate metadata dynamically for product pages
export async function generateMetadata(
  { params }: { params: Promise<{ styleCode: string }> }
): Promise<Metadata> {
  // Await the params
  const { styleCode } = await params

  // Validate styleCode
  if (!styleCode || styleCode.includes('.')) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found'
    }
  }

  const product = await prisma.product.findFirst({
    where: { styleCode }
  })

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found'
    }
  }

  return {
    title: product.name,
    description: product.description || `View details for ${product.name}`,
    keywords: [
      product.name,
      product.category,
      product.producttype || '',
      "fashion accessories",
      "earrings",
      "necklaces",
      "bracelets",
      "hair clips"
    ].filter((keyword): keyword is string => typeof keyword === 'string' && keyword !== '')
  }
}

export default async function ProductPage(props: PageProps) {
  // Await both params and searchParams
  const { styleCode } = await props.params
  const { sku } = await props.searchParams

  // Validate styleCode
  if (!styleCode || styleCode.includes('.')) {
    notFound()
  }

  try {
    // First get all products with this styleCode
    const products = await prisma.product.findMany({
      where: { styleCode },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        wholesalePrice: true,
        imageUrl: true,
        category: true,
        stock: true,
        color: true,
        material: true,
        styleCode: true,
        sku: true,
        mancode: true,
        productcost: true,
        productcharges: true,
        remarks: true,
        additionalImages: true,
        createdAt: true,
        updatedAt: true,
        exchangeRate: true,
        version: true
      },
      orderBy: {
        color: 'asc'
      }
    }) as Product[]

    if (!products.length) {
      notFound()
    }

    // If SKU is provided, find that specific product as main
    let mainProduct: Product
    if (sku) {
      const skuProduct = products.find(p => p.sku === sku)
      mainProduct = skuProduct || products[0]
    } else {
      mainProduct = products[0]
    }

    // Get variants excluding the main product
    const variants = products.filter(p => p.id !== mainProduct.id)

    return (
      <Suspense fallback={
        <>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </main>
          <Footer />
        </>
      }>
        <>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <ProductDetails product={mainProduct} variants={variants} />
          </main>
          <Footer />
        </>
      </Suspense>
    )
  } catch (error) {
    console.error('Error in ProductPage:', error)
    notFound()
  }
} 