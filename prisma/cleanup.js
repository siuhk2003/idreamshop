const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanup() {
  try {
    console.log('Starting cleanup...')

    // Delete in correct order to respect foreign key constraints
    await prisma.statusHistory.deleteMany({})
    console.log('Deleted all status history entries')

    await prisma.orderItem.deleteMany({})
    console.log('Deleted all order items')

    await prisma.shippingInfo.deleteMany({})
    console.log('Deleted all shipping info')

    await prisma.order.deleteMany({})
    console.log('Deleted all orders')

    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup() 