import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to create a product
const createProduct = (
  name: string,
  price: number,
  category: string,
  color: string,
  material: string,
  originalPrice?: number
) => ({
  name,
  description: `Beautiful ${name.toLowerCase()} perfect for any occasion`,
  price,
  originalPrice,
  imageUrl: `/placeholder.svg?height=200&width=200&text=${name.replace(/ /g, '+')}`,
  category,
  stock: Math.floor(Math.random() * 50) + 10,
  color,
  material
})

async function main() {
  console.log('Starting database seed...')
  
  // Clear existing products
  console.log('Deleting existing products...')
  await prisma.product.deleteMany()

  // New Arrivals
  const newProducts = [
    createProduct("Crystal Hair Clip", 24.99, "new", "Silver", "Metal, Crystal"),
    createProduct("Pearl Headband", 29.99, "new", "White", "Pearl, Fabric"),
    createProduct("Butterfly Barrette", 19.99, "new", "Gold", "Metal, Enamel"),
    createProduct("Floral Hair Pins Set", 34.99, "new", "Multi", "Metal, Ceramic"),
    createProduct("Diamond Hair Comb", 39.99, "new", "Silver", "Metal, Crystal")
  ]

  // Regular Products
  const regularProducts = [
    createProduct("Silk Scrunchie Set", 19.99, "regular", "Multi", "Silk"),
    createProduct("Basic Bobby Pins", 9.99, "regular", "Black", "Metal"),
    createProduct("Elastic Hair Ties", 14.99, "regular", "Multi", "Elastic"),
    createProduct("Classic Headband", 16.99, "regular", "Black", "Fabric"),
    createProduct("Metal Hair Clips", 12.99, "regular", "Silver", "Metal")
  ]

  // Clearance Products (with original prices)
  const clearanceProducts = [
    createProduct("Vintage Hair Clip", 8.99, "clearance", "Bronze", "Metal", 17.99),
    createProduct("Summer Scrunchies", 5.99, "clearance", "Multi", "Cotton", 12.99),
    createProduct("Basic Hairband", 4.99, "clearance", "Brown", "Plastic", 9.99),
    createProduct("Kids Hair Clips", 6.99, "clearance", "Multi", "Plastic", 13.99),
    createProduct("Simple Hair Pins", 3.99, "clearance", "Silver", "Metal", 8.99)
  ]

  // Combine all products
  const allProducts = [...newProducts, ...regularProducts, ...clearanceProducts]

  // Create products first
  console.log('Creating new products...')
  const products = await prisma.product.createMany({
    data: allProducts
  })

  // Get first product ID for test order
  const firstProduct = await prisma.product.findFirst()
  
  if (!firstProduct) {
    throw new Error('No products found to create test order')
  }

  // Create a test order with valid product ID
  const order = await prisma.order.create({
    data: {
      orderNumber: 'TEST-001',
      status: 'PROCESSING',
      subtotal: 100,
      gst: 5,
      pst: 7,
      total: 112,
      items: {
        create: [
          {
            productId: firstProduct.id, // Use actual product ID
            quantity: 1,
            price: 100
          }
        ]
      },
      shippingInfo: {
        create: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          address: '123 Test St',
          city: 'Test City',
          province: 'Test Province',
          postalCode: '12345',
          country: 'Test Country',
          phone: '123-456-7890'
        }
      },
      statusHistory: {
        create: {
          status: 'PROCESSING',
          notes: 'Test order created'
        }
      }
    }
  })

  console.log('Created test order:', order)
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 