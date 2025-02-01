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
import { getCloudinaryUrl } from '@/lib/utils'

interface ProductDetailsProps {
  products: Product[]
}

const cloudinaryLoader = ({ src, width, quality }: any) => {
  return getCloudinaryUrl(src)
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
        quantity // This will be handled by the cart context, not the Product type
      } as any) // Use type assertion since cart items have quantity
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock > 1) return <span>In stock</span>
    if (stock === 1) return <span className="text-red-600">Last one</span>
    return <span className="text-gray-500">Out of stock</span>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative aspect-square">
        <Image
          loader={cloudinaryLoader}
          src={selectedProduct.imageUrl}
          alt={selectedProduct.name || 'Product image'}
          fill
          className="object-cover rounded-lg"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
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