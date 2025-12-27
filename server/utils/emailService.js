import { sendEmail } from './emailVerification.js';

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
      
      <p>Your order has been successfully placed! We're excited to get your ${order.hasCustomItems ? 'custom' : 'customizable'} posters ready for you.</p>
      
      ${order.hasCustomItems ? `
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>🎨 Custom Order Notice:</strong> Your order contains custom items that require admin review for quality assurance.</p>
          <p style="margin: 10px 0 0 0;">Our team will review your custom design within 24 hours. You'll receive an email once your order is approved and moves to production!</p>
        </div>
      ` : ''}
      
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

// Send email wrapper function
const sendEmailWrapper = async (to, subject, html) => {
  try {
    const result = await sendEmail({
      from: process.env.RESEND_FROM || 'VYBE Posters <no-reply@vybebd.store>',
      to,
      subject,
      html,
    });
    
    if (result.success) {
      console.log('✅ Email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Email sending failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Main notification functions
const sendOrderConfirmation = async (order, userEmail) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  const html = getOrderConfirmationEmail(order);
  return sendEmailWrapper(userEmail, subject, html);
};

const sendOrderStatusUpdate = async (order, userEmail, statusUpdate) => {
  const subject = `Order Update - ${order.orderNumber}`;
  const html = getOrderStatusUpdateEmail(order, statusUpdate);
  return sendEmailWrapper(userEmail, subject, html);
};

const getCustomOrderRejectionEmail = (user, order, rejectionReason) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #eee; }
    .rejection-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚠️ Custom Order Requires Revision</h1>
      <p style="margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
    </div>
    
    <div class="content">
      <p>Hi <strong>${user.name || 'valued customer'}</strong>,</p>
      
      <p>Thank you for your custom poster order. Unfortunately, we're unable to proceed with your order as submitted due to quality requirements.</p>
      
      <div class="rejection-box">
        <h2 style="margin: 0 0 10px 0; color: #991b1b;">❌ Reason for Rejection:</h2>
        <p style="margin: 0; font-size: 16px;"><strong>${rejectionReason}</strong></p>
      </div>
      
      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0284c7;">📋 Order Details:</h3>
        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}</p>
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> ৳${order.pricing?.total || 0}</p>
      </div>
      
      <h3>What Happens Next?</h3>
      <ul>
        <li><strong>No charges applied:</strong> Your payment has not been processed and no money has been deducted.</li>
        <li><strong>Resubmit your order:</strong> You can create a new custom order with the corrected requirements.</li>
        <li><strong>Contact support:</strong> If you have questions, our team is here to help!</li>
      </ul>
      
      <h3>Tips for Resubmission:</h3>
      <ul>
        <li>Ensure your image has <strong>at least 300 DPI</strong> resolution for the selected poster size</li>
        <li>Upload high-quality images (minimum 2000x2000 pixels recommended)</li>
        <li>Avoid heavily compressed or low-resolution images from social media</li>
        <li>Check that your text is clearly readable and properly positioned</li>
        <li>Review all customization details before submitting</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/customize" class="button">Create New Custom Order</a>
      </div>
      
      <p>We apologize for any inconvenience and look forward to helping you create the perfect custom poster!</p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📧 Support Email:</strong> support@vybe.com</p>
        <p style="margin: 5px 0 0 0;"><strong>📱 WhatsApp:</strong> +880 1747809138</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>VYBE - Customizable Posters</strong></p>
      <p>Quality prints, every time!</p>
      <p style="color: #999; margin-top: 10px;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send custom order rejection email
const sendCustomOrderRejectionEmail = async (user, order, rejectionReason) => {
  const subject = `Custom Order Revision Required - ${order.orderNumber}`;
  const html = getCustomOrderRejectionEmail(user, order, rejectionReason);
  return sendEmailWrapper(user.email, subject, html);
};

export {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendEmailWrapper as sendEmail,
  sendCustomOrderRejectionEmail,
};
