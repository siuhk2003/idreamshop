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
      <div className="relative">
        {/* Main Image */}
        <div className="relative aspect-square">
          <Image
            src={getCloudinaryUrl(allImages[currentImageIndex])}
            alt={currentProduct.name}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>
        
        {/* Thumbnail Navigation */}
        {allImages.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`
                  relative w-20 h-20 flex-shrink-0 rounded
                  ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}
                  hover:ring-2 hover:ring-blue-300 transition-all
                `}
              >
                <Image
                  src={getCloudinaryUrl(image)}
                  alt={`${currentProduct.name} view ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentProduct.name}</h1>
        <p className="text-gray-600 mb-6">{currentProduct.description}</p>
        
        {/* Product Details Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Details</h2>
          <table className="w-full">
            <tbody>
              {/* Color Selection */}
              <tr>
                <td className="py-2 text-gray-600 w-24">Color</td>
                <td>
                  <Select
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                  >
                    <SelectTrigger className="w-[200px] bg-white">
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
                </td>
              </tr>

              {/* Material */}
              <tr>
                <td className="py-2 text-gray-600">Material</td>
                <td>{currentProduct.material}</td>
              </tr>

              {/* Quantity */}
              <tr>
                <td className="py-2 text-gray-600">Quantity</td>
                <td>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Price Display */}
        <div className="mb-8">
          {currentProduct.originalPrice ? (
            <>
              <p className="text-gray-600 line-through">${currentProduct.originalPrice.toFixed(2)}</p>
              <p className="text-2xl font-bold text-red-600">${currentProduct.price.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-900">${currentProduct.price.toFixed(2)}</p>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full mt-4 bg-blue-500 text-white hover:bg-blue-600"
          disabled={currentProduct.stock < quantity}
          onClick={handleAddToCart}
        >
          {currentProduct.stock >= quantity ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  )
} 