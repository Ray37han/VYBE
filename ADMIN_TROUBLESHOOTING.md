# Admin Product Upload Troubleshooting Guide

## Problem: "Failed to save product" error from other devices/accounts

### Common Causes & Solutions

## 1. ✅ Verify User Has Admin Role

**Check if user is admin:**
```bash
cd server
node verifyAdmin.js user@example.com
```

**Grant admin privileges:**
```bash
node makeAdmin.js user@example.com
```

## 2. 🔑 Check Authentication

**Symptoms:**
- "Not authorized" error
- "Please log in again" message

**Solutions:**
- Clear browser cache and cookies
- Log out and log back in
- Check if token is expired (tokens last 30 days)

## 3. 🌐 Check Network Connection

**For other devices:**
- Ensure device can reach the backend server
- Check CORS settings in `server/server.js`
- Verify backend URL in environment variables

## 4. 📸 Check Image Upload

**Common issues:**
- File size too large (max 50MB per image)
- Invalid file type (only JPEG, PNG, WebP)
- At least 1 image required for new products

## 5. 🔍 Debug Mode

**Check server logs for detailed error messages:**

When uploading products, server now logs:
- `📦 Product creation request received`
- `👤 User: email@example.com Role: admin`
- `📸 Uploading X images...`
- `✅ Product created successfully`

**Authentication logs:**
- `🍪 Token from cookie` or `🔑 Token from Authorization header`
- `✅ User authenticated: email Role: admin`
- `✅ User authorized`

**Error logs:**
- `❌ User is not admin: email`
- `❌ No token provided`
- `❌ Cloudinary not configured`

## 6. 🔧 Quick Fixes

### Reset User Session
1. Log out from all devices
2. Clear browser cache
3. Log back in

### Verify Cloudinary
Check server `.env` file has:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Check Backend Status
```bash
# Test backend is running
curl http://localhost:5001/api/health

# Or for production
curl https://vybe-backend-93eu.onrender.com/api/health
```

### Verify User Role via API
```bash
# Get current user details (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/auth/me
```

## 7. 📋 Pre-Upload Checklist

Before uploading products, ensure:
- [ ] User is logged in with admin account
- [ ] User has admin role (check with verifyAdmin.js)
- [ ] Images are under 50MB each
- [ ] Images are JPEG, PNG, or WebP format
- [ ] All required fields filled (name, description, price)
- [ ] Backend server is running
- [ ] Internet connection is stable

## 8. 🚨 Error Messages Explained

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Not authorized. Please log in" | No token | Log in again |
| "Token expired. Please log in again" | Token expired | Log in again |
| "Access denied. You need 'admin' role" | User is not admin | Use makeAdmin.js script |
| "Invalid product data format" | JSON parse error | Check form data |
| "At least one product image is required" | No images uploaded | Select at least 1 image |
| "File size too large. Maximum size is 50MB" | Image too big | Compress images |
| "Cloudinary not configured" | Missing env vars | Add Cloudinary credentials |

## 9. 📞 Need Help?

1. Check server terminal logs for detailed errors
2. Check browser console for client-side errors
3. Use verifyAdmin.js to confirm user role
4. Test from different browser/device
5. Check network tab in browser DevTools

## 10. 🛠️ Admin Management Commands

```bash
# List all admin users
node -e "require('./models/User.js').default.find({role:'admin'}).then(console.log)"

# Create initial admin (if none exists)
node createAdmin.js

# Verify specific user
node verifyAdmin.js user@example.com

# Grant admin to user
node makeAdmin.js user@example.com
```
