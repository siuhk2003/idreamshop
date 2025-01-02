'use client'

import React from 'react'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types/product'

interface ProductsListProps {
  products: Product[]
}

export const ProductsList: React.FC<ProductsListProps> = ({ products }) => {
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