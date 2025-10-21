# 🚀 Deploy Full Working VYBE Website

## Quick Deployment (5 minutes)

### Step 1: Deploy Backend to Render (Free)

1. **Go to Render:** https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: **VYBE**
5. Configure:
   - **Name:** vybe-backend
   - **Root Directory:** server
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://2303037_db_user:kALl4kOIAR6mUefP@cluster0.p6xeucy.mongodb.net/vybe-store
   JWT_SECRET=vybe-secret-key-2024-production-secure
   CLOUDINARY_CLOUD_NAME=dyonj35w3
   CLOUDINARY_API_KEY=158432847288626
   CLOUDINARY_API_SECRET=CjFWYAT0TyEEGwUqSEblxo78vTA
   CLIENT_URL=https://vybe-frontend.vercel.app
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. **Copy your backend URL:** `https://vybe-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel (Free)

1. **Go to Vercel:** https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository: **VYBE**
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

5. **Add Environment Variable:**
   ```
   VITE_API_URL=https://vybe-backend.onrender.com/api
   ```
   (Use the URL from Step 1)

6. Click "Deploy"
7. Wait 1-2 minutes
8. **Your website is live!** 🎉

---

### Step 3: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `CLIENT_URL` to your Vercel URL
5. Save changes (will redeploy)

---

## 🌐 Your Live Website URLs

After deployment you'll have:
- **Frontend (Customer Site):** https://vybe-frontend.vercel.app
- **Backend API:** https://vybe-backend.onrender.com
- **Admin Dashboard:** https://vybe-frontend.vercel.app/admin

---

## ✅ Testing Your Live Website

1. Visit your Vercel URL
2. Browse products
3. Add to cart
4. Register/Login
5. Complete checkout
6. Check order status
7. Login as admin (admin@vybe.com / admin123)
8. Manage orders

---

## 🔧 Alternative: Railway (Easier)

**Deploy Both in One Place:**

1. Go to: https://railway.app/
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose **VYBE** repository
5. Railway will auto-detect both client and server
6. Add environment variables
7. Deploy!

**Benefits:**
- Single dashboard
- Automatic HTTPS
- Simple deployment
- Free tier available

---

## 📱 Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your domain (e.g., vybe.com)
3. Update DNS records

### For Render (Backend):
1. Upgrade to paid plan for custom domain
2. Or use free Render URL

---

## 🚨 Important Notes

### Free Tier Limitations:
- **Render Free:** Backend sleeps after 15 min inactivity (takes 30s to wake up)
- **Vercel Free:** Unlimited, but has usage limits
- **Solution:** Upgrade to paid ($7-10/month) for always-on

### Database:
- MongoDB Atlas already configured
- Already on free tier (512MB)
- Will work fine for testing and small scale

---

## 🎯 Quick Commands Summary

```bash
# Commit and push deployment configs
git add .
git commit -m "Add deployment configurations"
git push origin main
```

Then follow the steps above to deploy to Render + Vercel!

---

## 💡 Pro Tips

1. **Use Render for Backend** - Reliable and free
2. **Use Vercel for Frontend** - Fast and free
3. **Keep GitHub updated** - Auto-deploys on push
4. **Monitor logs** - Check Render/Vercel dashboards
5. **Test thoroughly** - Try all features after deployment

---

**Your customers will see a fully working e-commerce website!** 🎊
