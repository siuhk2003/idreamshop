export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  wholesalePrice: number | null
  imageUrl: string
  category: string
  stock: number
  color: string
  material: string | null
  styleCode: string
  sku: string
  quantity?: number
  additionalImages?: string[]
} 