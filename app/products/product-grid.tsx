'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Product {
  id: string
  styleCode: string
  sku: string
  name: string
  price: number
  originalPrice: number | null
  category: string
  imageUrl: string
  color: string
  stock: number
}

const ITEMS_PER_PAGE = 8

export function ProductGrid() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [state, setState] = useState({
    currentPage: 1,
    products: [] as Product[],
    loading: true
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setState(prev => ({ ...prev, loading: true }))
      try {
        const response = await fetch(`/api/products?category=${category}`)
        const data = await response.json()
        
        if (data.success) {
          setState({
            currentPage: 1,
            products: data.products,
            loading: false
          })
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    fetchProducts()
  }, [category])

  if (state.loading) {
    return <div>Loading...</div>
  }

  const filteredProducts = state.products.filter(product => 
    !showInStockOnly || product.stock > 0
  )

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (state.currentPage - 1) * ITEMS_PER_PAGE,
    state.currentPage * ITEMS_PER_PAGE
  )

  const changePage = (newPage: number) => {
    setState(prev => ({ ...prev, currentPage: newPage }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <Switch
            id="stock-filter"
            checked={showInStockOnly}
            onCheckedChange={setShowInStockOnly}
            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
          />
          <Label htmlFor="stock-filter" className="text-gray-700 font-medium">
            Show In Stock Only
          </Label>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredProducts.length} products
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              styleCode={product.styleCode}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              color={product.color}
              isClearance={product.category === 'clearance'}
              stock={product.stock}
              originalPrice={product.originalPrice}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => changePage(Math.max(1, state.currentPage - 1))}
              disabled={state.currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center">
              Page {state.currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => changePage(Math.min(totalPages, state.currentPage + 1))}
              disabled={state.currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

