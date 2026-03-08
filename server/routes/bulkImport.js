import express from 'express';
import multer from 'multer';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { getProductImageUrls } from '../utils/cloudinaryTransform.js';
import {
  previewProduct,
  buildProductData,
  ensureUniqueSlug,
  detectCategory,
  getPricing,
  CATEGORY_KEYWORDS,
  PRICE_RULES,
} from '../services/importService.js';

const router = express.Router();

// All routes require admin auth
router.use(protect, authorize('admin'));

// Multer config for bulk uploads — higher file limit
const bulkUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file: ${file.originalname}. Only JPEG, PNG, WebP allowed.`), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 50, // up to 50 files per batch
  },
});

// ─── POST /preview — Preview product data from filenames (no upload) ──
router.post('/preview', bulkUpload.array('images', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' });
    }

    const previews = req.files.map((file) => {
      const preview = previewProduct(file.originalname);
      return {
        ...preview,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    });

    res.json({
      success: true,
      count: previews.length,
      data: previews,
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /import — Upload images and create products ──────────
router.post('/import', bulkUpload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' });
    }

    // Parse overrides if provided (JSON string with per-file customizations)
    let overrides = {};
    if (req.body.overrides) {
      try {
        overrides = JSON.parse(req.body.overrides);
      } catch {
        // ignore parse errors, use defaults
      }
    }

    // Global overrides
    const globalCategory = req.body.category || null;
    const globalBasePrice = req.body.basePrice ? Number(req.body.basePrice) : null;
    const globalOriginalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : null;
    const globalStock = req.body.stock ? Number(req.body.stock) : 100;

    const results = {
      success: [],
      failed: [],
      total: req.files.length,
    };

    // Process files sequentially to avoid overwhelming Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileOverrides = overrides[file.originalname] || overrides[i] || {};

      try {
        // 1. Generate preview from filename
        const preview = previewProduct(file.originalname);

        // 2. Apply overrides (per-file > global > auto-detected)
        const finalCategory = fileOverrides.category || globalCategory || preview.category;
        const pricing = getPricing(finalCategory, {
          basePrice: fileOverrides.basePrice || globalBasePrice,
          originalPrice: fileOverrides.originalPrice || globalOriginalPrice,
        });

        // 3. Ensure unique product name
        const uniqueSlug = await ensureUniqueSlug(preview.slug);
        const finalTitle = fileOverrides.title || (
          uniqueSlug !== preview.slug
            ? uniqueSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : preview.title
        );

        // 4. Upload to Cloudinary
        const cloudResult = await uploadToCloudinary(file.buffer, {
          folder: 'vybe/products',
          type: 'upload',
          imageType: 'product',
        });

        const imageData = {
          publicId: cloudResult.public_id,
          format: cloudResult.format,
          urls: getProductImageUrls(cloudResult.public_id),
        };

        // 5. Build product data
        const productData = buildProductData(preview, imageData, {
          title: finalTitle,
          category: finalCategory,
          basePrice: pricing.basePrice,
          originalPrice: pricing.originalPrice,
          stock: fileOverrides.stock ?? globalStock,
          description: fileOverrides.description,
        });

        // 6. Save to DB
        const product = await Product.create(productData);

        results.success.push({
          filename: file.originalname,
          productId: product._id,
          name: product.name,
          category: product.category,
          basePrice: product.basePrice,
          thumbnail: imageData.urls?.thumbnail,
        });

      } catch (fileError) {
        console.error(`Failed to import ${file.originalname}:`, fileError.message);
        results.failed.push({
          filename: file.originalname,
          error: fileError.message,
        });
      }
    }

    const statusCode = results.failed.length === results.total ? 500 : 200;

    res.status(statusCode).json({
      success: results.failed.length < results.total,
      message: `Imported ${results.success.length}/${results.total} products. ${results.failed.length} failed.`,
      data: results,
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /categories — List available categories with pricing ──
router.get('/categories', (req, res) => {
  const categories = Object.keys(PRICE_RULES).map(key => ({
    value: key,
    label: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    ...PRICE_RULES[key],
  }));

  res.json({ success: true, data: categories });
});

// ─── GET /keywords — List category detection keywords ──────────
router.get('/keywords', (req, res) => {
  res.json({ success: true, data: CATEGORY_KEYWORDS });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 50 files per batch.',
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum 50MB per file.',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
