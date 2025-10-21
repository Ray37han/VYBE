import axios from 'axios';

// SMS service configuration
// Using a generic SMS API - you can replace with your preferred provider
// Options: BulkSMS BD, SSL Wireless, Twilio, etc.

const sendSMS = async (phone, message) => {
  try {
    // Check if SMS credentials are configured
    if (!process.env.SMS_API_KEY || !process.env.SMS_SENDER_ID) {
      console.warn('⚠️ SMS not configured. Skipping SMS notification.');
      return { success: false, error: 'SMS not configured' };
    }

    // Format phone number (remove spaces, ensure Bangladesh format)
    const formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '+880');

    // Example using SSL Wireless (Bangladesh)
    // Replace with your SMS provider's API
    const response = await axios.post(
      process.env.SMS_API_URL || 'https://smsapi.example.com/send',
      {
        api_token: process.env.SMS_API_KEY,
        sid: process.env.SMS_SENDER_ID,
        msisdn: formattedPhone,
        sms: message,
        csms_id: Date.now().toString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SMS sent to:', phone);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// SMS templates
const getOrderConfirmationSMS = (order) => {
  return `VYBE Order Confirmed! Order #${order.orderNumber}
Total: ৳${order.pricing?.total}
${order.paymentMethod === 'bkash' ? `Payment: bKash to 01747809138` : 'Payment: Cash on Delivery'}
Track: ${process.env.CLIENT_URL || 'http://localhost:3000'}/my-orders
Thank you for shopping with VYBE!`;
};

const getOrderStatusUpdateSMS = (order, status) => {
  const statusMessages = {
    processing: 'is being processed',
    printing: 'is being printed',
    shipped: 'has been shipped',
    delivered: 'has been delivered',
    cancelled: 'has been cancelled',
  };

  return `VYBE Order Update: Your order #${order.orderNumber} ${statusMessages[status] || 'status updated'}.
Track: ${process.env.CLIENT_URL || 'http://localhost:3000'}/my-orders`;
};

// Main notification functions
const sendOrderConfirmationSMS = async (order, phone) => {
  const message = getOrderConfirmationSMS(order);
  return sendSMS(phone, message);
};

const sendOrderStatusUpdateSMS = async (order, phone, status) => {
  const message = getOrderStatusUpdateSMS(order, status);
  return sendSMS(phone, message);
};

// Alternative: Log SMS to console in development
const logSMS = (phone, message) => {
  console.log('\n📱 SMS NOTIFICATION');
  console.log('─'.repeat(50));
  console.log('To:', phone);
  console.log('Message:');
  console.log(message);
  console.log('─'.repeat(50) + '\n');
};

export {
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS,
  sendSMS,
  logSMS,
};
