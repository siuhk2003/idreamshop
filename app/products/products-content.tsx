'use client'

import { ProductCard } from '@/components/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  imageUrl: string
  category: string
  stock: number
}

interface ProductsContentProps {
  products: Product[]
}

export function ProductsContent({ products }: ProductsContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </div>
  )
} 