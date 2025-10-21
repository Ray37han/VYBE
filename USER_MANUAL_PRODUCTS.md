# 📚 VYBE Product Upload Guide - Facebook to Website

## Quick Reference: Adding Products from Your Facebook Page

This guide will walk you through uploading your poster products from your Facebook page to your VYBE website.

---

## 🎯 Step-by-Step Process

### **Step 1: Access Your Facebook Page**

1. Go to your Facebook page: https://www.facebook.com/profile.php?id=61580594942475
2. Open all your product posts/photos
3. For each product image:
   - Right-click on the image → "Open image in new tab"
   - Or: Click image → Click "Options" → "Download"
   - Save all product images to a folder on your computer (e.g., `Desktop/VYBE Products`)

**Tip:** Organize by product type (Abstract, Minimalist, Anime, etc.) for easier uploading

---

### **Step 2: Get Cloudinary Account (FREE)**

You need Cloudinary to upload images. It's free and takes 2 minutes!

1. **Sign up:** Go to https://cloudinary.com/users/register_free
2. **Fill in:**
   - Name
   - Email
   - Password
   - Company name: "VYBE" or your name
3. **Verify email** - Check inbox and click verification link
4. **Get credentials:**
   - After login, go to **Dashboard**
   - You'll see:
     - Cloud Name (e.g., `dxxxxxx`)
     - API Key (e.g., `123456789012345`)
     - API Secret (click "eye" icon to reveal)
   - **Keep this page open** - you'll need these!

---

### **Step 3: Add Cloudinary to Your Website**

1. Open your project folder: `/Users/rayhan/Downloads/My Mac/Web/vybe-mern/`
2. Open file: `server/.env` (in any text editor)
3. Find these lines:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. Replace with your actual credentials:
   ```
   CLOUDINARY_CLOUD_NAME=dxxxxxx
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUv
   ```
5. **Save the file**
6. **Restart your server:**
   - Go to the terminal running the server (should show "Server running on port 5001")
   - Press `Ctrl+C` to stop
   - Run: `npm run dev` to restart

---

### **Step 4: Login to Admin Dashboard**

1. **Open your website:** http://localhost:3000
2. **Click "Login"** in the top-right navbar
3. **Enter credentials:**
   - Email: `admin@vybe.com`
   - Password: `admin123`
4. **Click Login**
5. You'll see **"Admin"** link appear in navbar - click it
6. You're now in the **Admin Dashboard!**

---

### **Step 5: Add Your First Product**

#### A. Navigate to Products
1. In Admin Dashboard, click **"Manage Products"**
2. Click **"Add New Product"** button

#### B. Fill Product Details

**Product Name:**
```
Example: "Abstract Waves Poster"
```

**Description:**
```
Example: "Modern abstract art featuring flowing waves in gradient colors. 
Perfect for living rooms, bedrooms, or office spaces. 
High-quality print on premium matte paper."
```

**Category:** (Choose one)
- Abstract
- Minimalist
- Nature
- Typography
- Custom
- Anime
- Vintage
- Modern
- Other

**Base Price:** (in Taka)
```
Example: 350
```

**Is Customizable?** (Check this if customers can upload their own images)
- ✅ Yes (for custom posters)
- ❌ No (for fixed designs)

#### C. Add Available Sizes

Click "Add Size" for each size you offer:

**Example Sizes:**
| Size | Dimensions | Price (৳) |
|------|-----------|----------|
| A5 | 5.8" × 8.3" | 350 |
| A4 | 8.3" × 11.7" | 550 |
| A3 | 11.7" × 16.5" | 850 |
| A2 | 16.5" × 23.4" | 1200 |

Fill in:
- **Size Name:** A5
- **Width:** 5.8
- **Height:** 8.3
- **Unit:** inches
- **Price:** 350

Repeat for all sizes you offer.

#### D. Upload Product Images

