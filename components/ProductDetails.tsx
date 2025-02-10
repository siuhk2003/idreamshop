'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/types/product'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getCloudinaryUrl } from '@/lib/utils'

interface ProductDetailsProps {
  product: Product
  variants: Product[]
}

export function ProductDetails({ product, variants = [] }: ProductDetailsProps) {
  if (!product) {
    return <div>Loading...</div>
  }

  const { addToCart } = useCart()
  const [selectedColor, setSelectedColor] = useState(product.color)
  const [quantity, setQuantity] = useState(1)
  const [currentProduct, setCurrentProduct] = useState<Product>(product)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const variantProduct = variants.find(v => v.color === selectedColor)
    setCurrentProduct(variantProduct || product)
    setCurrentImageIndex(0)
  }, [selectedColor, variants, product])

  const allImages = [
    currentProduct.imageUrl,
    ...(currentProduct.additionalImages || [])
  ].filter(Boolean)

  const handleAddToCart = () => {
    if (currentProduct.stock >= quantity) {
      addToCart({
        ...currentProduct,
        name: `${currentProduct.name} - ${currentProduct.color}`,
        quantity
      } as any)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock > 1) return <span>In stock</span>
    if (stock === 1) return <span className="text-red-600">Last one</span>
    return <span className="text-gray-500">Out of stock</span>
  }

  // Get unique colors from product and variants
  const availableColors = [product, ...variants]
    .map(p => ({ color: p.color, inStock: p.stock > 0 }))
    .filter((value, index, self) => 
      index === self.findIndex(t => t.color === value.color)
    )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left side - Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square w-full">
          <Image
            src={getCloudinaryUrl(allImages[currentImageIndex])}
            alt={currentProduct.name}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>
        
        {/* Thumbnail Navigation - Horizontal scroll on mobile */}
        {allImages.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-2 snap-x">
            {allImages.map((image, index) => (
              <div 
                key={index}
                className={`relative flex-none w-20 aspect-square cursor-pointer rounded-md overflow-hidden snap-start
                  ${currentImageIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={getCloudinaryUrl(image)}
                  alt={`Product view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side - Product Info */}
      <div className="flex flex-col space-y-6">
        {/* Product Title and Price */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {currentProduct.name}
          </h1>
          <div className="space-y-1">
            {currentProduct.originalPrice ? (
              <>
                <p className="text-lg text-gray-500 line-through">
                  ${currentProduct.originalPrice.toFixed(2)}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${currentProduct.price.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                ${currentProduct.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Product Details Table */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Color Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <Select
              value={selectedColor}
              onValueChange={setSelectedColor}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-white">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableColors.map(({ color, inStock }) => (
                  <SelectItem
                    key={color}
                    value={color}
                    disabled={!inStock}
                    className="hover:bg-gray-100"
                  >
                    <span className={!inStock ? 'text-gray-400' : ''}>
                      {color} {!inStock && '(Out of Stock)'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Material */}
          {currentProduct.material && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Material</label>
              <p className="text-gray-900">{currentProduct.material}</p>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1"
                max={currentProduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, currentProduct.stock))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">
                {getStockStatus(currentProduct.stock)}
              </span>
            </div>
          </div>
        </div>

        {/* Add to Cart Button - Full width on mobile */}
        <Button 
          className="w-full bg-blue-500 text-white hover:bg-blue-600 py-6 text-lg"
          disabled={currentProduct.stock < quantity}
          onClick={handleAddToCart}
        >
          {currentProduct.stock >= quantity ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  )
} 