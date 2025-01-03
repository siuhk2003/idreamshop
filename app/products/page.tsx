'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Dynamically import components that use browser APIs with no SSR
const FilterSidebar = dynamic(
  () => import('./filter-sidebar').then(mod => mod.FilterSidebar)
)
const ProductsSearchHandler = dynamic(
  () => import('./products-search-handler').then(mod => mod.default)
)

// Handle loading state
const LoadingFallback = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <div className="w-64">Loading filters...</div>
        <div className="flex-1">
          <div className="flex justify-center items-center h-64">
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
)

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <FilterSidebar />
          <div className="flex-1">
            <ProductsSearchHandler />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


