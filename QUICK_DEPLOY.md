# 🚀 QUICK DEPLOY - Get Your Website Live in 5 Minutes!

## ⚡ FASTEST METHOD: Railway (One-Click Deploy)

### Deploy Backend (2 minutes)

1. **Go to:** https://railway.app/
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: **Ray37han/VYBE**
5. Railway will detect Node.js automatically
6. Click **"Add Variables"** and paste:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://2303037_db_user:kALl4kOIAR6mUefP@cluster0.p6xeucy.mongodb.net/vybe-store
JWT_SECRET=vybe-secret-key-2024-production-secure
CLOUDINARY_CLOUD_NAME=dyonj35w3
CLOUDINARY_API_KEY=158432847288626
CLOUDINARY_API_SECRET=CjFWYAT0TyEEGwUqSEblxo78vTA
CLIENT_URL=https://vybe.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

7. Under **Settings** → **Root Directory** → Enter: `server`
8. Click **"Deploy"**
9. Wait 1-2 minutes
10. **Copy your Railway URL** (e.g., `https://vybe-production.up.railway.app`)

---

### Deploy Frontend on Vercel (2 minutes)

1. **Go to:** https://vercel.com/
2. Click **"Add New"** → **"Project"**
3. Import: **Ray37han/VYBE**
4. Configure:
   - **Root Directory:** `client`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variable:**
   - Name: `VITE_API_URL`
   - Value: `YOUR_RAILWAY_URL/api` (from step 10 above)
   Example: `https://vybe-production.up.railway.app/api`

6. Click **"Deploy"**
7. Wait 1 minute ✅

---

## ✅ DONE! Your Website is LIVE!

Your Vercel URL will look like: **https://vybe-xyz123.vercel.app**

### What Works:
✅ Browse products with images
✅ Shopping cart
✅ User registration & login
✅ Checkout with bKash
✅ Order tracking
✅ Admin dashboard (admin@vybe.com / admin123)
✅ Order management
✅ Product management

---

## 🎯 Alternative: Render (Also Free)

If Railway doesn't work, use Render:

### Backend on Render:
1. Go to: https://dashboard.render.com/
2. New → Web Service
3. Connect GitHub: **VYBE**
4. Settings:
   - **Name:** vybe-backend
   - **Root Directory:** server
   - **Build:** `npm install`
   - **Start:** `npm start`
   - **Free Plan**
5. Add same environment variables as above
6. Deploy!

### Frontend stays on Vercel (same steps)

---

## 🔧 Troubleshooting

### "Failed to load products"
- **Cause:** Backend not deployed yet
- **Fix:** Deploy backend first, then update `VITE_API_URL` in Vercel

### Backend sleeping (Render free tier)
- **Cause:** Free tier sleeps after 15 min
- **Fix:** First request takes 30s to wake up (normal)
- **Solution:** Upgrade to paid ($7/month) for always-on

### API connection errors
- **Cause:** Wrong API URL
- **Fix:** Check Vercel environment variable matches your backend URL
- Add `/api` at the end: `https://your-backend.com/api`

---

## 💡 Pro Tips

1. **Deploy backend first** - Get the URL before deploying frontend
2. **Test backend** - Visit `YOUR_BACKEND_URL/api/products` to verify it works
3. **Update Vercel env** - If you change backend URL, update in Vercel settings
4. **Check logs** - Railway/Render dashboards show error logs
5. **Add products** - Login as admin and add products with images

---

## 🎊 Share Your Website!

Once deployed, share your Vercel URL:
- **https://your-vybe-site.vercel.app**

Customers can:
- Browse products
- Add to cart
- Register/Login
- Place orders
- Track orders

You can:
- Manage orders
- Add/edit products
- Manage users
- Verify payments

---

**Need help? Both Railway and Render have free tiers and are very reliable!** 🚀
