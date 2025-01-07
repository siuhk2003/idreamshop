const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetDatabase() {
  try {
    // Delete all records in reverse order of dependencies
    await prisma.passwordResetToken.deleteMany({})
    await prisma.verificationToken.deleteMany({})
    await prisma.statusHistory.deleteMany({})
    await prisma.orderItem.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.shippingInfo.deleteMany({})
    await prisma.cartItem.deleteMany({})
    await prisma.cart.deleteMany({})
    await prisma.member.deleteMany({})

    console.log('Database reset successful (Products table preserved)')
  } catch (error) {
    console.error('Error resetting database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase() 