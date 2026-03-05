# 🔧 OTP Troubleshooting Guide

## ❌ Error: "Failed to send OTP please try again"

Follow these steps in order:

---

## ✅ Step 1: Enable Phone Authentication (MOST COMMON)

**This is the #1 reason OTP fails!**

1. Go to: https://console.firebase.google.com/project/vybe-web-e7c35/authentication/providers

2. Look for **"Phone"** in the list of sign-in providers

3. Check if it says **"Disabled"** (gray) or **"Enabled"** (green)

4. If disabled, click on it:
   - Toggle the **"Enable"** switch
   - Click **"Save"**

5. Refresh your checkout page and try again

---

## ✅ Step 2: Check Browser Console for Actual Error

**Open Browser Developer Tools:**
- Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac)
- Firefox: Press `F12` or `Cmd+Shift+I` (Mac)
- Safari: Enable Developer menu first, then `Cmd+Option+C`

**Look for error messages:**
- Click the "Console" tab
- Look for red errors starting with `auth/...`
- Common errors:
  - `auth/project-not-whitelisted` → Phone auth not enabled
  - `auth/invalid-phone-number` → Wrong phone format
  - `auth/too-many-requests` → Try again later
  - `auth/captcha-check-failed` → reCAPTCHA issue

**Copy the exact error and search below for solution**

---

## 🔍 Common Errors & Solutions

### Error: `auth/project-not-whitelisted`
**Cause:** Phone authentication is not enabled in Firebase Console

**Solution:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Phone" provider
3. Save changes
4. Try again

---

### Error: `auth/invalid-phone-number`
**Cause:** Phone number format is incorrect

**Solution:**
Use one of these formats:
- `+8801712345678` ✅ (with country code)
- `01712345678` ✅ (will auto-add +880)
- `8801712345678` ✅ (will auto-add +)

**DON'T use:**
- `1712345678` ❌ (missing leading 0)
- `+880 171 234 5678` ❌ (spaces will be removed automatically, this is OK actually)

---

### Error: `auth/too-many-requests`
**Cause:** Too many OTP requests to the same number in short time

**Solution:**
1. Wait 15 minutes
2. Or use a different phone number
3. Firebase has rate limits to prevent abuse

---

### Error: `auth/quota-exceeded`
**Cause:** Exceeded Firebase free tier SMS quota (10,000/month)

**Solution:**
1. Check Firebase Console → Usage tab
2. If exceeded, upgrade to Blaze (pay-as-you-go) plan
3. Or wait until next month

---

### Error: `auth/captcha-check-failed`
**Cause:** reCAPTCHA verification failed

**Solution:**
1. Clear browser cache
2. Try in incognito/private mode
3. Check if you have ad blockers disabling reCAPTCHA
4. Try a different browser
5. Make sure `localhost` is in Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Should see `localhost` in the list

---

### Error: reCAPTCHA container not found
**Cause:** Missing reCAPTCHA div element

**Solution:**
Check if this exists in checkout page:
```html
<div id="recaptcha-container"></div>
```

---

## ✅ Step 3: Test Phone Number Format

**Try these phone numbers:**
1. `+8801712345678` (Grameenphone)
2. `01712345678` (without country code)
3. Replace with YOUR actual Bangladesh number

**Make sure:**
- It's a real Bangladesh mobile number
- You have access to receive SMS on this number
- It starts with 013, 015, 016, 017, 018, or 019

---

## ✅ Step 4: Check Network/Firewall

**Possible blocks:**
- Corporate firewall blocking Firebase
- VPN interfering with Google services
- Ad blocker blocking reCAPTCHA

**Solution:**
1. Disable VPN temporarily
2. Disable ad blockers
3. Try from a different network (mobile hotspot)

---

## ✅ Step 5: Verify Firebase Config

**Check frontend config (.env):**
```bash
cat client/.env | grep FIREBASE
```

**Should show:**
```
VITE_FIREBASE_API_KEY=AIzaSyDMDrNvStEkkrFukdNZ2-AtqF2ITHe4CuI
VITE_FIREBASE_AUTH_DOMAIN=vybe-web-e7c35.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vybe-web-e7c35
VITE_FIREBASE_STORAGE_BUCKET=vybe-web-e7c35.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=576126744036
VITE_FIREBASE_APP_ID=1:576126744036:web:c837265dfda65d596383f1
```

**If any value says "your-...", restart frontend:**
```bash
cd client
npm run dev
```

---

## ✅ Step 6: Check if Servers are Running

**Check backend:**
```bash
curl http://localhost:5001/api/health
```

**Should return:** `{"status":"ok"}`

**Check frontend:**
Open: http://localhost:3002

**Should load the website**

**If not running:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## ✅ Step 7: Test with Different Phone

**Try these carriers:**
- Grameenphone: `017XXXXXXXX`
- Robi: `018XXXXXXXX`
- Banglalink: `019XXXXXXXX`
- Airtel: `016XXXXXXXX`

**Note:** Use a real number you can access to receive SMS!

---

## 🐛 Debug Mode - Get Full Error Details

**Add this to Checkout.jsx temporarily:**

Find line ~230 (in the catch block):
```javascript
catch (error) {
  console.error('❌ Failed to send OTP:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Full error:', JSON.stringify(error, null, 2));
  toast.error(error.message || 'Failed to send verification code');
}
```

**Then:**
1. Try sending OTP again
2. Check console for detailed error
3. Share the error code/message for specific help

---

## 📋 Quick Checklist

Before trying again, verify:

- [ ] Phone authentication **enabled** in Firebase Console
- [ ] Phone number is **real Bangladesh mobile** (+880...)
- [ ] Browser console shows **no red errors**
- [ ] Both servers **running** (backend on 5001, frontend on 3002)
- [ ] Firebase config **correct** in .env files
- [ ] No **VPN or ad blockers** active
- [ ] reCAPTCHA container **exists** on page
- [ ] **localhost** in Firebase authorized domains

---

## 🎯 Most Likely Issue

**90% of the time, it's one of these:**

1. **Phone auth not enabled** in Firebase Console ← Check this first!
2. **Wrong phone number format** (use +8801XXXXXXXXX)
3. **reCAPTCHA blocked** by ad blocker
4. **Too many requests** to same number (wait 15 min)

---

## 💡 Quick Test

**Try this exact sequence:**

1. Enable Phone auth: https://console.firebase.google.com/project/vybe-web-e7c35/authentication/providers

2. Open checkout: http://localhost:3002/checkout

3. Open browser console: `F12` or `Cmd+Option+I`

4. Fill checkout form with:
   - Name: Test User
   - Phone: **+8801712345678** (replace with your real number!)
   - Address: Test Address

5. Click "Place Order"

6. Click "Send OTP"

7. Check console for errors

8. Check phone for SMS (should arrive in 5-30 seconds)

---

## ❓ Still Not Working?

**Share these details:**

1. Exact error from browser console (F12 → Console tab)
2. Phone number format you're using
3. Screenshot of error message
4. Is Phone auth enabled in Firebase? (yes/no)
5. Which browser are you using?

**Common fix:** Just enable Phone authentication in Firebase Console! 🔥

---

**Quick Links:**
- Firebase Console: https://console.firebase.google.com/project/vybe-web-e7c35
- Phone Auth Settings: https://console.firebase.google.com/project/vybe-web-e7c35/authentication/providers
- Frontend: http://localhost:3002
- Backend Health: http://localhost:5001/api/health
