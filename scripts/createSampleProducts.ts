const XLSX = require('xlsx-js-style')
const path = require('path')
const fs = require('fs')

const products = [
  // StyleCode 1 - Hair Clip Set (3 colors)
  {
    name: 'Crystal Hair Clip Set',
    description: 'Elegant crystal-embellished hair clips, perfect for special occasions',
    price: 24.99,
    originalPrice: null,
    wholesalePrice: 12.50,
    category: 'new',
    stock: 50,
    color: 'Gold',
    material: 'Metal with crystals',
    styleCode: 'HC001',
    sku: 'HC001-GOLD',
    imageUrl: '/images/products/hairclip-gold.jpg',
    additionalImages: [
      '/images/products/hairclip-gold-side.jpg',
      '/images/products/hairclip-gold-detail.jpg'
    ]
  },
  {
    name: 'Crystal Hair Clip Set',
    description: 'Elegant crystal-embellished hair clips, perfect for special occasions',
    price: 24.99,
    originalPrice: null,
    wholesalePrice: 12.50,
    category: 'new',
    stock: 45,
    color: 'Silver',
    material: 'Metal with crystals',
    styleCode: 'HC001',
    sku: 'HC001-SILV',
    imageUrl: '/images/products/hairclip-silver.jpg',
    additionalImages: [
      '/images/products/hairclip-silver-side.jpg',
      '/images/products/hairclip-silver-detail.jpg'
    ]
  },
  {
    name: 'Crystal Hair Clip Set',
    description: 'Elegant crystal-embellished hair clips, perfect for special occasions',
    price: 24.99,
    originalPrice: null,
    wholesalePrice: 12.50,
    category: 'new',
    stock: 40,
    color: 'Rose Gold',
    material: 'Metal with crystals',
    styleCode: 'HC001',
    sku: 'HC001-ROSE',
    imageUrl: '/images/products/hairclip-rosegold.jpg'
  },

  // StyleCode 2 - Silk Scrunchie Set (3 colors)
  {
    name: 'Luxury Silk Scrunchie Set',
    description: 'Set of 3 premium silk scrunchies, gentle on hair',
    price: 29.99,
    originalPrice: null,
    wholesalePrice: 15.00,
    category: 'new',
    stock: 60,
    color: 'Pastel Mix',
    material: '100% Mulberry Silk',
    styleCode: 'SS001',
    sku: 'SS001-PSTL',
    imageUrl: '/images/products/scrunchie-pastel.jpg'
  },
  {
    name: 'Luxury Silk Scrunchie Set',
    description: 'Set of 3 premium silk scrunchies, gentle on hair',
    price: 29.99,
    originalPrice: null,
    wholesalePrice: 15.00,
    category: 'new',
    stock: 55,
    color: 'Jewel Mix',
    material: '100% Mulberry Silk',
    styleCode: 'SS001',
    sku: 'SS001-JEWL',
    imageUrl: '/images/products/scrunchie-jewel.jpg'
  },
  {
    name: 'Luxury Silk Scrunchie Set',
    description: 'Set of 3 premium silk scrunchies, gentle on hair',
    price: 29.99,
    originalPrice: null,
    wholesalePrice: 15.00,
    category: 'new',
    stock: 50,
    color: 'Neutral Mix',
    material: '100% Mulberry Silk',
    styleCode: 'SS001',
    sku: 'SS001-NTRL',
    imageUrl: '/images/products/scrunchie-neutral.jpg'
  },

  // Regular Products
  {
    name: 'Pearl Hair Pins Set',
    description: 'Set of 6 delicate pearl hair pins',
    price: 19.99,
    originalPrice: null,
    wholesalePrice: 10.00,
    category: 'regular',
    stock: 75,
    color: 'White Pearl',
    material: 'Freshwater pearls, Metal',
    styleCode: 'HP001',
    sku: 'HP001-WHT',
    imageUrl: '/images/products/hairpins-pearl.jpg'
  },
  {
    name: 'Velvet Bow Headband',
    description: 'Classic velvet bow headband',
    price: 15.99,
    originalPrice: null,
    wholesalePrice: 8.00,
    category: 'regular',
    stock: 65,
    color: 'Black',
    material: 'Velvet',
    styleCode: 'HB001',
    sku: 'HB001-BLK',
    imageUrl: '/images/products/headband-black.jpg'
  },
  {
    name: 'Braided Leather Headband',
    description: 'Sophisticated braided leather headband',
    price: 22.99,
    originalPrice: null,
    wholesalePrice: 11.50,
    category: 'regular',
    stock: 40,
    color: 'Brown',
    material: 'Genuine leather',
    styleCode: 'HB002',
    sku: 'HB002-BRN',
    imageUrl: '/images/products/headband-leather.jpg'
  },

  // Clearance Items
  {
    name: 'Summer Collection Scrunchie Pack',
    description: 'Pack of 5 cotton scrunchies in summer colors',
    price: 12.99,
    originalPrice: 24.99,
    wholesalePrice: 6.50,
    category: 'clearance',
    stock: 30,
    color: 'Summer Mix',
    material: 'Cotton',
    styleCode: 'SC001',
    sku: 'SC001-SUM',
    imageUrl: '/images/products/scrunchie-summer.jpg'
  },
  {
    name: 'Floral Hair Clips Set',
    description: 'Set of 4 floral pattern hair clips',
    price: 9.99,
    originalPrice: 18.99,
    wholesalePrice: 5.00,
    category: 'clearance',
    stock: 25,
    color: 'Mixed Floral',
    material: 'Metal, Fabric',
    styleCode: 'HC002',
    sku: 'HC002-FLR',
    imageUrl: '/images/products/clips-floral.jpg'
  },

  // More Regular Products
  {
    name: 'Minimalist Metal Hair Claw',
    description: 'Modern geometric metal hair claw',
    price: 16.99,
    originalPrice: null,
    wholesalePrice: 8.50,
    category: 'regular',
    stock: 55,
    color: 'Matte Black',
    material: 'Metal',
    styleCode: 'CL001',
    sku: 'CL001-BLK',
    imageUrl: '/images/products/claw-black.jpg'
  },

  // StyleCode 3 - Premium Hair Claw Set (4 colors)
  {
    name: 'Premium Acrylic Hair Claw',
    description: 'Large premium acrylic hair claw with modern marble pattern',
    price: 18.99,
    originalPrice: null,
    wholesalePrice: 9.50,
    category: 'new',
    stock: 40,
    color: 'Tortoise Shell',
    material: 'Premium Acrylic',
    styleCode: 'CL002',
    sku: 'CL002-TORT',
    imageUrl: '/images/products/claw-tortoise.jpg',
    additionalImages: [
      '/images/products/claw-tortoise-open.jpg',
      '/images/products/claw-tortoise-side.jpg'
    ]
  },
  {
    name: 'Premium Acrylic Hair Claw',
    description: 'Large premium acrylic hair claw with modern marble pattern',
    price: 18.99,
    originalPrice: null,
    wholesalePrice: 9.50,
    category: 'new',
    stock: 35,
    color: 'Pearl White',
    material: 'Premium Acrylic',
    styleCode: 'CL002',
    sku: 'CL002-PEARL',
    imageUrl: '/images/products/claw-pearl.jpg'
  },
  {
    name: 'Premium Acrylic Hair Claw',
    description: 'Large premium acrylic hair claw with modern marble pattern',
    price: 18.99,
    originalPrice: null,
    wholesalePrice: 9.50,
    category: 'new',
    stock: 38,
    color: 'Black Marble',
    material: 'Premium Acrylic',
    styleCode: 'CL002',
    sku: 'CL002-MBLK',
    imageUrl: '/images/products/claw-marble-black.jpg'
  },
  {
    name: 'Premium Acrylic Hair Claw',
    description: 'Large premium acrylic hair claw with modern marble pattern',
    price: 18.99,
    originalPrice: null,
    wholesalePrice: 9.50,
    category: 'new',
    stock: 42,
    color: 'Rose Marble',
    material: 'Premium Acrylic',
    styleCode: 'CL002',
    sku: 'CL002-MROSE',
    imageUrl: '/images/products/claw-marble-rose.jpg'
  },

  // More Regular Products
  {
    name: 'Satin Ribbon Hair Ties',
    description: 'Set of 3 long satin ribbon hair ties',
    price: 14.99,
    originalPrice: null,
    wholesalePrice: 7.50,
    category: 'regular',
    stock: 85,
    color: 'Black',
    material: 'Satin',
    styleCode: 'RT001',
    sku: 'RT001-BLK',
    imageUrl: '/images/products/ribbon-black.jpg'
  },
  {
    name: 'Crystal Bobby Pins Set',
    description: 'Set of 6 crystal-embellished bobby pins',
    price: 16.99,
    originalPrice: null,
    wholesalePrice: 8.50,
    category: 'regular',
    stock: 70,
    color: 'Silver Crystal',
    material: 'Metal, Crystal',
    styleCode: 'BP001',
    sku: 'BP001-SLVR',
    imageUrl: '/images/products/pins-crystal.jpg'
  },

  // More Clearance Items
  {
    name: 'Vintage Style Headband',
    description: 'Padded vintage-style headband with knot detail',
    price: 11.99,
    originalPrice: 21.99,
    wholesalePrice: 6.00,
    category: 'clearance',
    stock: 15,
    color: 'Navy Blue',
    material: 'Satin',
    styleCode: 'HB003',
    sku: 'HB003-NVY',
    imageUrl: '/images/products/headband-vintage-navy.jpg'
  },
  {
    name: 'Mini Butterfly Clips Set',
    description: 'Set of 12 colorful mini butterfly clips',
    price: 8.99,
    originalPrice: 16.99,
    wholesalePrice: 4.50,
    category: 'clearance',
    stock: 20,
    color: 'Rainbow Mix',
    material: 'Plastic',
    styleCode: 'BC001',
    sku: 'BC001-RBW',
    imageUrl: '/images/products/clips-butterfly.jpg'
  }
]

// Create a modified version of products for Excel export
const productsForExcel = products.map(product => ({
  ...product,
  // Convert additionalImages array to comma-separated string
  additionalImages: (product.additionalImages || []).join(',')
}))

// Specify output path
const outputPath = path.join(__dirname, '..', 'data', 'sample_products.xlsx')

// Create workbook
const workbook = XLSX.utils.book_new()
const worksheet = XLSX.utils.json_to_sheet(productsForExcel)  // Use modified products
XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')

// Ensure directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true })

// Write file
XLSX.writeFile(workbook, outputPath)
console.log(`Excel file created at: ${outputPath}`)

// Keep the original export for importProducts.ts
module.exports = {
  sampleProducts: products  // Use original products with arrays
} 