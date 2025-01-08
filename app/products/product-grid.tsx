'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  imageUrl: string
  category: string
  stock: number
}

const ITEMS_PER_PAGE = 8

export function ProductGrid() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [state, setState] = useState({
    currentPage: 1,
    products: [] as Product[],
    loading: true
  })

  useEffect(() => {
    console.log('Effect triggered, category:', category)
    const fetchProducts = async () => {
      setState(prev => ({ ...prev, loading: true }))
      try {
        console.log('Fetching products...')
        const response = await fetch(`/api/products?category=${category}`)
        const data = await response.json()
        console.log('Received data:', data)
        
        if (data.success) {
          setState({
            currentPage: 1,
            products: data.products,
            loading: false
          })
          console.log('State updated with products:', data.products.length)
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

  useEffect(() => {
    console.log('State changed:', {
      currentPage: state.currentPage,
      productsCount: state.products.length,
      loading: state.loading
    })
  }, [state])

  if (state.loading) {
    return <div>Loading...</div>
  }

  const totalPages = Math.ceil(state.products.length / ITEMS_PER_PAGE)
  const paginatedProducts = state.products.slice(
    (state.currentPage - 1) * ITEMS_PER_PAGE,
    state.currentPage * ITEMS_PER_PAGE
  )

  const changePage = (newPage: number) => {
    setState(prev => ({ ...prev, currentPage: newPage }))
  }

  console.log('Pagination Info:', {
    totalProducts: state.products.length,
    currentPage: state.currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    paginatedProductsCount: paginatedProducts.length,
    sliceStart: (state.currentPage - 1) * ITEMS_PER_PAGE,
    sliceEnd: state.currentPage * ITEMS_PER_PAGE
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {paginatedProducts.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id}>
            <Card className="transition-transform hover:scale-105">
              <CardContent className="p-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-[200px] object-cover rounded-t-lg"
                />
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${product.category === 'clearance' ? 'text-red-600' : 'text-gray-900'}`}>
                    ${product.price.toFixed(2)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                  )}
                </div>
                <Button 
                  className="w-full mt-4 bg-blue-500 text-white hover:bg-blue-600"
                  disabled={product.stock === 0}
                  onClick={(e) => e.preventDefault()}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          </Link>
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
  )
}

