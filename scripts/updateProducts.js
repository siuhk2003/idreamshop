const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProducts() {
  try {
    // Get all products with explicit select to avoid type issues
    const products = await prisma.product.findMany({
      select: {
        id: true,
        styleCode: true,
        sku: true,
        color: true
      }
    })
    console.log(`Found ${products.length} total products`)

    let updatedCount = 0
    
    // Process in smaller batches to avoid timeout
    const batchSize = 10
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      await prisma.$transaction(async (tx) => {
        for (const product of batch) {
          const styleCode = `STYLE-${product.id.slice(0, 8)}`
          const sku = `SKU-${product.id.slice(0, 12)}`

          try {
            await tx.product.update({
              where: { id: product.id },
              data: {
                styleCode: styleCode,
                sku: sku,
                color: product.color || 'Default'
              }
            })
            updatedCount++
            console.log(`Updated product ${product.id} with SKU: ${sku}`)
          } catch (updateError) {
            console.error(`Failed to update product ${product.id}:`, updateError)
          }
        }
      })
      
      console.log(`Processed batch ${i/batchSize + 1}`)
    }

    console.log(`Successfully updated ${updatedCount} products`)

  } catch (error) {
    console.error('Error in update process:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProducts() 