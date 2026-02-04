# 🚂 Railway Deployment - Step by Step Guide

**Date:** November 3, 2025  
**Status:** ✅ Code pushed to GitHub - Ready to deploy!

---

## 🎯 WHAT YOU'LL GET

After deployment:
- 🌍 **Public Backend URL:** `https://vybe-backend-production.up.railway.app`
- 🔒 **Free HTTPS** automatically
- 🚀 **Accessible worldwide** from any device
- 💰 **$5 free credit** (enough for testing)

---

## 📋 DEPLOYMENT STEPS

### **Step 1: Go to Railway**

1. Open your browser and go to: **https://railway.app**
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub account

---

### **Step 2: Create New Project**

1. Click **"New Project"** (big purple button)
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your repositories
4. Find and click **"Ray37han/VYBE"**

Railway will automatically:
- ✅ Detect it's a Node.js project
- ✅ Read the `railway.json` configuration
- ✅ Start building

---

### **Step 3: Configure Environment Variables** ⚠️ IMPORTANT

Click on your project, then click **"Variables"** tab.

Add these environment variables (copy from your `server/.env`):

```bash
# Database
MONGODB_URI=mongodb+srv://2303037_db_user:kALl4kOIAR6mUefP@cluster0.p6xeucy.mongodb.net/vybe-store?retryWrites=true&w=majority

# JWT
JWT_SECRET=vybe-secret-key-2024-production-secure
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Cloudinary
CLOUDINARY_CLOUD_NAME=dyonj35w3
CLOUDINARY_API_KEY=158432847288626
CLOUDINARY_API_SECRET=CjFWYAT0TyEEGwUqSEblxo78vTA

# Email
EMAIL_USER=vybestore2024@gmail.com
EMAIL_PASS=temp-placeholder-configure-later
EMAIL_FROM_NAME=VYBE

# Client URL (will update this after frontend deployment)
CLIENT_URL=http://localhost:3000

# Node Environment
NODE_ENV=production

# Port (Railway will auto-assign, but good to have)
PORT=5001
```

**How to add each variable:**
1. Click **"+ New Variable"**
2. Enter **Variable Name** (e.g., `MONGODB_URI`)
3. Enter **Value** (paste the actual value)
4. Click **"Add"**
5. Repeat for all variables

---

### **Step 4: Deploy!**

1. After adding variables, Railway will automatically start deploying
2. You'll see:
   - 🔨 **Building...** (2-3 minutes)
   - 📦 **Deploying...** (30 seconds)
   - ✅ **Success!** (green checkmark)

---

### **Step 5: Get Your Backend URL**

1. Click on your deployment
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Railway will give you a URL like:
   ```
   https://vybe-backend-production.up.railway.app
   ```
6. **Copy this URL!** You'll need it for the frontend.

---

### **Step 6: Test Your Backend**

Open your browser or terminal and test:

```bash
# Test health endpoint
curl https://YOUR-RAILWAY-URL.up.railway.app/api/health

# Should return:
# {"status":"ok","message":"Server is running","timestamp":"2025-11-03T..."}
```

Or in browser:
```
https://YOUR-RAILWAY-URL.up.railway.app/api/products
```

---

### **Step 7: Update Frontend Configuration**

Now update your frontend to use the Railway backend:

```bash
cd "/Users/rayhan/Documents/My Mac/Web/vybe-mern/client"

# Edit .env file
nano .env
```

**Change from:**
```env
VITE_API_URL=http://192.168.0.140:5001/api
```

**Change to:**
```env
VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
```

**Example:**
```env
VITE_API_URL=https://vybe-backend-production.up.railway.app/api
```

Save the file (Ctrl+O, Enter, Ctrl+X)

---

### **Step 8: Update Backend CLIENT_URL**

Go back to Railway:
1. Click **"Variables"** tab
2. Find **CLIENT_URL**
3. Update it to include both localhost and your Railway URL:
   ```
   http://localhost:3000,https://vybe-backend-production.up.railway.app
   ```
4. Click **"Save"**
5. Railway will automatically redeploy (30 seconds)

---

### **Step 9: Restart Frontend**

```bash
cd client

# Kill any running frontend
pkill -f vite

# Start fresh
npm run dev
```

Your frontend will now connect to the Railway backend! 🎉

---

### **Step 10: Test Upload from Windows**

Now from your Windows device (or any device, anywhere):

1. **Open browser** on Windows
2. **Go to:** `http://YOUR-MAC-IP:3000` (or localhost if on same Mac)
3. **Or share your frontend** with ngrok:
   ```bash
   ngrok http 3000
   # Share the ngrok URL with Windows user
   ```
4. **Login as admin**
5. **Go to Products → Add Product**
6. **Upload an image**
7. **Success!** ✅ It works from anywhere now!

---

## 🎉 DEPLOYMENT COMPLETE!

Your backend is now:
- ✅ **Live on Railway** with public URL
- ✅ **Accessible worldwide** 24/7
- ✅ **Auto-scaling** (Railway handles traffic)
- ✅ **Free HTTPS** (secure)
- ✅ **Auto-restart** on crashes
- ✅ **Monitored** (Railway dashboard shows metrics)

---

## 📊 RAILWAY DASHBOARD

After deployment, you can monitor:
- 📈 **CPU Usage**
- 💾 **Memory Usage**
- 🌐 **Request Count**
- ⏱️ **Response Time**
- 📝 **Logs** (click "View Logs")

---

## 🔄 FUTURE UPDATES

When you update your code:

```bash
cd "/Users/rayhan/Documents/My Mac/Web/vybe-mern"
git add .
git commit -m "Updated features"
git push origin main
```

Railway will **automatically redeploy** (zero-downtime)! 🚀

---

## 🆓 FREE TIER LIMITS

Railway gives you:
- 💵 **$5 free credit per month**
- 🕐 **~500 hours of runtime** (enough for testing)
- 📦 **512MB memory** (upgradable)
- 🔄 **Unlimited deploys**

---

## 🚀 OPTIONAL: Deploy Frontend to Vercel

Want your frontend also accessible worldwide?

```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

You'll get: `https://vybe.vercel.app`

Then update Railway's `CLIENT_URL` to:
```
https://vybe.vercel.app,http://localhost:3000
```

---

## ❓ TROUBLESHOOTING

### **Build Failed**
- Check if all dependencies are in `package.json`
- Check Railway logs for specific error
- Make sure `NODE_ENV=production` is set

### **Can't connect to MongoDB**
- Verify `MONGODB_URI` is correct in Railway variables
- MongoDB Atlas should allow `0.0.0.0/0` (all IPs) in Network Access

### **CORS Error**
- Update `CLIENT_URL` in Railway to include your frontend URL
- Check browser console for specific origin

### **Images not uploading**
- Verify Cloudinary credentials in Railway variables
- Check Railway logs for Cloudinary errors

### **Still need help?**
- Check Railway logs: Dashboard → Your Project → View Logs
- Check Railway status: https://status.railway.app/

---

## 📞 SUPPORT

Railway Docs: https://docs.railway.app/  
Railway Discord: https://discord.gg/railway  
Your Repository: https://github.com/Ray37han/VYBE

---

**Your code is ready! Just follow the steps above. Total time: ~10 minutes** ⏱️

**Made with ❤️ for VYBE** 🎨
