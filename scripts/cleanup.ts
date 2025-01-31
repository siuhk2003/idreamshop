import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function cleanup() {
  try {
    console.log('Starting database cleanup...')

    // Delete in correct order to respect foreign key constraints
    console.log('Deleting status history...')
    await prisma.statusHistory.deleteMany()
    
    console.log('Deleting order items...')
    await prisma.orderItem.deleteMany()
    
    console.log('Deleting shipping info...')
    await prisma.shippingInfo.deleteMany()
    
    console.log('Deleting orders...')
    await prisma.order.deleteMany()
    
    console.log('Deleting cart items...')
    await prisma.cartItem.deleteMany()
    
    console.log('Deleting carts...')
    await prisma.cart.deleteMany()
    
    console.log('Deleting products...')
    await prisma.product.deleteMany()
    
    console.log('Deleting shipping rates...')
    await prisma.shippingRate.deleteMany()
    
    console.log('Deleting discount codes...')
    await prisma.discountCode.deleteMany()
    
    console.log('Deleting members...')
    await prisma.member.deleteMany()
    
    console.log('Deleting verification tokens...')
    await prisma.verificationToken.deleteMany()
    
    console.log('Deleting password reset tokens...')
    await prisma.passwordResetToken.deleteMany()
    
    console.log('Deleting reactivation tokens...')
    await prisma.reactivationToken.deleteMany()

    console.log('Database cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup() 