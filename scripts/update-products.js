const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx-js-style')
const prisma = new PrismaClient()

async function updateProducts() {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('data/product-updates.xlsx')
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log(`Found ${data.length} products to update`)

    // Track results
    const results = {
      success: 0,
      failed: 0,
      notFound: 0
    }

    // Process each row
    for (const row of data) {
      try {
        // Skip if no SKU
        if (!row.sku) {
          console.log('Skipping row: No SKU provided')
          continue
        }

        // Find and update the product
        const product = await prisma.product.findUnique({
          where: { sku: row.sku }
        })

        if (!product) {
          console.log(`Product not found: ${row.sku}`)
          results.notFound++
          continue
        }

        // Update the product
        await prisma.product.update({
          where: { sku: row.sku },
          data: {
            wholesaleCo: row.wholesaleCo || null,
            producttype: row.producttype || null,
            display: row.display || 'Yes'
          }
        })

        console.log(`Updated product: ${row.sku}`)
        results.success++

      } catch (error) {
        console.error(`Error updating product ${row.sku}:`, error)
        results.failed++
      }
    }

    // Print results
    console.log('\nUpdate Results:')
    console.log(`Successfully updated: ${results.success}`)
    console.log(`Failed to update: ${results.failed}`)
    console.log(`Products not found: ${results.notFound}`)

  } catch (error) {
    console.error('Script error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateProducts() 