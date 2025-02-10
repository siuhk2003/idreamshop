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
import Image from 'next/image'
import { getCloudinaryUrl } from '@/lib/utils'

const CATEGORIES = ['new', 'regular', 'clearance'] as const
type Category = typeof CATEGORIES[number]

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  wholesalePrice?: number | null
  imageUrl: string
  category: string
  stock: number
  color?: string
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
  wholesaleCo: string | null
  producttype: string | null
  display: string
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
  const [editForm, setEditForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    wholesalePrice: null,
    originalPrice: null,
    imageUrl: '',
    category: 'regular',
    stock: 0,
    sku: '',
    styleCode: '',
    mancode: '',
    productcost: 0,
    productcharges: 0,
    remarks: '',
    exchangeRate: 0
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [newProduct, setNewProduct] = useState<{
    name: string
    description: string
    price: number
    originalPrice: number | null
    wholesalePrice: number | null
    imageUrl: string
    category: string
    stock: number
    color?: string
    material?: string
    styleCode: string
    sku: string
    mancode: string
    productcost: number
    productcharges: number
    remarks?: string
    additionalImages: string
    exchangeRate: number
    wholesaleCo: string
    producttype: string
    display: string
  }>({
    name: '',
    description: '',
    price: 0,
    originalPrice: null,
    wholesalePrice: null,
    imageUrl: '',
    category: 'regular',
    stock: 0,
    sku: '',
    styleCode: '',
    mancode: '',
    productcost: 0,
    productcharges: 0,
    remarks: '',
    additionalImages: '',
    exchangeRate: 0.19,
    wholesaleCo: '',
    producttype: '',
    display: 'Yes'
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [importing, setImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?isAdmin=true', {
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = {
        ...newProduct,
        additionalImages: newProduct.additionalImages.trim() 
          ? newProduct.additionalImages.split(',').map(url => url.trim()).filter(Boolean)
          : []
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
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
        originalPrice: null,
        wholesalePrice: null,
        imageUrl: '',
        category: 'regular',
        stock: 0,
        color: '',
        material: '',
        styleCode: '',
        sku: '',
        mancode: '',
        productcost: 0,
        productcharges: 0,
        remarks: '',
        additionalImages: '',
        exchangeRate: 0.19,
        wholesaleCo: '',
        producttype: '',
        display: 'Yes'
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
      originalPrice: product.originalPrice || null,
      wholesalePrice: product.wholesalePrice || null,
      mancode: product.mancode || '',
      productcost: product.productcost || 0,
      productcharges: product.productcharges || 0,
      remarks: product.remarks || '',
      exchangeRate: product.exchangeRate,
      wholesaleCo: product.wholesaleCo || '',
      producttype: product.producttype || '',
      display: product.display || 'Yes'
    })
  }

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...editForm,
          wholesalePrice: editForm.wholesalePrice || null,
          mancode: editForm.mancode,
          productcost: editForm.productcost,
          productcharges: editForm.productcharges,
          remarks: editForm.remarks || null,
          exchangeRate: editForm.exchangeRate,
          wholesaleCo: editForm.wholesaleCo || null,
          producttype: editForm.producttype || null,
          display: editForm.display || 'Yes'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product')
      }

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
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Successfully imported ${data.count} products`)
        fetchProducts()
      } else {
        throw new Error(data.error || 'Import failed')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to import products')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase()
    return product.mancode.toLowerCase().includes(searchLower) || 
           product.sku.toLowerCase().includes(searchLower)
  })

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
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

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by Manufacturer Code or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-md"
          />
        </div>
        {searchTerm && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchTerm('')
              setCurrentPage(1)
            }}
          >
            Clear
          </Button>
        )}
        <div className="text-sm text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                  <Input 
                    id="wholesalePrice" 
                    name="wholesalePrice" 
                    type="number" 
                    value={newProduct.wholesalePrice || ''} 
                    onChange={(e) => setNewProduct({ 
                      ...newProduct, 
                      wholesalePrice: e.target.value ? parseFloat(e.target.value) : null 
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input 
                    id="originalPrice" 
                    name="originalPrice" 
                    type="number" 
                    value={newProduct.originalPrice || ''} 
                    onChange={(e) => setNewProduct({ 
                      ...newProduct, 
                      originalPrice: e.target.value ? parseFloat(e.target.value) : null 
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value as Category })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} required />
                </div>
                <div>
                  <Label htmlFor="styleCode">Style Code</Label>
                  <Input id="styleCode" name="styleCode" value={newProduct.styleCode} onChange={(e) => setNewProduct({ ...newProduct, styleCode: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="mancode">Manufacturer Code</Label>
                  <Input id="mancode" name="mancode" value={newProduct.mancode} onChange={(e) => setNewProduct({ ...newProduct, mancode: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="productcost">Product Cost</Label>
                  <Input id="productcost" name="productcost" type="number" value={newProduct.productcost} onChange={(e) => setNewProduct({ ...newProduct, productcost: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <Label htmlFor="productcharges">Product Charges</Label>
                  <Input id="productcharges" name="productcharges" type="number" value={newProduct.productcharges} onChange={(e) => setNewProduct({ ...newProduct, productcharges: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <Label htmlFor="exchangeRate">Exchange Rate</Label>
                  <Input id="exchangeRate" name="exchangeRate" type="number" value={newProduct.exchangeRate} onChange={(e) => setNewProduct({ ...newProduct, exchangeRate: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" name="material" value={newProduct.material} onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" name="remarks" value={newProduct.remarks} onChange={(e) => setNewProduct({ ...newProduct, remarks: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="additionalImages">Additional Images (comma-separated URLs)</Label>
                  <Input id="additionalImages" name="additionalImages" value={newProduct.additionalImages} onChange={(e) => setNewProduct({ ...newProduct, additionalImages: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="wholesaleCo">Wholesale Company</Label>
                  <Input
                    id="wholesaleCo"
                    name="wholesaleCo"
                    value={newProduct.wholesaleCo}
                    onChange={(e) => setNewProduct({ ...newProduct, wholesaleCo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="producttype">Product Type</Label>
                  <Input
                    id="producttype"
                    name="producttype"
                    value={newProduct.producttype}
                    onChange={(e) => setNewProduct({ ...newProduct, producttype: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="display">Display</Label>
                  <Select 
                    name="display" 
                    value={newProduct.display} 
                    onValueChange={(value) => setNewProduct({ ...newProduct, display: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select display option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Add Product</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6">
        {paginatedProducts.map(product => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="w-32">
                  <Image
                    src={getCloudinaryUrl(product.imageUrl)}
                    alt={product.name}
                    width={128}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-grow">
                  {editingId === product.id ? (
                    <div className="space-y-6">
                      <table className="w-full">
                        <tbody className="divide-y">
                          <tr>
                            <td className="py-2 pr-4 w-1/4">
                              <Label htmlFor="name">Product Name</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="name"
                                value={editForm.name || ''}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="description">Description</Label>
                            </td>
                            <td className="py-2">
                              <Textarea
                                id="description"
                                value={editForm.description || ''}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="sku">SKU</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="sku"
                                value={editForm.sku || ''}
                                onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="styleCode">Style Code</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="styleCode"
                                value={editForm.styleCode || ''}
                                onChange={e => setEditForm({ ...editForm, styleCode: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="mancode">Manufacturer Code</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="mancode"
                                value={editForm.mancode || ''}
                                onChange={e => setEditForm({ ...editForm, mancode: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="color">Color</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="color"
                                value={editForm.color || ''}
                                onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="material">Material</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="material"
                                value={editForm.material || ''}
                                onChange={e => setEditForm({ ...editForm, material: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="productcost">Product Cost (RMB)</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="productcost"
                                type="number"
                                step="0.01"
                                value={editForm.productcost || ''}
                                onChange={e => setEditForm({ ...editForm, productcost: parseFloat(e.target.value) })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="productcharges">Product Charges (RMB)</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="productcharges"
                                type="number"
                                step="0.01"
                                value={editForm.productcharges || ''}
                                onChange={e => setEditForm({ ...editForm, productcharges: parseFloat(e.target.value) })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="wholesalePrice">Wholesale Price (CAD)</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="wholesalePrice"
                                type="number"
                                step="0.01"
                                value={editForm.wholesalePrice || ''}
                                onChange={e => setEditForm({ ...editForm, wholesalePrice: parseFloat(e.target.value) })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="price">Price</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={editForm.price || ''}
                                onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="originalPrice">Original Price</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="originalPrice"
                                type="number"
                                step="0.01"
                                value={editForm.originalPrice || ''}
                                onChange={e => setEditForm({ 
                                  ...editForm, 
                                  originalPrice: e.target.value ? parseFloat(e.target.value) : null 
                                })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="stock">Stock</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="stock"
                                type="number"
                                value={editForm.stock || ''}
                                onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="category">Category</Label>
                            </td>
                            <td className="py-2">
                              <Select
                                value={editForm.category}
                                onValueChange={(value) => setEditForm({ ...editForm, category: value as Category })}
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
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="imageUrl">Main Image URL</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="imageUrl"
                                value={editForm.imageUrl || ''}
                                onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="additionalImages">Additional Image URLs</Label>
                            </td>
                            <td className="py-2">
                              <Textarea
                                id="additionalImages"
                                value={editForm.additionalImages?.join('\n') || ''}
                                onChange={e => setEditForm({ 
                                  ...editForm, 
                                  additionalImages: e.target.value.split('\n').filter(url => url.trim())
                                })}
                                placeholder="One URL per line"
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="remarks">Remarks</Label>
                            </td>
                            <td className="py-2">
                              <Textarea
                                id="remarks"
                                value={editForm.remarks || ''}
                                onChange={e => setEditForm({ ...editForm, remarks: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="exchangeRate">Exchange Rate (RMB to CAD)</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="exchangeRate"
                                type="number"
                                step="0.01"
                                value={editForm.exchangeRate || ''}
                                onChange={e => setEditForm({ ...editForm, exchangeRate: parseFloat(e.target.value) })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="wholesaleCo">Wholesale Company</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="wholesaleCo"
                                value={editForm.wholesaleCo || ''}
                                onChange={e => setEditForm({ ...editForm, wholesaleCo: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="producttype">Product Type</Label>
                            </td>
                            <td className="py-2">
                              <Input
                                id="producttype"
                                value={editForm.producttype || ''}
                                onChange={e => setEditForm({ ...editForm, producttype: e.target.value })}
                              />
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">
                              <Label htmlFor="display">Display</Label>
                            </td>
                            <td className="py-2">
                              <Select 
                                value={editForm.display} 
                                onValueChange={(value) => setEditForm({ ...editForm, display: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select display option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">Created At</td>
                            <td className="py-2 text-gray-600">{formatDate(product.createdAt)}</td>
                          </tr>

                          <tr>
                            <td className="py-2 pr-4">Updated At</td>
                            <td className="py-2 text-gray-600">{formatDate(product.updatedAt)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="flex justify-end gap-2 mt-4">
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
                          <p className="text-gray-600 mt-2">{product.description}</p>
                        </div>
                        <Button onClick={() => handleEdit(product)}>
                          Edit
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">SKU:</span> {product.sku}
                        </div>
                        <div>
                          <span className="font-semibold">Style Code:</span> {product.styleCode}
                        </div>
                        <div>
                          <span className="font-semibold">Manufacturer Code:</span> {product.mancode}
                        </div>

                        <div>
                          <span className="font-semibold">Color:</span> {product.color || '-'}
                        </div>
                        <div>
                          <span className="font-semibold">Material:</span> {product.material || '-'}
                        </div>
                        <div>
                          <span className="font-semibold">Product Cost (RMB):</span> ${product.productcost}
                        </div>

                        <div>
                          <span className="font-semibold">Product Charges (RMB):</span> ${product.productcharges}
                        </div>
                        <div>
                          <span className="font-semibold">Exchange Rate (RMB to CAD):</span> {product.exchangeRate.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-semibold">Wholesale Price (CAD):</span> ${product.wholesalePrice || '-'}
                        </div>

                        <div>
                          <span className="font-semibold">Price:</span> ${product.price}
                        </div>
                        <div>
                          <span className="font-semibold">Original Price:</span> ${product.originalPrice || '-'}
                        </div>
                        <div>
                          <span className="font-semibold">Stock:</span> {product.stock}
                        </div>
                        <div>
                          <span className="font-semibold">Category:</span> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </div>

                        <div>
                          <span className="font-semibold">Main Image URL:</span>
                          <div className="mt-1 text-xs text-gray-500 break-all">
                            {product.imageUrl}
                          </div>
                        </div>
                        {product.additionalImages && product.additionalImages.length > 0 && (
                          <div>
                            <span className="font-semibold">Additional Image URLs:</span>
                            <div className="mt-1 space-y-1">
                              {product.additionalImages.map((url, index) => (
                                <div key={index} className="text-xs text-gray-500 break-all">
                                  {url}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-semibold">Wholesale Company:</span> {product.wholesaleCo || '-'}
                        </div>
                        <div>
                          <span className="font-semibold">Product Type:</span> {product.producttype || '-'}
                        </div>
                        <div>
                          <span className="font-semibold">Display:</span> {product.display}
                        </div>
                      </div>

                      {product.remarks && (
                        <div className="text-sm mt-2">
                          <span className="font-semibold">Remarks:</span> {product.remarks}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
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