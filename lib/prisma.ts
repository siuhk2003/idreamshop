import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 

// Add this function to check database integrity
export async function checkDatabaseIntegrity() {
  const orphanedItems = await prisma.orderItem.findMany({
    where: {
      OR: [
        {
          product: null
        },
        {
          order: null
        }
      ]
    }
  })

  if (orphanedItems.length > 0) {
    console.error(`Found ${orphanedItems.length} orphaned OrderItems`)
    // Optionally clean up orphaned items
    await prisma.orderItem.deleteMany({
      where: {
        id: {
          in: orphanedItems.map(item => item.id)
        }
      }
    })
  }
} 