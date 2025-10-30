# 🚀 QUICK FIX - Enable Network Upload

## The Problem
Windows/Android users see "Cannot connect to server" when uploading products.

## The Solution (2 Steps)

### Step 1: Update Frontend Config
Open `client/.env` and change:
```env
# FROM THIS:
VITE_API_URL=http://localhost:5001/api

# TO THIS (use your Mac's IP):
VITE_API_URL=http://192.168.0.209:5001/api
```

### Step 2: Restart Frontend
```bash
cd client
npm run dev
```

## Access from Windows/Android
Open browser and go to:
```
http://192.168.0.209:3000
```
(NOT localhost:3000!)

---

## ✅ What's Already Fixed

Backend server is ready! These are already done:
- ✅ CORS configured for network access
- ✅ All 5 admins have upload permission
- ✅ Enhanced error logging
- ✅ 50MB upload limit
- ✅ 3-minute timeout for large files

---

## 🧪 Test Everything Works

```bash
# Run this script to verify setup:
./test-network.sh
```

---

## 📋 Admin Users with Upload Permission

All these users can upload products:
1. rayhan@vybe.com
2. asifha1234567890@gmail.com
3. dewanalruza@gmail.com
4. rjrhythm2005@gmail.com
5. ahamedniaj34@gmail.com

---

## Need More Help?

Read the detailed guides:
- `FIX_NETWORK_UPLOAD.md` - Complete troubleshooting guide
- `FIXES_APPLIED.md` - Technical details of what was fixed
