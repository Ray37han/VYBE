# 📧 Email and SMS Notification Setup Guide

## Overview
Your VYBE e-commerce platform now includes automatic email and SMS notifications for:
- Order confirmation
- Order status updates
- Payment confirmation

---

## 📧 Email Setup (Gmail)

### Step 1: Create App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Navigate to Security → 2-Step Verification (Enable if not already)

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "VYBE Store"
   - Click "Generate"
   - Copy the 16-character password

### Step 2: Configure .env File

Open `server/.env` and update:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Your 16-character app password (without spaces)
```

### Step 3: Test Email
Emails will be sent automatically when:
- ✅ Customer places an order
- ✅ Admin updates order status
- ✅ Payment is verified

---

## 📱 SMS Setup (Bangladesh)

### Current Status
SMS notifications are **optional** and currently log to console. To enable:

### Option 1: SSL Wireless (Bangladesh)
1. Sign up: https://sslwireless.com/
2. Get API credentials
3. Update `.env`:
```env
SMS_API_URL=https://smsplus.sslwireless.com/api/v3/send-sms
SMS_API_KEY=your-api-key
SMS_SENDER_ID=VYBE
```

### Option 2: BulkSMS BD
1. Sign up: https://bulksmsbd.net/
2. Get API credentials
3. Update `.env` and `utils/smsService.js` API endpoint

### Option 3: Twilio (International)
```bash
npm install twilio
```
Update `smsService.js` to use Twilio API

### Development Mode
SMS messages are currently logged to terminal console. Check terminal output when orders are placed.

---

## 🎨 Email Templates

### Order Confirmation Email
- Beautiful HTML template with VYBE branding
- Order details table
- Shipping address
- Payment information
- Track order button

### Order Status Update Email
- Status change notification
- Tracking number (if provided)
- Admin notes
- Updated timestamp

### Customizing Templates
Edit templates in `server/utils/emailService.js`:
- Modify HTML/CSS
- Change colors (current: purple gradient)
- Add your logo URL
- Update messaging

---

## 🔧 Admin Order Management

### Accessing Admin Panel
1. Login as admin: `admin@vybe.com` / `admin123`
2. Navigate to "Manage Orders" in dashboard

### Features

#### Order List View
- Filter by status (Pending, Processing, Printing, Shipped, Delivered, Cancelled)
- View all order details
- Customer information
- Payment status

#### Order Detail Modal
- Complete order information
- Customer details and shipping address
- Order items with images
- Pricing breakdown

#### Update Order Status
1. Click "View" on any order
2. Select new status from dropdown
3. Optionally add tracking number
4. Add note for customer
5. Click "Update Order Status"
6. ✅ Email & SMS sent automatically

#### Verify Payment
1. Open order detail
2. Enter transaction ID (from bKash)
3. Select payment status (Pending/Completed/Failed/Refunded)
4. Click "Update Payment Status"
5. ✅ Payment confirmation sent

---

## 👥 User Management

### Accessing User Management
Navigate to "Manage Users" in admin dashboard

### Features
- **View All Users**: Complete user list with details
- **Search**: Find users by name or email
- **Filter by Role**: Show only Admins or Users
- **Edit User**: Update name, email, or role
- **Delete User**: Remove user accounts (cannot delete yourself)
- **Role Management**: Promote users to admin or demote to user

### User Statistics
- Total users count
- Number of admins
- Number of customers

---

## 🚀 Testing Notifications

### Test Order Flow
1. **Place Order** (as customer):
   ```
   - Add product to cart
   - Go to checkout
   - Fill shipping info
   - Select payment method
   - Place order
   ```
   ✅ Order confirmation email sent
   ✅ SMS logged to console

2. **Update Order** (as admin):
   ```
   - Go to Manage Orders
   - Click "View" on order
   - Change status to "Processing"
   - Add note: "Your poster is being prepared"
   - Click Update
   ```
   ✅ Status update email sent
   ✅ SMS notification sent

3. **Verify Payment** (as admin):
   ```
   - Open order
   - Enter transaction ID: TXN123456
   - Set status to "Completed"
   - Click Update Payment
   ```
   ✅ Payment confirmed

### Check Terminal Output
Watch backend terminal for:
```
✅ Email sent: <message-id>
📱 SMS NOTIFICATION
──────────────────────────────────────────────────
To: 01747809138
Message: VYBE Order Confirmed! Order #VYBE...
──────────────────────────────────────────────────
```

---

## 📝 Notification Content

### Order Confirmation SMS
```
VYBE Order Confirmed! Order #VYBE1730000001
Total: ৳850
Payment: bKash to 01747809138
Track: http://localhost:3000/my-orders
Thank you for shopping with VYBE!
```

### Order Status Update SMS
```
VYBE Order Update: Your order #VYBE1730000001 has been shipped.
Tracking: TRK123456
Track: http://localhost:3000/my-orders
```

---

## ⚙️ Configuration Files

### Email Service
`server/utils/emailService.js`
- Nodemailer configuration
- Email templates (HTML)
- Send functions

### SMS Service
`server/utils/smsService.js`
- SMS API configuration
- SMS templates
- Console logging for development

### Order Routes
`server/routes/orders.js`
- Triggers notifications on order creation
- Includes user email and phone

### Admin Routes
`server/routes/admin.js`
- Triggers notifications on status updates
- Triggers notifications on payment updates

---

## 🔒 Security Notes

- ✅ Use Gmail App Passwords (never use main password)
- ✅ Keep `.env` file secure and private
- ✅ Never commit credentials to Git
- ✅ Use environment variables in production
- ✅ SMS API keys are sensitive - keep secure

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check `.env` has correct EMAIL_USER and EMAIL_PASS
2. Verify App Password is correct (no spaces)
3. Check terminal for error messages
4. Ensure 2-Step Verification is enabled on Google

### Port Already in Use Error
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
# Restart server
npm run dev
```

