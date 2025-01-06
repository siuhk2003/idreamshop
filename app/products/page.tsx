'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const FilterSidebar = dynamic(
  () => import('./filter-sidebar').then(mod => mod.FilterSidebar),
  { ssr: false }
)
const ProductsSearchHandler = dynamic(
  () => import('./products-search-handler').then(mod => mod.default),
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


