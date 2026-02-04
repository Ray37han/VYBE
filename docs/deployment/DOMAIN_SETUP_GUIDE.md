# 🌐 Custom Domain Setup Guide for VYBE

## Overview
This guide will help you connect your custom domain to your VYBE e-commerce platform.

---

## 📋 Prerequisites

- ✅ Domain purchased (e.g., yourdomain.com)
- ✅ Access to domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- ✅ Backend deployed on Render (current setup)
- ✅ Frontend ready to deploy

---

## 🎯 Recommended Setup

### Option A: Simple Setup (Single Domain)
```
yourdomain.com → Frontend (Vercel/Netlify)
yourdomain.com/api → Backend (Render)
```

### Option B: Subdomain Setup (Professional)
```
yourdomain.com → Frontend (Vercel/Netlify)
api.yourdomain.com → Backend (Render)
```

**We recommend Option B** - cleaner separation and easier to manage.

---

## 🔧 Step-by-Step Setup

### Step 1: Backend (Render) Domain Setup

#### 1.1 Add Custom Domain to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service: `vybe-backend-93eu`
3. Click **"Settings"** → **"Custom Domain"**
4. Click **"Add Custom Domain"**
5. Enter: `api.yourdomain.com`
6. Copy the **CNAME record** Render provides

#### 1.2 Configure DNS Records (Your Domain Registrar)

Add this DNS record in your domain provider (GoDaddy, Namecheap, etc.):

```
Type: CNAME
Name: api
Value: vybe-backend-93eu.onrender.com
TTL: 3600 (or Auto)
```

**Wait 5-60 minutes** for DNS propagation.

#### 1.3 Enable HTTPS

- Render will automatically provision a **free SSL certificate**
- This happens once DNS propagation completes
- You'll see a green checkmark in Render dashboard

---

### Step 2: Frontend Deployment & Domain Setup

#### Option A: Deploy to Vercel (Recommended)

**Why Vercel?**
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Zero configuration
- ✅ Free tier generous
- ✅ Perfect for React/Vite

**2.1 Install Vercel CLI:**

```bash
npm install -g vercel
```

**2.2 Deploy Frontend:**

```bash
cd client
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **vybe** (or your choice)
- Directory? **./client** or press Enter
- Override settings? **N**

**2.3 Add Custom Domain in Vercel:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **"Add"**
5. Enter your domain: `yourdomain.com`
6. Also add: `www.yourdomain.com`

**2.4 Configure DNS Records:**

Vercel will show you which records to add. Typically:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Alternative (if A record doesn't work):**

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

---

#### Option B: Deploy to Netlify

**2.1 Install Netlify CLI:**

```bash
npm install -g netlify-cli
```

**2.2 Build and Deploy:**

```bash
cd client
npm run build
netlify deploy --prod
```

**2.3 Add Custom Domain:**

1. Go to Netlify Dashboard
2. Site settings → Domain management
3. Add custom domain
4. Follow DNS instructions provided

---

### Step 3: Update Environment Variables

#### 3.1 Update Client Environment

**File: `client/.env`**

```env
# Production - Your Custom Domain
VITE_API_URL=https://api.yourdomain.com/api

# Or if using same domain:
# VITE_API_URL=https://yourdomain.com/api
```

#### 3.2 Update Server Environment (Render)

Go to Render Dashboard → Your Service → Environment:

Add/Update these variables:

```env
CLIENT_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

#### 3.3 Update CORS Settings

**File: `server/server.js`**

The CORS is already configured to use environment variable, but verify:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

### Step 4: Redeploy Everything

#### 4.1 Rebuild Frontend with New API URL

```bash
cd client
npm run build
vercel --prod
```

#### 4.2 Trigger Backend Redeploy (Render)

- Go to Render Dashboard
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Or push to your GitHub repository

---

## 🧪 Testing Your Setup

### Test Backend API:

```bash
curl https://api.yourdomain.com/api/products
```

Should return product data (or 200 OK).

### Test Frontend:

1. Visit `https://yourdomain.com`
2. Open browser DevTools → Network tab
3. Click on any product
4. Verify API calls go to `https://api.yourdomain.com`

### Test HTTPS:

Both URLs should show a **🔒 lock icon** in browser:
- `https://yourdomain.com` ✅
- `https://api.yourdomain.com` ✅

---

## 🔍 Common DNS Record Examples

### GoDaddy

| Type  | Name | Value                           | TTL  |
|-------|------|---------------------------------|------|
| A     | @    | 76.76.21.21                     | 600  |
| CNAME | www  | cname.vercel-dns.com            | 1 Hour |
| CNAME | api  | vybe-backend-93eu.onrender.com  | 1 Hour |