### Module Import Errors
- Ensure all files use ES6 import/export syntax
- Check file paths in import statements
- Restart nodemon if needed

---

## 📊 Email Stats & Monitoring

### Check if Emails are Delivered
1. Watch terminal console for:
   ```
   ✅ Email sent: <message-id>
   ```
2. Check your EMAIL_USER inbox for any bounce messages
3. Ask customer to check spam folder if not received

### Email Delivery Tips
- Use verified email domain
- Keep email content clean (avoid spammy words)
- Include unsubscribe option for production
- Consider using transactional email services (SendGrid, Mailgun) for production

---

## 🎯 Production Recommendations

### For Production Deployment:

1. **Email Service**
   - Consider: SendGrid, AWS SES, Mailgun, or Postmark
   - Better deliverability
   - Analytics and tracking
   - Higher sending limits

2. **SMS Service**
   - SSL Wireless for Bangladesh
   - Twilio for international
   - Verify sender ID approval

3. **Environment Variables**
   ```bash
   # Update production .env on server
   EMAIL_USER=noreply@yourdomain.com
   EMAIL_PASS=your-production-api-key
   CLIENT_URL=https://vybe.yourdomain.com
   ```

4. **Error Handling**
   - Log failed notifications
   - Retry failed sends
   - Alert admin of delivery failures

---

## ✅ Features Implemented

- ✅ Complete order management UI
- ✅ User management with role control
- ✅ Payment verification system
- ✅ Email notifications with beautiful templates
- ✅ SMS notifications with console logging
- ✅ Order status tracking
- ✅ Automatic notifications on status updates
- ✅ Transaction ID verification
- ✅ Admin notes for customers

---

## 📞 Support

For issues or questions:
- Check terminal logs
- Review `.env` configuration
- Test with sample order
- Verify email credentials

---

**Happy Selling! 🎉**
