import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { paymentIntentId: string } }
) {
  try {
    const { paymentIntentId } = await params
    
    const order = await prisma.order.findFirst({
      where: {
        paymentIntentId
      }
    })

    return NextResponse.json({ exists: !!order })
  } catch (error) {
    return NextResponse.json({ exists: false })
  }
} 