'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FilterSidebar } from './filter-sidebar'

// Config object for dynamic rendering
const config = {
  dynamic: 'force-dynamic',
  revalidate: 0
} as const

// Dynamically import with no SSR
const ProductsSearchHandler = dynamic(
  () => import('./products-search-handler'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <p>Loading products...</p>
      </div>
    )
  }
)

function ProductsContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <FilterSidebar />
          <div className="flex-1">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <p>Loading products...</p>
              </div>
            }>
              <ProductsSearchHandler />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <FilterSidebar />
            <div className="flex-1">
              <div className="flex justify-center items-center h-64">
                <p>Loading products...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}


