'use client'

import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/types/product'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={600}
          height={600}
          className="w-full h-[500px] object-contain rounded-lg"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Details</h2>
          <ul className="space-y-2 text-gray-600">
            <li><span className="font-medium">Color:</span> {product.color}</li>
            <li><span className="font-medium">Material:</span> {product.material}</li>
            <li><span className="font-medium">Availability:</span> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</li>
          </ul>
        </div>
        <div className="mb-8">
          {product.category === 'clearance' && product.originalPrice ? (
            <>
              <p className="text-gray-600 line-through">${product.originalPrice.toFixed(2)}</p>
              <p className="text-2xl font-bold text-red-600">${product.price.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
          )}
        </div>
        <Button 
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  )
} 