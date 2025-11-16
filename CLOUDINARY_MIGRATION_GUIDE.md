# Cloudinary Migration Guide

## 🎯 Overview

This guide helps migrate existing products from **URL-based** image storage to **publicId-based** storage with Cloudinary transformations.

---

## 📊 Database Schema Change

### Before (URL-based)
```javascript
{
  "_id": "...",
  "name": "Moon Knight Poster",
  "images": [
    {
      "url": "https://res.cloudinary.com/vybe/image/upload/v1234567890/vybe-products/abc123.jpg",
      "publicId": "vybe-products/abc123"
    }
  ]
}
```

### After (publicId-based)
```javascript
{
  "_id": "...",
  "name": "Moon Knight Poster",
  "images": [
    {
      "publicId": "vybe/products/abc123",  // Note: folder separator changed
      "format": "jpg",
      "urls": {
        "thumbnail": "https://res.cloudinary.com/.../w_400,h_400/...",
        "medium": "https://res.cloudinary.com/.../w_800,h_800/...",
        "large": "https://res.cloudinary.com/.../w_1200,h_1200/...",
        "full": "https://res.cloudinary.com/.../w_2000,h_2000/..."
      }
    }
  ]
}
```

---

## 🔄 Migration Options

### Option 1: Gradual Migration (Recommended)

**Pros**: 
- ✅ No downtime
- ✅ Backward compatible
- ✅ Test as you go

**Cons**:
- ❌ Mixed formats temporarily
- ❌ Slower overall migration

**How**:
1. Deploy new code (already backward compatible)
2. New uploads use publicId format automatically
3. Old products still work with URL format
4. Migrate products gradually over time
5. Eventually all products will be new format

### Option 2: Bulk Migration (Faster)

**Pros**:
- ✅ All products migrated at once
- ✅ Clean, consistent database

**Cons**:
- ❌ Requires maintenance window
- ❌ Risk of errors affecting all products

**How**:
1. Schedule maintenance window (30-60 minutes)
2. Run migration script (see below)
3. Verify all products display correctly
4. Rollback if issues occur

---

## 📝 Migration Script

### Create Migration File

**File**: `server/migrations/migrateToPublicId.js`