1. Click **"Upload Images"** or drag & drop
2. Select 1-5 images from your computer
3. Wait for upload (shows progress bar)
4. Images will appear as thumbnails
5. First image = Main product image (customers see first)

**Image Tips:**
- Use high-quality images (at least 1000×1000 px)
- Show the poster in different angles/settings if possible
- Max 5 images per product
- Supported formats: JPG, PNG, WebP
- Max 5MB per image

#### E. Additional Options

**Stock Quantity:**
```
Example: 50 (how many you have available)
```

**Tags:** (Optional - helps customers find products)
```
Example: abstract, waves, gradient, modern, wall art
```

**Featured Product?** 
- ✅ Check this to show on homepage

**Active:**
- ✅ Keep checked to show in store
- ❌ Uncheck to hide (draft)

#### F. Save Product

1. Review all information
2. Click **"Create Product"** or **"Save"**
3. Success message will appear!
4. Product is now live on your website 🎉

---

### **Step 6: View Your Product**

1. **Go to homepage:** http://localhost:3000
2. **Click "Shop"** or scroll to see products
3. **Your product is live!**
4. Click it to see full details page
5. Test "Add to Cart" functionality

---

## 📋 Product Upload Checklist

For each product from your Facebook page:

- [ ] Downloaded high-quality images
- [ ] Created product name
- [ ] Written detailed description
- [ ] Selected category
- [ ] Set base price
- [ ] Added all available sizes with prices
- [ ] Uploaded 1-5 product images
- [ ] Set stock quantity
- [ ] Added relevant tags
- [ ] Marked as featured (if applicable)
- [ ] Set to Active
- [ ] Clicked Save/Create
- [ ] Verified product shows on website

---

## 🎨 Product Examples from Your Facebook Page

### Example 1: Anime Poster
```yaml
Name: Naruto Hokage Poster
Description: High-quality anime poster featuring Naruto in Hokage mode. 
             Perfect for anime fans and bedroom decoration.
Category: Anime
Base Price: 400
Sizes:
  - A5: 350৳
  - A4: 550৳
  - A3: 900৳
Customizable: No
Stock: 30
Tags: naruto, anime, manga, hokage, wall art
Featured: Yes
```

### Example 2: Custom Poster
```yaml
Name: Custom Photo Poster
Description: Upload your favorite photo and we'll create a beautiful poster! 
             Perfect for gifts, memories, or personal decoration.
Category: Custom
Base Price: 500
Sizes:
  - A4: 500৳
  - A3: 800৳
  - A2: 1200৳
Customizable: Yes (customers can upload images)
Stock: 100
Tags: custom, personalized, photo, gift, memories
Featured: Yes
```

### Example 3: Minimalist Design
```yaml
Name: Mountain Line Art Poster
Description: Clean minimalist line drawing of mountain landscape. 
             Simple, elegant, and fits any modern interior.
Category: Minimalist
Base Price: 350
Sizes:
  - A5: 350৳
  - A4: 550৳
  - A3: 850৳
Customizable: No
Stock: 50
Tags: minimalist, mountain, line art, nature, modern
Featured: No
```

---

## 💡 Pro Tips

### Getting Better Product Photos

If Facebook images are low quality:
1. **Take new photos:**
   - Use good lighting (natural daylight is best)
   - Place poster on wall or flat surface
   - Use your phone camera (latest phones work great)
   - Hold steady or use tripod
   - Take multiple angles

2. **Photo editing (optional):**
   - Use free apps: Snapseed (mobile) or Canva (web)
   - Adjust brightness/contrast
   - Crop to remove background
   - Keep colors accurate to real product

### Writing Great Descriptions

Include:
- ✅ What it looks like
- ✅ What room/space it's good for
- ✅ Material/quality (matte paper, glossy, etc.)
- ✅ Color scheme
- ✅ Style/vibe (modern, vintage, minimalist)
- ✅ Perfect for (gifts, decoration, office, etc.)

