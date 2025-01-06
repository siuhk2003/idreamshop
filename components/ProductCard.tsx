'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { Product } from '@/types/product'

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  imageUrl: string
  isClearance?: boolean
  stock?: number
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  originalPrice, 
  imageUrl, 
  isClearance, 
  stock = 0 
}: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    if (stock > 0) {
      addToCart({ id, name, price, imageUrl, stock } as Product)
    }
  }

  return (
    <Link href={`/products/${id}`}>
      <Card className="bg-white transition-transform hover:scale-105">
        <CardContent className="p-4">
          <Image
            src={imageUrl}
            alt={name}
            width={400}
            height={400}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {isClearance && originalPrice ? (
            <>
              <p className="text-gray-600 line-through">${originalPrice.toFixed(2)}</p>
              <p className="text-red-600 font-bold">${price.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-gray-600">${price.toFixed(2)}</p>
          )}
          <Button 
            className="w-full mt-4 bg-blue-500 text-white hover:bg-blue-600"
            disabled={stock === 0}
            onClick={handleAddToCart}
          >
            {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}