'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductType {
  type: string
  count: number
}

export function FilterSidebar() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'
  const currentType = searchParams.get('type') || 'all'
  const [productTypes, setProductTypes] = useState<ProductType[]>([])

  const categories = [
    { id: 'all', name: 'All Products', href: '/products' },
    { id: 'new', name: 'New Arrivals', href: '/products?category=new' },
    { id: 'clearance', name: 'Clearance', href: '/products?category=clearance' }
  ]

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch('/api/products/types')
        const data = await response.json()
        if (data.success) {
          setProductTypes(data.types)
        }
      } catch (error) {
        console.error('Failed to fetch product types:', error)
      }
    }

    fetchProductTypes()
  }, [])

  const getTypeHref = (type: string) => {
    const params = new URLSearchParams()
    if (currentCategory !== 'all') {
      params.set('category', currentCategory)
    }
    if (type !== 'all') {
      params.set('type', type)
    }
    return `/products${params.toString() ? `?${params.toString()}` : ''}`
  }

  return (
    <div className="w-full lg:w-64 bg-white rounded-lg shadow p-4 space-y-6 mb-6 lg:mb-0">
      <div>
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <Button 
              key={category.id}
              variant={currentCategory === category.id ? 'default' : 'outline'} 
              className="w-full justify-start"
              asChild
            >
              <Link href={category.href}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Product Types</h3>
        <div className="space-y-2">
          <Button
            variant={currentType === 'all' ? 'default' : 'outline'}
            className="w-full justify-start"
            asChild
          >
            <Link href={getTypeHref('all')}>All Types</Link>
          </Button>
          {productTypes.map(({ type, count }) => (
            <Button
              key={type}
              variant={currentType === type ? 'default' : 'outline'}
              className="w-full justify-start"
              asChild
            >
              <Link href={getTypeHref(type)}>
                {type} ({count})
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
