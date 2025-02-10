type Category = 'new' | 'regular' | 'clearance'

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
  material?: string
  styleCode: string
  sku: string
  mancode: string
  productcost: number
  productcharges: number
  remarks?: string
  additionalImages?: string[]
  createdAt: string | Date
  updatedAt: string | Date
  exchangeRate: number
  version: number
  wholesaleCo?: string
  producttype?: string
  display: string
}

export type { Category } 