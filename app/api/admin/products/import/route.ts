import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { read, utils } from 'xlsx-js-style'

const REQUIRED_HEADERS = [
  'name', 'description', 'price', 'category', 'stock', 
  'styleCode', 'sku', 'mancode', 'productcost', 'productcharges',
  'exchangeRate'
]
const OPTIONAL_HEADERS = [
  'originalPrice', 'wholesalePrice', 'imageUrl', 'color', 
  'material', 'remarks', 'additionalImages', 'wholesaleCo',
  'producttype', 'display'
]
const VALID_CATEGORIES = ['new', 'regular', 'clearance']

export const POST = async (request: Request) => {
  try {
    console.log('Import API called')
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      console.log('Unauthorized attempt')
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    console.log('File received:', file?.name)
    
    if (!file) {
      console.log('No file in request')
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = utils.sheet_to_json(worksheet)

    // Validate headers
    if (data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Excel file is empty'
      }, { status: 400 })
    }

    const firstRow = data[0] as Record<string, unknown>
    const missingHeaders = REQUIRED_HEADERS.filter(header => !(header in firstRow))

    if (missingHeaders.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required columns: ${missingHeaders.join(', ')}`
      }, { status: 400 })
    }

    const products = await prisma.$transaction(
      data.map((row: any) => {
        // Validate category
        if (!VALID_CATEGORIES.includes(row.category)) {
          throw new Error(`Invalid category "${row.category}" for product "${row.name}"`)
        }

        return prisma.product.create({
          data: {
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
            wholesalePrice: row.wholesalePrice ? parseFloat(row.wholesalePrice) : null,
            imageUrl: row.imageUrl || '/placeholder.svg',
            category: row.category,
            stock: parseInt(row.stock),
            color: row.color || null,
            material: row.material || null,
            styleCode: row.styleCode,
            sku: row.sku,
            mancode: row.mancode,
            productcost: parseFloat(row.productcost),
            productcharges: parseFloat(row.productcharges),
            remarks: row.remarks || null,
            additionalImages: row.additionalImages ? row.additionalImages.split(',').map((url: string) => url.trim()) : [],
            exchangeRate: parseFloat(row.exchangeRate),
            wholesaleCo: row.wholesaleCo || null,
            producttype: row.producttype || null,
            display: row.display || 'Yes',
          }
        })
      })
    )

    return NextResponse.json({ 
      success: true,
      count: products.length 
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import products'
    }, { status: 500 })
  }
} 