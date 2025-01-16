const { PrismaClient: PrismaDb } = require('@prisma/client')
const { sampleProducts } = require('./createSampleProducts.ts')

const db = new PrismaDb()

async function importProducts() {
  try {
    console.log('Starting product import...')
    
    for (const product of sampleProducts) {
      await db.product.create({
        data: product
      })
    }

    console.log('Product import completed successfully')
  } catch (error) {
    console.error('Error importing products:', error)
  } finally {
    await db.$disconnect()
  }
}

importProducts() 