'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product } from '@/types/product'
import { CartItem } from '@/types/cart'
import { getCloudinaryUrl } from '@/lib/utils'

interface CartContextType {
  items: CartItem[]
  setItems: (items: CartItem[]) => void
  addToCart: (product: Product & { quantity: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => Promise<boolean>
  clearCart: () => void
  discount: number | null
  setDiscount?: (discount: number | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error('Failed to parse saved cart:', error)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addToCart = (product: Product & { quantity: number }) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      }
      
      const cartItem: CartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        imageUrl: getCloudinaryUrl(product.imageUrl),
        stock: product.stock
      }
      
      return [...currentItems, cartItem]
    })
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id, quantity }]
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setItems(currentItems =>
          currentItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating quantity:', error)
      return false
    }
  }

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem('cart')
  }, [])

  return (
    <CartContext.Provider value={{
      items,
      setItems,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      discount,
      setDiscount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 