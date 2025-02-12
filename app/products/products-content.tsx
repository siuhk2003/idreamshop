'use client'

import { Suspense, useMemo, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ProductGrid } from './product-grid'

const FilterSidebar = dynamic(
  () => import('./filter-sidebar').then(mod => mod.FilterSidebar),
  { ssr: false }
)

export function ProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [types, setTypes] = useState<string[]>([])

  useEffect(() => {
    const fetchTypes = async () => {
      if (types.length > 0) return
      try {
        const response = await fetch('/api/products/types')
        if (response.ok) {
          const data = await response.json()
          setTypes(data.types)
        }
      } catch (error) {
        console.error('Failed to fetch types:', error)
      }
    }

    fetchTypes()
  }, [types.length])

  const fetchProducts = useMemo(() => {
    return async () => {
      const queryString = new URLSearchParams({
        category: selectedCategory || 'all',
        type: selectedType || 'all'
      }).toString()

      const response = await fetch(`/api/products?${queryString}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
      setIsLoading(false)
    }
  }, [selectedCategory, selectedType])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Suspense fallback={<div className="w-full lg:w-64">Loading filters...</div>}>
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