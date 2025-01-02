export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  imageUrl: string
  category: string
  stock: number
  color: string | null
  material: string | null
  createdAt: Date
  updatedAt: Date
} 