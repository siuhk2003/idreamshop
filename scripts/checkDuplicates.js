const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAndFixDuplicates() {
  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true
      }
    })

    // Find duplicates
    const skuMap = new Map()
    const duplicates = []

    products.forEach(product => {
      if (product.sku) {
        if (skuMap.has(product.sku)) {
          duplicates.push(product)
        } else {
          skuMap.set(product.sku, product.id)
        }
      }
    })

    console.log(`Found ${duplicates.length} products with duplicate SKUs`)

    // Fix duplicates
    for (const product of duplicates) {
      const newSku = `SKU-${product.id}`
      await prisma.product.update({
        where: { id: product.id },
        data: { sku: newSku }
      })
      console.log(`Updated product ${product.id} with new SKU: ${newSku}`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndFixDuplicates() 