import { CartItem } from '@/types/cart'

export async function checkStock(items: CartItem[]) {
  const response = await fetch('/api/check-stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })

  const data = await response.json()
  return {
    success: data.success,
    outOfStock: data.outOfStock || []
  }
} 