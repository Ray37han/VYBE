# 🔥 Firebase Setup - Phone OTP (2 Minutes)

The OTP feature requires Firebase configuration. Follow these steps:

---

## 📱 What You're Setting Up

- **Frontend**: Firebase client SDK for sending OTP to phones
- **Backend**: Firebase Admin SDK for verifying OTP tokens

---

## ⚡ Quick Setup (Step by Step)

### **Step 1: Create Firebase Project** (30 seconds)

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it `vybe-ecommerce` (or any name)
4. Continue through setup (disable Google Analytics if you want faster setup)
5. Click **"Create project"**

---

### **Step 2: Enable Phone Authentication** (30 seconds)

1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get Started"**
3. Go to **"Sign-in method"** tab at the top
4. Find **"Phone"** in the providers list
5. Click **"Enable"** toggle switch
6. Click **"Save"**

---

### **Step 3: Get Frontend Config** (30 seconds)

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** `</>`
5. Register app with nickname `vybe-client`
6. Copy the `firebaseConfig` object values

**Example config you'll see:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijk",
  authDomain: "vybe-123456.firebaseapp.com",
  projectId: "vybe-123456",
  storageBucket: "vybe-123456.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234"
};
```

---

### **Step 4: Add Frontend Config to .env** (30 seconds)

Open `client/.env` and update these lines with your actual values:

```bash
# Replace these placeholder values with your actual Firebase config
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijk
VITE_FIREBASE_AUTH_DOMAIN=vybe-123456.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vybe-123456
VITE_FIREBASE_STORAGE_BUCKET=vybe-123456.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcd1234
```

---

### **Step 5: Get Backend Service Account** (30 seconds)

1. Still in **Project Settings** (gear icon)
2. Go to **"Service accounts"** tab at the top
3. Click **"Generate new private key"** button
4. Click **"Generate key"** in the popup
5. A JSON file will download - **keep it safe!**

---

### **Step 6: Add Backend Config to .env** (30 seconds)

**Option A: Use JSON file path (easier)**

1. Move the downloaded JSON file to: `server/config/firebase-service-account.json`
2. Open `server/.env` and add:

```bash
# Firebase Admin SDK - Service Account
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

**Option B: Use environment variable (more secure)**

1. Open the downloaded JSON file
2. Copy the entire contents (it's one long line)
3. Open `server/.env` and add:

```bash
# Firebase Admin SDK - Service Account Key (single line JSON)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"vybe-123456",...}'
```

---

### **Step 7: Restart Servers** (10 seconds)

Stop both servers (Ctrl+C in terminals) and restart:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

You should see:
```
✅ Firebase Admin initialized with service account
```

---

## 🧪 Test OTP Flow

1. Open http://localhost:3001
2. Add a product to cart or click "Buy Now"
3. Fill checkout form with a **real Bangladesh phone number** (you need to receive SMS)
4. Click "Place Order"
5. Enter your phone: `01712345678` (or your real number)
6. Click "Send OTP"
7. Check your phone for SMS with 6-digit code
8. Enter the code
9. Click "Verify"

**Expected Flow:**
- SMS arrives within 10 seconds
- OTP is 6 digits
- Verification succeeds
- Order is created in database

---

## 🚨 Common Issues

### "Firebase not configured" error
- Check `.env` files have actual values, not placeholders
- Restart both servers after updating `.env`

### "Invalid phone number" error
- Use Bangladesh format: `01712345678`
- Or with country code: `+8801712345678`

### "reCAPTCHA error"
- Add `localhost` to authorized domains in Firebase Console:
  - Go to Authentication > Settings > Authorized domains
  - `localhost` should be listed by default

### "Service account not found" (Backend)
- Check the JSON file path is correct
- Or check the environment variable has the full JSON content
- Make sure there are no line breaks in the JSON string

---

## 💰 Firebase Pricing (Free Tier Limits)

**Phone Authentication:**
- First 10,000 verifications/month: **FREE**
- After that: $0.06 per verification
- Perfect for testing and small-scale launch

**For 100 orders/day:**
- ~3,000 orders/month
- Cost: **$0** (well within free tier)

**When you need to upgrade:**
- If you hit 10,000+ orders/month
- Upgrade to Firebase Blaze plan (pay-as-you-go)
- Still very affordable for e-commerce

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Phone authentication enabled
- [ ] Frontend config added to `client/.env`
- [ ] Backend service account added to `server/.env`
- [ ] Both servers restarted
- [ ] Test with real phone number successful
- [ ] OTP received and verified
- [ ] Order created in database

---

## 🎯 Next Steps After Setup

1. **Test thoroughly** with different phone numbers
2. **Test error cases**: wrong OTP, expired OTP, network errors
3. **Monitor Firebase Console** > Authentication > Users to see verified phones
4. **Check MongoDB** to see orders with `phoneVerified: true`
5. **When ready**: Deploy to production (see DEPLOY_LIVE_WEBSITE.md)

---

## 📚 Additional Resources

- **Frontend Firebase Config**: `client/src/firebase.js`
- **Backend Firebase Config**: `server/config/firebase-admin.js`
- **Error Handling Guide**: `client/src/utils/firebaseErrors.js`
- **Full Documentation**: `docs/features/FIREBASE_PHONE_AUTH_GUIDE.md`

---

**Estimated Setup Time**: 2-5 minutes
**Cost**: $0 (free tier covers testing and initial launch)
**Difficulty**: Easy - just copy/paste config values

**Need Help?** Open an issue with the error message and we'll help troubleshoot!
