import { prisma } from '@/lib/prisma'
import { ProductDetails } from '@/components/ProductDetails'
import { notFound } from 'next/navigation'
import { Product } from '@/types/product'
import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface PageProps {
  params: Promise<{ styleCode: string }> | { styleCode: string }
  searchParams: Promise<{ sku?: string }> | { sku?: string }
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const { styleCode } = resolvedParams
  const { sku } = resolvedSearchParams || {}

  if (!styleCode) {
    console.log('No styleCode provided')
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
      console.log('No products found for styleCode:', styleCode)
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

    console.log('Main product:', mainProduct)
    console.log('Variants:', variants)

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
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Error Loading Product</h1>
            <p className="text-gray-600">Sorry, there was a problem loading this product.</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }
} 