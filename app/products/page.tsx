'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductGrid } from './product-grid'

const FilterSidebar = dynamic(
  () => import('./filter-sidebar').then(mod => mod.FilterSidebar),
  { ssr: false }
)

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <Suspense fallback={<div className="w-64">Loading filters...</div>}>
            <FilterSidebar />
          </Suspense>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-8">Our Products</h1>
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductGrid />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


