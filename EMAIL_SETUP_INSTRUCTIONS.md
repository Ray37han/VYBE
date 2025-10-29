# 📧 Email OTP Setup Instructions

## ⚠️ IMPORTANT: Configure Email Before Testing Login

The OTP authentication system is **fully implemented** but requires email credentials to send verification codes.

---

## 🚀 Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)

### Step 2: Generate App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Select **"Mail"** and your device
3. Click **Generate**
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update `.env` File
Open `server/.env` and update:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=abcdefghijklmnop  # Remove spaces from app password
EMAIL_FROM_NAME=VYBE
```

### Step 4: Restart Backend
```bash
# Kill and restart server
cd server
npm start
```

---

## ✅ Test the OTP Flow

1. **Go to Login Page**: http://localhost:3001/login

2. **Enter Credentials**:
   - Email: (registered user email)
   - Password: (user password)

3. **Check Email**:
   - Look for email from VYBE
   - Subject: "Your VYBE Verification Code"
   - Code expires in 5 minutes

4. **Enter 6-Digit Code**:
   - Copy code from email
   - Paste into OTP field
   - Click "Verify & Login"

5. **Success!** 🎉
   - You're now logged in with 2FA

---

## 🔧 Alternative: Temporary Disable OTP

If you want to test without email setup, you can temporarily disable OTP:

**Edit `server/routes/auth.js`** - Line ~20:

```javascript
// TEMPORARY: Skip OTP for testing
const SKIP_OTP_FOR_TESTING = true; // Change to false when email is configured

router.post('/login', async (req, res) => {
  // ... existing code ...
  
  // Add this check before sending OTP
  if (SKIP_OTP_FOR_TESTING) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token);
    return res.json({
      success: true,
      message: 'Login successful (OTP skipped for testing)',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  }
  
  // ... rest of OTP code ...
});
```

---

## 📱 Current Status

### ✅ Implemented:
- Two-step email verification login
- Secure 6-digit OTP generation
- Beautiful HTML email template
- Animated UI with countdown timer
- Resend code functionality
- 5-minute code expiration

### ⏳ Pending:
- Email credentials configuration (YOU need to do this)
- Testing with real email service

---

## 🆘 Troubleshooting

### Gmail App Password Not Working?
- Make sure 2FA is enabled first
- Remove spaces from app password
- Use lowercase letters only
- Try generating a new app password

### Emails Not Sending?
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASS are correct
- Restart backend server after .env changes
- Check terminal for error messages

### Port Already in Use?
```bash
# Kill processes on ports
lsof -ti:5001 | xargs kill -9  # Backend
lsof -ti:3001 | xargs kill -9  # Frontend
```

---

## 🎯 Production Recommendation

For production, use **SendGrid** instead of Gmail:

1. Create account: https://sendgrid.com/
2. Get API key from Settings → API Keys
3. Verify sender email
4. Update `.env`:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
   EMAIL_USER=noreply@yourdomain.com
   EMAIL_FROM_NAME=VYBE
   ```

SendGrid offers:
- ✅ 100 free emails/day
- ✅ Better deliverability
- ✅ Email analytics
- ✅ Professional service

---

## 📍 Current URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **Login Page**: http://localhost:3001/login
- **API Test**: http://localhost:5001/api/health

---

**Last Updated**: October 30, 2025
**Status**: Servers Running ✅ | Email Configuration Needed ⏳
