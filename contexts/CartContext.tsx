'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product } from '@/types/product'
import { getCloudinaryUrl } from '@/lib/utils'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  setItems: (items: CartItem[]) => void
  addToCart: (product: Product & { quantity: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => Promise<boolean>
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    console.log('Cart Items:', items)
  }, [items])

  const addToCart = (product: Product & { quantity: number }) => {
    console.log('Adding to cart:', product)
    
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)
      
      if (existingItem) {
        console.log('Updating existing item:', existingItem)
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
      
      console.log('Adding new item:', cartItem)
      return [...currentItems, cartItem]
    })
  }

  const removeItem = (id: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id)
      localStorage.setItem('cart', JSON.stringify(newItems))
      return newItems
    })
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ id, quantity }]
        }),
      })

      const data = await response.json()
      
      if (!data.success) {
        alert(`Sorry, only ${data.outOfStock[0].availableStock} items available`)
        setItems(currentItems => {
          const newItems = currentItems.map(item =>
            item.id === id 
              ? { ...item, quantity: data.outOfStock[0].availableStock }
              : item
          )
          localStorage.setItem('cart', JSON.stringify(newItems))
          return newItems
        })
        return false
      }

      setItems(currentItems => {
        const newItems = currentItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
        localStorage.setItem('cart', JSON.stringify(newItems))
        return newItems
      })
      return true
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
      clearCart 
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