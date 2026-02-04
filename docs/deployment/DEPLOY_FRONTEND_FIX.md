# Deploy Frontend Fix - Backend URL Update

## Problem
Frontend was pointing to old Railway backend URL. Backend is actually on Render.

## Changes Made ✅
- Updated `client/src/api/index.js` fallback URL to Render
- Committed and pushed to GitHub (commit e5e30e8)

## Deploy the Fix - Two Options

### Option 1: Automatic Deployment (Easiest)
Since you pushed to GitHub, Vercel should auto-deploy within 1-2 minutes.

**BUT** you need to update the environment variable first:

1. Go to: https://vercel.com/ray37hans-projects/vybe/settings/environment-variables
2. Find `VITE_API_URL` 
3. Edit the Production value to: `https://vybe-backend-93eu.onrender.com/api`
4. Click **Redeploy** or wait for auto-deploy

### Option 2: Manual Vercel Dashboard
1. Login to Vercel: https://vercel.com
2. Go to your **vybe** project
3. Navigate to **Settings** → **Environment Variables**
4. Update `VITE_API_URL` for **Production**:
   - Old value: `https://vybe-backend-production-2ab6.up.railway.app/api`
   - New value: `https://vybe-backend-93eu.onrender.com/api`
5. Go to **Deployments** tab
6. Click the **3 dots** on the latest deployment → **Redeploy**
7. Select **Use existing Build Cache: No**
8. Click **Redeploy**

### Option 3: Update via CLI (If needed)
```bash
cd "/Users/rayhan/Documents/My Mac/Web/vybe-mern/client"

# Remove old variable (confirm with 'yes')
vercel env rm VITE_API_URL production

# Add new variable
echo "https://vybe-backend-93eu.onrender.com/api" | vercel env add VITE_API_URL production

# Trigger redeploy
vercel --prod --force
```

## Verification
After deployment completes:
1. Visit your website
2. Open browser DevTools → Network tab
3. Try loading products
4. Verify requests go to: `https://vybe-backend-93eu.onrender.com/api/`

## Backend URLs Reference
- ✅ **Render (Current)**: https://vybe-backend-93eu.onrender.com/api/
- ❌ **Railway (Old)**: https://vybe-backend-production-2ab6.up.railway.app/api/

---

**Status**: Backend is working on Render. Just need to update Vercel env var and redeploy frontend.
