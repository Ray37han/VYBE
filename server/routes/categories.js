import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 60;

// @route   GET /api/categories
// @desc    Get all active categories with product counts
// @access  Public
router.get('/', cacheMiddleware(CACHE_TTL * 5), async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/tree
// @desc    Get categories as a hierarchical tree
// @access  Public
router.get('/tree', cacheMiddleware(CACHE_TTL * 5), async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    // Group into parent → children
    const parentMap = {};
    const roots = [];

    for (const cat of categories) {
      if (cat.parent) {
        if (!parentMap[cat.parent]) parentMap[cat.parent] = [];
        parentMap[cat.parent].push(cat);
      } else {
        roots.push(cat);
      }
    }

    // Attach children to parents
    const tree = roots.map(root => ({
      ...root,
      children: parentMap[root.slug] || [],
    }));

    // Also include parent groups that have children but aren't in categories
    const parentSlugs = [...new Set(categories.filter(c => c.parent).map(c => c.parent))];
    for (const parentSlug of parentSlugs) {
      if (!roots.find(r => r.slug === parentSlug)) {
        tree.push({
          slug: parentSlug,
          name: parentSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          displayName: parentSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          icon: '📁',
          isGroup: true,
          children: parentMap[parentSlug] || [],
        });
      }
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/:slug', cacheMiddleware(CACHE_TTL * 5), async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/:slug/tags
// @desc    Get unique tags for products in a category (for dynamic filter UI)
// @access  Public
router.get('/:slug/tags', cacheMiddleware(CACHE_TTL * 2), async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true, normalizedCategory: req.params.slug } },
      { $unwind: '$normalizedTags' },
      { $group: { _id: '$normalizedTags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    const tags = result.map(r => ({ tag: r._id, count: r.count }));

    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/trending
// @desc    Get trending categories based on recent sales
// @access  Public
router.get('/stats/trending', cacheMiddleware(CACHE_TTL * 3), async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true, normalizedCategory: { $ne: '' } } },
      {
        $group: {
          _id: '$normalizedCategory',
          totalSold: { $sum: '$sold' },
          productCount: { $sum: 1 },
          avgRating: { $avg: '$rating.average' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Enrich with category metadata
    const enriched = await Promise.all(result.map(async (r) => {
      const cat = await Category.findOne({ slug: r._id }).lean();
      return {
        slug: r._id,
        displayName: cat?.displayName || r._id,
        icon: cat?.icon || '📦',
        totalSold: r.totalSold,
        productCount: r.productCount,
        avgRating: Math.round(r.avgRating * 10) / 10,
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
