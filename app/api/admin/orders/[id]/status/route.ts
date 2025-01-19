import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params
    const { id } = await Promise.resolve(context.params)
    const { status } = await request.json()

    // Get the current order to check payment method and status
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        shippingInfo: true
      }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    })

    // Only send email for e-transfer orders being confirmed
    if (status === 'CONFIRMED' && currentOrder.paymentMethod === 'etransfer') {
      try {
        await sendEmail({
          to: currentOrder.shippingInfo.email,
          subject: `Payment Confirmed for Order #${currentOrder.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Payment Confirmed</h1>
              <p>Dear ${currentOrder.shippingInfo.firstName},</p>
              <p>We have received and confirmed your e-transfer payment for order #${currentOrder.orderNumber}.</p>
              <p>We will notify you once your order has been shipped.</p>
              <p>Thank you for shopping with us!</p>
              <br>
              <p>iDream</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json({ 
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
} 