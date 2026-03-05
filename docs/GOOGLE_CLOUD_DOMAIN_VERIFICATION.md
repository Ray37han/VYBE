# Google Cloud Domain Verification for OAuth Branding

## Issue
Error: "The website of your home page URL 'https://www.vybebd.store/' is not registered to you. Verify ownership of your home page."

## Solution: 2-Step Process

### Step 1: Verify Domain in Google Search Console

#### A. Add Your Domain
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Choose **URL prefix** method
4. Enter: `https://vybebd.store` (without www)
5. Click **Continue**

#### B. Choose Verification Method

**Option 1: HTML Tag Method (Easiest)**
1. Google will show you a meta tag like:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```
2. Copy the entire tag
3. Add it to `/client/index.html` in the `<head>` section:
   ```html
   <head>
     <meta charset="UTF-8" />
     <link rel="icon" type="image/svg+xml" href="/vite.svg" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     
     <!-- Google Search Console Verification -->
     <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
     
     <title>VYBE - Custom Poster Printing in Bangladesh</title>
   </head>
   ```
4. Commit and push to GitHub (auto-deploys to Vercel)
5. Wait 2-3 minutes for deployment
6. Go back to Search Console and click **Verify**

**Option 2: DNS TXT Record Method**
1. Google will provide a TXT record like: `google-site-verification=abc123xyz`
2. Add this to your domain's DNS settings:
   - **Type:** TXT
   - **Name:** @ (or leave blank)
   - **Value:** `google-site-verification=abc123xyz`
   - **TTL:** 3600
3. Wait 10-15 minutes for DNS propagation
4. Click **Verify** in Search Console

**Option 3: HTML File Upload Method**
1. Download the verification file (e.g., `google1234567890abcdef.html`)
2. Upload to `/client/public/` folder
3. Commit and push to GitHub
4. Verify the file is accessible at: `https://vybebd.store/google1234567890abcdef.html`
5. Click **Verify** in Search Console

#### C. Add WWW Subdomain (Optional but Recommended)
1. In Search Console, add another property for `https://www.vybebd.store`
2. Use the same verification method
3. This ensures both versions are verified

---

### Step 2: Link Domain to Google Cloud Console

#### A. Access OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project: **vybe-web-9ffd6**
3. Navigate to: **APIs & Services** → **OAuth consent screen**

#### B. Add Authorized Domain
1. Scroll to **Authorized domains** section
2. Click **Add domain**
3. Enter: `vybebd.store` (without https:// or www)
4. Click **Save**

#### C. Update Application Home Page
1. In **App information** section
2. Update **Application home page** to: `https://vybebd.store`
3. Update **Privacy policy link** to: `https://vybebd.store/privacy-policy`
4. Update **Terms of service link** to: `https://vybebd.store/terms-of-service`
5. Click **Save and Continue**

---

## Troubleshooting

### Error: "Domain not verified"
**Solution:** Complete Step 1 first. Google Cloud requires domain ownership verification via Search Console before you can add it to OAuth consent screen.

### Error: "www.vybebd.store not found"
**Solution:** 
1. Check if your Vercel deployment redirects www to non-www
2. Verify both `vybebd.store` and `www.vybebd.store` in Search Console
3. Use `vybebd.store` (without www) in Google Cloud Console

### Verification tag not found
**Solution:**
1. Ensure you deployed the updated `index.html` to production
2. Check deployment status on Vercel dashboard
3. Visit `https://vybebd.store` and view page source (Ctrl+U)
4. Search for `google-site-verification` to confirm tag is present

### DNS verification taking too long
**Solution:**
1. Check DNS propagation: [dnschecker.org](https://dnschecker.org)
2. Search for your domain with TXT record type
3. Wait up to 24 hours for full propagation (usually 10-15 minutes)

---

## Quick Checklist

- [ ] Add property in Google Search Console
- [ ] Choose verification method (HTML tag recommended)
- [ ] Add verification code to index.html
- [ ] Deploy to production (git push)
- [ ] Wait for Vercel deployment to complete
- [ ] Click Verify in Search Console
- [ ] Verify www subdomain (optional)
- [ ] Go to Google Cloud Console
- [ ] Add `vybebd.store` to Authorized domains
- [ ] Update OAuth consent screen URLs
- [ ] Save changes
- [ ] Test Firebase Phone Auth with production domain

---

## Firebase Authorized Domains

Don't forget to also add your domain to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **vybe-web-9ffd6**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Enter: `vybebd.store`
6. Click **Add**

This allows Firebase Phone Auth to work on your production domain.

---

## Expected Timeline
- HTML tag deployment: **2-3 minutes**
- Search Console verification: **Instant** (after deployment)
- DNS verification: **10-15 minutes** (up to 24 hours)
- Google Cloud domain linking: **Instant** (after Search Console verification)
- Total time (HTML method): **5-10 minutes**

---

## After Verification

Once domain is verified:
1. Firebase Phone Auth will work on `vybebd.store`
2. Google OAuth consent screen will show your branding
3. You can submit app for verification (if needed)
4. Users will see "VYBE" instead of "Unverified app" warning

---

## Support Resources
- [Google Search Console Help](https://support.google.com/webmasters/answer/9008080)
- [Google Cloud Domain Verification](https://support.google.com/cloud/answer/9110914)
- [Firebase Authorized Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices)