```javascript
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { getProductImageUrls } from '../utils/cloudinaryTransform.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migrate products from URL-based to publicId-based image storage
 */
async function migrateProducts() {
  try {
    console.log('🚀 Starting product migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products with images
    const products = await Product.find({ 
      images: { $exists: true, $ne: [] } 
    });
    
    console.log(`📦 Found ${products.length} products to migrate`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        let needsUpdate = false;
        const updatedImages = [];

        for (const image of product.images) {
          // Check if already migrated (has urls field)
          if (image.urls && image.publicId) {
            console.log(`⏭️  Product ${product._id} already migrated`);
            updatedImages.push(image);
            continue;
          }

          // Extract publicId from URL or use existing publicId
          let publicId = image.publicId;
          
          if (!publicId && image.url) {
            // Extract from URL: https://res.cloudinary.com/.../vybe-products/abc123.jpg
            const match = image.url.match(/vybe-products\/([^/.]+)/);
            if (match) {
              // Convert old format to new format
              publicId = `vybe/products/${match[1]}`;
            }
          }

          if (!publicId) {
            console.warn(`⚠️  No publicId for product ${product._id}, image ${image._id}`);
            updatedImages.push(image);
            continue;
          }

          // Normalize publicId format (old format uses dash, new uses slash)
          publicId = publicId.replace('vybe-products/', 'vybe/products/');

          // Extract format from URL or default to jpg
          let format = 'jpg';
          if (image.url) {
            const formatMatch = image.url.match(/\.([a-z]+)$/i);
            if (formatMatch) {
              format = formatMatch[1];
            }
          }

          // Generate new format with all URL variants
          const newImage = {
            publicId: publicId,
            format: format,
            urls: getProductImageUrls(publicId),
            // Keep old URL for backward compatibility
            _oldUrl: image.url,
          };

          updatedImages.push(newImage);
          needsUpdate = true;
        }

        if (needsUpdate) {
          product.images = updatedImages;
          await product.save();
          migrated++;
          console.log(`✅ Migrated product: ${product.name} (${product._id})`);
        } else {
          skipped++;
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error migrating product ${product._id}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📦 Total: ${products.length}`);

    await mongoose.disconnect();
    console.log('\n🎉 Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProducts();
```

### Run Migration

```bash
# From server directory
cd server

# Run migration
node migrations/migrateToPublicId.js
```

**Expected Output**:
```
🚀 Starting product migration...
✅ Connected to MongoDB
📦 Found 45 products to migrate
✅ Migrated product: Moon Knight Poster (abc123...)
✅ Migrated product: Starry Night (def456...)
...
📊 Migration Summary:
✅ Migrated: 45
⏭️  Skipped: 0
❌ Errors: 0
📦 Total: 45
🎉 Migration complete!
```

---

## 🧪 Testing After Migration

### 1. API Test
```bash
# Get products
curl http://localhost:5001/api/products | jq '.data[0].images[0]'
```

**Expected**:
```json
{
  "publicId": "vybe/products/abc123",
  "format": "jpg",
  "urls": {
    "thumbnail": "https://res.cloudinary.com/.../w_400.../abc123.jpg",
    "medium": "https://res.cloudinary.com/.../w_800.../abc123.jpg",
    "large": "https://res.cloudinary.com/.../w_1200.../abc123.jpg",
    "full": "https://res.cloudinary.com/.../w_2000.../abc123.jpg"
  }
}
```

### 2. Image Load Test
Open each URL in browser and verify:
- ✅ Image loads successfully
- ✅ Watermark visible: `© VYBE` (bottom-right)
- ✅ Image quality good
- ✅ Format optimized (WebP in Chrome)

### 3. Frontend Test
- ✅ Product cards display images
- ✅ Product detail page shows images
- ✅ Image zoom/lightbox works
- ✅ Mobile responsive images work

---

## 🔙 Rollback Plan

### If Migration Fails

**Option A: Restore from Backup**
```bash
# Restore MongoDB from backup
mongorestore --uri="mongodb://..." --archive=backup.archive
```

**Option B: Revert Code**
```bash
# Revert to previous commit
git revert HEAD
git push

# Or checkout old version
git checkout <previous-commit-hash>
```

**Option C: Manual Fix**
1. Keep old `url` field in database (migration script preserves it as `_oldUrl`)
2. Update code to use `image.url || image.urls.large` as fallback
3. Re-run migration when ready

---

## 📋 Pre-Migration Checklist

- [ ] Backup MongoDB database
- [ ] Test migration script on staging
- [ ] Verify Cloudinary credentials valid
- [ ] Check Cloudinary bandwidth limits
- [ ] Schedule maintenance window (if bulk migration)
- [ ] Notify users (if downtime expected)
- [ ] Prepare rollback plan
- [ ] Test image transformations work

---

## 🚀 Post-Migration Steps

### 1. Verify All Products
```bash
# Check for products without urls
db.products.find({ 
  'images.urls': { $exists: false } 
}).count()
```

**Expected**: 0

### 2. Test Performance
```bash
# Test image load times
curl -w "@curl-format.txt" -o /dev/null -s "https://res.cloudinary.com/.../abc123.jpg"
```

**Expected**: < 200ms

### 3. Monitor Cloudinary Usage
- Check Cloudinary dashboard
- Verify bandwidth within limits
- Monitor transformation counts
- Check CDN hit rate

### 4. Update Frontend (Optional)
```javascript
// Before
<img src={product.images[0].url} />

// After (responsive)
<img 
  src={product.images[0].urls.medium}
  srcSet={product.images[0].urls.responsive.srcset}
  sizes={product.images[0].urls.responsive.sizes}
/>
```

### 5. Clean Up
After confirming everything works:
```bash
# Remove old watermark utility (no longer used)
rm server/utils/watermark.js

# Remove old migration backups
rm migrations/backup-*.archive
```

---

## 🐛 Troubleshooting

### Issue: "publicId not found"

**Cause**: Old products don't have publicId field

**Solution**: Migration script extracts it from URL

### Issue: "Signature mismatch" on image URLs

**Cause**: Private images need signed URLs

**Solution**: Ensure `sign_url: true` in cloudinaryTransform.js

### Issue: Images show old format (no watermark)

**Cause**: Frontend using old `url` field

**Solution**: Update frontend to use `urls.thumbnail` or `urls.large`

### Issue: Some images don't load

**Cause**: Invalid publicId format

**Solution**: Check publicId format: `vybe/products/abc123` (slash, not dash)

---

## 📊 Migration Timeline

### Recommended Schedule

**Week 1**: Test on staging
- Deploy new code to staging
- Run migration on staging database
- Test all functionality
- Fix any issues

**Week 2**: Deploy to production
- Schedule maintenance window (optional)
- Backup production database
- Deploy new code
- Run migration (if bulk)
- Verify all products working
- Monitor for 24 hours

**Week 3**: Cleanup
- Remove old watermark utility
- Update frontend for responsive images
- Document any issues/learnings

---

## ✅ Success Criteria

Migration is successful when:
- ✅ All products have `publicId` and `urls` fields
- ✅ All image URLs load correctly with watermarks
- ✅ No broken images on frontend
- ✅ Performance improved (faster loads)
- ✅ No errors in server logs
- ✅ Cloudinary bandwidth within limits
- ✅ Users don't notice any issues

---

## 📚 Additional Resources

- [Cloudinary URL API](https://cloudinary.com/documentation/image_transformation_reference)
- [MongoDB Schema Migration Best Practices](https://www.mongodb.com/blog/post/building-with-patterns-the-schema-versioning-pattern)
- Full System Docs: `CLOUDINARY_WATERMARK_SYSTEM.md`

---

**Migration Type**: Database Schema Update  
**Breaking Changes**: None (backward compatible)  
**Estimated Time**: 30-60 minutes (for 100-1000 products)  
**Downtime**: Optional (0 with gradual migration)  
**Risk Level**: Low (can rollback easily)  

---

## 🆘 Support

If issues occur during migration:
1. Stop migration immediately
2. Rollback to backup
3. Review error logs
4. Test on single product first
5. Contact developer if needed

**Remember**: The new system is backward compatible - old products will still work without migration!
