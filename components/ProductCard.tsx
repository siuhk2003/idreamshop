'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { Product } from '@/types/product'
import { getCloudinaryUrl } from '@/lib/utils'

interface ProductCardProps extends Partial<Product> {
  isClearance?: boolean
  styleCode: string
  name: string
  price: number
  imageUrl: string
  color: string
}

const cloudinaryLoader = ({ src, width, quality }: any) => {
  return getCloudinaryUrl(src)
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
    <Card className="overflow-hidden">
      <Link href={`/products/${styleCode}`}>
        <div className="relative aspect-square">
          <Image
            loader={cloudinaryLoader}
            src={imageUrl}
            alt={name || 'Product image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
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
      </Link>
    </Card>
  )
}