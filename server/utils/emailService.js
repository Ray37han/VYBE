import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.default ? nodemailer.default.createTransport({
  service: 'gmail', // or use another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
  },
}) : nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const getOrderConfirmationEmail = (order) => {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.product?.name || 'Product'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.size}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ৳${item.price * item.quantity}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #eee; }
    .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .total { font-size: 18px; font-weight: bold; color: #667eea; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Order Confirmed!</h1>
      <p style="margin: 10px 0 0 0;">Thank you for your order at VYBE</p>
    </div>
    
    <div class="content">
      <p>Hi <strong>${order.shippingAddress?.name}</strong>,</p>
      
      <p>Your order has been successfully placed! We're excited to get your customizable posters ready for you.</p>
      
      <div class="order-details">
        <h2 style="margin-top: 0; color: #667eea;">Order Details</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery'}</p>
        ${order.paymentInfo?.transactionId ? `<p><strong>Transaction ID:</strong> ${order.paymentInfo.transactionId}</p>` : ''}
      </div>
      
      <h3>Order Items</h3>
      <table class="table">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Size</th>
            <th style="padding: 10px; text-align: center;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
            <td style="padding: 10px; text-align: right;">৳${order.pricing?.subtotal}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right;">Shipping:</td>
            <td style="padding: 10px; text-align: right;">৳${order.pricing?.shippingCost || 0}</td>
          </tr>
          <tr class="total">
            <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
            <td style="padding: 10px; text-align: right;">৳${order.pricing?.total}</td>
          </tr>
        </tfoot>
      </table>
      
      <h3>Shipping Address</h3>
      <div class="order-details">
        <p><strong>${order.shippingAddress?.name}</strong></p>
        <p>${order.shippingAddress?.phone}</p>
        <p>${order.shippingAddress?.street}</p>
        <p>${order.shippingAddress?.city}, ${order.shippingAddress?.zipCode || ''}</p>
        <p>${order.shippingAddress?.country || 'Bangladesh'}</p>
      </div>
      
      ${order.paymentMethod === 'bkash' && order.paymentInfo?.status === 'pending' ? `
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Payment Required:</strong> Please complete your bKash payment to confirm your order.</p>
          <p style="margin: 10px 0 0 0;">Send ৳${order.pricing?.total} to <strong>01747809138</strong> and update your transaction ID.</p>
        </div>
      ` : ''}
      
      <p>We'll send you another email when your order ships. If you have any questions, feel free to contact us!</p>
      
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/my-orders" class="button">Track Your Order</a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>VYBE - Customizable Posters</strong></p>
      <p>Thank you for shopping with us!</p>
      <p style="color: #999; margin-top: 10px;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const getOrderStatusUpdateEmail = (order, statusUpdate) => {
  const statusMessages = {
    processing: 'Your order is being processed',
    printing: 'Your customized poster is being printed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #eee; }
    .status-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📦 Order Status Update</h1>
      <p style="margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
    </div>
    
    <div class="content">
      <p>Hi <strong>${order.shippingAddress?.name}</strong>,</p>
      
      <div class="status-box">
        <h2 style="margin: 0 0 10px 0; color: #0284c7;">
          ${statusMessages[statusUpdate.status] || 'Order status updated'}
        </h2>
        ${statusUpdate.note ? `<p style="margin: 0;">${statusUpdate.note}</p>` : ''}
      </div>
      
      ${statusUpdate.trackingNumber ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📍 Tracking Number:</strong> ${statusUpdate.trackingNumber}</p>
        </div>
      ` : ''}
      
      <p><strong>Current Status:</strong> ${statusUpdate.status.charAt(0).toUpperCase() + statusUpdate.status.slice(1)}</p>
      <p><strong>Updated:</strong> ${new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/my-orders" class="button">View Order Details</a>
      </div>
      
      <p>Thank you for your patience!</p>
    </div>
    
    <div class="footer">
      <p><strong>VYBE - Customizable Posters</strong></p>
      <p>Questions? Contact us anytime!</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"VYBE Posters" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Main notification functions
const sendOrderConfirmation = async (order, userEmail) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  const html = getOrderConfirmationEmail(order);
  return sendEmail(userEmail, subject, html);
};

const sendOrderStatusUpdate = async (order, userEmail, statusUpdate) => {
  const subject = `Order Update - ${order.orderNumber}`;
  const html = getOrderStatusUpdateEmail(order, statusUpdate);
  return sendEmail(userEmail, subject, html);
};

export {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendEmail,
};
