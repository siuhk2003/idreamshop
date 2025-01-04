'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = ['new', 'regular', 'clearance'] as const
type Category = typeof CATEGORIES[number]

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  imageUrl: string
  category: Category
  stock: number
  wholesalePrice?: number | null
}

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    wholesalePrice: null,
    originalPrice: null,
    imageUrl: '',
    category: 'regular',
    stock: 0
  })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products')
      }
      
      console.log('Fetched products:', data.products)
      setProducts(data.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newProduct)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product')
      }

      setProducts([...products, data.product])
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'regular',
        stock: 0
      })
      setShowAddForm(false)

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({
      ...product,
      originalPrice: product.originalPrice || product.price
    })
  }

  const handleSave = async (id: string) => {
    try {
      // Prepare the update data
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price ? Number(editForm.price) : undefined,
        wholesalePrice: editForm.wholesalePrice ? Number(editForm.wholesalePrice) : null,
        stock: editForm.stock ? Number(editForm.stock) : undefined,
        category: editForm.category,
        imageUrl: editForm.imageUrl,
        // Only include originalPrice if category is clearance
        originalPrice: editForm.category === 'clearance' 
          ? Number(editForm.originalPrice) || Number(editForm.price)
          : null
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product')
      }

      // Update local state with the returned data
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...data.product } : p
      ))
      setEditingId(null)
      setEditForm({})

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update product')
    }
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel Add' : 'Add New Product'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Add New Product</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name || ''}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description || ''}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    placeholder="Price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                  <Input
                    id="wholesalePrice"
                    type="number"
                    value={newProduct.wholesalePrice || ''}
                    onChange={e => setNewProduct({ ...newProduct, wholesalePrice: parseFloat(e.target.value) })}
                    placeholder="Wholesale Price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock || ''}
                    onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                    placeholder="Stock"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value as Category })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newProduct.imageUrl || ''}
                  onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="Image URL"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={async () => {
                  await handleAddProduct()
                  setShowAddForm(false)
                }}>
                  Add Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6">
        {paginatedProducts.map(product => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-32 h-32">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                
                <div className="flex-grow">
                  {editingId === product.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={editForm.name || ''}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Product name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editForm.description || ''}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            value={editForm.price || ''}
                            onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                            placeholder="Price"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                          <Input
                            id="wholesalePrice"
                            type="number"
                            value={editForm.wholesalePrice || ''}
                            onChange={e => setEditForm({ ...editForm, wholesalePrice: parseFloat(e.target.value) })}
                            placeholder="Wholesale Price"
                          />
                        </div>

                        {editForm.category === 'clearance' && (
                          <div className="space-y-2">
                            <Label htmlFor="originalPrice">Original Price</Label>
                            <Input
                              id="originalPrice"
                              type="number"
                              value={editForm.originalPrice || ''}
                              onChange={e => setEditForm({ ...editForm, originalPrice: parseFloat(e.target.value) })}
                              placeholder="Original Price"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={editForm.stock || ''}
                            onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                            placeholder="Stock"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={editForm.category}
                          onValueChange={(value) => {
                            const category = value as Category
                            setEditForm({ 
                              ...editForm, 
                              category,
                              originalPrice: category === 'clearance' 
                                ? (editForm.originalPrice || editForm.price)
                                : null
                            })
                          }}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingId(null)
                            setEditForm({})
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => handleSave(product.id)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <Button onClick={() => handleEdit(product)}>
                          Edit
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Price:</span> ${product.price}
                          {product.category === 'clearance' && product.originalPrice && (
                            <span className="text-red-500 line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          )}
                          <br />
                          <span className="font-semibold">Wholesale:</span> ${product.wholesalePrice ?? 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Stock:</span> {product.stock}
                        </div>
                        <div>
                          <span className="font-semibold">Category:</span> {product.category}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="py-2">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 