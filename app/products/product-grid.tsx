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

export function ProductGrid() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [visibleItems, setVisibleItems] = useState(9)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products?category=${category}`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [category])

  const showMore = () => {
    setVisibleItems(prevVisible => Math.min(prevVisible + 9, products.length))
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.slice(0, visibleItems).map((product) => (
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
      {visibleItems < products.length && (
        <div className="mt-12 text-center">
          <Button onClick={showMore} variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

