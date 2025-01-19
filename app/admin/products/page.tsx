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
import { Upload } from 'lucide-react'
import { format } from 'date-fns'

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
  sku: string
  styleCode: string
  additionalImages?: string[]
  createdAt: string
  updatedAt: string
  color?: string
  material?: string
}

const ITEMS_PER_PAGE = 10

const formatDate = (date: Date | string) => {
  try {
    const dateObj = new Date(date)
    if (!isNaN(dateObj.getTime())) {
      return format(dateObj, 'PPpp')
    }
    return 'Invalid date'
  } catch (error) {
    return 'Invalid date'
  }
}

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
    stock: 0,
    sku: '',
    styleCode: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [importing, setImporting] = useState(false)

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
        stock: 0,
        sku: '',
        styleCode: ''
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
        sku: editForm.sku,
        styleCode: editForm.styleCode,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name)
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Sending request to import API...')
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      console.log('Response received:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        alert(`Successfully imported ${data.count} products`)
        fetchProducts()
      } else {
        throw new Error(data.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert(error instanceof Error ? error.message : 'Failed to import products')
    } finally {
      setImporting(false)
      event.target.value = ''
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            disabled={importing}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import Excel'}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
            disabled={importing}
          />
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel Add' : 'Add New Product'}
          </Button>
        </div>
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

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={newProduct.sku || ''}
                  onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="SKU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variationCode">Variation Code</Label>
                <Input
                  id="variationCode"
                  value={newProduct.styleCode || ''}
                  onChange={e => setNewProduct({ ...newProduct, styleCode: e.target.value })}
                  placeholder="Variation Code"
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
              <div className="flex gap-6">
                <div className="w-48 space-y-2">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  {product.additionalImages?.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
                
                <div className="flex-grow">
                  {editingId === product.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={editForm.name || ''}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="styleCode">Style Code</Label>
                          <Input
                            id="styleCode"
                            value={editForm.styleCode || ''}
                            onChange={e => setEditForm({ ...editForm, styleCode: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editForm.description || ''}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={editForm.price || ''}
                            onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                          <Input
                            id="wholesalePrice"
                            type="number"
                            step="0.01"
                            value={editForm.wholesalePrice || ''}
                            onChange={e => setEditForm({ ...editForm, wholesalePrice: parseFloat(e.target.value) })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="originalPrice">Original Price</Label>
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            value={editForm.originalPrice || ''}
                            onChange={e => setEditForm({ ...editForm, originalPrice: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={editForm.stock || ''}
                            onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            value={editForm.color || ''}
                            onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="material">Material</Label>
                          <Input
                            id="material"
                            value={editForm.material || ''}
                            onChange={e => setEditForm({ ...editForm, material: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={editForm.category}
                          onValueChange={(value: string) => setEditForm({ 
                            ...editForm, 
                            category: value as Category 
                          })}
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

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Main Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={editForm.imageUrl || ''}
                          onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalImages">Additional Image URLs (one per line)</Label>
                        <Textarea
                          id="additionalImages"
                          value={editForm.additionalImages?.join('\n') || ''}
                          onChange={e => setEditForm({ 
                            ...editForm, 
                            additionalImages: e.target.value.split('\n').filter(url => url.trim())
                          })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <Label>Created At</Label>
                          <p>{formatDate(product.createdAt)}</p>
                        </div>
                        <div>
                          <Label>Updated At</Label>
                          <p>{formatDate(product.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleSave(product.id)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-500">Style Code: {product.styleCode}</p>
                        </div>
                        <Button onClick={() => handleEdit(product)}>
                          Edit
                        </Button>
                      </div>

                      <p className="text-gray-600">{product.description}</p>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Price:</span> ${product.price}
                        </div>
                        <div>
                          <span className="font-semibold">Wholesale:</span> ${product.wholesalePrice}
                        </div>
                        {product.originalPrice && (
                          <div>
                            <span className="font-semibold">Original:</span> ${product.originalPrice}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Stock:</span> {product.stock}
                        </div>
                        <div>
                          <span className="font-semibold">Color:</span> {product.color}
                        </div>
                        <div>
                          <span className="font-semibold">Material:</span> {product.material}
                        </div>
                      </div>

                      <div className="text-sm">
                        <div>
                          <span className="font-semibold">Created:</span> {formatDate(product.createdAt)}
                        </div>
                        <div>
                          <span className="font-semibold">Updated:</span> {formatDate(product.updatedAt)}
                        </div>
                      </div>
                    </div>
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