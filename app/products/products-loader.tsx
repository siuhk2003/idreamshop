import { prisma } from '@/lib/prisma'

export async function ProductsLoader({ category }: { category: string }) {
  const products = await prisma.product.findMany({
    where: category === 'all' ? {} : { category },
    orderBy: { createdAt: 'desc' }
  })

  return products
} 