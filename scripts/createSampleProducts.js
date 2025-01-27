const XLSX = require('xlsx-js-style')
const path = require('path')
const fs = require('fs')

// Helper function to calculate wholesale price in CAD
const calculateWholesalePrice = (productcost, productcharges, exchangeRate) => {
  return Number(((productcost + productcharges) * exchangeRate).toFixed(2))
}

// Helper function to calculate retail price (40% markup from wholesale)
const calculateRetailPrice = (wholesalePrice) => {
  return Number((wholesalePrice * 1.4).toFixed(2))
}

const products = [
    // StyleCode 1 - Hair Clip Set (3 colors)
    {
      name: 'Crystal Hair Clip Set',
      description: 'Elegant crystal-embellished hair clips, perfect for special occasions',
      productcost: 85.00,  // RMB
      productcharges: 15.00, // RMB
      exchangeRate: 0.19,   // RMB to CAD
      category: 'new',
      stock: 8,
      color: 'Gold',
      material: 'Metal with crystals',
      styleCode: 'HC001',
      sku: 'HC001-GOLD',
      imageUrl: '/images/products/hairclip-gold.jpg',
      additionalImages: [
        '/images/products/hairclip-gold-side.jpg',
        '/images/products/hairclip-gold-detail.jpg'
      ],
      mancode: 'MAN001',
      remarks: 'Premium quality product'
    },
    {
      name: 'Crystal Hair Clip Set',
      description: 'Elegant crystal-embellished hair clips, perfect for special occasions',
      productcost: 85.00,
      productcharges: 15.00,
      exchangeRate: 0.19,
      category: 'new',
      stock: 10,
      color: 'Silver',
      material: 'Metal with crystals',
      styleCode: 'HC001',
      sku: 'HC001-SILV',
      imageUrl: '/images/products/hairclip-silver.jpg',
      additionalImages: [
        '/images/products/hairclip-silver-side.jpg',
        '/images/products/hairclip-silver-detail.jpg'
      ],
      mancode: 'MAN001',
      remarks: 'Premium quality product'
    },
    {
      name: 'Crystal Hair Clip Set',
      description: 'Elegant crystal-embellished hair clips, perfect for special occasions',
      price: 24.99,
      originalPrice: null,
      wholesalePrice: 12.50,
      exchangeRate: 0.19,
      category: 'new',
      stock: 40,
      color: 'Rose Gold',
      material: 'Metal with crystals',
      styleCode: 'HC001',
      sku: 'HC001-ROSE',
      imageUrl: '/images/products/hairclip-rosegold.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
    },
  
    // StyleCode 2 - Silk Scrunchie Set (3 colors)
    {
      name: 'Luxury Silk Scrunchie Set',
      description: 'Set of 3 premium silk scrunchies, gentle on hair',
      productcost: 65.00,
      productcharges: 10.00,
      exchangeRate: 0.19,
      category: 'new',
      stock: 7,
      color: 'Pastel Mix',
      material: '100% Mulberry Silk',
      styleCode: 'SS001',
      sku: 'SS001-PSTL',
      imageUrl: '/images/products/scrunchie-pastel.jpg',
      mancode: 'MAN002',
      remarks: 'Luxury silk collection'
    },
    {
      name: 'Luxury Silk Scrunchie Set',
      description: 'Set of 3 premium silk scrunchies, gentle on hair',
      productcost: 65.00,
      productcharges: 10.00,
      exchangeRate: 0.19,
      category: 'new',
      stock: 6,
      color: 'Jewel Mix',
      material: '100% Mulberry Silk',
      styleCode: 'SS001',
      sku: 'SS001-JEWL',
      imageUrl: '/images/products/scrunchie-jewel.jpg',
      mancode: 'MAN002',
      remarks: 'Luxury silk collection'
    },
    {
      name: 'Luxury Silk Scrunchie Set',
      description: 'Set of 3 premium silk scrunchies, gentle on hair',
      productcost: 65.00,
      productcharges: 10.00,
      exchangeRate: 0.19,
      category: 'new',
      stock: 8,
      color: 'Neutral Mix',
      material: '100% Mulberry Silk',
      styleCode: 'SS001',
      sku: 'SS001-NTRL',
      imageUrl: '/images/products/scrunchie-neutral.jpg',
      mancode: 'MAN002',
      remarks: 'Luxury silk collection'
    },
  
    // Regular Products
    {
      name: 'Pearl Hair Pins Set',
      description: 'Set of 6 delicate pearl hair pins',
      productcost: 55.00,
      productcharges: 8.00,
      exchangeRate: 0.19,
      category: 'regular',
      stock: 9,
      color: 'White Pearl',
      material: 'Freshwater pearls, Metal',
      styleCode: 'HP001',
      sku: 'HP001-WHT',
      imageUrl: '/images/products/hairpins-pearl.jpg',
      mancode: 'MAN003',
      remarks: 'Natural pearls'
    },
    {
      name: 'Velvet Bow Headband',
      description: 'Classic velvet bow headband',
      productcost: 45.00,
      productcharges: 7.00,
      exchangeRate: 0.19,
      category: 'regular',
      stock: 10,
      color: 'Black',
      material: 'Velvet',
      styleCode: 'HB001',
      sku: 'HB001-BLK',
      imageUrl: '/images/products/headband-black.jpg',
      mancode: 'MAN003',
      remarks: 'Classic design'
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
      imageUrl: '/images/products/headband-leather.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
    },
  
    // Clearance Items
    {
      name: 'Summer Collection Scrunchie Pack',
      description: 'Pack of 5 cotton scrunchies in summer colors',
      productcost: 35.00,
      productcharges: 5.00,
      exchangeRate: 0.19,
      category: 'clearance',
      stock: 5,
      color: 'Summer Mix',
      material: 'Cotton',
      styleCode: 'SC001',
      sku: 'SC001-SUM',
      imageUrl: '/images/products/scrunchie-summer.jpg',
      mancode: 'MAN002',
      remarks: 'Last season collection'
    },
    {
      name: 'Floral Hair Clips Set',
      description: 'Set of 4 floral pattern hair clips',
      productcost: 40.00,
      productcharges: 6.00,
      exchangeRate: 0.19,
      category: 'clearance',
      stock: 4,
      color: 'Mixed Floral',
      material: 'Metal, Fabric',
      styleCode: 'HC002',
      sku: 'HC002-FLR',
      imageUrl: '/images/products/clips-floral.jpg',
      mancode: 'MAN001',
      remarks: 'Limited stock'
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
      imageUrl: '/images/products/claw-black.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      ],
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/claw-pearl.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/claw-marble-black.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/claw-marble-rose.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/ribbon-black.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/pins-crystal.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/headband-vintage-navy.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
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
      imageUrl: '/images/products/clips-butterfly.jpg',
      mancode: 'MAN001',
      productcost: 8.50,
      productcharges: 2.00,
      remarks: 'Premium quality product'
    }
  ]
  
  // Process products to add calculated fields
  const processedProducts = products.map(product => {
    const wholesalePrice = calculateWholesalePrice(
      product.productcost,
      product.productcharges,
      product.exchangeRate
    )
    
    return {
      ...product,
      wholesalePrice,
      price: calculateRetailPrice(wholesalePrice),
      originalPrice: product.category === 'clearance' ? calculateRetailPrice(wholesalePrice) * 1.2 : null
    }
  })
  
  // Create Excel-friendly version
  const productsForExcel = processedProducts.map(product => ({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    styleCode: product.styleCode,
    sku: product.sku,
    mancode: product.mancode,
    productcost: product.productcost,
    productcharges: product.productcharges,
    exchangeRate: product.exchangeRate,
    wholesalePrice: product.wholesalePrice,
    imageUrl: product.imageUrl,
    additionalImages: (product.additionalImages || []).join(','),
    color: product.color,
    material: product.material,
    originalPrice: product.originalPrice || '',
    remarks: product.remarks || ''
  }))
  
  // Update the output path and directory creation
  const dataDir = path.join(__dirname, '..', 'data')
  const outputPath = path.join(dataDir, 'sample_products.xlsx')

  // Create data directory if it doesn't exist
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log(`Created directory: ${dataDir}`)
    }

    // Create workbook with column formatting
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(productsForExcel)
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
    
    // Add column headers explanation
    worksheet['!cols'] = [
      { wch: 30 }, // name
      { wch: 50 }, // description
      { wch: 10 }, // price
      { wch: 15 }, // category
      { wch: 10 }, // stock
      { wch: 15 }, // styleCode
      { wch: 15 }, // sku
      { wch: 15 }, // mancode
      { wch: 12 }, // productcost
      { wch: 12 }, // productcharges
      { wch: 12 }, // exchangeRate
      { wch: 12 }, // wholesalePrice
      { wch: 30 }, // imageUrl
      { wch: 50 }, // additionalImages
      { wch: 15 }, // color
      { wch: 15 }, // material
      { wch: 12 }, // originalPrice
      { wch: 30 }  // remarks
    ]
    
    // Write file
    XLSX.writeFile(workbook, outputPath)
    console.log(`Successfully created Excel file at: ${outputPath}`)
    console.log(`Number of products processed: ${productsForExcel.length}`)

  } catch (error) {
    console.error('Error creating Excel file:', error)
  }
  
  // Keep the original export for importProducts.ts
  module.exports = {
    sampleProducts: processedProducts
  } 