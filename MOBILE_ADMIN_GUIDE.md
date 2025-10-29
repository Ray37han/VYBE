# Mobile Admin Upload Guide (Android/iOS)

## 🔧 Fixed Issues (Latest Update)

✅ Authorization header now properly included with FormData uploads
✅ Mobile browser FormData boundary handling fixed
✅ Auto-logout on authentication errors
✅ Better error messages for mobile debugging
✅ Enhanced server-side request logging

## 📱 How to Upload Products from Android/Mobile

### Step 1: Ensure You're Logged In as Admin

1. Open browser on your Android device (Chrome recommended)
2. Navigate to your website
3. Log in with your admin credentials
4. Go to Admin Dashboard

### Step 2: Verify Admin Access

Before uploading, check the browser console:
- Press F12 or enable "Desktop site" mode
- Or use Chrome Remote Debugging

Check for these logs when you load the admin page:
```
✅ User authenticated: your-email@example.com Role: admin
✅ User authorized
```

### Step 3: Upload Product

1. Click "Add New Product"
2. Fill in all required fields
3. **Important for Mobile**: Select images from your device
4. Click "Create Product"

### 🐛 Troubleshooting Mobile Upload Errors

#### Error: "Authentication failed. Please log in again."
**Solution:**
1. Log out completely
2. Clear browser cache (Settings → Privacy → Clear browsing data)
3. Close browser completely
4. Reopen browser
5. Log in again
6. Try uploading again

#### Error: "Access denied. You do not have admin privileges."
**Solution:**
- Contact the main admin to verify your account has admin role
- Run on server: `node makeAdmin.js your-email@example.com`
- Log out and log in again

#### Error: "Failed to save product" (generic)
**Check these:**
1. ✅ All required fields filled
2. ✅ At least 1 image selected
3. ✅ Each image under 50MB
4. ✅ Images are JPEG, PNG, or WebP
5. ✅ Stable internet connection
6. ✅ Backend server is running

### 📊 How to Check Server Logs (for debugging)

When you try to upload from mobile, server logs will show:

```
📱 POST /api/admin/products
🌐 Origin: https://your-frontend-url
🔑 Auth: Bearer token present ✅
🍪 Cookie: Cookie present
📦 Content-Type: multipart/form-data; boundary=...

📦 Product creation request received
👤 User: your-email@example.com Role: admin
📸 Uploading 3 images...
✅ Product created successfully: 507f1f77bcf86cd799439011
```

**If you see errors, they will show:**
```
❌ User is not admin: your-email@example.com
❌ No token provided
❌ Token expired
```

### 🔍 Mobile-Specific Checks

#### 1. Check Token in Browser Console
On mobile browser:
```javascript
// Open DevTools (Desktop mode in Chrome)
console.log('Token:', localStorage.getItem('token'));
// Should show a long JWT string, not null
```

#### 2. Test Authentication
```javascript
// In console
fetch('/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log);
// Should return your user data with role: 'admin'
```

#### 3. Check Network Tab
- Open DevTools Network tab
- Try uploading product
- Look for `/api/admin/products` request
- Check:
  - Request Headers → Authorization: Bearer xxx ✅
  - Request Headers → Content-Type: multipart/form-data ✅
  - Response Status: Should be 200 or 201, not 401/403
  - Response Body: Check error message if failed

### 📝 Common Mobile Browser Issues

#### Chrome Mobile
- ✅ Best support for admin uploads
- ✅ DevTools available in Desktop mode
- ✅ FormData works correctly

#### Safari Mobile (iOS)
- ⚠️ May require additional permissions for camera/photos
- ⚠️ Test in private browsing to rule out cache issues
- ✅ Should work after fixes

#### Firefox Mobile
- ✅ Good FormData support
- ✅ Works well with file uploads

### 🚀 Quick Test Steps

1. **Test 1: Can you access admin dashboard?**
   - Navigate to `/admin/dashboard`
   - Should see dashboard, not redirect to login

2. **Test 2: Can you see "Add New Product" button?**
   - Should be visible at top right
   - If not, you're not admin

3. **Test 3: Can you select images?**
   - Click image input
   - Should open file picker
   - Select 1-2 small test images

4. **Test 4: Check console before submit**
   - Open DevTools
   - Check for any red errors
   - Token should exist in localStorage

5. **Test 5: Submit and watch console**
   - Click "Create Product"
   - Watch console for errors
   - Check server logs if available

### 💡 Best Practices for Mobile Admin

1. **Use WiFi** instead of mobile data for large uploads
2. **Compress images** before uploading (use online tools)
3. **One product at a time** - don't rush multiple uploads
4. **Test with small images first** (under 1MB) to verify it works
5. **Keep browser tab active** during upload (don't switch tabs)
6. **Clear browser cache** periodically
7. **Log out/in daily** to refresh token

### 🆘 Still Not Working?

1. **Try Desktop/Laptop First**
   - Verify your account has admin role
   - Successfully upload one product
   - Then try mobile again

2. **Check Backend Logs**
   - Ask someone with server access
   - Look for the detailed logs added in latest update
   - Will show exactly what's failing

3. **Network Issues**
   - Check if backend URL is accessible from mobile
   - Try: `https://vybe-backend-93eu.onrender.com/api/`
   - Should see API info, not error

4. **Contact Admin**
   - Share exact error message
   - Share screenshots
   - Mention device/browser/OS version

### 📞 Support Information

**Backend URL:** `https://vybe-backend-93eu.onrender.com/api`

**Admin Dashboard:** `/admin/dashboard`

**Test Backend:** 
```bash
# From mobile browser console
fetch('https://vybe-backend-93eu.onrender.com/api/')
  .then(r => r.json())
  .then(console.log)
```

**Expected Response:**
```json
{
  "success": true,
  "message": "VYBE Backend API",
  "version": "1.0.0"
}
```