### Namecheap

| Type  | Host | Value                           | TTL       |
|-------|------|---------------------------------|-----------|
| A     | @    | 76.76.21.21                     | Automatic |
| CNAME | www  | cname.vercel-dns.com            | Automatic |
| CNAME | api  | vybe-backend-93eu.onrender.com  | Automatic |

### Cloudflare

**⚠️ Important for Cloudflare:**
- Turn **OFF** "Proxy" (orange cloud) for API subdomain
- Keep it as "DNS only" (gray cloud)
- Or use Full SSL mode

---

## ⚡ Quick Setup Checklist

- [ ] Add custom domain to Render backend
- [ ] Configure DNS CNAME record for `api.yourdomain.com`
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Deploy frontend to Vercel
- [ ] Add custom domain in Vercel
- [ ] Configure DNS A/CNAME records for `yourdomain.com`
- [ ] Update `client/.env` with new API URL
- [ ] Update Render environment variables
- [ ] Rebuild and redeploy frontend
- [ ] Test both URLs with HTTPS
- [ ] Verify API calls work from frontend

---

## 🐛 Troubleshooting

### DNS Not Propagating?

Check DNS propagation status:
- https://dnschecker.org
- https://www.whatsmydns.net

Enter your domain and check if records are visible globally.

### SSL Certificate Not Working?

**Render:**
- Wait 10-15 minutes after DNS propagation
- Check "Custom Domain" section for SSL status
- May need to click "Refresh" to trigger SSL

**Vercel:**
- Automatic SSL within minutes
- If fails, remove and re-add domain

### CORS Errors?

1. Check `CLIENT_URL` in Render environment matches your domain exactly
2. Verify `server/server.js` CORS configuration
3. Ensure no trailing slashes in URLs

### API Calls Failing?

1. Check browser DevTools → Network tab
2. Verify API URL in requests matches `VITE_API_URL`
3. Check Render logs for errors
4. Ensure backend is running

### Mixed Content Errors?

- Both frontend and backend MUST use HTTPS
- Check for any hardcoded `http://` URLs in code
- Vercel and Render provide free SSL automatically

---

## 📞 Platform-Specific Help

### Render Support
- Docs: https://render.com/docs/custom-domains
- Support: https://render.com/docs

### Vercel Support
- Docs: https://vercel.com/docs/concepts/projects/domains
- Support: https://vercel.com/support

### Domain Registrar Help
- **GoDaddy:** https://www.godaddy.com/help/manage-dns
- **Namecheap:** https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain
- **Cloudflare:** https://support.cloudflare.com/hc/en-us/articles/360019093151

---

## 🎉 Post-Setup

### Update Social Links & Metadata

Update these files with your new domain:

**client/index.html:**
```html
<meta property="og:url" content="https://yourdomain.com">
<link rel="canonical" href="https://yourdomain.com">
```

**client/public/robots.txt:**
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

### Setup Analytics (Optional)

Add Google Analytics or Vercel Analytics:
```bash
npm install @vercel/analytics
```

---

## 📝 Example Complete Setup

**Your Domain:** `vybeshop.com`

**DNS Records:**
```
A     @    → 76.76.21.21               (Frontend - Vercel)
CNAME www  → cname.vercel-dns.com      (Frontend - www)
CNAME api  → vybe-backend-93eu.onrender.com (Backend - Render)
```

**Environment Variables:**

`client/.env`:
```env
VITE_API_URL=https://api.vybeshop.com/api
```

Render Environment:
```env
CLIENT_URL=https://vybeshop.com
CORS_ORIGIN=https://vybeshop.com
```

**Live URLs:**
- 🌐 Website: https://vybeshop.com
- 🔌 API: https://api.vybeshop.com/api
- 📦 Products: https://api.vybeshop.com/api/products

---

## 🚀 Need Help?

1. Check DNS propagation first (usually the issue)
2. Verify SSL certificates are active
3. Check browser console for errors
4. Review Render deployment logs
5. Test API endpoint directly in browser

**Current Setup:**
- Backend: Render (https://vybe-backend-93eu.onrender.com)
- Frontend: Local (needs deployment)
- Database: MongoDB Atlas (no changes needed)

---

**Ready to start? Tell me:**
1. What's your domain name?
2. Which frontend platform do you prefer? (Vercel recommended)
3. Do you want subdomain setup (api.yourdomain.com) or single domain?

I'll guide you through each step! 🎯
