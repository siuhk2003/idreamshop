export type Category = 'new' | 'regular' | 'clearance'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  wholesalePrice: number | null
  imageUrl: string
  category: Category
  stock: number
  color: string
  material: string | null
  styleCode: string
  sku: string
  quantity?: number
  additionalImages?: string[]
  createdAt: Date | string
  updatedAt: Date | string
} 