**Example:**
```
"Stunning abstract poster with flowing geometric shapes in purple 
and gold tones. Printed on premium 250gsm matte paper for rich 
colors and durability. Perfect for modern living rooms, bedrooms, 
or office spaces. Makes a great gift for art lovers!"
```

### Pricing Strategy

**Bangladesh Poster Market Standard:**
- A5 (Small): 300-500৳
- A4 (Medium): 500-800৳
- A3 (Large): 800-1500৳
- A2 (Extra Large): 1200-2500৳

**Custom posters:** Usually 20-30% more expensive

---

## 🔄 Bulk Upload Process

If you have many products (10+):

### Quick Method:

1. **Organize images in folders** by category:
   ```
   VYBE Products/
   ├── Abstract/
   │   ├── product1.jpg
   │   └── product2.jpg
   ├── Anime/
   │   ├── naruto.jpg
   │   └── onepiece.jpg
   └── Minimalist/
       └── mountains.jpg
   ```

2. **Create a spreadsheet** (Excel/Google Sheets):
   | Name | Category | Description | Base Price | Sizes | Image File |
   |------|----------|-------------|------------|-------|------------|
   | Abstract Waves | Abstract | Beautiful waves... | 350 | A5,A4,A3 | abstract1.jpg |

3. **Upload one by one** using admin panel (fastest way with current setup)
4. Each product takes ~2-3 minutes

### Time Estimate:
- 10 products = ~30 minutes
- 20 products = ~1 hour
- 50 products = ~2.5 hours

**Recommendation:** Start with 5-10 best-selling products, then add more gradually

---

## 🆘 Common Issues & Solutions

### "Upload failed" or "Image upload error"

**Solution:**
1. Check Cloudinary credentials in `server/.env`
2. Verify internet connection
3. Ensure image is under 5MB
4. Try JPG format instead of PNG
5. Restart server: `Ctrl+C` then `npm run dev`

### "Product not showing on website"

**Solution:**
1. Make sure "Active" is checked
2. Refresh browser (Ctrl+R or Cmd+R)
3. Check if product has at least one image
4. Verify at least one size is added

### "Can't login to admin"

**Solution:**
1. Use exact credentials:
   - Email: `admin@vybe.com`
   - Password: `admin123`
2. Check for extra spaces
3. Try creating new admin user (see main README)

### "Images look blurry"

**Solution:**
1. Use higher resolution images from Facebook (click "Download HD")
2. Minimum recommended: 1000×1000 pixels
3. For posters, 1500×2000+ pixels is ideal

---

## 📱 Mobile Workflow

### Using Phone to Add Products:

1. **Download images from Facebook app:**
   - Open Facebook app
   - Go to your page
   - Save photos to phone gallery

2. **Transfer to computer:**
   - WhatsApp Web (send to yourself)
   - Email images to yourself
   - Google Drive/iCloud sync
   - USB cable transfer

3. **Or use computer browser:**
   - Access admin panel on computer
   - Upload from there (easier with mouse/keyboard)

---

## ✅ After Uploading All Products

### Test Everything:

1. **Browse as customer:**
   - Logout from admin
   - Visit http://localhost:3000
   - Click through products
   - Try filters/search

2. **Test purchase flow:**
   - Add product to cart
   - Go to cart
   - Proceed to checkout
   - Fill shipping info
   - Test payment (use test mode)

3. **Check mobile view:**
   - Open on phone: `http://YOUR-COMPUTER-IP:3000`
   - Or resize browser window
   - Verify everything looks good

### Share Your Store:

Once deployed online, you can:
- Share link on Facebook page
- Update Facebook "Shop" tab
- Share on Instagram
- Send to customers via WhatsApp

---

## 🚀 Need Help?

- Check `README.md` in project folder
- Review `QUICKSTART.md` for setup issues
- See `PROJECT_SUMMARY.md` for features overview

---

**Your VYBE store is ready for products! Start uploading and watch your business grow! 🎨✨**

*Last updated: October 21, 2025*
