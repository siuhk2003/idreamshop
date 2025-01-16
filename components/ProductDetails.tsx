'use client'

import { useState } from 'react'
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

interface ProductDetailsProps {
  products: Product[]
}

export function ProductDetails({ products }: ProductDetailsProps) {
  const { addToCart } = useCart()
  const [selectedColor, setSelectedColor] = useState(products[0].color)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const selectedProduct = products.find(p => p.color === selectedColor)!
  
  // Combine main image with additional images
  const allImages = [
    selectedProduct.imageUrl,
    ...(selectedProduct.additionalImages || [])
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    )
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    )
  }

  const handleAddToCart = () => {
    if (selectedProduct.stock >= quantity) {
      addToCart({
        ...selectedProduct,
        name: `${selectedProduct.name} - ${selectedProduct.color}`,
        quantity
      })
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock > 1) return <span>In stock</span>
    if (stock === 1) return <span className="text-red-600">Last one</span>
    return <span className="text-gray-500">Out of stock</span>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative">
        <div className="relative w-full h-[500px]">
          <Image
            src={allImages[currentImageIndex]}
            alt={`${selectedProduct.name} - View ${currentImageIndex + 1}`}
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>
        
        {allImages.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentImageIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Thumbnail preview */}
        {allImages.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                  currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h1>
        <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Details</h2>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 text-gray-600 w-24">Color</td>
                <td>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-[180px] bg-white border border-gray-300 hover:border-gray-400">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 shadow-md">
                      {products.map(p => (
                        <SelectItem 
                          key={p.color} 
                          value={p.color}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          {p.color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Material</td>
                <td>{selectedProduct.material}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Quantity</td>
                <td>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedProduct.stock))}
                    className="w-20"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Availability</td>
                <td>{getStockStatus(selectedProduct.stock)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          {selectedProduct.category === 'clearance' && selectedProduct.originalPrice ? (
            <>
              <p className="text-gray-600 line-through">${selectedProduct.originalPrice.toFixed(2)}</p>
              <p className="text-2xl font-bold text-red-600">${selectedProduct.price.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-900">${selectedProduct.price.toFixed(2)}</p>
          )}
        </div>

        <Button 
          className="w-full mt-4 bg-blue-500 text-white hover:bg-blue-600"
          disabled={selectedProduct.stock < quantity}
          onClick={handleAddToCart}
        >
          {selectedProduct.stock >= quantity ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  )
} 