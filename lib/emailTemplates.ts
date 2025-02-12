export const getOrderConfirmationEmail = (order: any) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Order Confirmation</h1>
    
    <p>Dear ${order.shippingInfo.firstName} ${order.shippingInfo.lastName},</p>
    
    <p>Thank you for your order! Here are your order details:</p>
    
    <p style="font-weight: bold;">Order #${order.orderNumber}</p>
    
    <h3>Items Ordered:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr style="border-bottom: 1px solid #eee;">
        <th style="text-align: left; padding: 8px;">Item</th>
        <th style="text-align: center; padding: 8px;">Quantity</th>
        <th style="text-align: right; padding: 8px;">Price</th>
      </tr>
      ${order.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">${item.product.name}</td>
          <td style="text-align: center; padding: 8px;">${item.quantity}</td>
          <td style="text-align: right; padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>

    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Subtotal:</span>
        <span>$${order.subtotal.toFixed(2)}</span>
      </div>
      
      ${order.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #16a34a;">
          <span>Discount:</span>
          <span>-$${order.discount.toFixed(2)}</span>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Shipping:</span>
        <span>$${order.shippingCost.toFixed(2)}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; border-top: 1px solid #eee; padding-top: 5px;">
        <span>Total Before Tax:</span>
        <span>$${order.totalBeforeTax.toFixed(2)}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>GST (5%):</span>
        <span>$${order.gst.toFixed(2)}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>PST (7%):</span>
        <span>$${order.pst.toFixed(2)}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #eee; padding-top: 5px;">
        <span>Total:</span>
        <span>$${order.total.toFixed(2)}</span>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3>Shipping Address:</h3>
      <p style="margin: 0;">
        ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}<br>
        ${order.shippingInfo.address}
        ${order.shippingInfo.apartment ? `<br>Unit ${order.shippingInfo.apartment}` : ''}<br>
        ${order.shippingInfo.city}, ${order.shippingInfo.province}<br>
        ${order.shippingInfo.postalCode}<br>
        Phone: ${order.shippingInfo.phone}
      </p>
    </div>

    <p>We'll notify you when your order has been shipped.</p>
    
    <p>Thank you for shopping with us!</p>
  </div>
` 