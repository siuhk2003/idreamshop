'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { Product } from '@/types/product'

interface ProductCardProps extends Partial<Product> {
  isClearance?: boolean
  styleCode: string
  name: string
  price: number
  imageUrl: string
  color: string
}

export function ProductCard({ 
  styleCode,
  name, 
  price, 
  originalPrice,
  imageUrl,
  color,
  isClearance 
}: ProductCardProps) {
  return (
    <Link href={`/products/${encodeURIComponent(styleCode)}`}>
      <Card className="bg-white transition-transform hover:scale-105">
        <CardContent className="p-4">
          <Image
            src={imageUrl}
            alt={name}
            width={400}
            height={400}
            className="w-full h-[300px] object-cover rounded-t-lg"
            priority
          />
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">Color: {color}</p>

          {/* Price Display */}
          {isClearance && originalPrice ? (
            <>
              <p className="text-gray-600 line-through">${originalPrice.toFixed(2)}</p>
              <p className="text-red-600 font-bold">${price.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-gray-600">${price.toFixed(2)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}