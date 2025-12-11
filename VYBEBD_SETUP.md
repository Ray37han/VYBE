# 🚀 Quick Setup Guide for vybebd.store

## ⚡ INSTANT STEPS

### 1️⃣ Deploy Frontend (Run this now)

```bash
cd "/Users/rayhan/Documents/My Mac/Web/vybe-mern"
./deploy-domain.sh
```

OR manually:

```bash
cd client
npm run build
vercel --prod
```

---

### 2️⃣ Add DNS Records in Spaceship

**Login:** https://www.spaceship.com/
**Navigate to:** Domains → vybebd.store → DNS Management

**Add these 3 records:**

#### Record 1: Main Domain (Frontend)
```
Type: A
Host: @
Points to: 76.76.21.21
TTL: Auto (or 3600)
```

#### Record 2: WWW Subdomain (Frontend)
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com
TTL: Auto (or 3600)
```

#### Record 3: API Subdomain (Backend)
```
Type: CNAME
Host: api
Points to: vybe-backend-93eu.onrender.com
TTL: Auto (or 3600)
```

**⚠️ Important:** Remove any existing A or CNAME records for @, www, or api before adding these!

---

### 3️⃣ Add Domain in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: **vybe**
3. Click: **Settings** → **Domains**
4. Click: **Add**
5. Enter: `vybebd.store` → Click **Add**
6. Repeat and add: `www.vybebd.store` → Click **Add**

Vercel will automatically:
- ✅ Verify DNS records
- ✅ Provision SSL certificate
- ✅ Enable HTTPS

---

### 4️⃣ Configure Backend (Render)

1. Go to: https://dashboard.render.com
2. Select: **vybe-backend-93eu**
3. Click: **Settings** → **Custom Domain**
4. Click: **Add Custom Domain**
5. Enter: `api.vybebd.store`
6. Copy the CNAME value (should match: vybe-backend-93eu.onrender.com)

**Update Environment Variables:**
1. Click: **Environment** tab
2. Add/Update these variables:

```
CLIENT_URL = https://vybebd.store
CORS_ORIGIN = https://vybebd.store
```

3. Click: **Save Changes**
4. Click: **Manual Deploy** → **Deploy latest commit**

---

## 🧪 Testing (After DNS Propagation)

**Check DNS Propagation:**
- https://dnschecker.org/#A/vybebd.store
- https://dnschecker.org/#CNAME/api.vybebd.store

**Test Frontend:**
```bash
curl -I https://vybebd.store
```
Should return: `200 OK`

**Test Backend API:**
```bash
curl https://api.vybebd.store/api/products
```
Should return: Product JSON data

**Browser Test:**
1. Visit: https://vybebd.store
2. Open DevTools → Network tab
3. Browse products
4. Verify API calls go to: `https://api.vybebd.store/api/...`

---

## 📋 Spaceship DNS Quick Reference

**Spaceship DNS Interface Tips:**

1. **Delete default records first**
   - Spaceship often adds default parking records
   - Delete any existing @ or www records before adding yours

2. **Host field notation:**
   - `@` = root domain (vybebd.store)
   - `www` = www subdomain (www.vybebd.store)
   - `api` = api subdomain (api.vybebd.store)

3. **TTL (Time To Live):**
   - Use "Auto" or 3600 (1 hour)
   - Lower TTL = faster changes, but more DNS queries

4. **CNAME restrictions:**
   - Can't add CNAME for @ (root) if A record exists
   - Use A record for @ instead

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Vercel deployment | 2-3 min | Instant |
| Add DNS records | 2 min | Instant |
| DNS propagation | 5-60 min | Wait |
| SSL certificate | 5-10 min | Auto |
| Total setup time | ~15-70 min | - |

---

## 🔧 Your Final URLs

After setup completes:

- 🌐 **Main Website:** https://vybebd.store
- 🌐 **WWW Version:** https://www.vybebd.store (auto-redirect)
- 🔌 **API Endpoint:** https://api.vybebd.store/api
- 📦 **Products API:** https://api.vybebd.store/api/products
- 🛒 **Cart API:** https://api.vybebd.store/api/cart
- 👤 **Auth API:** https://api.vybebd.store/api/auth

---

## ⚠️ Troubleshooting

### DNS not working?
1. Clear browser cache: Cmd+Shift+R (Mac)
2. Flush DNS cache: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
3. Check DNS propagation: https://dnschecker.org
4. Wait full 60 minutes before troubleshooting

### SSL certificate not showing?
- Vercel: Auto-provisions in 5-10 minutes after DNS verification
- Render: Auto-provisions after custom domain DNS verifies

### CORS errors?
1. Verify `CLIENT_URL` in Render matches exactly: `https://vybebd.store`
2. No trailing slash!
3. Redeploy backend after changing env vars

### API calls failing?
1. Check `client/.env` has: `VITE_API_URL=https://api.vybebd.store/api`
2. Rebuild frontend: `npm run build && vercel --prod`
3. Verify Render custom domain shows green checkmark

---

## 📞 Support Links

- **Spaceship DNS Help:** https://www.spaceship.com/help/article/dns-management
- **Vercel Domains:** https://vercel.com/docs/concepts/projects/domains
- **Render Custom Domains:** https://render.com/docs/custom-domains

---

## ✅ Setup Checklist

- [ ] Run `./deploy-domain.sh` or deploy to Vercel
- [ ] Login to Spaceship
- [ ] Delete existing DNS records for @, www, api
- [ ] Add A record for @ pointing to 76.76.21.21
- [ ] Add CNAME for www pointing to cname.vercel-dns.com
- [ ] Add CNAME for api pointing to vybe-backend-93eu.onrender.com
- [ ] Add domain in Vercel dashboard (vybebd.store and www.vybebd.store)
- [ ] Add custom domain in Render (api.vybebd.store)
- [ ] Update Render environment variables (CLIENT_URL, CORS_ORIGIN)
- [ ] Redeploy backend on Render
- [ ] Wait for DNS propagation (check dnschecker.org)
- [ ] Test https://vybebd.store in browser
- [ ] Test API: https://api.vybebd.store/api/products
- [ ] Verify SSL certificates (🔒 lock icon in browser)

---

**Ready? Run this command:**

```bash
./deploy-domain.sh
```

Then follow the DNS setup steps above! 🚀
