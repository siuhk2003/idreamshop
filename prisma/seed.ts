import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createProduct = (
  sku: string,
  styleCode: string,
  name: string,
  price: number,
  category: string,
  color: string,
  material: string,
  originalPrice?: number
) => ({
  sku,
  styleCode,
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
  const newProducts = [
    createProduct(
      "NC001-45645464",
      "CLIP-002",
      "Crystal Hair Clip",
      24.99,
      "new",
      "Silver",
      "Metal, Crystal",
      10
    ),
    // ... update other product creations similarly
  ]

  for (const product of newProducts) {
    await prisma.product.create({
      data: product,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

