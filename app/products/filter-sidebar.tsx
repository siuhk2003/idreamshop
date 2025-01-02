'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function FilterSidebar() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'

  const categories = [
    { id: 'all', name: 'All Products', href: '/products' },
    { id: 'new', name: 'New Arrivals', href: '/products?category=new' },
    { id: 'clearance', name: 'Clearance', href: '/products?category=clearance' }
  ]

  return (
    <div className="w-64 space-y-4">
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
  )
}
