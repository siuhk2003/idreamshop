'use client'

import React, { Suspense } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types/product'

interface ProductsListProps {
  products: Product[]
}

function ProductsListContent({ products }: ProductsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
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

export const ProductsList: React.FC<ProductsListProps> = ({ products }) => {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="bg-gray-100 animate-pulse rounded-lg h-64"
          />
        ))}
      </div>
    }>
      <ProductsListContent products={products} />
    </Suspense>
  )
} 