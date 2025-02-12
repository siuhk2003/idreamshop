import { Suspense } from 'react'
import { CartContent } from './cart-content'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View and manage your shopping cart at iDream Shop",
  keywords: ["shopping cart", "checkout", "online shopping"]
}

export default function CartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartContent />
    </Suspense>
  )
} 