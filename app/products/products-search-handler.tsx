'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Product } from '@prisma/client'
import { ProductCard } from '@/components/ProductCard'

export default function ProductsSearchHandler() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/products?category=${category}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products')
        }

        if (!data.products) {
          throw new Error('No products data received')
        }

        setProducts(data.products)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category])

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId)
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
        credentials: 'include'
      })

      if (response.ok) {
        console.log('Product added to cart')
      } else {
        const error = await response.json()
        console.error('Failed to add to cart:', error.error)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice}
          imageUrl={product.imageUrl}
          isClearance={product.category === 'clearance'}
          stock={product.stock}
        />
      ))}
    </div>
  )
} 