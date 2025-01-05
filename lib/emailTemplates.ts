export function getOrderConfirmationEmail(order: {
  orderNumber: string
  items: Array<{
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    apartment?: string
    city: string
    province: string
    postalCode: string
    phone: string
  }
  subtotal: number
  gst: number
  pst: number
  total: number
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
      <p>Dear ${order.shippingInfo.firstName} ${order.shippingInfo.lastName},</p>
      <p>Thank you for your order! Here are your order details:</p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Order #${order.orderNumber}</h2>
        
        <h3 style="color: #666;">Items Ordered:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: right; padding: 8px;">Quantity</th>
            <th style="text-align: right; padding: 8px;">Price</th>
          </tr>
          ${order.items.map(item => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px;">${item.product.name}</td>
              <td style="text-align: right; padding: 8px;">${item.quantity}</td>
              <td style="text-align: right; padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
          <p>GST (5%): $${order.gst.toFixed(2)}</p>
          <p>PST (7%): $${order.pst.toFixed(2)}</p>
          <p style="font-weight: bold; font-size: 1.2em;">Total: $${order.total.toFixed(2)}</p>
        </div>
      </div>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9;">
        <h3 style="color: #666;">Shipping Address:</h3>
        <p>
          ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}<br>
          ${order.shippingInfo.address}
          ${order.shippingInfo.apartment ? `<br>${order.shippingInfo.apartment}` : ''}<br>
          ${order.shippingInfo.city}, ${order.shippingInfo.province}<br>
          ${order.shippingInfo.postalCode}<br>
          Phone: ${order.shippingInfo.phone}
        </p>
      </div>
      
      <p>We'll notify you when your order has been shipped.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <div style="margin-top: 40px; text-align: center; color: #666;">
        <p>Thank you for shopping with us!</p>
      </div>
    </div>
  `
} 